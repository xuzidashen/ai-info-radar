import type { Importance, InfoItemDTO, KeywordCategory } from "@/lib/types";

export type SummaryProviderName = "mock" | "deepseek";

export type SummaryProviderInput = {
  keyword: {
    name: string;
    category: KeywordCategory;
    description?: string | null;
  };
  infoItems: Array<{
    title: string;
    source: string;
    summary: string;
    importance: Importance;
    url: string;
    publishedAt?: string | null;
    provider?: string | null;
    score?: number | null;
    credibilityLabel?: InfoItemDTO["credibilityLabel"];
    credibilityScore?: number | null;
    credibilityReason?: string | null;
  }>;
};

export type GeneratedSummary = {
  content: string;
  provider: SummaryProviderName;
};

export type SummaryProvider = {
  name: SummaryProviderName;
  generate(input: SummaryProviderInput): Promise<GeneratedSummary>;
};

export type SummaryRunResult = GeneratedSummary & {
  requestedProvider: SummaryProviderName;
  fallbackUsed: boolean;
  error?: string;
};
