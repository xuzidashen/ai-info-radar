export type SummaryConfidence = "high" | "medium" | "low";

export type StructuredSummary = {
  overview: string;
  keyChanges: Array<{
    title: string;
    detail: string;
    confidence: SummaryConfidence;
  }>;
  whyItMatters: string[];
  risks: string[];
  sourceNotes: Array<{
    source: string;
    note: string;
    url?: string;
  }>;
};

const emptySummary: StructuredSummary = {
  overview: "现有信息不足以形成明确结论。",
  keyChanges: [],
  whyItMatters: [],
  risks: ["现有来源有限，需要结合后续公开信息继续验证。"],
  sourceNotes: []
};

function cleanText(value: unknown, limit = 500) {
  if (typeof value !== "string") return "";
  return value
    .replace(/```(?:json|markdown)?/gi, "")
    .replace(/^[#>*\-\s]+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function stringList(value: unknown, limit = 6) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, 240)).filter(Boolean).slice(0, limit);
}

function confidence(value: unknown): SummaryConfidence {
  return value === "high" || value === "low" ? value : "medium";
}

function normalize(value: unknown): StructuredSummary | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const overview = cleanText(input.overview, 180);
  if (!overview) return null;

  const keyChanges = Array.isArray(input.keyChanges)
    ? input.keyChanges.flatMap((entry, index) => {
        if (!entry || typeof entry !== "object") return [];
        const item = entry as Record<string, unknown>;
        const detail = cleanText(item.detail, 360);
        if (!detail) return [];
        return [{
          title: cleanText(item.title, 80) || `重要变化 ${index + 1}`,
          detail,
          confidence: confidence(item.confidence)
        }];
      }).slice(0, 6)
    : [];

  const sourceNotes = Array.isArray(input.sourceNotes)
    ? input.sourceNotes.flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const item = entry as Record<string, unknown>;
        const source = cleanText(item.source, 160);
        const note = cleanText(item.note, 280);
        if (!source || !note) return [];
        const url = typeof item.url === "string" && /^https?:\/\//.test(item.url) ? item.url.slice(0, 1000) : undefined;
        return [{ source, note, url }];
      }).slice(0, 8)
    : [];

  return {
    overview,
    keyChanges,
    whyItMatters: stringList(input.whyItMatters),
    risks: stringList(input.risks),
    sourceNotes
  };
}

function extractJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  return start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate;
}

function legacySummary(content: string): StructuredSummary {
  const cleaned = content.trim();
  if (!cleaned) return emptySummary;
  const sections = [...cleaned.matchAll(/(?:【([^】]+)】|^#{1,4}\s+(.+)$)\s*([\s\S]*?)(?=【[^】]+】|^#{1,4}\s+|$)/gm)]
    .map((match) => ({ title: cleanText(match[1] || match[2], 60), body: cleanText(match[3], 900) }))
    .filter((item) => item.title && item.body);
  const plain = cleanText(cleaned, 1800);
  const overviewSection = sections.find((item) => /概览|摘要|新增|重点|结论/.test(item.title));
  const riskSection = sections.find((item) => /风险|不确定/.test(item.title));
  const sourceSection = sections.find((item) => /来源/.test(item.title));
  const whySections = sections.filter((item) => /影响|值得|建议|意义/.test(item.title));
  const changeSections = sections.filter((item) => !/来源|风险|免责声明|影响|值得|建议/.test(item.title));
  const sentences = plain.split(/[。！？\n]+/).map((item) => cleanText(item, 260)).filter((item) => item.length > 8);

  return {
    overview: (overviewSection?.body || sentences[0] || emptySummary.overview).slice(0, 180),
    keyChanges: (changeSections.length ? changeSections : sentences.slice(1, 4).map((body, index) => ({ title: `重要变化 ${index + 1}`, body })))
      .slice(0, 5)
      .map((item, index) => ({ title: item.title || `重要变化 ${index + 1}`, detail: item.body, confidence: "medium" as const })),
    whyItMatters: whySections.map((item) => item.body).slice(0, 5),
    risks: riskSection ? [riskSection.body] : emptySummary.risks,
    sourceNotes: sourceSection
      ? sourceSection.body.split(/\s*(?:\d+[.、]|[-•])\s*/).map((note) => cleanText(note, 260)).filter(Boolean).slice(0, 6).map((note, index) => ({ source: `来源 ${index + 1}`, note }))
      : []
  };
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
  const changes = summary.keyChanges.length
    ? summary.keyChanges.map((item, index) => `${index + 1}. **${item.title}**\n   ${item.detail}\n   置信度：${item.confidence}`).join("\n\n")
    : "暂无明确变化。";
  const why = summary.whyItMatters.length ? summary.whyItMatters.map((item) => `- ${item}`).join("\n") : "- 暂无补充。";
  const risks = summary.risks.length ? summary.risks.map((item) => `- ${item}`).join("\n") : "- 暂无明确风险。";
  const sources = summary.sourceNotes.length
    ? summary.sourceNotes.map((item) => `- ${item.source}：${item.note}`).join("\n")
    : "- 详见来源列表。";

  return `### 一句话总览\n${summary.overview}\n\n### 重要变化\n${changes}\n\n### 为什么值得关注\n${why}\n\n### 风险与不确定性\n${risks}\n\n### 来源说明\n${sources}`;
}

export function serializeStructuredSummary(summary: StructuredSummary) {
  return JSON.stringify(summary);
}
