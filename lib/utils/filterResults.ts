import type { NormalizedSearchResult } from "@/lib/providers/search/types";
import { getSourceCredibility } from "@/lib/utils/sourceCredibility";

type FilterOptions = {
  keywordName: string;
  maxResults?: number;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function relevancePenalty(result: NormalizedSearchResult, keywordName: string) {
  const keyword = normalizeText(keywordName);
  const haystack = normalizeText(`${result.title} ${result.content}`);

  if (!keyword || haystack.includes(keyword)) {
    return 0;
  }

  const keywordParts = keyword.split(/\s+/).filter(Boolean);
  const matched = keywordParts.some((part) => part.length > 1 && haystack.includes(part));

  return matched ? 0.05 : 0.18;
}

export function filterResults(
  results: NormalizedSearchResult[],
  options: FilterOptions
): NormalizedSearchResult[] {
  const seenTitles = new Set<string>();
  const maxResults = options.maxResults ?? 8;

  return results
    .filter((result) => result.title?.trim() && result.url?.trim())
    .map((result) => {
      const content = result.content?.trim() ?? "";
      const baseScore = typeof result.score === "number" ? result.score : 0.5;
      const contentPenalty = content.length < 20 ? 0.35 : content.length < 60 ? 0.12 : 0;
      const penalty = contentPenalty + relevancePenalty(result, options.keywordName);
      const credibility = getSourceCredibility(result.source, result.url);

      return {
        ...result,
        title: result.title.trim(),
        url: result.url.trim(),
        content,
        score: Math.max(0, Math.min(1, baseScore - penalty + credibility.score * 0.08))
      };
    })
    .filter((result) => {
      if ((result.content?.length ?? 0) < 12) {
        return false;
      }

      const normalizedTitle = normalizeText(result.title);
      if (seenTitles.has(normalizedTitle)) {
        return false;
      }

      seenTitles.add(normalizedTitle);
      return true;
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, maxResults);
}
