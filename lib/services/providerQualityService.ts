import { prisma } from "@/lib/prisma";
import { serializeProviderQualitySnapshot } from "@/lib/serializers";
import { createNotificationFromProviderQuality } from "@/lib/services/notificationService";
import type { ProviderType, QualityLabel } from "@/lib/types";

export type QualityInput = {
  success: boolean;
  fallbackUsed?: boolean;
  resultCount?: number | null;
  latencyMs?: number | null;
  errorMessage?: string | null;
  providerType?: ProviderType;
};

export function qualityLabelFromScore(score: number): QualityLabel {
  if (score >= 85) {
    return "excellent";
  }

  if (score >= 70) {
    return "good";
  }

  if (score >= 45) {
    return "warning";
  }

  return "poor";
}

export function calculateRunQuality(input: QualityInput): {
  qualityScore: number;
  qualityLabel: QualityLabel;
  qualityReason: string;
} {
  let score = 0;
  const reasons: string[] = [];

  if (input.success) {
    score += 40;
    reasons.push("执行成功 +40");
  } else {
    reasons.push("执行失败 +0");
  }

  if (!input.fallbackUsed) {
    score += 20;
    reasons.push("未使用 fallback +20");
  } else {
    score -= 25;
    reasons.push("使用 fallback -25");
  }

  if ((input.resultCount ?? 0) > 0) {
    score += 20;
    reasons.push("有结果 +20");
  } else {
    score -= 20;
    reasons.push("无结果 -20");
  }

  if (input.providerType === "summary" && (input.resultCount ?? 0) > 0 && (input.resultCount ?? 0) < 220) {
    score -= 12;
    reasons.push("总结偏短 -12");
  }

  if (input.providerType === "factor" && (input.resultCount ?? 0) <= 0) {
    score -= 18;
    reasons.push("因子输出缺失 -18");
  }

  if (input.providerType === "linkage" && (input.resultCount ?? 0) <= 0) {
    score -= 18;
    reasons.push("联动路径不足 -18");
  }

  if (typeof input.latencyMs === "number" && input.latencyMs > 0 && input.latencyMs <= 15000) {
    score += 10;
    reasons.push("延迟合理 +10");
  } else if (typeof input.latencyMs === "number" && input.latencyMs > 30000) {
    score -= 10;
    reasons.push("延迟偏高 -10");
  }

  if (!input.errorMessage) {
    score += 10;
    reasons.push("无错误 +10");
  } else {
    score -= 40;
    reasons.push("存在错误 -40");
  }

  const qualityScore = Math.max(0, Math.min(100, score));

  return {
    qualityScore,
    qualityLabel: qualityLabelFromScore(qualityScore),
    qualityReason: reasons.join("；")
  };
}

export async function recordProviderSnapshot(input: {
  providerType: ProviderType;
  providerName: string;
  success: boolean;
  fallbackUsed?: boolean;
  latencyMs?: number | null;
  resultCount?: number | null;
  errorMessage?: string | null;
  qualityScore?: number | null;
  estimatedCost?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}) {
  const quality =
    typeof input.qualityScore === "number"
      ? input.qualityScore
      : calculateRunQuality({
          success: input.success,
          fallbackUsed: input.fallbackUsed,
          resultCount: input.resultCount,
          latencyMs: input.latencyMs,
          errorMessage: input.errorMessage,
          providerType: input.providerType
        }).qualityScore;

  const snapshot = await prisma.providerQualitySnapshot.create({
    data: {
      providerType: input.providerType,
      providerName: input.providerName,
      success: input.success,
      fallbackUsed: Boolean(input.fallbackUsed),
      latencyMs: input.latencyMs ?? null,
      resultCount: input.resultCount ?? null,
      errorMessage: input.errorMessage ?? null,
      qualityScore: quality,
      estimatedCost: input.estimatedCost ?? null,
      inputTokens: input.inputTokens ?? null,
      outputTokens: input.outputTokens ?? null
    }
  });

  const serialized = serializeProviderQualitySnapshot(snapshot);
  await createNotificationFromProviderQuality({
    providerType: input.providerType,
    providerName: input.providerName,
    qualityScore: quality,
    fallbackUsed: input.fallbackUsed,
    success: input.success,
    errorMessage: input.errorMessage
  });

  return serialized;
}

