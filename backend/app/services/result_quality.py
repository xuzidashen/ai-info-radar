from dataclasses import replace
from difflib import SequenceMatcher
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from app.providers.search_base import SearchResult

TRACKING_PARAMS = {"fbclid", "gclid", "mc_cid", "mc_eid", "ref"}

MEDIA_DOMAINS = {
    "reuters.com",
    "bloomberg.com",
    "wsj.com",
    "nytimes.com",
    "ft.com",
    "bbc.com",
    "cnn.com",
    "caixin.com",
    "36kr.com",
    "thepaper.cn",
    "yicai.com",
    "sina.com.cn",
    "qq.com",
    "163.com",
    "people.com.cn",
    "xinhuanet.com",
}

FORUM_DOMAINS = {
    "reddit.com",
    "news.ycombinator.com",
    "zhihu.com",
    "tieba.baidu.com",
    "douban.com",
}

RESEARCH_DOMAINS = {
    "arxiv.org",
    "nature.com",
    "science.org",
    "pubmed.ncbi.nlm.nih.gov",
    "doi.org",
    "ieee.org",
    "acm.org",
    "springer.com",
}

OFFICIAL_DOMAINS = {
    "openai.com",
    "deepseek.com",
    "tavily.com",
    "microsoft.com",
    "google.com",
    "apple.com",
    "nvidia.com",
    "tesla.com",
}

TECHNICAL_DOMAINS = {
    "github.com",
    "gitlab.com",
    "npmjs.com",
    "pypi.org",
}


def get_search_max_results(default: int = 8) -> int:
    import os

    raw_value = os.getenv("SEARCH_MAX_RESULTS", str(default))
    try:
        value = int(raw_value)
    except ValueError:
        return default
    return max(1, min(value, 20))


def extract_domain(url: str) -> str:
    parsed = urlparse(url)
    domain = parsed.netloc.lower().split("@")[-1].split(":")[0]
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def normalize_url(url: str) -> str:
    parsed = urlparse(url.strip())
    domain = extract_domain(url)
    query = [
        (key, value)
        for key, value in parse_qsl(parsed.query, keep_blank_values=False)
        if not key.lower().startswith("utm_") and key.lower() not in TRACKING_PARAMS
    ]
    normalized_path = parsed.path.rstrip("/") or "/"
    return urlunparse(
        (
            parsed.scheme.lower() or "https",
            domain,
            normalized_path,
            "",
            urlencode(sorted(query)),
            "",
        )
    )


def normalize_title(title: str) -> str:
    return "".join(char.lower() for char in title if char.isalnum())


def classify_source(domain: str) -> str:
    if not domain:
        return "unknown"
    if domain.endswith(".gov.cn") or domain.endswith(".gov") or domain in OFFICIAL_DOMAINS:
        return "official"
    if domain in TECHNICAL_DOMAINS:
        return "technical"
    if domain in RESEARCH_DOMAINS or any(domain.endswith(f".{item}") for item in RESEARCH_DOMAINS):
        return "research"
    if domain in MEDIA_DOMAINS or any(domain.endswith(f".{item}") for item in MEDIA_DOMAINS):
        return "media"
    if domain in FORUM_DOMAINS or any(domain.endswith(f".{item}") for item in FORUM_DOMAINS):
        return "forum"
    return "unknown"


def credibility_score(source_type: str) -> int:
    return {
        "official": 5,
        "research": 4,
        "media": 3,
        "technical": 3,
        "forum": 2,
        "unknown": 1,
    }.get(source_type, 1)


def enrich_result(result: SearchResult) -> SearchResult:
    domain = result.source_domain or extract_domain(result.source_url)
    source_type = result.source_type if result.source_type != "unknown" else classify_source(domain)
    return replace(
        result,
        source_domain=domain,
        source_type=source_type,
        credibility_score=credibility_score(source_type),
    )


def is_near_duplicate_title(title: str, seen_titles: list[str]) -> bool:
    normalized = normalize_title(title)
    if not normalized:
        return False
    for seen in seen_titles:
        if normalized == seen:
            return True
        if SequenceMatcher(None, normalized, seen).ratio() >= 0.92:
            return True
    return False


def deduplicate_and_enrich_results(
    results: list[SearchResult],
    max_results: int,
) -> tuple[list[SearchResult], list[str]]:
    seen_urls: set[str] = set()
    seen_titles: list[str] = []
    cleaned: list[SearchResult] = []
    removed = 0

    for result in results:
        if not result.source_url:
            removed += 1
            continue

        normalized_url = normalize_url(result.source_url)
        if normalized_url in seen_urls:
            removed += 1
            continue

        if is_near_duplicate_title(result.title, seen_titles):
            removed += 1
            continue

        seen_urls.add(normalized_url)
        seen_titles.append(normalize_title(result.title))
        cleaned.append(enrich_result(result))

        if len(cleaned) >= max_results:
            break

    warnings: list[str] = []
    if removed:
        warnings.append(f"已去除 {removed} 条重复或低质量来源。")
    if len(results) > len(cleaned) and len(cleaned) >= max_results:
        warnings.append(f"结果已限制为 SEARCH_MAX_RESULTS={max_results} 条。")
    return cleaned, warnings
