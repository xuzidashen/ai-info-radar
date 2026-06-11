import { Activity, CheckCircle2 } from "lucide-react";

import { StatusPill } from "@/components/ui/StatusPill";

export type ProviderCompactItem = {
  label: string;
  activeProvider: string;
  requestedProvider: string;
  fallbackWillBeUsed?: boolean;
};

export function ProviderStatusCompact({ items }: { items: ProviderCompactItem[] }) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">Provider 状态</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">只显示当前使用状态，不暴露任何密钥。</p>
        </div>
        <Activity className="h-5 w-5 text-sky-700" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item.label} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-slate-950">{item.label}</p>
              <StatusPill tone={item.fallbackWillBeUsed ? "warning" : "success"}>{item.fallbackWillBeUsed ? "fallback" : "ready"}</StatusPill>
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              active: <span className="text-slate-950">{item.activeProvider}</span>
            </p>
            <p className="mt-1 text-xs font-bold text-slate-400">requested: {item.requestedProvider}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
