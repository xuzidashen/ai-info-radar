import type { SearchMode, ZoneType } from "@/lib/types";

export type SummaryTemplate = {
  id: string;
  name: string;
  zoneType: ZoneType;
  searchMode?: SearchMode;
  sections: string[];
  description: string;
};

export const summaryTemplates: SummaryTemplate[] = [
  {
    id: "exam",
    name: "考公信息模板",
    zoneType: "search",
    searchMode: "exam",
    description: "适合公告、报名、考试节点与备考素材。",
    sections: ["核心公告", "时间节点", "报名/考试相关", "政策变化", "备考建议", "来源列表"]
  },
  {
    id: "news",
    name: "新闻资讯模板",
    zoneType: "search",
    searchMode: "news",
    description: "适合新闻事件快速梳理。",
    sections: ["今日要点", "事件背景", "影响范围", "后续关注", "来源列表"]
  },
  {
    id: "policy",
    name: "政策文件模板",
    zoneType: "search",
    searchMode: "policy",
    description: "适合政策条款、影响对象和申论素材整理。",
    sections: ["政策背景", "核心条款", "影响对象", "落地难点", "可用素材", "来源列表"]
  },
  {
    id: "competition",
    name: "比赛资料模板",
    zoneType: "search",
    searchMode: "custom",
    description: "适合比赛资料、提交时间和任务要求。",
    sections: ["比赛信息", "报名/提交时间", "任务要求", "可执行动作", "风险提醒", "来源列表"]
  },
  {
    id: "finance-company",
    name: "财经公司模板",
    zoneType: "analysis",
    searchMode: "finance",
    description: "适合公司、财报、公告和行业事件辅助研究。",
    sections: ["最新变化", "短期影响", "长期影响", "风险点", "需要人工复核", "来源列表", "免责声明"]
  },
  {
    id: "industry",
    name: "行业分析模板",
    zoneType: "analysis",
    searchMode: "industry",
    description: "适合行业热点、产业链影响与供需变化。",
    sections: ["行业新增信息", "上游影响", "中游变化", "下游影响", "供需变化", "风险断点", "来源列表"]
  },
  {
    id: "linkage",
    name: "联合分析模板",
    zoneType: "linkage",
    searchMode: "industry",
    description: "适合上游、中游、下游、政策和市场联动。",
    sections: ["模块概览", "关键联动路径", "上游变化", "中游传导", "下游影响", "证据支持", "假设与不确定性", "风险断点", "来源列表"]
  }
];

export function getTemplateById(id?: string | null) {
  return summaryTemplates.find((template) => template.id === id) ?? null;
}

export function getDefaultTemplate(zoneType: ZoneType, searchMode?: SearchMode) {
  return (
    summaryTemplates.find((template) => template.zoneType === zoneType && template.searchMode === searchMode) ??
    summaryTemplates.find((template) => template.zoneType === zoneType) ??
    summaryTemplates[0]
  );
}

export function formatTemplateSections(template: SummaryTemplate) {
  return template.sections.map((section) => `【${section}】`).join("\n");
}

