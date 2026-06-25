import type { NormalizedSearchResult } from "@/lib/providers/search/types";
import { getSourceCredibility, type SourceCredibility } from "@/lib/utils/sourceCredibility";

export type SourceType = "official" | "media" | "social" | "self_media" | "unknown";
export type ContentQualityStatus = "new" | "duplicate" | "stale" | "low_relevance" | "needs_review";

export type InfoQuality = {
  sourceType: SourceType;
  credibility: SourceCredibility;
  statuses: ContentQualityStatus[];
  labels: string[];
  reason: string;
  canonicalUrl: string;
};

const officialHints = ["gov.cn", "edu.cn", "sse.com.cn", "szse.cn", "hkex.com.hk", "sec.gov", "docs.", "developer.", "official", "公告", "官网", "官方"];
const mediaHints = ["reuters.com", "apnews.com", "xinhua", "people.com.cn", "cctv.com", "caixin.com", "yicai.com", "cls.cn", "thepaper.cn", "36kr.com", "ithome.com"];
const socialHints = ["x.com", "twitter.com", "weibo.com", "zhihu.com", "reddit.com", "bilibili.com"];
const selfMediaHints = ["mp.weixin.qq.com", "toutiao.com", "baijiahao", "substack.com", "medium.com", "blog", "自媒体"];

function includesAny(value: string, hints: string[]) {
  return hints.some((hint) => value.includes(hint.toLowerCase()));
}

export function canonicalizeUrl(url?: string | null) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (/^(utm_|spm|from|share|ref|source|session|fbclid|gclid)/i.test(key)) {
        parsed.searchParams.delete(key);
      }
    }
    parsed.hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function inferSourceType(source: string, url: string): SourceType {
  const host = canonicalizeUrl(url).toLowerCase();
  const haystack = `${source} ${host}`.toLowerCase();
  if (includesAny(haystack, officialHints)) return "official";
  if (includesAny(haystack, mediaHints)) return "media";
  if (includesAny(haystack, socialHints)) return "social";
  if (includesAny(haystack, selfMediaHints)) return "self_media";
  return "unknown";
}

function isStale(publishedAt?: string | Date | null) {
  if (!publishedAt) return false;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() > 1000 * 60 * 60 * 24 * 45;
}

function relevanceScore(result: Pick<NormalizedSearchResult, "title" | "content">, keywordName: string, extraKeywords: string[] = []) {
  const text = `${result.title} ${result.content}`.toLocaleLowerCase("zh-CN");
  const tokens = [keywordName, ...extraKeywords]
    .flatMap((item) => item.split(/[，,\s]+/))
    .map((item) => item.trim().toLocaleLowerCase("zh-CN"))
    .filter((item) => item.length > 1);
  if (!tokens.length) return 1;
  const matched = tokens.filter((token) => text.includes(token)).length;
  return matched / Math.min(tokens.length, 4);
}

export function evaluateSearchResultQuality(input: {
  result: NormalizedSearchResult;
  keywordName: string;
  extraKeywords?: string[];
  duplicate?: boolean;
}): InfoQuality {
  const { result, keywordName, extraKeywords = [], duplicate = false } = input;
  const credibility = getSourceCredibility(result.source, result.url);
  const sourceType = inferSourceType(result.source, result.url);
  const statuses = new Set<ContentQualityStatus>();

  if (duplicate) statuses.add("duplicate");
  if (isStale(result.publishedAt)) statuses.add("stale");
  if (relevanceScore(result, keywordName, extraKeywords) < 0.25) statuses.add("low_relevance");
  if (!result.url || !result.source || !result.publishedAt || credibility.label === "low" || sourceType === "unknown" || sourceType === "self_media") {
    statuses.add("needs_review");
  }
  if (!statuses.size) statuses.add("new");

  const labels = Array.from(statuses).map((status) => {
    if (status === "new") return credibility.label === "high" ? "高可信" : "可参考";
    if (status === "duplicate") return "疑似重复";
    if (status === "stale") return "旧内容";
    if (status === "low_relevance") return "低相关";
    return credibility.label === "low" ? "需复核" : "可参考";
  });

  return {
    sourceType,
    credibility,
    statuses: Array.from(statuses),
    labels: Array.from(new Set(labels)),
    reason: [
      result.url ? "" : "缺少原帖链接",
      result.source ? "" : "缺少来源名称",
      result.publishedAt ? "" : "缺少发布时间",
      credibility.reason,
      sourceType === "self_media" ? "单一自媒体来源，可信度需复核。" : "",
      sourceType === "unknown" ? "来源类型无法判断，建议人工复核。" : ""
    ].filter(Boolean).join(" "),
    canonicalUrl: canonicalizeUrl(result.url)
  };
}

export function qualityLabelFromInfo(input: {
  credibilityLabel?: string | null;
  credibilityReason?: string | null;
  url?: string | null;
  source?: string | null;
  publishedAt?: string | Date | null;
  score?: number | null;
}) {
  const labels: string[] = [];
  if (!input.url) labels.push("需复核");
  if (!input.publishedAt) labels.push("需复核");
  if (input.credibilityLabel === "high") labels.push("高可信");
  if (input.credibilityLabel === "medium" || input.credibilityLabel === "unknown") labels.push("可参考");
  if (input.credibilityLabel === "low") labels.push("需复核");
  if (typeof input.score === "number" && input.score < 0.35) labels.push("低相关");
  return {
    labels: Array.from(new Set(labels.length ? labels : ["可参考"])),
    sourceType: inferSourceType(input.source ?? "", input.url ?? ""),
    reason: input.credibilityReason || (!input.url ? "来源链接缺失，建议复核。" : "来源质量需要结合原帖复核。")
  };
}
