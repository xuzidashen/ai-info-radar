import { AlertTriangle, Gauge, RadioTower } from "lucide-react";

import { StatusPill } from "@/components/ui/StatusPill";
import { qualityTone } from "@/lib/design/status";
import { providerTypeLabels, qualityLabelText, type ProviderQualitySnapshotDTO, type ProviderType, type QualityLabel } from "@/lib/types";

export type QualityProviderItem = {
  providerType: ProviderType;
  total: number;
  successRate: number;
  fallbackCount: number;
  avgLatencyMs: number | null;
  avgQuality: number | null;
  qualityLabel: QualityLabel | null;
  recentError: string | null;
};

export function QualityRadarPanel({
  providers,
  recentSnapshots
}: {
  providers: QualityProviderItem[];
  recentSnapshots: ProviderQualitySnapshotDTO[];
}) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">质量雷达</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">按 Provider 类型看成功率、fallback、延迟和最近错误。</p>
        </div>
        <Gauge className="h-5 w-5 text-sky-700" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {providers.map((item) => (
          <article key={item.providerType} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <StatusPill tone={qualityTone(item.qualityLabel)}>
                  {item.qualityLabel ? qualityLabelText[item.qualityLabel] : "暂无评分"}
                </StatusPill>
                <h3 className="mt-3 text-lg font-black text-slate-950">{providerTypeLabels[item.providerType]}</h3>
              </div>
              <RadioTower className="h-5 w-5 text-sky-700" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label="成功率" value={`${item.successRate}%`} />
              <Metric label="Fallback" value={item.fallbackCount} />
              <Metric label="延迟" value={item.avgLatencyMs ? `${item.avgLatencyMs}ms` : "未知"} />
            </div>
            {item.recentError ? (
              <p className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold leading-5 text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {item.recentError}
              </p>
            ) : (
              <p className="mt-4 text-xs font-bold text-slate-400">暂无最近错误。</p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
        <h3 className="font-black text-slate-950">最近 10 条质量事件</h3>
        <div className="mt-4 space-y-2">
          {recentSnapshots.slice(0, 10).map((snapshot) => (
            <div key={snapshot.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={snapshot.success ? "success" : "danger"}>{snapshot.success ? "success" : "failed"}</StatusPill>
                <StatusPill tone={snapshot.fallbackUsed ? "warning" : "neutral"}>{snapshot.fallbackUsed ? "fallback" : "direct"}</StatusPill>
                <StatusPill>{providerTypeLabels[snapshot.providerType]}</StatusPill>
              </div>
              <p className="text-sm font-bold text-slate-500">{snapshot.providerName} / score {snapshot.qualityScore ?? "未知"}</p>
            </div>
          ))}
          {!recentSnapshots.length ? <p className="text-sm font-bold text-slate-500">暂无质量快照。</p> : null}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}
