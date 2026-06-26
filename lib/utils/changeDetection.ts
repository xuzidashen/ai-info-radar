import type { InfoItem } from "@prisma/client";

import type { NormalizedSearchResult } from "@/lib/providers/search/types";
import { canonicalizeUrl, evaluateSearchResultQuality } from "@/lib/utils/infoQuality";

export type ChangeType =
  | "new"
  | "update"
  | "duplicate"
  | "stale"
  | "important_change"
  | "low_signal"
  | "needs_review";

const CHANGE_PREFIX = "[[CHANGE:";

const changeTypeLabels: Record<ChangeType, string> = {
  new: "新",
  update: "补充",
  duplicate: "重复",
  stale: "旧闻",
  important_change: "高价值",
  low_signal: "低相关",
  needs_review: "需复核"
};

const meaningfulChangeTypes = new Set<ChangeType>(["new", "update", "important_change", "needs_review"]);

function normalizeText(value?: string | null) {
  return (value ?? "")
    .toLocaleLowerCase("zh-CN")
    .replace(/[^\p{L}\p{N}\u4e00-\u9fa5]+/gu, "");
}

function titleSimilarity(left?: string | null, right?: string | null) {
  const a = normalizeText(left);
  const b = normalizeText(right);

  if (!a || !b) return 0;
  if (a === b) return 1;

  const setA = new Set(a.split(""));
  const setB = new Set(b.split(""));
  let shared = 0;
  for (const char of setA) {
    if (setB.has(char)) shared += 1;
  }
  return shared / Math.max(1, Math.min(setA.size, setB.size));
}

function relevanceScore(result: Pick<NormalizedSearchResult, "title" | "content">, keywordName: string, extraKeywords: string[] = []) {
  const text = normalizeText(`${result.title} ${result.content}`);
  const tokens = [keywordName, ...extraKeywords]
    .flatMap((item) => item.split(/[、，,\s]+/))
    .map((item) => normalizeText(item))
    .filter((item) => item.length > 1);

  if (!tokens.length) return 1;
  const matched = tokens.filter((token) => text.includes(token)).length;
  return matched / Math.min(tokens.length, 4);
}

function isOlderThanDays(value?: string | Date | null, days = 45) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() > days * 24 * 60 * 60 * 1000;
}

export function formatChangeTypeLabel(changeType?: ChangeType | null) {
  if (!changeType) return "";
  return changeTypeLabels[changeType];
}

export function isMeaningfulChangeType(changeType?: ChangeType | null) {
  return Boolean(changeType && meaningfulChangeTypes.has(changeType));
}

export function applyChangeTypeMarker(changeType: ChangeType, reason?: string | null) {
  const suffix = reason?.trim() ? ` ${reason.trim()}` : "";
  return `${CHANGE_PREFIX}${changeType}]${suffix}`.trim();
}

export function extractChangeTypeMarker(value?: string | null) {
  if (!value) return null;
  const match = value.match(/\[\[CHANGE:([a-z_]+)\]\]/i);
  if (!match) return null;
  const changeType = match[1] as ChangeType;
  return changeTypeLabels[changeType] ? changeType : null;
}

export function stripChangeTypeMarker(value?: string | null) {
  if (!value) return null;
  return value.replace(/\[\[CHANGE:[a-z_]+\]\]\s*/i, "").trim() || null;
}

export function detectChangeType(input: {
  result: Pick<NormalizedSearchResult, "title" | "content" | "rawContent" | "source" | "url" | "publishedAt">;
  keywordName: string;
  extraKeywords?: string[];
  existingItems?: Array<Pick<InfoItem, "title" | "url" | "source" | "publishedAt" | "credibilityLabel">>;
}) {
  const quality = evaluateSearchResultQuality({
    result: input.result as NormalizedSearchResult,
    keywordName: input.keywordName,
    extraKeywords: input.extraKeywords
  });
  const existingItems = input.existingItems ?? [];
  const canonicalUrl = canonicalizeUrl(input.result.url);
  const relevance = relevanceScore(input.result, input.keywordName, input.extraKeywords);

  const duplicate = existingItems.find((item) => canonicalUrl && canonicalizeUrl(item.url) === canonicalUrl);
  if (duplicate) {
    return { changeType: "duplicate" as const, label: formatChangeTypeLabel("duplicate"), reason: "链接已存在，判定为重复内容。", meaningful: false, quality };
  }

  let bestTitleMatch = 0;
  for (const item of existingItems) {
    bestTitleMatch = Math.max(bestTitleMatch, titleSimilarity(input.result.title, item.title));
  }

  if (bestTitleMatch >= 0.85) {
    return { changeType: "update" as const, label: formatChangeTypeLabel("update"), reason: "标题高度相似，判定为补充报道。", meaningful: true, quality };
  }

  if (isOlderThanDays(input.result.publishedAt, 45)) {
    return { changeType: "stale" as const, label: formatChangeTypeLabel("stale"), reason: "发布时间较早，更像旧闻回流。", meaningful: false, quality };
  }

  if (relevance < 0.25) {
    return { changeType: "low_signal" as const, label: formatChangeTypeLabel("low_signal"), reason: "与主题相关度偏低，噪音较多。", meaningful: false, quality };
  }

  const needsReview =
    quality.credibility.label === "low" ||
    quality.sourceType === "unknown" ||
    quality.sourceType === "self_media" ||
    !input.result.url ||
    !input.result.source;

  if (quality.credibility.label === "high" && (quality.sourceType === "official" || quality.sourceType === "media") && relevance >= 0.5) {
    return { changeType: "important_change" as const, label: formatChangeTypeLabel("important_change"), reason: "来源可信且与主题强相关，属于高价值变化。", meaningful: true, quality };
  }

  if (needsReview) {
    return { changeType: "needs_review" as const, label: formatChangeTypeLabel("needs_review"), reason: "来源或完整度不足，建议人工复核。", meaningful: true, quality };
  }

  return { changeType: "new" as const, label: formatChangeTypeLabel("new"), reason: "首次出现的新内容。", meaningful: true, quality };
}
