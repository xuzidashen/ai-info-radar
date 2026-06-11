import { Boxes } from "lucide-react";

import { linkageModuleRoleLabels, type LinkageModuleDTO } from "@/lib/types";

export function LinkageModuleCard({ module }: { module: LinkageModuleDTO }) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-radar-500/25 bg-radar-500/10 px-2.5 py-1 text-xs font-black text-radar-500">
            <Boxes className="h-3.5 w-3.5" />
            {linkageModuleRoleLabels[module.role]}
          </span>
          <h3 className="mt-3 text-lg font-black text-slate-950">{module.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{module.description || "暂无模块描述"}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-500">
          权重 {module.weight ?? 1}
        </span>
      </div>
    </article>
  );
}
