import { AlertTriangle, FileText, Layers3, Network, Workflow } from "lucide-react";

import { HomeHero } from "@/components/product/HomeHero";
import { NotificationDigest } from "@/components/product/NotificationDigest";
import { ProviderStatusCompact } from "@/components/product/ProviderStatusCompact";
import { RecentReportList } from "@/components/product/RecentReportList";
import { SummaryStatsCard } from "@/components/product/SummaryStatsCard";
import { ZoneEntryCard } from "@/components/product/ZoneEntryCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { getHomeView } from "@/lib/services/homeViewService";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) {
    return "暂无联动分析";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const data = await getHomeView();

  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-6">
      <HomeHero zoneCount={data.todaySummary.zoneCount} reportCount={data.todaySummary.totalReportCount} unreadCount={data.unreadCount} />

      <section className="grid gap-5 lg:grid-cols-3">
        {data.zones.map((zone) => (
          <ZoneEntryCard key={zone.id} zone={zone} />
        ))}
      </section>

      <SummaryStatsCard
        stats={[
          { label: "专区数量", value: data.todaySummary.zoneCount, hint: "Search / Analysis / Linkage", icon: <Workflow className="h-5 w-5" /> },
          { label: "Topic 数量", value: data.todaySummary.topicCount, hint: "当前追踪主题", icon: <Layers3 className="h-5 w-5" /> },
          { label: "今日新增报告", value: data.todaySummary.todayReportCount, hint: "今天生成的 ZoneReport", icon: <FileText className="h-5 w-5" /> },
          {
            label: "风险预警",
            value: data.todaySummary.highRiskSignalCount,
            hint: data.todaySummary.highRiskSignalCount > 0 ? "建议复核来源与摘要" : "暂无高风险信号",
            icon: <AlertTriangle className="h-5 w-5" />
          }
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <RecentReportList reports={data.recentReports} />
        <div className="space-y-6">
          <NotificationDigest notifications={data.notifications} unreadCount={data.unreadCount} />
          <ProviderStatusCompact items={data.providerStatus} />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="danger">Linkage</StatusPill>
              <StatusPill tone="neutral">{formatDate(data.latestLinkage?.createdAt)}</StatusPill>
            </div>
            <h2 className="mt-3 text-xl font-black text-slate-950">最新联动观察</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {data.latestLinkage
                ? `${data.latestLinkage.topicName}：联动分 ${data.latestLinkage.linkageScore ?? "未知"}，风险分 ${data.latestLinkage.riskScore ?? "未知"}，置信度 ${data.latestLinkage.confidence ?? "未知"}。`
                : "暂无联动分析。进入联合分析专区配置模块和关系后，最新结果会显示在这里。"}
            </p>
          </div>
          <Network className="h-8 w-8 text-sky-700" />
        </div>
      </section>
    </div>
  );
}
