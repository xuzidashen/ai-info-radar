import type {
  DailySignal,
  AppNotification,
  InfoItem,
  Keyword,
  LinkageAnalysis,
  LinkageEdge,
  LinkageModule,
  ProviderQualitySnapshot,
  ReportFavorite,
  ReportTag,
  Summary,
  TopicRunLog,
  TopicSchedule,
  WorkspaceZone,
  ZoneReport,
  ZoneReportTag,
  ZoneTopic
} from "@prisma/client";
import type {
  DailySignalDTO,
  AppNotificationDTO,
  InfoItemDTO,
  KeywordDTO,
  LinkageAnalysisDTO,
  LinkageEdgeDTO,
  LinkageModuleDTO,
  ProviderQualitySnapshotDTO,
  ReportTagDTO,
  SummaryDTO,
  TopicRunLogDTO,
  TopicScheduleDTO,
  WorkspaceZoneDTO,
  ZoneReportDTO,
  ZoneTopicDTO
} from "@/lib/types";

type KeywordWithCounts = Keyword & {
  _count?: {
    infoItems: number;
    summaries: number;
  };
};

type DailySignalWithKeyword = DailySignal & {
  keyword?: KeywordWithCounts;
};

type WorkspaceZoneWithRelations = WorkspaceZone & {
  _count?: {
    topics?: number;
    reports?: number;
  };
  reports?: ZoneReport[];
};

type ZoneTopicWithRelations = ZoneTopic & {
  keyword?: KeywordWithCounts | null;
  moduleLinks?: LinkageModule[];
  linkageAnalyses?: LinkageAnalysis[];
  latestReport?: ZoneReport | null;
  latestDailySignal?: DailySignal | null;
};

type LinkageEdgeWithModules = LinkageEdge & {
  fromModule?: LinkageModule;
  toModule?: LinkageModule;
};

type TopicRunLogWithRelations = TopicRunLog & {
  zone?: WorkspaceZoneWithRelations | null;
  topic?: ZoneTopicWithRelations | null;
  reports?: ZoneReport[];
  parentRunLog?: TopicRunLog | null;
  retryRuns?: TopicRunLog[];
};

type TopicScheduleWithRelations = TopicSchedule & {
  zone?: WorkspaceZoneWithRelations;
  topic?: ZoneTopicWithRelations;
};

type ReportTagLinkWithTag = ZoneReportTag & {
  tag?: ReportTag;
};

type ZoneReportWithMetaRelations = ZoneReport & {
  favorite?: ReportFavorite | null;
  tagLinks?: ReportTagLinkWithTag[];
};

function parseStringArray(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function serializeKeyword(keyword: KeywordWithCounts): KeywordDTO {
  return {
    id: keyword.id,
    name: keyword.name,
    category: keyword.category as KeywordDTO["category"],
    description: keyword.description,
    lastSearchedAt: keyword.lastSearchedAt?.toISOString() ?? null,
    createdAt: keyword.createdAt.toISOString(),
    updatedAt: keyword.updatedAt.toISOString(),
    infoItemCount: keyword._count?.infoItems,
    summaryCount: keyword._count?.summaries
  };
}

export function serializeInfoItem(item: InfoItem): InfoItemDTO {
  return {
    id: item.id,
    title: item.title,
    source: item.source,
    url: item.url,
    publishedAt: item.publishedAt.toISOString(),
    summary: item.summary,
    importance: item.importance as InfoItemDTO["importance"],
    sentiment: item.sentiment as InfoItemDTO["sentiment"],
    provider: item.provider,
    score: item.score,
    rawContent: item.rawContent,
    fetchedAt: item.fetchedAt?.toISOString() ?? null,
    credibilityScore: item.credibilityScore,
    credibilityLabel: item.credibilityLabel as InfoItemDTO["credibilityLabel"],
    credibilityReason: item.credibilityReason,
    eventType: item.eventType,
    eventSubtype: item.eventSubtype,
    sentimentScore: item.sentimentScore,
    impactScore: item.impactScore,
    riskScore: item.riskScore,
    policyScore: item.policyScore,
    techScore: item.techScore,
    financialScore: item.financialScore,
    attentionScore: item.attentionScore,
    timeHorizon: item.timeHorizon,
    factorConfidence: item.factorConfidence,
    factorReason: item.factorReason,
    relatedCompanies: parseStringArray(item.relatedCompanies),
    relatedIndustries: parseStringArray(item.relatedIndustries),
    keywordId: item.keywordId,
    createdAt: item.createdAt.toISOString()
  };
}

export function serializeSummary(summary: Summary): SummaryDTO {
  return {
    id: summary.id,
    keywordId: summary.keywordId,
    content: summary.content,
    provider: summary.provider,
    createdAt: summary.createdAt.toISOString()
  };
}

export function serializeDailySignal(signal: DailySignalWithKeyword): DailySignalDTO {
  return {
    id: signal.id,
    keywordId: signal.keywordId,
    date: signal.date.toISOString(),
    newsCount: signal.newsCount,
    positiveCount: signal.positiveCount,
    negativeCount: signal.negativeCount,
    neutralCount: signal.neutralCount,
    avgSentiment: signal.avgSentiment,
    avgImpact: signal.avgImpact,
    avgRisk: signal.avgRisk,
    avgPolicy: signal.avgPolicy,
    avgTech: signal.avgTech,
    avgFinancial: signal.avgFinancial,
    avgAttention: signal.avgAttention,
    avgConfidence: signal.avgConfidence,
    signalLevel: signal.signalLevel as DailySignalDTO["signalLevel"],
    riskLevel: signal.riskLevel as DailySignalDTO["riskLevel"],
    attentionLevel: signal.attentionLevel as DailySignalDTO["attentionLevel"],
    summary: signal.summary,
    factorSnapshot: signal.factorSnapshot,
    createdAt: signal.createdAt.toISOString(),
    updatedAt: signal.updatedAt.toISOString(),
    keyword: signal.keyword ? serializeKeyword(signal.keyword) : undefined
  };
}

export function serializeWorkspaceZone(zone: WorkspaceZoneWithRelations): WorkspaceZoneDTO {
  const reports = zone.reports ?? [];
  const today = startOfToday();
  const lastReport = reports[0];

  return {
    id: zone.id,
    name: zone.name,
    type: zone.type as WorkspaceZoneDTO["type"],
    description: zone.description,
    icon: zone.icon,
    color: zone.color,
    createdAt: zone.createdAt.toISOString(),
    updatedAt: zone.updatedAt.toISOString(),
    topicCount: zone._count?.topics,
    reportCount: zone._count?.reports,
    todayReportCount: reports.filter((report) => report.createdAt >= today).length,
    lastReportAt: lastReport?.createdAt.toISOString() ?? null
  };
}

export function serializeReportTag(tag: ReportTag): ReportTagDTO {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    createdAt: tag.createdAt.toISOString()
  };
}

