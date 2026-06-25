import type { NormalizedSearchResult } from "@/lib/providers/search/types";
import { canonicalizeUrl } from "@/lib/utils/infoQuality";
import { getSourceCredibility } from "@/lib/utils/sourceCredibility";

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "")
    .trim();
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function canonicalOf(url: string) {
  return canonicalizeUrl(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function charSimilarity(a: string, b: string) {
  const left = new Set([...normalizeTitle(a)]);
  const right = new Set([...normalizeTitle(b)]);

  if (left.size === 0 || right.size === 0) {
    return 0;
  }

  let overlap = 0;
  left.forEach((char) => {
    if (right.has(char)) {
      overlap += 1;
    }
  });

  return overlap / Math.max(left.size, right.size);
}

function qualityScore(result: NormalizedSearchResult) {
  const credibility = getSourceCredibility(result.source, result.url);

  return [
    result.url ? 2 : 0,
    result.publishedAt ? 1.2 : 0,
    Math.min((result.content?.length ?? 0) / 500, 1),
    typeof result.score === "number" ? result.score : 0.5,
    credibility.score
  ].reduce((sum, value) => sum + value, 0);
}

function chooseBetter(a: NormalizedSearchResult, b: NormalizedSearchResult) {
  return qualityScore(b) > qualityScore(a) ? b : a;
}

export function dedupeResults(results: NormalizedSearchResult[]): NormalizedSearchResult[] {
  const deduped: NormalizedSearchResult[] = [];

  for (const result of results) {
    const sameIndex = deduped.findIndex((existing) => {
      if (existing.url && result.url && existing.url === result.url) {
        return true;
      }

      if (existing.url && result.url && canonicalOf(existing.url) === canonicalOf(result.url)) {
        return true;
      }

      const titleSimilarity = charSimilarity(existing.title, result.title);
      const sameSource = existing.source === result.source || hostOf(existing.url) === hostOf(result.url);

      return titleSimilarity >= 0.86 || (sameSource && titleSimilarity >= 0.68);
    });

    if (sameIndex === -1) {
      deduped.push(result);
    } else {
      deduped[sameIndex] = chooseBetter(deduped[sameIndex], result);
    }
  }

  return deduped.sort((a, b) => qualityScore(b) - qualityScore(a));
}
