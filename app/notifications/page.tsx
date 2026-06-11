import Link from "next/link";
import { Bell, ExternalLink, Inbox } from "lucide-react";

import { CinematicHero } from "@/components/brand/CinematicHero";
import { MarkAllNotificationsReadButton, MarkNotificationReadButton } from "@/components/NotificationActions";
import { SummaryStatsCard } from "@/components/product/SummaryStatsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { notificationTone } from "@/lib/design/status";
import { listNotifications } from "@/lib/services/notificationService";
import { notificationSeverityLabels, type AppNotificationDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function targetLink(notification: AppNotificationDTO) {
  if (notification.reportId) {
    return `/reports/${notification.reportId}`;
  }
  if (notification.runLogId) {
    return `/runs/${notification.runLogId}`;
  }
  if (notification.topicId && notification.zoneId) {
    return `/zones/${notification.zoneId}/topics/${notification.topicId}`;
  }
  return null;
}

export default async function NotificationsPage() {
  const { notifications, unreadCount } = await listNotifications({ limit: 120 });
  const dangerCount = notifications.filter((item) => item.severity === "danger").length;
  const warningCount = notifications.filter((item) => item.severity === "warning").length;
  const groups = [
    { label: "风险", severity: "danger" as const },
    { label: "注意", severity: "warning" as const },
    { label: "信息", severity: "info" as const },
    { label: "成功", severity: "success" as const }
  ];

  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-6">
      <CinematicHero
        eyebrow="Notifications"
        title="通知中心"
        subtitle="像消息流一样查看系统事件"
        description="集中查看运行失败、fallback、报告生成、定时任务和 provider 质量告警。当前仅做 App 内通知，不做外部推送。"
        mood="mobile"
        compact
        stats={[
          { label: "未读", value: String(unreadCount), hint: "unread" },
          { label: "注意", value: String(warningCount), hint: "warning" },
          { label: "风险", value: String(dangerCount), hint: "risk" }
        ]}
      />

      <SummaryStatsCard
        title="消息概览"
        stats={[
          { label: "未读", value: unreadCount, status: unreadCount > 0 ? "warning" : "success", icon: <Bell className="h-5 w-5" /> },
          { label: "警告", value: warningCount, status: warningCount > 0 ? "warning" : "neutral", icon: <Inbox className="h-5 w-5" /> },
          { label: "风险", value: dangerCount, status: dangerCount > 0 ? "danger" : "neutral", icon: <Bell className="h-5 w-5" /> },
          { label: "总数", value: notifications.length, status: "info", icon: <Inbox className="h-5 w-5" /> }
        ]}
      />

      <div className="flex justify-end">
        <MarkAllNotificationsReadButton />
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-6">
          {groups.map((group) => {
            const items = notifications.filter((notification) => notification.severity === group.severity);
            if (!items.length) {
              return null;
            }

            return (
              <section key={group.severity} className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-slate-950">{group.label}</h2>
                  <StatusPill tone={notificationTone(group.severity)}>{items.length}</StatusPill>
                </div>
                <div className="space-y-3">
                  {items.map((notification) => {
                    const href = targetLink(notification);

                    return (
                      <article
                        key={notification.id}
                        className={[
                          "rounded-[22px] border p-4 transition",
                          notification.read ? "border-slate-200/70 bg-slate-50/86" : "border-sky-200 bg-sky-50/80"
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusPill tone={notificationTone(notification.severity)}>{notificationSeverityLabels[notification.severity]}</StatusPill>
                              <StatusPill tone={notification.read ? "neutral" : "info"}>{notification.read ? "已读" : "未读"}</StatusPill>
                              <StatusPill>{notification.type}</StatusPill>
                            </div>
                            <h3 className="mt-3 break-words text-lg font-black text-slate-950">{notification.title}</h3>
                            <p className="mt-2 break-words text-sm font-bold leading-6 text-slate-600">{notification.message}</p>
                            <p className="mt-3 text-xs font-bold text-slate-400">{formatDate(notification.createdAt)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {!notification.read ? <MarkNotificationReadButton id={notification.id} /> : null}
                            {href ? (
                              <Link href={href} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-sky-200 hover:text-sky-700">
                                <ExternalLink className="h-4 w-4" />
                                查看关联
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState title="暂无通知" description="运行失败、fallback 或生成报告后会自动创建通知。" icon={<Bell className="h-5 w-5" />} />
      )}
    </div>
  );
}
