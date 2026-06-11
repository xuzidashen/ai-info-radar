import type { ReactNode } from "react";

import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";

type MetricCardProps = {
  label: string;
  value: string | number;
  description?: string;
  trend?: string;
  status?: StatusTone;
  icon?: ReactNode;
  className?: string;
};

export function MetricCard({ label, value, description, trend, status = "neutral", icon, className = "" }: MetricCardProps) {
  return (
    <article className={`rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black leading-none text-slate-950">{value}</p>
        </div>
        {icon ? <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sky-700 shadow-sm">{icon}</div> : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {trend ? <StatusPill tone={status}>{trend}</StatusPill> : null}
        {description ? <p className="text-xs font-bold leading-5 text-slate-500">{description}</p> : null}
      </div>
    </article>
  );
}
