export type SummaryConfidence = "high" | "medium" | "low";
export type SummaryContentType = "policy" | "financial_report" | "news_event" | "industry_update" | "person_event" | "general";
export type SummarySourceType = "official" | "media" | "social" | "self_media" | "unknown";

export type StructuredSummary = {
  contentType: SummaryContentType;
  title: string;
  overview: string;
  coreFacts: string[];
  keyDetails: Array<{
    label: string;
    value: string;
  }>;
  impactTargets: string[];
  whyItMatters: string[];
  followUp: string[];
  uncertainties: string[];
  sources: Array<{
    title: string;
    url?: string;
    type: SummarySourceType;
    note: string;
  }>;
  keyChanges: Array<{
    title: string;
    detail: string;
    confidence: SummaryConfidence;
  }>;
  risks: string[];
  sourceNotes: Array<{
    source: string;
    note: string;
    url?: string;
  }>;
};

const emptySummary: StructuredSummary = {
  contentType: "general",
  title: "现有来源不足以判断",
  overview: "现有信息不足，需要人工复核。",
  coreFacts: ["现有来源不足以形成可验证事实。"],
  keyDetails: [
    { label: "发布方/主体", value: "未披露" },
    { label: "时间", value: "未披露" },
    { label: "核心内容", value: "现有来源不足，需要人工复核。" },
    { label: "关键数字", value: "未披露" }
  ],
  impactTargets: [],
  whyItMatters: [],
  followUp: ["等待更多可验证来源。"],
  uncertainties: ["现有来源有限，需要结合后续公开信息继续验证。"],
  sources: [],
  keyChanges: [],
  risks: ["现有来源有限，需要结合后续公开信息继续验证。"],
  sourceNotes: []
};

const contentTypes: SummaryContentType[] = ["policy", "financial_report", "news_event", "industry_update", "person_event", "general"];
const sourceTypes: SummarySourceType[] = ["official", "media", "social", "self_media", "unknown"];

