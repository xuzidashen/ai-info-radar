from sqlmodel import Session

from app import crud
from app.models import Keyword
from app.providers.factory import get_search_provider, get_summary_provider
from app.schemas import ProviderInfoRead, RunRead
from app.services.result_quality import deduplicate_and_enrich_results, get_search_max_results


async def run_keyword_radar(session: Session, keyword: Keyword) -> RunRead:
    search_provider = get_search_provider()
    summarizer = get_summary_provider()
    max_results = get_search_max_results()
    warnings: list[str] = []

    if search_provider.provider_name == "mock":
        warnings.append("当前使用 mock search provider，结果仅用于演示和本地流程验证。")
    if summarizer.provider_name == "mock":
        warnings.append("当前使用 mock summary provider，摘要为本地模拟生成。")

    raw_results = await search_provider.search(keyword.text, limit=max_results * 2)
    results, quality_warnings = deduplicate_and_enrich_results(raw_results, max_results)
    warnings.extend(quality_warnings)
    summary = await summarizer.summarize(keyword.text, results)
    run = crud.create_run(session, keyword, results, summary)
    provider_info = ProviderInfoRead(
        search_provider=search_provider.provider_name,
        summary_provider=summarizer.provider_name,
        search_max_results=max_results,
    )
    return crud.run_to_read(run, provider_info=provider_info, warnings=warnings)
