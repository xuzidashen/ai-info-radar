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
  excludeWords: string[];
  contentDirections: string[];
  sourcePreference?: "官方优先" | "媒体优先" | "全网";
  depth?: string;
  searchScope?: string;
  presetNames: string[];
  queryTemplates: string[];
  queryTexts: string[];
  queryText: string;
  description: string | null;
  reportEnabled: boolean;
};

const contextStart = "[[AI_RADAR_TOPIC_CONTEXT]]";
const contextEnd = "[[/AI_RADAR_TOPIC_CONTEXT]]";
const preferenceMarker = "[[RADAR_TOPIC_PREFS]]";

type TopicPreferences = {
  keywords?: string[];
  excludeWords: string[];
  contentDirections: string[];
  sourcePreference?: "官方优先" | "媒体优先" | "全网";
  depth?: string;
  searchScope?: string;
  autoSummary?: boolean;
};

const mainFlowMetaPrefix = "[radar-meta]";

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

function parseTopicPreferences(description?: string | null): TopicPreferences {
  if (!description) {
    return { excludeWords: [], contentDirections: [] };
  }

  if (description.startsWith(mainFlowMetaPrefix)) {
    const lineBreak = description.indexOf("\n");
    const raw = lineBreak >= 0 ? description.slice(mainFlowMetaPrefix.length, lineBreak).trim() : description.slice(mainFlowMetaPrefix.length).trim();

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const sourcePreference = parsed.sourcePreference === "媒体优先" || parsed.sourcePreference === "全网" || parsed.sourcePreference === "官方优先"
        ? parsed.sourcePreference
        : undefined;
      return {
        keywords: unique(asStringArray(parsed.keywords), 12),
        excludeWords: unique(asStringArray(parsed.excludeWords), 12),
        contentDirections: unique(asStringArray(parsed.contentDirections), 6),
        sourcePreference,
        depth: typeof parsed.depth === "string" ? parsed.depth : undefined,
        searchScope: typeof parsed.searchScope === "string" ? parsed.searchScope : undefined,
        autoSummary: typeof parsed.autoSummary === "boolean" ? parsed.autoSummary : undefined
      };
    } catch {
      return { excludeWords: [], contentDirections: [] };
    }
  }

  const markerIndex = description.indexOf(preferenceMarker);
  if (markerIndex < 0) {
    return { excludeWords: [], contentDirections: [] };
  }

  try {
    const raw = description.slice(markerIndex + preferenceMarker.length).trim();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const sourcePreference = parsed.sourcePreference === "媒体优先" || parsed.sourcePreference === "全网" || parsed.sourcePreference === "官方优先"
      ? parsed.sourcePreference
      : undefined;
    return {
      keywords: unique(asStringArray(parsed.keywords), 12),
      excludeWords: unique(asStringArray(parsed.excludeWords), 12),
      contentDirections: unique(asStringArray(parsed.contentDirections), 6),
      sourcePreference,
      depth: typeof parsed.depth === "string" ? parsed.depth : undefined,
      searchScope: typeof parsed.searchScope === "string" ? parsed.searchScope : undefined,
      autoSummary: typeof parsed.autoSummary === "boolean" ? parsed.autoSummary : undefined
    };
  } catch {
    return { excludeWords: [], contentDirections: [] };
  }
}

function stripTopicPreferences(description: string) {
  if (description.startsWith(mainFlowMetaPrefix)) {
    const lineBreak = description.indexOf("\n");
    return lineBreak >= 0 ? description.slice(lineBreak + 1).trim() : "";
  }

  const markerIndex = description.indexOf(preferenceMarker);
  return markerIndex >= 0 ? description.slice(0, markerIndex).trim() : description;
}

function sourcePreferenceTerms(sourcePreference?: TopicPreferences["sourcePreference"]) {
  if (sourcePreference === "官方优先") return ["官方", "公告", "原文"];
  if (sourcePreference === "媒体优先") return ["媒体", "报道", "来源"];
  return [];
}

