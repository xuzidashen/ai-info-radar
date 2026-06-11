import type { AttentionLevel, Importance, KeywordCategory, RiskLevel, Sentiment, SignalLevel } from "@/lib/types";

export type FactorProviderName = "mock" | "deepseek";

export type FactorKeywordInput = {
  id: string;
  name: string;
  category: KeywordCategory;
  description?: string | null;
};

export type FactorInfoItemInput = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  importance: Importance;
  sentiment: Sentiment;
  provider: string;
  score?: number | null;
  credibilityLabel?: "high" | "medium" | "low" | "unknown" | null;
  credibilityScore?: number | null;
  credibilityReason?: string | null;
  rawContent?: string | null;
};

export type FactorAnalyzeInput = {
  keyword: FactorKeywordInput;
  infoItems: FactorInfoItemInput[];
};

export type ItemFactorResult = {
  infoItemId: string;
  eventType: string | null;
  eventSubtype: string | null;
  sentimentScore: number;
  impactScore: number;
  riskScore: number;
  policyScore: number;
  techScore: number;
  financialScore: number;
  attentionScore: number;
  timeHorizon: string | null;
  factorConfidence: number;
  factorReason: string;
  relatedCompanies: string[];
  relatedIndustries: string[];
};

export type DailySignalResult = {
  newsCount: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  avgSentiment: number | null;
  avgImpact: number | null;
  avgRisk: number | null;
  avgPolicy: number | null;
  avgTech: number | null;
  avgFinancial: number | null;
  avgAttention: number | null;
  avgConfidence: number | null;
  signalLevel: SignalLevel;
  riskLevel: RiskLevel;
  attentionLevel: AttentionLevel;
  summary: string;
  factorSnapshot: string;
};

export type FactorAnalyzeResult = {
  provider: FactorProviderName;
  itemFactors: ItemFactorResult[];
  dailySignal: DailySignalResult;
};

export type FactorRunResult = FactorAnalyzeResult & {
  requestedProvider: FactorProviderName;
  fallbackUsed: boolean;
  error?: string;
};

export type FactorProvider = {
  name: FactorProviderName;
  analyze(input: FactorAnalyzeInput): Promise<FactorAnalyzeResult>;
};

