export const keywordCategories = [
  "finance",
  "policy",
  "ai-tech",
  "study",
  "custom"
] as const;

export type KeywordCategory = (typeof keywordCategories)[number];

export const categoryLabels: Record<KeywordCategory, string> = {
  finance: "公司/财经",
  policy: "考公/政策",
  "ai-tech": "AI/科技",
  study: "比赛/学习",
  custom: "自定义"
};

export const categoryHints: Record<KeywordCategory, string> = {
  finance: "适合公司动态、财报、产业链、监管信息，不输出具体交易方向。",
  policy: "适合公务员考试、政策文件、地方公告、申论素材积累。",
  "ai-tech": "适合 AI 产品、模型、开发工具、科技公司和技术趋势。",
  study: "适合比赛、课程、资料、备赛节点和学习任务。",
  custom: "适合个人自定义追踪主题。"
};

export type Importance = "high" | "medium" | "low";
export type Sentiment = "positive" | "neutral" | "negative";

export type SignalLevel =
  | "strong_positive"
  | "positive"
  | "neutral"
  | "negative"
  | "high_risk"
  | "insufficient_info";

export type RiskLevel = "low" | "medium" | "high" | "unknown";
export type AttentionLevel = "low" | "medium" | "high";

export const signalLevelLabels: Record<SignalLevel, string> = {
  strong_positive: "强正面关注",
  positive: "偏正面",
  neutral: "中性",
  negative: "偏负面",
  high_risk: "高风险",
  insufficient_info: "信息不足"
};

export const riskLevelLabels: Record<RiskLevel, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
  unknown: "未知"
};

export const attentionLevelLabels: Record<AttentionLevel, string> = {
  low: "低关注",
  medium: "中关注",
  high: "高关注"
};

export const zoneTypes = ["search", "analysis", "linkage"] as const;
export type ZoneType = (typeof zoneTypes)[number];

export const zoneTypeLabels: Record<ZoneType, string> = {
  search: "信息检索专区",
  analysis: "AI 分析辅助专区",
  linkage: "多模块联合分析专区"
};

export const zoneTypeShortLabels: Record<ZoneType, string> = {
  search: "Search Zone",
  analysis: "Analysis Zone",
  linkage: "Linkage Zone"
};

export const searchModes = [
  "general",
  "news",
  "policy",
  "exam",
  "finance",
  "tech",
  "industry",
  "custom"
] as const;

export type SearchMode = (typeof searchModes)[number];

export const searchModeLabels: Record<SearchMode, string> = {
  general: "通用检索",
  news: "新闻资讯",
  policy: "政策文件",
  exam: "考公考试",
  finance: "财经公司",
  tech: "科技主题",
  industry: "行业分析",
  custom: "自定义"
};

export const zoneReportTypes = ["daily", "topic", "linkage", "custom"] as const;
export type ZoneReportType = (typeof zoneReportTypes)[number];

export const topicRunTypes = ["search", "analysis", "linkage"] as const;
export type TopicRunType = (typeof topicRunTypes)[number];

export const topicRunTriggerTypes = ["manual", "schedule", "api", "retry"] as const;
export type TopicRunTriggerType = (typeof topicRunTriggerTypes)[number];

export const topicRunStatuses = ["running", "success", "failed", "partial_success", "fallback"] as const;
export type TopicRunStatus = (typeof topicRunStatuses)[number];

export const topicRunStatusLabels: Record<TopicRunStatus, string> = {
  running: "运行中",
  success: "成功",
  failed: "失败",
  partial_success: "部分成功",
  fallback: "已回退"
};

export const topicScheduleFrequencies = ["daily", "weekly", "manual_only"] as const;
export type TopicScheduleFrequency = (typeof topicScheduleFrequencies)[number];

export const topicScheduleFrequencyLabels: Record<TopicScheduleFrequency, string> = {
  daily: "每天",
  weekly: "每周",
  manual_only: "仅手动"
};

export const providerTypes = ["search", "summary", "factor", "linkage"] as const;
export type ProviderType = (typeof providerTypes)[number];

export const providerTypeLabels: Record<ProviderType, string> = {
  search: "SearchProvider",
  summary: "SummaryProvider",
  factor: "FactorProvider",
  linkage: "LinkageProvider"
};

export const qualityLabels = ["excellent", "good", "warning", "poor"] as const;
export type QualityLabel = (typeof qualityLabels)[number];

export const qualityLabelText: Record<QualityLabel, string> = {
  excellent: "优秀",
  good: "良好",
  warning: "需关注",
  poor: "较差"
};

export const linkageModuleRoles = [
  "upstream",
  "midstream",
  "downstream",
  "policy",
  "market",
  "company",
  "technology",
  "other"
] as const;