function depthTerms(depth?: string) {
  if (depth === "深度") return ["深度", "解读", "影响"];
  if (depth === "简短") return ["最新", "要点"];
  return ["最新"];
}

function negativeTerms(excludeWords: string[]) {
  return excludeWords.slice(0, 4).map((word) => `-${word}`);
}

function buildQueryCandidates(input: {
  topicName: string;
  keywords: string[];
  contentDirections: string[];
  sourcePreference?: TopicPreferences["sourcePreference"];
  depth?: string;
  category: string;
  queryTemplates: string[];
  excludeWords: string[];
}) {
  const baseTerms = unique([
    input.topicName,
    ...input.keywords.slice(1, 4),
    ...input.contentDirections.slice(0, 2),
    input.category,
    ...sourcePreferenceTerms(input.sourcePreference),
    ...depthTerms(input.depth)
  ], 10);
  const excludes = negativeTerms(input.excludeWords);
  const candidateFromTerms = [...baseTerms, ...excludes].join(" ");
  const candidates = [
    input.queryTemplates[0],
    input.queryTemplates[1],
    candidateFromTerms
  ].filter((item): item is string => Boolean(item?.trim()));

  return unique(candidates.map((item) => item.replace(/\s+/g, " ").trim().slice(0, 180)), 2);
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
  const preferences = parseTopicPreferences(topic.description);
  const keywords = unique([topic.name, ...(preferences.keywords ?? []), ...(context?.keywords ?? [])], 12);
  const presetNames = context?.presets.map((preset) => preset.name) ?? [];
  const queryTemplates = unique(
    (context?.presets ?? [])
      .flatMap((preset) => preset.queryTemplates)
      .map((template) => template.replaceAll("{keyword}", keywords[0] ?? topic.name)),
    8
  );
  const queryTexts = buildQueryCandidates({
    topicName: topic.name,
    keywords,
    contentDirections: preferences.contentDirections,
    sourcePreference: preferences.sourcePreference,
    depth: preferences.depth,
    category: topic.category,
    queryTemplates,
    excludeWords: preferences.excludeWords
  });
  const queryText = queryTexts[0] ?? topic.name;
  let readableDescription = stripTopicPreferences(topic.description ?? "");
  const start = readableDescription.indexOf(contextStart);
  const end = readableDescription.indexOf(contextEnd);
  if (start >= 0 && end > start) {
    readableDescription = `${readableDescription.slice(0, start)}${readableDescription.slice(end + contextEnd.length)}`.trim();
  }
  const descriptionLines = [
    readableDescription.trim(),
    presetNames.length ? `已选信息源预设：${presetNames.join("、")}` : "",
    queryTemplates.length ? `推荐查询：${queryTemplates.join("；")}` : "",
    preferences.excludeWords.length ? `排除词：${preferences.excludeWords.join("、")}` : "",
    preferences.contentDirections.length ? `内容方向：${preferences.contentDirections.join("、")}` : "",
    preferences.sourcePreference ? `来源偏好：${preferences.sourcePreference}` : "",
    preferences.depth ? `内容深度：${preferences.depth}` : "",
    preferences.searchScope ? `搜索范围：${preferences.searchScope}` : ""
  ].filter(Boolean);

  return {
    primaryKeyword: topic.name,
    keywords,
    excludeWords: preferences.excludeWords,
    contentDirections: preferences.contentDirections,
    sourcePreference: preferences.sourcePreference,
    depth: preferences.depth,
    searchScope: preferences.searchScope,
    presetNames,
    queryTemplates,
    queryTexts,
    queryText,
    description: descriptionLines.length ? descriptionLines.join("\n") : topic.description ?? null,
    reportEnabled: context?.reportEnabled ?? !topic.description?.includes("报告生成 关闭")
  };
}
