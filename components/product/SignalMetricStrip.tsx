import { Activity, AlertTriangle, Eye, Network } from "lucide-react";

import { StatusPill } from "@/components/ui/StatusPill";
import type { DailySignalDTO, LinkageAnalysisDTO } from "@/lib/types";

export function SignalMetricStrip({
  signal,
  linkage
}: {
  signal?: DailySignalDTO;
  linkage?: LinkageAnalysisDTO;
}) {
  const metrics = linkage
    ? [
        { label: "联动强度", value: linkage.linkageScore ?? "未知", icon: <Network className="h-4 w-4" />, tone: "info" as const },
        { label: "风险断点", value: linkage.riskScore ?? "未知", icon: <AlertTriangle className="h-4 w-4" />, tone: "danger" as const },
        { label: "置信度", value: linkage.confidence ?? "未知", icon: <Eye className="h-4 w-4" />, tone: "neutral" as const }
      ]
    : [
        { label: "情绪", value: signal?.avgSentiment ?? "未知", icon: <Activity className="h-4 w-4" />, tone: "info" as const },
        { label: "风险", value: signal?.avgRisk ?? "未知", icon: <AlertTriangle className="h-4 w-4" />, tone: "danger" as const },
        { label: "关注度", value: signal?.avgAttention ?? "未知", icon: <Eye className="h-4 w-4" />, tone: "warning" as const },
        { label: "影响", value: signal?.avgImpact ?? "未知", icon: <Network className="h-4 w-4" />, tone: "success" as const }
      ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="rounded-[22px] border border-white/80 bg-white/88 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <StatusPill tone={metric.tone}>{metric.label}</StatusPill>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">{metric.icon}</span>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-950">{metric.value}</p>
        </article>
      ))}
    </section>
  );
}