function cleanText(value: unknown, limit = 500) {
  if (typeof value !== "string") return "";
  return value
    .replace(/```(?:json|markdown)?/gi, "")
    .replace(/^\s*(好的[，,。]?这是|以下是|当然[，,。]?|根据提供的信息[，,。]?)/, "")
    .replace(/^[#>*\-\s]+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function stringList(value: unknown, limit = 3, itemLimit = 240) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, itemLimit)).filter(Boolean).slice(0, limit);
}

function confidence(value: unknown): SummaryConfidence {
  return value === "high" || value === "low" ? value : "medium";
}

function contentType(value: unknown): SummaryContentType {
  return contentTypes.includes(value as SummaryContentType) ? value as SummaryContentType : "general";
}

function sourceType(value: unknown): SummarySourceType {
  return sourceTypes.includes(value as SummarySourceType) ? value as SummarySourceType : "unknown";
}

function keyDetails(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const label = cleanText(item.label, 60);
    const detail = cleanText(item.value, 260);
    return label && detail ? [{ label, value: detail }] : [];
  }).slice(0, 8);
}

function sourceNotes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const source = cleanText(item.source ?? item.title, 160);
    const note = cleanText(item.note, 280);
    if (!source || !note) return [];
    const url = typeof item.url === "string" && /^https?:\/\//.test(item.url) ? item.url.slice(0, 1000) : undefined;
    return [{ source, note, url }];
  }).slice(0, 5);
}

function sources(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const title = cleanText(item.title ?? item.source, 180);
    const note = cleanText(item.note, 320) || "该来源提供了部分事实线索。";
    if (!title) return [];
    const url = typeof item.url === "string" && /^https?:\/\//.test(item.url) ? item.url.slice(0, 1000) : undefined;
    return [{ title, url, type: sourceType(item.type), note }];
  }).slice(0, 5);
}

function legacyKeyChanges(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const detail = cleanText(item.detail, 360);
    if (!detail) return [];
    return [{
      title: cleanText(item.title, 80) || `核心事实 ${index + 1}`,
      detail,
      confidence: confidence(item.confidence)
    }];
  }).slice(0, 3);
}

function defaultKeyDetails(summary: Pick<StructuredSummary, "coreFacts" | "sources">) {
  return [
    { label: "发布方/主体", value: summary.sources[0]?.title || "未披露" },
    { label: "时间", value: "未披露" },
    { label: "核心内容", value: summary.coreFacts[0] || "现有来源不足，需要人工复核。" },
    { label: "关键数字", value: "未披露" }
  ];
}

function normalize(value: unknown): StructuredSummary | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const oldChanges = legacyKeyChanges(input.keyChanges);
  const parsedSources = sources(input.sources);
  const parsedSourceNotes = sourceNotes(input.sourceNotes);
  const normalizedSources = parsedSources.length
    ? parsedSources
    : parsedSourceNotes.map((item) => ({ title: item.source, url: item.url, type: "unknown" as const, note: item.note }));
  const coreFacts = stringList(input.coreFacts, 3, 280).length
    ? stringList(input.coreFacts, 3, 280)
    : oldChanges.map((item) => `${item.title}：${item.detail}`).slice(0, 3);
  const overview = cleanText(input.overview ?? input.conclusion ?? coreFacts[0] ?? input.title, 110);

  if (!overview && !coreFacts.length) return null;

  const normalized: StructuredSummary = {
    contentType: contentType(input.contentType),
    title: cleanText(input.title, 120) || overview || "事实型情报卡",
    overview: overview || coreFacts[0] || emptySummary.overview,
    coreFacts: coreFacts.length ? coreFacts : [overview || emptySummary.coreFacts[0]],
    keyDetails: keyDetails(input.keyDetails),
    impactTargets: stringList(input.impactTargets, 5, 120),
    whyItMatters: stringList(input.whyItMatters, 3, 220),
    followUp: stringList(input.followUp, 3, 220),
    uncertainties: stringList(input.uncertainties ?? input.risks, 3, 220),
    sources: normalizedSources,
    keyChanges: oldChanges,
    risks: [],
    sourceNotes: []
  };

  if (!normalized.keyDetails.length) {
    normalized.keyDetails = defaultKeyDetails(normalized);
  }

  if (!normalized.uncertainties.length) {
    normalized.uncertainties = emptySummary.uncertainties;
  }

  normalized.risks = normalized.uncertainties;
  normalized.keyChanges = normalized.keyChanges.length
    ? normalized.keyChanges
    : normalized.coreFacts.map((fact, index) => ({
        title: `核心事实 ${index + 1}`,
        detail: fact,
        confidence: "medium" as const
      }));
  normalized.sourceNotes = normalized.sources.map((item) => ({
    source: item.title,
    note: item.note,
    url: item.url
  }));

  return normalized;
}

function extractJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  return start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate;
}

function inferContentType(text: string): SummaryContentType {
  if (/财报|营收|净利润|毛利率|现金流|同比|环比/.test(text)) return "financial_report";
  if (/政策|公告|细则|补贴|申报|执行/.test(text)) return "policy";
  if (/行业|产业链|上游|中游|下游|产能|订单/.test(text)) return "industry_update";
  if (/人物|任命|辞任|发布会|活动|作品/.test(text)) return "person_event";
  if (/事件|回应|通报|发生/.test(text)) return "news_event";
  return "general";
}

function extractKeyNumbers(text: string) {
  const matches = text.match(/(?:\d+(?:\.\d+)?%?|\d+(?:\.\d+)?\s*(?:万|亿|元|人|家|项|年|月|日|小时|分钟|亿元|万元))/g);
  return matches?.slice(0, 8).join("、") || "未披露";
}

function legacySummary(content: string): StructuredSummary {
  const cleaned = content.trim();
  if (!cleaned) return emptySummary;
  const sections = [...cleaned.matchAll(/(?:【([^】]+)】|^#{1,4}\s+(.+)$)\s*([\s\S]*?)(?=【[^】]+】|^#{1,4}\s+|$)/gm)]
    .map((match) => ({ title: cleanText(match[1] || match[2], 60), body: cleanText(match[3], 900) }))
    .filter((item) => item.title && item.body);
  const plain = cleanText(cleaned, 1800);
  const overviewSection = sections.find((item) => /概览|摘要|新增|重点|结论|背景/.test(item.title));
  const riskSection = sections.find((item) => /风险|不确定|提示/.test(item.title));
  const sourceSection = sections.find((item) => /来源/.test(item.title));
  const whySections = sections.filter((item) => /影响|值得|建议|意义|关注/.test(item.title));
  const changeSections = sections.filter((item) => !/来源|风险|免责声明|影响|值得|建议|备注/.test(item.title));
  const sentences = plain.split(/[。！？\n]+/).map((item) => cleanText(item, 260)).filter((item) => item.length > 8);
  const facts = (changeSections.length ? changeSections.map((item) => item.body) : sentences).slice(0, 3);
  const overview = (overviewSection?.body || facts[0] || sentences[0] || emptySummary.overview).slice(0, 110);
  const parsedSources = sourceSection
    ? sourceSection.body.split(/\s*(?:\d+[.、]|[-•])\s*/).map((note) => cleanText(note, 260)).filter(Boolean).slice(0, 5).map((note, index) => ({
        title: `来源 ${index + 1}`,
        note,
        type: "unknown" as const
      }))
    : [];
  const summary: StructuredSummary = {
    contentType: inferContentType(plain),
    title: overview.slice(0, 80),
    overview,
    coreFacts: facts.length ? facts : [overview],
    keyDetails: [
      { label: "发布方/主体", value: parsedSources[0]?.title || "未披露" },
      { label: "时间", value: "未披露" },
      { label: "核心内容", value: facts[0] || overview },
      { label: "关键数字", value: extractKeyNumbers(plain) }
    ],
    impactTargets: whySections.map((item) => item.body).slice(0, 3),
    whyItMatters: whySections.map((item) => item.body).slice(0, 3),
    followUp: ["关注后续官方文件、公告更新和高可信来源交叉验证。"],
    uncertainties: riskSection ? [riskSection.body] : emptySummary.uncertainties,
    sources: parsedSources,
    keyChanges: [],
    risks: [],
    sourceNotes: []
  };
  summary.keyChanges = summary.coreFacts.map((fact, index) => ({ title: `核心事实 ${index + 1}`, detail: fact, confidence: "medium" as const }));
  summary.risks = summary.uncertainties;
  summary.sourceNotes = summary.sources.map((item) => ({ source: item.title, note: item.note, url: item.url }));
  return summary;
}

export function parseStructuredSummary(content?: string | null): StructuredSummary {
  if (!content?.trim()) return emptySummary;
  try {
    const parsed = JSON.parse(extractJson(content)) as unknown;
    return normalize(parsed) ?? legacySummary(content);
  } catch {
    return legacySummary(content);
  }
}

export function structuredSummaryToMarkdown(summary: StructuredSummary) {
  const facts = summary.coreFacts.length ? summary.coreFacts.map((item, index) => `${index + 1}. ${item}`).join("\n") : "暂无明确事实。";
  const details = summary.keyDetails.length ? summary.keyDetails.map((item) => `- ${item.label}：${item.value}`).join("\n") : "- 暂无关键信息。";
  const impacts = summary.impactTargets.length ? summary.impactTargets.map((item) => `- ${item}`).join("\n") : "- 暂无明确影响对象。";
  const why = summary.whyItMatters.length ? summary.whyItMatters.map((item) => `- ${item}`).join("\n") : "- 暂无补充。";
  const followUp = summary.followUp.length ? summary.followUp.map((item) => `- ${item}`).join("\n") : "- 等待更多来源。";
  const risks = summary.uncertainties.length ? summary.uncertainties.map((item) => `- ${item}`).join("\n") : "- 暂无明确风险。";
  const sourcesText = summary.sources.length
    ? summary.sources.map((item) => `- ${item.title}（${item.type}）：${item.note}${item.url ? `\n  ${item.url}` : ""}`).join("\n")
    : "- 详见来源列表。";

  return `### ${summary.title}\n${summary.overview}\n\n### 核心事实\n${facts}\n\n### 关键信息\n${details}\n\n### 影响对象\n${impacts}\n\n### 为什么值得关注\n${why}\n\n### 后续跟踪点\n${followUp}\n\n### 风险与不确定\n${risks}\n\n### 来源\n${sourcesText}`;
}

export function serializeStructuredSummary(summary: StructuredSummary) {
  return JSON.stringify(summary);
}
