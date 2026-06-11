import { MockSearchProvider } from "@/lib/providers/search/mockSearchProvider";
import { runSearchProvider } from "@/lib/providers/search";
import type { NormalizedSearchResult } from "@/lib/providers/search/types";
import type { KeywordCategory } from "@/lib/types";
import { dedupeResults } from "@/lib/utils/dedupeResults";
import { filterResults } from "@/lib/utils/filterResults";
import { getSourceCredibility } from "@/lib/utils/sourceCredibility";

export function processSearchResults(results: NormalizedSearchResult[], keywordName: string) {
  return dedupeResults(
    filterResults(results, {
      keywordName,
      maxResults: 12
    })
  )
    .slice(0, 8)
    .map((result) => ({
      ...result,
      credibility: getSourceCredibility(result.source, result.url)
    }));
}

export async function runSearchForTest(input: {
  keywordName: string;
  category: KeywordCategory;
  description?: string | null;
}) {
  const searchRun = await runSearchProvider({
    ...input,
    maxResults: 8
  });
  const processedResults = processSearchResults(searchRun.results, input.keywordName);

  if (processedResults.length > 0) {
    return {
      ...searchRun,
      usedMock: searchRun.provider === "mock",
      usedTavily: searchRun.provider === "tavily",
      rawCount: searchRun.results.length,
      results: processedResults
    };
  }

  const mockRun = await new MockSearchProvider().search({
    ...input,
    maxResults: 8
  });

  return {
    ...mockRun,
    requestedProvider: searchRun.requestedProvider,
    fallbackUsed: true,
    usedMock: true,
    usedTavily: false,
    error: searchRun.error ?? "Search results were empty after filtering and dedupe",
    rawCount: searchRun.results.length,
    results: processSearchResults(mockRun.results, input.keywordName)
  };
}
