export type LinkageProviderName = "mock" | "deepseek";

export type LinkageAnalyzeInput = {
  topic: {
    id: string;
    name: string;
    category: string;
    description?: string | null;
  };
  modules: Array<{
    id: string;
    name: string;
    role: string;
    description?: string | null;
    weight?: number | null;
    searchResults?: Array<{
      title: string;
      source: string;
      url: string;
      summary: string;
      publishedAt?: string | Date | null;
    }>;
  }>;
  edges: Array<{
    from: string;
    to: string;
    relationType: string;
    strength?: number | null;
    reason?: string | null;
  }>;
};

export type LinkagePath = {
  from: string;
  to: string;
  relationType: string;
  impact: string;
  strength: number;
  evidence: string[];
};

export type LinkageAnalyzeResult = {
  title: string;
  markdown: string;
  linkageScore: number;
  riskScore: number;
  confidence: number;
  keyPaths: LinkagePath[];
  assumptions: string[];
  warnings: string[];
  provider: LinkageProviderName;
  fallbackUsed: boolean;
};

export type LinkageProvider = {
  name: LinkageProviderName;
  analyze(input: LinkageAnalyzeInput): Promise<LinkageAnalyzeResult>;
};

