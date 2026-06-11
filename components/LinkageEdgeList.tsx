import { ArrowRight } from "lucide-react";

import { linkageRelationTypeLabels, type LinkageEdgeDTO } from "@/lib/types";

export function LinkageEdgeList({ edges }: { edges: LinkageEdgeDTO[] }) {
  if (edges.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/72 p-5 text-sm font-bold text-slate-500">
        暂无模块关系。添加至少一条关系后，联动分析会更有意义。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {edges.map((edge) => (
        <div key={edge.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-950">
            <span>{edge.fromModule?.name ?? edge.fromModuleId}</span>
            <ArrowRight className="h-4 w-4 text-radar-500" />
            <span>{edge.toModule?.name ?? edge.toModuleId}</span>
            <span className="rounded-full border border-signal-500/30 bg-signal-500/12 px-2.5 py-1 text-xs text-signal-500">
              {linkageRelationTypeLabels[edge.relationType]}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
              强度 {Math.round((edge.strength ?? 0) * 100)}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-radar-500" style={{ width: `${Math.round((edge.strength ?? 0) * 100)}%` }} />
          </div>
          {edge.reason ? <p className="mt-3 text-sm leading-6 text-slate-500">{edge.reason}</p> : null}
        </div>
      ))}
    </div>
  );
}