export type LinkageModuleRole = (typeof linkageModuleRoles)[number];

export const linkageModuleRoleLabels: Record<LinkageModuleRole, string> = {
  upstream: "上游",
  midstream: "中游",
  downstream: "下游",
  policy: "政策",
  market: "市场",
  company: "公司",
  technology: "技术",
  other: "其他"
};

export const linkageRelationTypes = [
  "demand_pull",
  "supply_constraint",
  "cost_pressure",
  "policy_driver",
  "technology_substitution",
  "sentiment_spillover",
  "capital_market",
  "other"
] as const;

export type LinkageRelationType = (typeof linkageRelationTypes)[number];

export const linkageRelationTypeLabels: Record<LinkageRelationType, string> = {
  demand_pull: "需求拉动",
  supply_constraint: "供给约束",
  cost_pressure: "成本压力",
  policy_driver: "政策驱动",
  technology_substitution: "技术替代",
  sentiment_spillover: "情绪外溢",
  capital_market: "资本市场",
  other: "其他"
};

export type KeywordDTO = {
  id: string;
  name: string;
  category: KeywordCategory;
  description: string | null;
  lastSearchedAt: string | null;
  createdAt: string;
  updatedAt: string;
  infoItemCount?: number;
  summaryCount?: number;
};

export type InfoItemDTO = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  importance: Importance;
  sentiment: Sentiment;
  provider: string;
  score: number | null;
  rawContent: string | null;
  fetchedAt: string | null;
  credibilityScore: number | null;
  credibilityLabel: "high" | "medium" | "low" | "unknown" | null;
  credibilityReason: string | null;
  eventType: string | null;
  eventSubtype: string | null;
  changeType: string | null;
  changeReason: string | null;
  sentimentScore: number | null;
  impactScore: number | null;
  riskScore: number | null;
  policyScore: number | null;
  techScore: number | null;
  financialScore: number | null;
  attentionScore: number | null;
  timeHorizon: string | null;
  factorConfidence: number | null;
  factorReason: string | null;
  relatedCompanies: string[];
  relatedIndustries: string[];
  keywordId: string;
  createdAt: string;
};

export type SummaryDTO = {
  id: string;
  keywordId: string;
  content: string;
  provider: string;
  createdAt: string;
};

export type DailySignalDTO = {
  id: string;
  keywordId: string;
  date: string;
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
  summary: string | null;
  factorSnapshot: string | null;
  createdAt: string;
  updatedAt: string;
  keyword?: KeywordDTO;
};

export type KeywordDetailDTO = KeywordDTO & {
  infoItems: InfoItemDTO[];
  summaries: SummaryDTO[];
  dailySignals?: DailySignalDTO[];
};

export type WorkspaceZoneDTO = {
  id: string;
  name: string;
  type: ZoneType;
  description: string | null;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  topicCount?: number;
  reportCount?: number;
  todayReportCount?: number;
  lastReportAt?: string | null;
};

export type ZoneTopicDTO = {
  id: string;
  zoneId: string;
  keywordId: string | null;
  name: string;
  category: string;
  description: string | null;
  searchMode: SearchMode;
  summaryTemplate: string | null;
  analysisEnabled: boolean;
  factorEnabled: boolean;
  linkageEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  keyword?: KeywordDTO | null;
  moduleCount?: number;
  edgeCount?: number;
  latestReport?: ZoneReportDTO | null;
  latestDailySignal?: DailySignalDTO | null;
  latestLinkageAnalysis?: LinkageAnalysisDTO | null;
};

export type ZoneReportDTO = {
  id: string;
  zoneId: string;
  runLogId: string | null;
  title: string;
  type: ZoneReportType;
  markdown: string;
  summary: string | null;
  metadata: string | null;
  createdAt: string;
  favorite?: boolean;
  tags?: ReportTagDTO[];
};

export type TopicRunLogDTO = {
  id: string;
  topicId: string | null;
  zoneId: string | null;
  parentRunLogId: string | null;
  runType: TopicRunType;
  triggerType: TopicRunTriggerType;
  status: TopicRunStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  searchProvider: string | null;
  summaryProvider: string | null;
  factorProvider: string | null;
  linkageProvider: string | null;
  fallbackUsed: boolean;
  errorMessage: string | null;
  rawResultCount: number;
  filteredCount: number;
  dedupedCount: number;
  savedItemCount: number;
  reportCount: number;
  qualityScore: number | null;
  qualityLabel: QualityLabel | null;
  qualityReason: string | null;
  retryCount: number;
  metadata: string | null;
  zone?: WorkspaceZoneDTO | null;
  topic?: ZoneTopicDTO | null;
  reports?: ZoneReportDTO[];
  parentRunLog?: Pick<TopicRunLogDTO, "id" | "status" | "triggerType" | "startedAt"> | null;
  retryRuns?: Array<Pick<TopicRunLogDTO, "id" | "status" | "triggerType" | "startedAt">>;
};

