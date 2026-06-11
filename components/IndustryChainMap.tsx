import { ArrowDown, ArrowRight, Boxes } from "lucide-react";

import {
  linkageModuleRoleLabels,
  linkageRelationTypeLabels,
  type LinkageEdgeDTO,
  type LinkageModuleDTO,
  type LinkageModuleRole
} from "@/lib/types";

const groups: Array<{
  title: string;
  roles: LinkageModuleRole[];
  description: string;
}> = [
  {
    title: "上游模块",
    roles: ["upstream", "policy"],
    description: "需求、政策、供给或成本起点"
  },
  {
    title: "中游模块",
    roles: ["midstream", "technology"],
    description: "制造、技术、设备和关键零部件"
  },
  {
    title: "下游 / 市场",
    roles: ["downstream", "market", "company", "other"],
    description: "应用端、客户、市场和相关主题"
  }
];

function percent(value: number | null | undefined) {
  return Math.max(0, Math.min(100, Math.round((value ?? 0) * 100)));
}

export function IndustryChainMap({ modules, edges = [] }: { modules: LinkageModuleDTO[]; edges?: LinkageEdgeDTO[] }) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-radar-500">Industry Chain Map</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">上游 → 中游 → 下游 → 市场/应用端</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
          {modules.length} modules / {edges.length} edges
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
        {groups.map((group, index) => {
          const items = modules.filter((module) => group.roles.includes(module.role));

          return (
            <div key={group.title} className="contents">
              <section className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-950">{group.title}</h3>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-400">{group.description}</p>
                  </div>
                  <Boxes className="h-4 w-4 text-radar-500" />
                </div>
                <div className="mt-4 space-y-2">
                  {items.length > 0 ? (
                    items.map((module) => (
                      <div key={module.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="font-black text-slate-950">{module.name}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{linkageModuleRoleLabels[module.role]}</p>
                        {module.description ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{module.description}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 text-sm font-bold text-slate-400">
                      未配置模块
                    </p>
                  )}
                </div>
              </section>
              {index < groups.length - 1 ? (
                <>
                  <div className="hidden items-center justify-center text-radar-500 lg:flex">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div className="flex justify-center text-radar-500 lg:hidden">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {edges.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {edges.map((edge) => (
            <div key={edge.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-950">
                <span>{edge.fromModule?.name ?? edge.fromModuleId}</span>
                <ArrowRight className="h-4 w-4 text-radar-500" />
                <span>{edge.toModule?.name ?? edge.toModuleId}</span>
                <span className="rounded-full border border-signal-500/25 bg-signal-500/10 px-2 py-0.5 text-xs text-signal-500">
                  {linkageRelationTypeLabels[edge.relationType]}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-radar-500" style={{ width: `${percent(edge.strength)}%` }} />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-400">strength {percent(edge.strength)}%</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
