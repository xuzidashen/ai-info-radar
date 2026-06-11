import { GitBranch, Route } from "lucide-react";

import { StatusPill } from "@/components/ui/StatusPill";
import { linkageModuleRoleLabels, linkageRelationTypeLabels, type LinkageEdgeDTO, type LinkageModuleDTO } from "@/lib/types";

export function IndustryFlowCard({
  modules,
  edges,
  title = "产业链联动路径"
}: {
  modules: LinkageModuleDTO[];
  edges: LinkageEdgeDTO[];
  title?: string;
}) {
  const roleGroups = ["upstream", "midstream", "downstream"] as const;

  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">用模块和关系表达上下游传导，不替代事实核验。</p>
        </div>
        <Route className="h-5 w-5 text-sky-700" />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {roleGroups.map((role) => {
          const items = modules.filter((module) => module.role === role);
          return (
            <div key={role} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
              <StatusPill tone="info">{linkageModuleRoleLabels[role]}</StatusPill>
              <div className="mt-3 space-y-2">
                {items.length ? (
                  items.map((module) => (
                    <div key={module.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="font-black text-slate-950">{module.name}</p>
                      {module.description ? <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-500">{module.description}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-bold text-slate-400">暂无模块</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-sky-700" />
          <h3 className="font-black text-slate-950">关系路径</h3>
        </div>
        <div className="mt-3 space-y-2">
          {edges.length ? (
            edges.slice(0, 8).map((edge) => (
              <div key={edge.id} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold leading-6 text-slate-600">
                <span className="text-slate-950">{edge.fromModule?.name ?? "起点"}</span>
                <span className="mx-2 text-sky-700">{"->"}</span>
                <span className="text-slate-950">{edge.toModule?.name ?? "终点"}</span>
                <span className="ml-2 text-slate-400">{linkageRelationTypeLabels[edge.relationType]}</span>
              </div>
            ))
          ) : (
            <p className="text-sm font-bold text-slate-400">暂无关系，请先添加模块关系。</p>
          )}
        </div>
      </div>
    </section>
  );
}