export function serializeZoneReport(report: ZoneReportWithMetaRelations): ZoneReportDTO {
  return {
    id: report.id,
    zoneId: report.zoneId,
    runLogId: report.runLogId,
    title: report.title,
    type: report.type as ZoneReportDTO["type"],
    markdown: report.markdown,
    summary: report.summary,
    metadata: report.metadata,
    createdAt: report.createdAt.toISOString(),
    favorite: report.favorite ? true : undefined,
    tags: report.tagLinks?.flatMap((link) => (link.tag ? [serializeReportTag(link.tag)] : []))
  };
}

export function serializeLinkageModule(module: LinkageModule): LinkageModuleDTO {
  return {
    id: module.id,
    topicId: module.topicId,
    name: module.name,
    role: module.role as LinkageModuleDTO["role"],
    description: module.description,
    weight: module.weight,
    createdAt: module.createdAt.toISOString(),
    updatedAt: module.updatedAt.toISOString()
  };
}

export function serializeLinkageEdge(edge: LinkageEdgeWithModules): LinkageEdgeDTO {
  return {
    id: edge.id,
    fromModuleId: edge.fromModuleId,
    toModuleId: edge.toModuleId,
    relationType: edge.relationType as LinkageEdgeDTO["relationType"],
    strength: edge.strength,
    direction: edge.direction,
    reason: edge.reason,
    createdAt: edge.createdAt.toISOString(),
    updatedAt: edge.updatedAt.toISOString(),
    fromModule: edge.fromModule ? serializeLinkageModule(edge.fromModule) : undefined,
    toModule: edge.toModule ? serializeLinkageModule(edge.toModule) : undefined
  };
}

export function serializeLinkageAnalysis(analysis: LinkageAnalysis): LinkageAnalysisDTO {
  return {
    id: analysis.id,
    topicId: analysis.topicId,
    title: analysis.title,
    markdown: analysis.markdown,
    linkageScore: analysis.linkageScore,
    riskScore: analysis.riskScore,
    confidence: analysis.confidence,
    keyPaths: analysis.keyPaths,
    assumptions: analysis.assumptions,
    warnings: analysis.warnings,
    createdAt: analysis.createdAt.toISOString()
  };
}

