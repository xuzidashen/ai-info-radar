from app.providers.search_base import SearchResult

SUMMARY_TEMPLATE = """【关键词】{keyword}

一、今日新增信息
- ...

二、重要程度判断
- 高 / 中 / 低
- 判断理由：

三、核心变化
- 公司/事件：
- 政策/行业：
- 市场/舆情：

四、短期影响
- ...

五、长期影响
- ...

六、风险提示
- ...
- 本内容仅基于公开信息自动整理，不构成投资、法律、考试录取或其他专业建议。

七、来源链接
- [来源标题](URL)
"""


def build_source_block(results: list[SearchResult]) -> str:
    if not results:
        return "暂无来源。"
    lines: list[str] = []
    for index, item in enumerate(results, start=1):
        published = f"\n  published_at: {item.published_at}" if item.published_at else ""
        lines.append(
            f"{index}. title: {item.title}\n"
            f"   snippet: {item.snippet}\n"
            f"   url: {item.source_url}\n"
            f"   source_domain: {item.source_domain}\n"
            f"   source_type: {item.source_type}\n"
            f"   credibility_score: {item.credibility_score}"
            f"{published}"
        )
    return "\n".join(lines)


def build_summary_prompt(keyword: str, results: list[SearchResult]) -> str:
    return (
        "你是个人 AI 信息雷达助手。只基于提供的搜索结果生成中文摘要。\n"
        "硬性要求：\n"
        "- 不得编造事实；不要使用未出现在来源中的数据、机构、日期或结论。\n"
        "- 只能引用提供的来源标题和链接。\n"
        "- 信息不足时写“暂无足够公开信息判断”。\n"
        "- 不得给出直接买入、卖出或其他投资指令。\n"
        "- 区分事实、可能影响和风险。\n"
        "- 输出必须适合个人信息跟踪，简洁、可执行、谨慎。\n"
        "- 必须使用下面的结构和标题，保留免责声明。\n\n"
        f"摘要结构：\n{SUMMARY_TEMPLATE}\n\n"
        f"关键词：{keyword}\n\n"
        f"搜索结果：\n{build_source_block(results)}"
    )
