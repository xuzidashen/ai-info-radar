import type { KeywordCategory } from "@/lib/types";

export type SearchProviderName = "mock" | "tavily";
export type SearchTopic = "general" | "news" | "finance";
export type SearchTimeRange = "day" | "week" | "month" | "year";

export type SearchProviderInput = {
  keywordName: string;
  category: KeywordCategory;
  description?: string | null;
  queryText?: string | null;
  maxResults?: number;
  timeRange?: SearchTimeRange;
};

export type NormalizedSearchResult = {
  title: string;
  source: string;
  url: string;
  publishedAt?: string | null;
  content: string;
  rawContent?: string | null;
  score?: number | null;
};

export type SearchProviderResult = {
  results: NormalizedSearchResult[];
  provider: SearchProviderName;
};

export type SearchProvider = {
  name: SearchProviderName;
  search(input: SearchProviderInput): Promise<SearchProviderResult>;
};

export type SearchRunResult = SearchProviderResult & {
  requestedProvider: SearchProviderName;
  fallbackUsed: boolean;
  error?: string;
};
