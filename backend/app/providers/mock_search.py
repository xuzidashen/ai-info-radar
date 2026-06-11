from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from app.providers.search_base import SearchProvider, SearchResult


class MockSearchProvider(SearchProvider):
    provider_name = "mock"

    async def search(self, keyword: str, limit: int = 8) -> list[SearchResult]:
        safe_keyword = quote(keyword)
        now = datetime.now(timezone.utc)
        templates = [
            ("政策与公告", "出现新的公开信息，值得加入今日观察列表。"),
            ("产品与技术", "相关工具或方案有小幅更新，可能影响后续学习和实践。"),
            ("社区讨论", "讨论热度上升，观点分歧集中在成本、效果和可落地性。"),
            ("数据趋势", "短期指标有所变化，但仍需要更多来源交叉验证。"),
            ("案例复盘", "有新的实践案例被整理，能提供可参考的执行路径。"),
            ("风险提醒", "部分来源提到限制条件，建议避免直接做高风险决策。"),
            ("观点文章", "长线影响仍不确定，但已经出现几个稳定观察方向。"),
            ("工具清单", "出现可替代方案，适合后续做简单横向比较。"),
        ]
        results: list[SearchResult] = []
        for index, (topic, snippet) in enumerate(templates[:limit], start=1):
            published_at = (now - timedelta(hours=index * 3)).isoformat()
            results.append(
                SearchResult(
                    title=f"{keyword}：{topic}模拟来源 {index}",
                    snippet=snippet,
                    source_url=f"https://example.com/radar/{safe_keyword}/{index}",
                    published_at=published_at,
                )
            )
        return results
