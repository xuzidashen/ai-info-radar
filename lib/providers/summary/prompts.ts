import { categoryLabels } from "@/lib/types";
import type { SummaryProviderInput } from "@/lib/providers/summary/types";

const MAX_SOURCES = 5;
const MAX_SOURCE_SUMMARY_LENGTH = 520;
const MAX_PROMPT_LENGTH = 12000;

function truncate(value: string | null | undefined, limit: number) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "未知";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "未知" : date.toISOString();
}

function formatSourceCredibility(item: SummaryProviderInput["infoItems"][number]) {
  const parts = [
    item.credibilityLabel ? `可信度：${item.credibilityLabel}` : null,
    item.credibilityReason ? `原因：${truncate(item.credibilityReason, 120)}` : null,
    typeof item.score === "number" ? `搜索分：${item.score}` : null
  ].filter(Boolean);
  return parts.join("；") || "未标注";
}

function contentTypeInstructions() {
  return `内容类型判断与抽取模板：
1. policy 政策类：必须提取发布机构、政策名称、发布时间、适用对象、核心条款、补贴/限制/门槛、执行时间、原文链接。缺少官方来源时写“需要等待官方文件或细则确认”。
2. financial_report 财报类：必须提取公司名称、报告期、营收、净利润、同比/环比、毛利率、现金流、主营业务变化、管理层指引、风险点、公告链接。禁止输出买入、卖出、目标价和确定性涨跌判断。
3. news_event 新闻事件类：必须提取时间、地点、人物/机构、发生了什么、结果是什么、是否有官方回应、来源是谁、是否存在争议。
4. industry_update 行业动态类：必须提取行业变化、上游/中游/下游影响、涉及公司、价格/订单/产能/政策变化、可能传导路径和不确定性。
5. person_event 人物动态类：必须提取人物是谁、发生了什么具体动作、涉及作品/活动/事件、时间地点、舆论变化、来源可靠性、是否有官方确认。
6. general 综合类：仍然必须写具体事实，不能只写“值得关注”。`;
}

export function buildFactSummaryPrompt(input: SummaryProviderInput) {
  const sources = input.infoItems.slice(0, MAX_SOURCES).map((item, index) => ({
    index: index + 1,
    title: truncate(item.title, 180),
    source: truncate(item.source, 120),
    publishedAt: formatDate(item.publishedAt),
    summary: truncate(item.summary, MAX_SOURCE_SUMMARY_LENGTH),
    url: truncate(item.url, 800),
    credibility: formatSourceCredibility(item)
  }));

  const prompt = `你要为“个人关注主题信息雷达”生成事实型中文情报卡。

关键词：${truncate(input.keyword.name, 120)}
分类：${categoryLabels[input.keyword.category]}
用户备注：${truncate(input.keyword.description, 420) || "无"}
搜索结果数量：${sources.length}
搜索结果列表：
${sources.map((item) => `${item.index}. 标题：${item.title}
   来源：${item.source}
   可信度：${item.credibility}
   发布时间：${item.publishedAt}
   摘要：${item.summary}
   URL：${item.url}`).join("\n")}

${contentTypeInstructions()}

只输出合法 JSON，不要输出 Markdown、代码块或额外解释。JSON 结构必须是：
{
  "contentType": "policy | financial_report | news_event | industry_update | person_event | general",
  "title": "精炼标题",
  "overview": "不超过 80 个汉字的一句话事实结论",
  "coreFacts": ["核心事实 1", "核心事实 2", "核心事实 3"],
  "keyDetails": [
    {"label": "发布方/主体", "value": "具体机构、公司或人物；没有则写未披露"},
    {"label": "时间", "value": "具体时间；没有则写未披露"},
    {"label": "核心内容", "value": "政策条款、事件内容、财报数据或人物动作"},
    {"label": "关键数字", "value": "金额、比例、票数、营收、利润、补贴额度等；没有则写未披露"}
  ],
  "impactTargets": ["影响对象 1", "影响对象 2"],
  "whyItMatters": ["为什么与用户关注主题有关", "为什么值得继续跟踪"],
  "followUp": ["后续需要关注的信号 1", "后续需要关注的信号 2"],
  "uncertainties": ["风险或不确定性 1", "风险或不确定性 2"],
  "sources": [
    {"title": "来源标题", "url": "来源链接", "type": "official | media | social | self_media | unknown", "note": "该来源提供了什么信息"}
  ]
}

写作规则：
1. 只基于给定搜索结果总结，不编造事实、数字、来源、政策名、公司名、人物动作或链接。
2. 精炼不是省略事实，而是删除废话，保留发布方、时间、政策/公告/财报/事件核心内容、关键数字和影响对象。
3. 不要输出“好的，这是……”，不要输出“值得关注”这种空泛结论，必须说明具体原因。
4. 不要输出 Markdown 原始符号，例如 ###、**、项目符号。
5. 不要把来源混进正文，来源必须放在 sources 中。
6. coreFacts 最多 3 条；whyItMatters、followUp、uncertainties 各最多 3 条；sources 最多 5 条。
7. 来源没有提供的信息写“未披露”，不要补全或猜测。
8. 单一自媒体或来源可靠性弱时，uncertainties 必须写“可信度需复核”。
9. 信息不足时，overview 或 uncertainties 必须明确写“信息不足，需要人工复核”。
10. 财经、股票、公司公告相关内容必须在 uncertainties 中包含：以上内容仅为公开信息整理和辅助研究，不构成投资建议。`;

  return prompt.slice(0, MAX_PROMPT_LENGTH);
}