export type TopicScheduleDTO = {
  id: string;
  topicId: string;
  zoneId: string;
  name: string;
  enabled: boolean;
  frequency: TopicScheduleFrequency;
  hour: number | null;
  minute: number | null;
  dayOfWeek: number | null;
  timezone: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
  zone?: WorkspaceZoneDTO;
  topic?: ZoneTopicDTO;
};

export type ProviderQualitySnapshotDTO = {
  id: string;
  providerType: ProviderType;
  providerName: string;
  success: boolean;
  fallbackUsed: boolean;
  latencyMs: number | null;
  resultCount: number | null;
  errorMessage: string | null;
  qualityScore: number | null;
  estimatedCost: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: string;
};

export const notificationTypes = [
  "run_failed",
  "fallback_used",
  "high_risk_signal",
  "schedule_completed",
  "provider_quality_warning",
  "report_generated",
  "linkage_warning"
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export const notificationSeverities = ["info", "success", "warning", "danger"] as const;
export type NotificationSeverity = (typeof notificationSeverities)[number];

export const notificationSeverityLabels: Record<NotificationSeverity, string> = {
  info: "信息",
  success: "成功",
  warning: "注意",
  danger: "风险"
};

export type AppNotificationDTO = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  zoneId: string | null;
  topicId: string | null;
  runLogId: string | null;
  reportId: string | null;
  createdAt: string;
};

export type ReportTagDTO = {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
};

export type LinkageModuleDTO = {
  id: string;
  topicId: string;
  name: string;
  role: LinkageModuleRole;
  description: string | null;
  weight: number | null;
  createdAt: string;
  updatedAt: string;
};

export type LinkageEdgeDTO = {
  id: string;
  fromModuleId: string;
  toModuleId: string;
  relationType: LinkageRelationType;
  strength: number | null;
  direction: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  fromModule?: LinkageModuleDTO;
  toModule?: LinkageModuleDTO;
};

export type LinkageAnalysisDTO = {
  id: string;
  topicId: string;
  title: string;
  markdown: string;
  linkageScore: number | null;
  riskScore: number | null;
  confidence: number | null;
  keyPaths: string | null;
  assumptions: string | null;
  warnings: string | null;
  createdAt: string;
};

export type ZoneDetailDTO = WorkspaceZoneDTO & {
  topics: ZoneTopicDTO[];
  reports: ZoneReportDTO[];
};

export type ZoneTopicDetailDTO = ZoneTopicDTO & {
  zone: WorkspaceZoneDTO;
  reports: ZoneReportDTO[];
  infoItems: InfoItemDTO[];
  summaries: SummaryDTO[];
  dailySignals: DailySignalDTO[];
  modules: LinkageModuleDTO[];
  edges: LinkageEdgeDTO[];
  linkageAnalyses: LinkageAnalysisDTO[];
};

export function isKeywordCategory(value: unknown): value is KeywordCategory {
  return typeof value === "string" && keywordCategories.includes(value as KeywordCategory);
}

export function isZoneType(value: unknown): value is ZoneType {
  return typeof value === "string" && zoneTypes.includes(value as ZoneType);
}

export function isSearchMode(value: unknown): value is SearchMode {
  return typeof value === "string" && searchModes.includes(value as SearchMode);
}

export function isLinkageModuleRole(value: unknown): value is LinkageModuleRole {
  return typeof value === "string" && linkageModuleRoles.includes(value as LinkageModuleRole);
}

export function isLinkageRelationType(value: unknown): value is LinkageRelationType {
  return typeof value === "string" && linkageRelationTypes.includes(value as LinkageRelationType);
}

export function isTopicScheduleFrequency(value: unknown): value is TopicScheduleFrequency {
  return typeof value === "string" && topicScheduleFrequencies.includes(value as TopicScheduleFrequency);
}

export function isTopicRunStatus(value: unknown): value is TopicRunStatus {
  return typeof value === "string" && topicRunStatuses.includes(value as TopicRunStatus);
}

export function isTopicRunType(value: unknown): value is TopicRunType {
  return typeof value === "string" && topicRunTypes.includes(value as TopicRunType);
}

export function isTopicRunTriggerType(value: unknown): value is TopicRunTriggerType {
  return typeof value === "string" && topicRunTriggerTypes.includes(value as TopicRunTriggerType);
}
