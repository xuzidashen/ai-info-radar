import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { serializeTopicRunLog } from "@/lib/serializers";
import { createNotificationFromRunLog } from "@/lib/services/notificationService";
import { calculateRunQuality } from "@/lib/services/providerQualityService";
import { getRetryPolicyForRunLog } from "@/lib/services/retryPolicyService";
import type { TopicRunStatus, TopicRunTriggerType, TopicRunType } from "@/lib/types";

export type RunLogMetrics = {
  searchProvider?: string | null;
  summaryProvider?: string | null;
  factorProvider?: string | null;
  linkageProvider?: string | null;
  fallbackUsed?: boolean;
  errorMessage?: string | null;
  rawResultCount?: number;
  filteredCount?: number;
  dedupedCount?: number;
  savedItemCount?: number;
  reportCount?: number;
  metadata?: unknown;
};

function stringifyMetadata(value: unknown) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : JSON.stringify(value);
}

async function finishRunLog(id: string, status: TopicRunStatus, metrics: RunLogMetrics = {}) {
  const existing = await prisma.topicRunLog.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new Error("运行日志不存在");
  }

  const finishedAt = new Date();
  const durationMs = finishedAt.getTime() - existing.startedAt.getTime();
  const quality = calculateRunQuality({
    success: status !== "failed",
    fallbackUsed: metrics.fallbackUsed,
    resultCount: metrics.savedItemCount ?? metrics.dedupedCount ?? metrics.filteredCount ?? metrics.rawResultCount,
    latencyMs: durationMs,
    errorMessage: metrics.errorMessage
  });

  const log = await prisma.topicRunLog.update({
    where: { id },
    data: {
      status,
      finishedAt,
      durationMs,
      searchProvider: metrics.searchProvider ?? existing.searchProvider,
      summaryProvider: metrics.summaryProvider ?? existing.summaryProvider,
      factorProvider: metrics.factorProvider ?? existing.factorProvider,
      linkageProvider: metrics.linkageProvider ?? existing.linkageProvider,
      fallbackUsed: Boolean(metrics.fallbackUsed ?? existing.fallbackUsed),
      errorMessage: metrics.errorMessage ?? null,
      rawResultCount: metrics.rawResultCount ?? existing.rawResultCount,
      filteredCount: metrics.filteredCount ?? existing.filteredCount,
      dedupedCount: metrics.dedupedCount ?? existing.dedupedCount,
      savedItemCount: metrics.savedItemCount ?? existing.savedItemCount,
      reportCount: metrics.reportCount ?? existing.reportCount,
      qualityScore: quality.qualityScore,
      qualityLabel: quality.qualityLabel,
      qualityReason: quality.qualityReason,
      metadata: metrics.metadata ? stringifyMetadata(metrics.metadata) : existing.metadata
    },
    include: {
      zone: {
        include: {
          _count: {
            select: { topics: true, reports: true }
          },
          reports: {
            orderBy: { createdAt: "desc" },
            take: 20
          }
        }
      },
      topic: {
        include: {
          keyword: {
            include: {
              _count: {
                select: { infoItems: true, summaries: true }
              }
            }
          },
          moduleLinks: true,
          linkageAnalyses: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      },
      reports: {
        orderBy: { createdAt: "desc" }
      },
      parentRunLog: true,
      retryRuns: {
        orderBy: { startedAt: "desc" }
      }
    }
  });

  const serialized = serializeTopicRunLog(log);

  if (status === "failed" || serialized.fallbackUsed || status === "fallback") {
    await createNotificationFromRunLog(serialized);
  }

  return serialized;
}

export async function createRunLog(input: {
  topicId?: string | null;
  zoneId?: string | null;
  runType: TopicRunType;
  triggerType?: TopicRunTriggerType;
  parentRunLogId?: string | null;
  retryCount?: number;
  metadata?: unknown;
}) {
  const log = await prisma.topicRunLog.create({
    data: {
      topicId: input.topicId ?? null,
      zoneId: input.zoneId ?? null,
      parentRunLogId: input.parentRunLogId ?? null,
      runType: input.runType,
      triggerType: input.triggerType ?? "manual",
      status: "running",
      retryCount: input.retryCount ?? 0,
      metadata: input.metadata ? stringifyMetadata(input.metadata) : null
    }
  });

  return serializeTopicRunLog(log);
}

export async function markRunSuccess(id: string, metrics: RunLogMetrics = {}) {
  return finishRunLog(id, "success", metrics);
}

export async function markRunFallback(id: string, metrics: RunLogMetrics = {}) {
  return finishRunLog(id, "fallback", {
    ...metrics,
    fallbackUsed: true
  });
}

export async function markRunFailed(id: string, metrics: RunLogMetrics = {}) {
  return finishRunLog(id, "failed", metrics);
}

export async function listRunLogs(input: {
  status?: TopicRunStatus;
  zoneId?: string;
  topicId?: string;
  runType?: TopicRunType;
  triggerType?: TopicRunTriggerType;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
} = {}) {
  const where: Prisma.TopicRunLogWhereInput = {
    status: input.status,
    zoneId: input.zoneId,
    topicId: input.topicId,
    runType: input.runType,
    triggerType: input.triggerType,
    startedAt:
      input.dateFrom || input.dateTo
        ? {
            gte: input.dateFrom,
            lte: input.dateTo
          }
        : undefined
  };

  const logs = await prisma.topicRunLog.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: Math.min(input.limit ?? 100, 500),
    include: {
      zone: {
        include: {
          _count: {
            select: { topics: true, reports: true }
          },
          reports: {
            orderBy: { createdAt: "desc" },
            take: 20
          }
        }
      },
      topic: {
        include: {
          keyword: {
            include: {
              _count: {
                select: { infoItems: true, summaries: true }
              }
            }
          },
          moduleLinks: true,
          linkageAnalyses: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      },
      reports: {
        orderBy: { createdAt: "desc" }
      },
      parentRunLog: true,
      retryRuns: {
        orderBy: { startedAt: "desc" }
      }
    }
  });

  return logs.map(serializeTopicRunLog);
}

export async function getRunLogDetail(id: string) {
  const log = await prisma.topicRunLog.findUnique({
    where: { id },
    include: {
      zone: {
        include: {
          _count: {
            select: { topics: true, reports: true }
          },
          reports: {
            orderBy: { createdAt: "desc" },
            take: 20
          }
        }
      },
      topic: {
        include: {
          keyword: {
            include: {
              _count: {
                select: { infoItems: true, summaries: true }
              }
            }
          },
          moduleLinks: true,
          linkageAnalyses: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      },
      reports: {
        orderBy: { createdAt: "desc" }
      },
      parentRunLog: true,
      retryRuns: {
        orderBy: { startedAt: "desc" }
      }
    }
  });

  return log ? serializeTopicRunLog(log) : null;
}

export async function retryRunLog(id: string) {
  const log = await prisma.topicRunLog.findUnique({
    where: { id }
  });

  if (!log?.topicId) {
    throw new Error("该运行日志没有可重试的 Topic");
  }

  const detail = await getRunLogDetail(id);

  if (!detail) {
    throw new Error("运行日志不存在");
  }

  const policy = await getRetryPolicyForRunLog(detail);

  if (!policy.canRetry) {
    throw new Error(policy.reason);
  }

  const { runZoneTopic } = await import("@/lib/services/topicRunService");
  return runZoneTopic(log.topicId, {
    triggerType: "retry",
    retryOfRunLogId: id,
    retryCount: policy.retryCount + 1
  });
}