export async function listProviderSnapshots(input: {
  providerType?: ProviderType;
  providerName?: string;
  limit?: number;
} = {}) {
  const snapshots = await prisma.providerQualitySnapshot.findMany({
    where: {
      providerType: input.providerType,
      providerName: input.providerName
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(input.limit ?? 100, 500)
  });

  return snapshots.map(serializeProviderQualitySnapshot);
}

export async function getProviderDashboardStats() {
  const snapshots = await prisma.providerQualitySnapshot.findMany({
    orderBy: { createdAt: "desc" },
    take: 500
  });
  const providerTypes: ProviderType[] = ["search", "summary", "factor", "linkage"];

  const byType = providerTypes.map((providerType) => {
    const items = snapshots.filter((snapshot) => snapshot.providerType === providerType);
    const successCount = items.filter((item) => item.success).length;
    const fallbackCount = items.filter((item) => item.fallbackUsed).length;
    const latencyItems = items.filter((item) => typeof item.latencyMs === "number");
    const avgLatencyMs = latencyItems.length
      ? Math.round(latencyItems.reduce((sum, item) => sum + (item.latencyMs ?? 0), 0) / latencyItems.length)
      : null;
    const avgQuality = items.length
      ? Math.round(items.reduce((sum, item) => sum + (item.qualityScore ?? 0), 0) / items.length)
      : null;
    const recentError = items.find((item) => item.errorMessage)?.errorMessage ?? null;

    return {
      providerType,
      total: items.length,
      successCount,
      successRate: items.length ? Math.round((successCount / items.length) * 100) : 0,
      fallbackCount,
      avgLatencyMs,
      avgQuality,
      qualityLabel: avgQuality === null ? null : qualityLabelFromScore(avgQuality),
      recentError
    };
  });
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  const costOf = (items: typeof snapshots) =>
    Number(items.reduce((sum, item) => sum + (item.estimatedCost ?? 0), 0).toFixed(6));
  const warningSnapshots = snapshots.filter((snapshot) => {
    const score = snapshot.qualityScore ?? 100;
    return snapshot.fallbackUsed || !snapshot.success || score < 70;
  });
  const fallbackTrend = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + index);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const items = snapshots.filter((snapshot) => snapshot.createdAt >= day && snapshot.createdAt < next);

    return {
      date: day.toISOString().slice(0, 10),
      total: items.length,
      fallbackCount: items.filter((item) => item.fallbackUsed).length,
      failedCount: items.filter((item) => !item.success).length
    };
  });

  return {
    total: snapshots.length,
    fallbackCount: snapshots.filter((snapshot) => snapshot.fallbackUsed).length,
    todayEstimatedCost: costOf(snapshots.filter((snapshot) => snapshot.createdAt >= startOfToday)),
    weekEstimatedCost: costOf(snapshots.filter((snapshot) => snapshot.createdAt >= startOfWeek)),
    providerCallCounts: providerTypes.map((providerType) => ({
      providerType,
      count: snapshots.filter((snapshot) => snapshot.providerType === providerType).length
    })),
    recentWarnings: warningSnapshots.slice(0, 10).map(serializeProviderQualitySnapshot),
    recentFailed: snapshots
      .filter((snapshot) => !snapshot.success)
      .slice(0, 10)
      .map(serializeProviderQualitySnapshot),
    fallbackTrend,
    recentErrors: snapshots
      .filter((snapshot) => snapshot.errorMessage)
      .slice(0, 10)
      .map(serializeProviderQualitySnapshot),
    byType,
    recentSnapshots: snapshots.slice(0, 30).map(serializeProviderQualitySnapshot)
  };
}
