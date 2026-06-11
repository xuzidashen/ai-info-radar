import type { ReactNode } from "react";

import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";

export type SummaryStat = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: StatusTone;
  status?: StatusTone;
  icon?: ReactNode;
};

export function SummaryStatsCard({ title = "今日摘要", stats }: { title?: string; stats: SummaryStat[] }) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <StatusPill tone="info">Today</StatusPill>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-[22px] border border-slate-200/70 bg-slate-50/88 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-black leading-none text-slate-950">{stat.value}</p>
              </div>
              {stat.icon ? <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">{stat.icon}</div> : null}
            </div>
            {stat.hint ? <p className="mt-3 text-xs font-bold leading-5 text-slate-500">{stat.hint}</p> : null}
            {stat.status || stat.tone ? <StatusPill tone={stat.status ?? stat.tone} className="mt-3">{stat.status ?? stat.tone}</StatusPill> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
