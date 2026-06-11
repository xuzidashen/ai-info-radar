import { prisma } from "@/lib/prisma";
import { serializeAppNotification } from "@/lib/serializers";
import type { NotificationSeverity, NotificationType, TopicRunLogDTO } from "@/lib/types";

export type NotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  zoneId?: string | null;
  topicId?: string | null;
  runLogId?: string | null;
  reportId?: string | null;
};

export async function createNotification(input: NotificationInput) {
  const notification = await prisma.appNotification.create({
    data: {
      type: input.type,
      title: input.title,
      message: input.message,
      severity: input.severity ?? "info",
      zoneId: input.zoneId ?? null,
      topicId: input.topicId ?? null,
      runLogId: input.runLogId ?? null,
      reportId: input.reportId ?? null
    }
  });

  return serializeAppNotification(notification);
}

export async function listNotifications(input: { read?: boolean; limit?: number } = {}) {
  const where = typeof input.read === "boolean" ? { read: input.read } : undefined;
  const [notifications, unreadCount] = await Promise.all([
    prisma.appNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(input.limit ?? 100, 500)
    }),
    prisma.appNotification.count({
      where: { read: false }
    })
  ]);

  return {
    notifications: notifications.map(serializeAppNotification),
    unreadCount
  };
}

export async function markAsRead(id: string) {
  const notification = await prisma.appNotification.update({
    where: { id },
    data: { read: true }
  });

  return serializeAppNotification(notification);
}

export async function markAllAsRead() {
  const result = await prisma.appNotification.updateMany({
    where: { read: false },
    data: { read: true }
  });

  return { count: result.count };
}

export async function createNotificationFromRunLog(log: TopicRunLogDTO) {
  if (log.status === "failed") {
    return createNotification({
      type: "run_failed",
      title: "Topic 运行失败",
      message: `${log.topic?.name ?? "未知 Topic"} 运行失败：${log.errorMessage ?? "未记录错误原因"}`,
      severity: "danger",
      zoneId: log.zoneId,
      topicId: log.topicId,
      runLogId: log.id
    });
  }

  if (log.fallbackUsed || log.status === "fallback") {
    return createNotification({
      type: "fallback_used",
      title: "Provider 已回退",
      message: `${log.topic?.name ?? "未知 Topic"} 本次运行使用 fallback，建议检查真实 provider 配置或网络状态。`,
      severity: "warning",
      zoneId: log.zoneId,
      topicId: log.topicId,
      runLogId: log.id
    });
  }

  return null;
}

export async function createNotificationFromProviderQuality(input: {
  providerType: string;
  providerName: string;
  qualityScore?: number | null;
  fallbackUsed?: boolean;
  success?: boolean;
  errorMessage?: string | null;
}) {
  const score = input.qualityScore ?? 100;

  if (input.success !== false && !input.fallbackUsed && score >= 70) {
    return null;
  }

  return createNotification({
    type: "provider_quality_warning",
    title: "Provider 质量需要关注",
    message: `${input.providerType}/${input.providerName} 质量分 ${score}，${input.errorMessage ?? (input.fallbackUsed ? "本次使用 fallback" : "请查看质量监控详情")}`,
    severity: input.success === false ? "danger" : "warning"
  });
}

export async function createNotificationFromLinkageWarnings(input: {
  topicId?: string | null;
  zoneId?: string | null;
  runLogId?: string | null;
  warnings?: string | null;
}) {
  if (!input.warnings?.trim()) {
    return null;
  }

  return createNotification({
    type: "linkage_warning",
    title: "联动分析出现风险提示",
    message: input.warnings.slice(0, 260),
    severity: "warning",
    topicId: input.topicId,
    zoneId: input.zoneId,
    runLogId: input.runLogId
  });
}
