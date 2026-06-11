import type { ReactNode } from "react";

const accentClasses = {
  radar: "border-radar-500/30 bg-radar-500/10 text-radar-600",
  amber: "border-signal-500/35 bg-signal-500/12 text-amber-700",
  danger: "border-danger-500/30 bg-danger-500/10 text-danger-500",
  ink: "border-ink-950/15 bg-ink-950/6 text-ink-800"
};

export function DashboardStat({
  label,
  value,
  helper,
  icon,
  accent = "radar"
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  accent?: keyof typeof accentClasses;
}) {
  return (
    <section className="radar-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ink-700">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-normal text-ink-950">{value}</p>
        </div>
        <div className={`rounded-xl border p-3 ${accentClasses[accent]}`}>{icon}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-700">{helper}</p>
    </section>
  );
}
