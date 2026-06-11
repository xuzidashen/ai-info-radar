import { generateMockInfoItems } from "@/lib/mockSearch";
import type { SearchProvider, SearchProviderInput, SearchProviderResult } from "@/lib/providers/search/types";

export class MockSearchProvider implements SearchProvider {
  name = "mock" as const;

  async search(input: SearchProviderInput): Promise<SearchProviderResult> {
    const results = generateMockInfoItems({
      name: input.keywordName,
      category: input.category
    })
      .slice(0, input.maxResults ?? 5)
      .map((item, index) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        publishedAt: item.publishedAt.toISOString(),
        content: item.summary,
        rawContent: null,
        score: Number((0.95 - index * 0.08).toFixed(2))
      }));

    return {
      provider: this.name,
      results
    };
  }
}
