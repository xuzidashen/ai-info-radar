import { Activity, AlertTriangle, DollarSign, Gauge } from "lucide-react";

import { CinematicHero } from "@/components/brand/CinematicHero";
import { QualityRadarPanel } from "@/components/product/QualityRadarPanel";
import { SummaryStatsCard } from "@/components/product/SummaryStatsCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { getProviderDashboardStats } from "@/lib/services/providerQualityService";
import { providerTypeLabels } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function QualityPage() {
  const stats = await getProviderDashboardStats();

  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-6">
      <CinematicHero
        eyebrow="Provider Quality"
        title="质量雷达"
        subtitle="轻量监控真实 Provider 的稳定性"
        description="追踪 Search、Summary、Factor、Linkage Provider 的成功率、fallback、平均延迟、最近错误和质量评分。成本字段当前为预留占位。"
        mood="analysis"
        compact
        stats={[
          { label: "Snapshots", value: String(stats.total), hint: "recent 500" },
          { label: "Fallback", value: String(stats.fallbackCount), hint: "需要关注" },
          { label: "Week Cost", value: `$${stats.weekEstimatedCost.toFixed(4)}`, hint: "placeholder" }
        ]}
      />

      <SummaryStatsCard
        title="Provider 总览"
        stats={[
          {
            label: "今日估算成本",
            value: `$${stats.todayEstimatedCost.toFixed(4)}`,
            hint: "当前 provider 多数未返回真实成本",
            icon: <DollarSign className="h-5 w-5" />
          },
          {
            label: "本周估算成本",
            value: `$${stats.weekEstimatedCost.toFixed(4)}`,
            hint: "为后续 token 成本预留",
            icon: <Gauge className="h-5 w-5" />
          },
          ...stats.byType.map((item) => ({
            label: providerTypeLabels[item.providerType],
            value: item.avgQuality ?? "暂无",
            hint: `${item.successRate}% success / ${item.fallbackCount} fallback`,
            icon: <Activity className="h-5 w-5" />
          }))
        ]}
      />

      <QualityRadarPanel providers={stats.byType} recentSnapshots={stats.recentSnapshots} />

      <section className="grid gap-5 xl:grid-cols-2">
        <SnapshotList title="最近 10 条 warning" items={stats.recentWarnings} />
        <SnapshotList title="最近 10 条 failed" items={stats.recentFailed} />
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function SnapshotList({ title, items }: { title: string; items: Awaited<ReturnType<typeof getProviderDashboardStats>>["recentSnapshots"] }) {
  return (
    <SectionCard title={title} description="用于快速定位质量波动、fallback 或真实 provider 异常。">
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((snapshot) => (
            <article key={snapshot.id} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={snapshot.success ? "success" : "danger"}>{snapshot.success ? "success" : "failed"}</StatusPill>
                <StatusPill tone={snapshot.fallbackUsed ? "warning" : "neutral"}>{snapshot.fallbackUsed ? "fallback" : "direct"}</StatusPill>
                <StatusPill>{providerTypeLabels[snapshot.providerType]}</StatusPill>
              </div>
              <p className="mt-3 font-black text-slate-950">{snapshot.providerName}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{formatDate(snapshot.createdAt)} / score {snapshot.qualityScore ?? "未知"}</p>
              {snapshot.errorMessage ? (
                <p className="mt-2 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold leading-5 text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {snapshot.errorMessage}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm font-bold text-slate-500">目前没有对应质量记录。</p>
      )}
    </SectionCard>
  );
}
