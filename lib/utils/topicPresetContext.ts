import {
  sourcePresets,
  sourcePresetTypeLabels,
  type SourcePreset
} from "@/lib/sourcePresets";

export type TopicPresetContext = {
  interest: string;
  keywords: string[];
  presets: Array<{
    id: string;
    name: string;
    category: SourcePreset["category"];
    sourceType: SourcePreset["sourceType"];
    queryTemplates: string[];
    credibilityHint: SourcePreset["credibilityHint"];
  }>;
  aiScoring: boolean;
  reportEnabled: boolean;
};

export type TopicSearchContext = {
  primaryKeyword: string;
  keywords: string[];
  presetNames: string[];
  queryTemplates: string[];
  queryText: string;
  description: string | null;
  reportEnabled: boolean;
};

const contextStart = "[[AI_RADAR_TOPIC_CONTEXT]]";
const contextEnd = "[[/AI_RADAR_TOPIC_CONTEXT]]";

function unique(values: string[], limit = 12) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const clean = value.trim();
    if (!clean || seen.has(clean)) {
      continue;
    }
    seen.add(clean);
    result.push(clean);
    if (result.length >= limit) {
      break;
    }
  }

  return result;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export function toTopicPresetContext(input: {
  interest: string;
  keywords: string[];
  presets: SourcePreset[];
  aiScoring: boolean;
  reportEnabled: boolean;
}): TopicPresetContext {
  return {
    interest: input.interest.trim(),
    keywords: unique(input.keywords),
    presets: input.presets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      category: preset.category,
      sourceType: preset.sourceType,
      queryTemplates: preset.queryTemplates,
      credibilityHint: preset.credibilityHint
    })),
    aiScoring: input.aiScoring,
    reportEnabled: input.reportEnabled
  };
}

export function buildTopicDescription(input: {
  base: string;
  interest: string;
  keywords: string[];
  presets: SourcePreset[];
  aiScoring: boolean;
  reportEnabled: boolean;
}) {
  const context = toTopicPresetContext(input);
  const readable = [
    input.base.trim(),
    context.interest ? `关注描述：${context.interest}` : "",
    context.keywords.length ? `推荐关键词：${context.keywords.join("、")}` : "",
    context.presets.length
      ? `推荐信息源：${context.presets.map((preset) => `${preset.name}（${sourcePresetTypeLabels[preset.sourceType]}）`).join("；")}`
      : "",
    `向导偏好：AI 评分 ${context.aiScoring ? "启用" : "关闭"}；报告生成 ${context.reportEnabled ? "启用" : "关闭"}`
  ].filter(Boolean);

  return [
    readable.join("\n"),
    contextStart,
    JSON.stringify(context),
    contextEnd
  ]
    .filter(Boolean)
    .join("\n");
}

function parseReadableDescription(description: string): TopicPresetContext | null {
  const keywordLine = description.match(/推荐关键词：(.+)/);
  const presetLine = description.match(/推荐信息源：(.+)/);
  const interestLine = description.match(/关注描述：(.+)/);
  const preferenceLine = description.match(/向导偏好：(.+)/);
  const presetNames = presetLine?.[1]
    ?.split(/[；;]/)
    .map((item) => item.replace(/（.+?）/g, "").trim())
    .filter(Boolean) ?? [];
  const matchedPresets = sourcePresets.filter((preset) => presetNames.includes(preset.name));

  if (!keywordLine && !presetLine && !interestLine) {
    return null;
  }

  return toTopicPresetContext({
    interest: interestLine?.[1]?.trim() ?? "",
    keywords: keywordLine?.[1]?.split(/[、,，]/).map((item) => item.trim()).filter(Boolean) ?? [],
    presets: matchedPresets,
    aiScoring: !preferenceLine?.[1]?.includes("AI 评分 关闭"),
    reportEnabled: !preferenceLine?.[1]?.includes("报告生成 关闭")
  });
}

export function parseTopicPresetContext(description?: string | null): TopicPresetContext | null {
  if (!description) {
    return null;
  }

  const start = description.indexOf(contextStart);
  const end = description.indexOf(contextEnd);

  if (start >= 0 && end > start) {
    const raw = description.slice(start + contextStart.length, end).trim();

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const presetEntries = Array.isArray(parsed.presets) ? parsed.presets : [];

      return {
        interest: typeof parsed.interest === "string" ? parsed.interest : "",
        keywords: unique(asStringArray(parsed.keywords)),
        presets: presetEntries.flatMap((entry) => {
          if (!entry || typeof entry !== "object") {
            return [];
          }
          const rawPreset = entry as Record<string, unknown>;
          const source = typeof rawPreset.id === "string" ? sourcePresets.find((preset) => preset.id === rawPreset.id) : null;
          return source
            ? [
                {
                  id: source.id,
                  name: source.name,
                  category: source.category,
                  sourceType: source.sourceType,
                  queryTemplates: source.queryTemplates,
                  credibilityHint: source.credibilityHint
                }
              ]
            : [];
        }),
        aiScoring: typeof parsed.aiScoring === "boolean" ? parsed.aiScoring : true,
        reportEnabled: typeof parsed.reportEnabled === "boolean" ? parsed.reportEnabled : true
      };
    } catch {
      return parseReadableDescription(description);
    }
  }

  return parseReadableDescription(description);
}

export function buildTopicSearchContext(topic: {
  name: string;
  category: string;
  searchMode: string;
  description?: string | null;
}): TopicSearchContext {
  const context = parseTopicPresetContext(topic.description);
  const keywords = unique([topic.name, ...(context?.keywords ?? [])], 12);
  const presetNames = context?.presets.map((preset) => preset.name) ?? [];
  const queryTemplates = unique(
    (context?.presets ?? [])
      .flatMap((preset) => preset.queryTemplates)
      .map((template) => template.replaceAll("{keyword}", keywords[0] ?? topic.name)),
    8
  );
  const queryText = (
    queryTemplates[0] ||
    unique([topic.name, ...keywords.slice(1, 3), topic.category], 4).join(" ")
  ).slice(0, 180);
  let readableDescription = topic.description ?? "";
  const start = readableDescription.indexOf(contextStart);
  const end = readableDescription.indexOf(contextEnd);
  if (start >= 0 && end > start) {
    readableDescription = `${readableDescription.slice(0, start)}${readableDescription.slice(end + contextEnd.length)}`.trim();
  }
  const descriptionLines = [
    readableDescription.trim(),
    presetNames.length ? `已选信息源预设：${presetNames.join("、")}` : "",
    queryTemplates.length ? `推荐查询：${queryTemplates.join("；")}` : ""
  ].filter(Boolean);

  return {
    primaryKeyword: topic.name,
    keywords,
    presetNames,
    queryTemplates,
    queryText,
    description: descriptionLines.length ? descriptionLines.join("\n") : topic.description ?? null,
    reportEnabled: context?.reportEnabled ?? !topic.description?.includes("报告生成 关闭")
  };
}
