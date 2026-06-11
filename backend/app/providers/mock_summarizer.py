from app.providers.search_base import SearchResult
from app.providers.summarizer_base import Summarizer


class MockSummarizer(Summarizer):
    provider_name = "mock"

    async def summarize(self, keyword: str, results: list[SearchResult]) -> str:
        source_lines = "\n".join(
            f"- [{item.title}]({item.source_url})" for item in results
        )
        top_titles = "；".join(item.title for item in results[:3])
        return (
            f"【关键词】{keyword}\n\n"
            "一、今日新增信息\n"
            f"- 本次模拟检索整理出 {len(results)} 条去重信息，主要集中在：{top_titles}。\n"
            "- 当前内容来自 mock provider，用于验证产品流程，不代表真实外部检索结果。\n\n"
            "二、重要程度判断\n"
            "- 中\n"
            "- 判断理由：信息足够用于个人跟踪，但来源为模拟数据，不能直接用于重大决策。\n\n"
            "三、核心变化\n"
            "- 公司/事件：暂无足够公开信息判断。\n"
            "- 政策/行业：暂无足够公开信息判断。\n"
            "- 市场/舆情：模拟结果显示该关键词适合进入观察列表。\n\n"
            "四、短期影响\n"
            "- 可先作为每日信息雷达的跟踪项，观察是否出现更多权威来源或真实案例。\n\n"
            "五、长期影响\n"
            "- 长期价值取决于后续公开信息是否稳定增加，以及它是否影响学习、项目或职业方向。\n\n"
            "六、风险提示\n"
            "- 请核验来源可信度、发布时间和利益相关方，不要把模拟摘要当作事实。\n"
            "- 本内容仅基于公开信息自动整理，不构成投资、法律、考试录取或其他专业建议。\n\n"
            "七、来源链接\n"
            f"{source_lines}"
        )