export function serializeZoneTopic(topic: ZoneTopicWithRelations): ZoneTopicDTO {
  return {
    id: topic.id,
    zoneId: topic.zoneId,
    keywordId: topic.keywordId,
    name: topic.name,
    category: topic.category,
    description: topic.description,
    searchMode: topic.searchMode as ZoneTopicDTO["searchMode"],
    summaryTemplate: topic.summaryTemplate,
    analysisEnabled: topic.analysisEnabled,
    factorEnabled: topic.factorEnabled,
    linkageEnabled: topic.linkageEnabled,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
    keyword: topic.keyword ? serializeKeyword(topic.keyword) : null,
    moduleCount: topic.moduleLinks?.length,
    latestReport: topic.latestReport ? serializeZoneReport(topic.latestReport) : null,
    latestDailySignal: topic.latestDailySignal ? serializeDailySignal(topic.latestDailySignal) : null,
    latestLinkageAnalysis: topic.linkageAnalyses?.[0] ? serializeLinkageAnalysis(topic.linkageAnalyses[0]) : null
  };
}

export function serializeTopicRunLog(log: TopicRunLogWithRelations): TopicRunLogDTO {
  return {
    id: log.id,
    topicId: log.topicId,
    zoneId: log.zoneId,
    parentRunLogId: log.parentRunLogId,
    runType: log.runType as TopicRunLogDTO["runType"],
    triggerType: log.triggerType as TopicRunLogDTO["triggerType"],
    status: log.status as TopicRunLogDTO["status"],
    startedAt: log.startedAt.toISOString(),
    finishedAt: log.finishedAt?.toISOString() ?? null,
    durationMs: log.durationMs,
    searchProvider: log.searchProvider,
    summaryProvider: log.summaryProvider,
    factorProvider: log.factorProvider,
    linkageProvider: log.linkageProvider,
    fallbackUsed: log.fallbackUsed,
    errorMessage: log.errorMessage,
    rawResultCount: log.rawResultCount,
    filteredCount: log.filteredCount,
    dedupedCount: log.dedupedCount,
    savedItemCount: log.savedItemCount,
    reportCount: log.reportCount,
    qualityScore: log.qualityScore,
    qualityLabel: log.qualityLabel as TopicRunLogDTO["qualityLabel"],
    qualityReason: log.qualityReason,
    retryCount: log.retryCount,
    metadata: log.metadata,
    zone: log.zone ? serializeWorkspaceZone(log.zone) : null,
    topic: log.topic ? serializeZoneTopic(log.topic) : null,
    reports: log.reports?.map(serializeZoneReport),
    parentRunLog: log.parentRunLog
      ? {
          id: log.parentRunLog.id,
          status: log.parentRunLog.status as TopicRunLogDTO["status"],
          triggerType: log.parentRunLog.triggerType as TopicRunLogDTO["triggerType"],
          startedAt: log.parentRunLog.startedAt.toISOString()
        }
      : null,
    retryRuns: log.retryRuns?.map((retry) => ({
      id: retry.id,
      status: retry.status as TopicRunLogDTO["status"],
      triggerType: retry.triggerType as TopicRunLogDTO["triggerType"],
      startedAt: retry.startedAt.toISOString()
    }))
  };
}

export function serializeTopicSchedule(schedule: TopicScheduleWithRelations): TopicScheduleDTO {
  return {
    id: schedule.id,
    topicId: schedule.topicId,
    zoneId: schedule.zoneId,
    name: schedule.name,
    enabled: schedule.enabled,
    frequency: schedule.frequency as TopicScheduleDTO["frequency"],
    hour: schedule.hour,
    minute: schedule.minute,
    dayOfWeek: schedule.dayOfWeek,
    timezone: schedule.timezone,
    lastRunAt: schedule.lastRunAt?.toISOString() ?? null,
    nextRunAt: schedule.nextRunAt?.toISOString() ?? null,
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
    zone: schedule.zone ? serializeWorkspaceZone(schedule.zone) : undefined,
    topic: schedule.topic ? serializeZoneTopic(schedule.topic) : undefined
  };
}

export function serializeProviderQualitySnapshot(snapshot: ProviderQualitySnapshot): ProviderQualitySnapshotDTO {
  return {
    id: snapshot.id,
    providerType: snapshot.providerType as ProviderQualitySnapshotDTO["providerType"],
    providerName: snapshot.providerName,
    success: snapshot.success,
    fallbackUsed: snapshot.fallbackUsed,
    latencyMs: snapshot.latencyMs,
    resultCount: snapshot.resultCount,
    errorMessage: snapshot.errorMessage,
    qualityScore: snapshot.qualityScore,
    estimatedCost: snapshot.estimatedCost,
    inputTokens: snapshot.inputTokens,
    outputTokens: snapshot.outputTokens,
    createdAt: snapshot.createdAt.toISOString()
  };
}

export function serializeAppNotification(notification: AppNotification): AppNotificationDTO {
  return {
    id: notification.id,
    type: notification.type as AppNotificationDTO["type"],
    title: notification.title,
    message: notification.message,
    severity: notification.severity as AppNotificationDTO["severity"],
    read: notification.read,
    zoneId: notification.zoneId,
    topicId: notification.topicId,
    runLogId: notification.runLogId,
    reportId: notification.reportId,
    createdAt: notification.createdAt.toISOString()
  };
}
