import type {
  NormalizedSearchResult,
  SearchProvider,
  SearchProviderInput,
  SearchProviderResult,
  SearchTimeRange,
  SearchTopic
} from "@/lib/providers/search/types";
import type { KeywordCategory } from "@/lib/types";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  raw_content?: string | null;
  score?: number;
  published_date?: string | null;
};

type TavilyResponse = {
  results?: TavilyResult[];
};

function resolveTopic(category: KeywordCategory): SearchTopic {
  if (category === "finance") {
    return "finance";
  }

  if (category === "policy" || category === "ai-tech") {
    return "news";
  }

  return "general";
}

function resolveTimeRange(category: KeywordCategory, override?: SearchTimeRange): SearchTimeRange {
  if (override) {
    return override;
  }

  return category === "study" ? "month" : "week";
}

function sourceFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Tavily";
  }
}

export class TavilySearchProvider implements SearchProvider {
  name = "tavily" as const;

  async search(input: SearchProviderInput): Promise<SearchProviderResult> {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      throw new Error("TAVILY_API_KEY is not configured");
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: input.description
          ? `${input.keywordName} ${input.description}`
          : input.keywordName,
        topic: resolveTopic(input.category),
        time_range: resolveTimeRange(input.category, input.timeRange),
        max_results: input.maxResults ?? 8,
        search_depth: "basic",
        include_raw_content: false
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(`Tavily search failed: ${response.status} ${message.slice(0, 200)}`);
    }

    const data = (await response.json()) as TavilyResponse;
    const results: NormalizedSearchResult[] = (data.results ?? [])
      .filter((item) => item.title && item.url)
      .map((item) => {
        const url = item.url ?? "";

        return {
          title: item.title ?? "Untitled",
          source: sourceFromUrl(url),
          url,
          publishedAt: item.published_date ?? null,
          content: item.content ?? item.raw_content ?? "",
          rawContent: item.raw_content ?? null,
          score: typeof item.score === "number" ? item.score : null
        };
      });

    if (results.length === 0) {
      throw new Error("Tavily returned no usable results");
    }

    return {
      provider: this.name,
      results
    };
  }
}
