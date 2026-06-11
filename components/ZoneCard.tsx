import { ArrowRight, Clock3, FileText, Layers3 } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { zoneTypeLabels, zoneTypeShortLabels, type WorkspaceZoneDTO, type ZoneType } from "@/lib/types";

const zoneCopy: Record<ZoneType, { scene: string; process: string; tone: "success" | "warning" | "danger" }> = {
  search: {
    scene: "用于考公、新闻、政策、比赛、学习资料等信息检索和 AI 总结。",
    process: "搜索 → 去重 → 可信度 → AI 总结 → Markdown",
    tone: "success"
  },
  analysis: {
    scene: "用于财经、公司、行业、科技主题的风险、情绪、关注度辅助分析。",
    process: "搜索 → 总结 → 因子评分 → DailySignal → 报告",
    tone: "warning"
  },
  linkage: {
    scene: "用于 AI、PCB、光模块、半导体等产业链模块之间的联动和传导分析。",
    process: "模块 → 关系 → 路径 → 假设 → 联动报告",
    tone: "danger"
  }
};

function formatDate(value?: string | null) {
  if (!value) {
    return "暂无报告";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ZoneCard({ zone, elevated = false }: { zone: WorkspaceZoneDTO; elevated?: boolean }) {
  const copy = zoneCopy[zone.type];

  return (
    <article
      className={[
        "group rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-sky-200",
        elevated ? "min-h-full" : ""
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <StatusPill tone={copy.tone}>{zoneTypeShortLabels[zone.type]}</StatusPill>
          <h3 className="mt-4 text-2xl font-black leading-tight text-slate-950">{zone.name || zoneTypeLabels[zone.type]}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{copy.scene}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/88 p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Process</p>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{copy.process}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Layers3 className="h-3.5 w-3.5 text-radar-500" />
            Topic
          </p>
          <p className="mt-2 text-xl font-black text-slate-950">{zone.topicCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <FileText className="h-3.5 w-3.5 text-signal-500" />
            Report
          </p>
          <p className="mt-2 text-xl font-black text-slate-950">{zone.reportCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Clock3 className="h-3.5 w-3.5 text-danger-500" />
            最近
          </p>
          <p className="mt-2 text-sm font-black text-slate-950">{formatDate(zone.lastReportAt)}</p>
        </div>
      </div>

      <ActionButton href={`/zones/${zone.id}`} variant="secondary" className="mt-5 w-full group-hover:border-radar-500/35 group-hover:text-radar-500">
        进入专区
        <ArrowRight className="h-4 w-4" />
      </ActionButton>
    </article>
  );
}
