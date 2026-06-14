import type { Importance } from "@/lib/types";

export type ScoreableInfoItem = {
  score?: number | null;
  importance?: Importance | string | null;
  factorReason?: string | null;
  credibilityReason?: string | null;
  summary?: string | null;
  eventType?: string | null;
  eventSubtype?: string | null;
  relatedIndustries?: string[] | string | null;
  provider?: string | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function toDisplayScore(score?: number | null, importance?: Importance | string | null) {
  if (typeof score === "number" && Number.isFinite(score)) {
    return clamp(score <= 1 ? score * 10 : score, 0, 10);
  }

  if (importance === "high") {
    return 8.5;
  }
  if (importance === "medium") {
    return 6.5;
  }
  if (importance === "low") {
    return 4;
  }

  return 5;
}

export function formatDisplayScore(score?: number | null, importance?: Importance | string | null) {
  return `${toDisplayScore(score, importance).toFixed(1)}/10`;
}

export function buildScoreReason(item: ScoreableInfoItem) {
  if (item.factorReason) {
    return item.factorReason;
  }

  if (item.credibilityReason) {
    return item.credibilityReason;
  }

  if (item.score !== null && item.score !== undefined) {
    return "基于搜索相关度、来源质量和内容完整度换算为 0-10 评分。";
  }

  if (item.importance === "high") {
    return "该信息被标记为高优先级，按规则映射为高分参考项。";
  }
  if (item.importance === "medium") {
    return "该信息被标记为中优先级，适合作为背景或跟踪材料。";
  }
  if (item.importance === "low") {
    return "该信息被标记为低优先级，当前仅作为补充信息。";
  }

  return "现有来源不足以判断，按中性分处理。";
}

function parseStringList(value: string[] | string | null | undefined) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  } catch {
    return value
      .split(/[、,，\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function deriveItemTags(item: ScoreableInfoItem, fallbackCategory?: string | null) {
  const tags = new Set<string>();

  if (item.eventType) {
    tags.add(item.eventType);
  }
  if (item.eventSubtype) {
    tags.add(item.eventSubtype);
  }
  for (const industry of parseStringList(item.relatedIndustries)) {
    tags.add(industry);
  }
  if (fallbackCategory) {
    tags.add(fallbackCategory);
  }
  if (item.importance === "high") {
    tags.add("高分关注");
  }
  if (item.provider) {
    tags.add(item.provider);
  }

  return Array.from(tags).slice(0, 6);
}
