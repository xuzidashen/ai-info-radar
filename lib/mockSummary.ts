import { categoryLabels, type InfoItemDTO, type KeywordCategory } from "@/lib/types";
import type { StructuredSummary, SummaryContentType } from "@/lib/utils/summaryParser";

type SummaryItem = {
  title: string;
  source: string;
  summary: string;
  importance: InfoItemDTO["importance"];
  url?: string | null;
  publishedAt?: string | Date | null;
};

function contentTypeFor(category: KeywordCategory): SummaryContentType {
  if (category === "policy") return "policy";
  if (category === "finance") return "financial_report";
  if (category === "ai-tech") return "industry_update";
  if (category === "study") return "general";
  return "general";
}

function formatDate(value: unknown) {
  if (!value) return "未披露";
  const date = new Date(value as string | Date);
  return Number.isNaN(date.getTime()) ? "未披露" : date.toLocaleDateString("zh-CN");
}

function sourceUrl(item: SummaryItem) {
  return "url" in item && typeof item.url === "string" ? item.url : undefined;
}

function firstItem(items: SummaryItem[]) {
  return items.find((item) => item.importance === "high") ?? items[0];
}

function buildKeyDetails(category: KeywordCategory, item: SummaryItem | undefined) {
  const title = item?.title ?? "未披露";
  const summary = item?.summary ?? "现有来源不足，需要人工复核。";
  const source = item?.source ?? "未披露";
  const keyNumbers = summary.match(/(?:\d+(?:\.\d+)?%?|\d+(?:\.\d+)?\s*(?:万|亿|元|人|家|项|年|月|日|亿元|万元))/g)?.slice(0, 6).join("、") || "未披露";

  if (category === "finance") {
    return [
      { label: "发布方/主体", value: source },
      { label: "时间", value: formatDate("publishedAt" in (item ?? {}) ? item?.publishedAt : undefined) },
      { label: "核心内容", value: `围绕“${title}”整理公开公告、产业链或经营变化。` },
      { label: "关键数字", value: keyNumbers }
    ];
  }

  if (category === "policy") {
    return [
      { label: "发布方/主体", value: source },
      { label: "时间", value: formatDate("publishedAt" in (item ?? {}) ? item?.publishedAt : undefined) },
      { label: "核心内容", value: summary.slice(0, 180) || "政策核心内容未披露。" },
      { label: "关键数字", value: keyNumbers }
    ];
  }

  return [
    { label: "发布方/主体", value: source },
    { label: "时间", value: formatDate("publishedAt" in (item ?? {}) ? item?.publishedAt : undefined) },
    { label: "核心内容", value: summary.slice(0, 180) || "现有来源只提供了标题级信息。" },
    { label: "关键数字", value: keyNumbers }
  ];
}

export function generateMockSummary(keyword: {
  name: string;
  category: KeywordCategory;
  description?: string | null;
}, items: SummaryItem[]): string {
  const topic = keyword.name;
  const category = categoryLabels[keyword.category];
  const lead = firstItem(items);
  const leadSummary = lead?.summary || "现有来源不足，需要人工复核。";
  const summary: StructuredSummary = {
    contentType: contentTypeFor(keyword.category),
    title: `${topic}：本次更新的事实摘要`,
    overview: items.length
      ? `本次围绕“${topic}”整理 ${items.length} 条公开来源，重点是${lead?.title ?? "最新变化"}。`.slice(0, 80)
      : `“${topic}”当前来源不足，需要人工复核。`,
    coreFacts: items.length
      ? items.slice(0, 3).map((item, index) => `${index + 1}. ${item.source} 提到：${item.title}；${item.summary || "摘要未披露"}`.slice(0, 220))
      : ["现有来源不足以形成可验证事实。"],
    keyDetails: buildKeyDetails(keyword.category, lead),
    impactTargets: keyword.category === "policy"
      ? ["政策适用对象", "相关申报主体", "后续执行部门"]
      : keyword.category === "finance"
        ? ["相关公司", "产业链上下游", "公开信息研究者"]
        : [category, "关注该主题的用户"],
    whyItMatters: [
      `这些来源都与用户关注的“${topic}”直接相关。`,
      "雷达保留原始链接，便于后续复核和追踪变化。"
    ],
    followUp: [
      "关注官方文件、公告或原始来源是否更新。",
      "复核后续是否出现新的时间节点、金额、指标或执行细则。"
    ],
    uncertainties: keyword.category === "finance"
      ? ["公开来源可能存在延迟或口径差异。", "以上内容仅为公开信息整理和辅助研究，不构成投资建议。"]
      : ["部分来源可能只提供摘要，需要打开原帖复核细节。"],
    sources: items.slice(0, 5).map((item) => ({
      title: item.title,
      url: sourceUrl(item),
      type: "unknown",
      note: `${item.source} 提供了与“${topic}”相关的公开线索。`
    })),
    keyChanges: [],
    risks: [],
    sourceNotes: []
  };
  summary.keyChanges = summary.coreFacts.map((fact, index) => ({ title: `核心事实 ${index + 1}`, detail: fact, confidence: "medium" as const }));
  summary.risks = summary.uncertainties;
  summary.sourceNotes = summary.sources.map((item) => ({ source: item.title, note: item.note, url: item.url }));
  if (keyword.description) {
    summary.followUp.push(`结合用户备注继续复核：${keyword.description.slice(0, 80)}`);
  }
  if (!items.length) {
    summary.sources = [];
    summary.sourceNotes = [];
  }
  return JSON.stringify(summary);
}
