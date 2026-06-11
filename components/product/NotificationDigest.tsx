import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { StatusPill } from "@/components/ui/StatusPill";
import { notificationTone } from "@/lib/design/status";
import { notificationSeverityLabels, type AppNotificationDTO } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function NotificationDigest({
  notifications,
  unreadCount
}: {
  notifications: AppNotificationDTO[];
  unreadCount: number;
}) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">通知摘要</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{unreadCount} 条未读，运行异常和 fallback 会在这里出现。</p>
        </div>
        <Link href="/notifications" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
          <Bell className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.slice(0, 4).map((notification) => (
              <Link
                key={notification.id}
                href="/notifications"
                className="flex items-start justify-between gap-3 rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4 transition hover:border-sky-200 hover:bg-white"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={notificationTone(notification.severity)}>{notificationSeverityLabels[notification.severity]}</StatusPill>
                    {!notification.read ? <StatusPill tone="info">未读</StatusPill> : null}
                  </div>
                  <p className="mt-3 line-clamp-1 font-black text-slate-950">{notification.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{notification.message}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">{formatDate(notification.createdAt)}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无通知" description="报告生成、运行失败和 Provider 回退会形成通知。" />
        )}
      </div>
    </section>
  );
}
