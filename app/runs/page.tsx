import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, Clock3, History } from "lucide-react";

import { CinematicHero } from "@/components/brand/CinematicHero";
import { RunTimeline } from "@/components/product/RunTimeline";
import { SummaryStatsCard } from "@/components/product/SummaryStatsCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { listRunLogs } from "@/lib/services/runLogService";
import type { TopicRunLogDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function averageDuration(logs: TopicRunLogDTO[]) {
  const items = logs.filter((log) => typeof log.durationMs === "number");
  if (!items.length) {
    return 0;
  }

  return Math.round(items.reduce((sum, log) => sum + (log.durationMs ?? 0), 0) / items.length);
}

export default async function RunsPage() {
  const logs = await listRunLogs({ limit: 120 });
  const today = startOfToday();
  const todayLogs = logs.filter((log) => new Date(log.startedAt) >= today);
  const successCount = todayLogs.filter((log) => log.status === "success").length;
  const failedCount = todayLogs.filter((log) => log.status === "failed").length;
  const fallbackCount = todayLogs.filter((log) => log.fallbackUsed || log.status === "fallback").length;
  const avgDuration = averageDuration(todayLogs);

  return (
    <div className="mx-auto w-full max-w-[92rem] space-y-6">
      <CinematicHero
        eyebrow="Run Timeline"
        title="运行时间线"
        subtitle="每一次检索、分析和联动都可追踪"
        description="查看 Topic 运行状态、耗时、fallback、质量标签和重试入口。移动端以时间线卡片展示，不使用横向表格。"
        mood="analysis"
        compact
        stats={[
          { label: "今日运行", value: String(todayLogs.length), hint: "today" },
          { label: "Fallback", value: String(fallbackCount), hint: "需要关注" },
          { label: "平均耗时", value: `${avgDuration}ms`, hint: "latency" }
        ]}
      />

      <SummaryStatsCard
        title="今日运行总览"
        stats={[
          { label: "今日运行", value: todayLogs.length, icon: <History className="h-5 w-5" />, hint: "manual / schedule / retry" },
          { label: "成功", value: successCount, icon: <CheckCircle2 className="h-5 w-5" />, hint: "completed" },
          { label: "失败", value: failedCount, icon: <AlertTriangle className="h-5 w-5" />, hint: failedCount > 0 ? "可进入详情重试" : "暂无失败" },
          { label: "Fallback", value: fallbackCount, icon: <Activity className="h-5 w-5" />, hint: fallbackCount > 0 ? "检查 provider 配置" : "暂无回退" },
          { label: "平均耗时", value: `${avgDuration}ms`, icon: <Clock3 className="h-5 w-5" />, hint: "今日平均" }
        ]}
      />

      <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">运行日志</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">最近运行排在前面。失败或 fallback 日志可以直接重试。</p>
          </div>
          <StatusPill tone="info">{logs.length} logs</StatusPill>
        </div>
        <RunTimeline logs={logs} />
      </section>

      <Link href="/zones" className="inline-flex text-sm font-black text-sky-700 transition hover:text-sky-900">
        去运行 Topic
      </Link>
    </div>
  );
}
