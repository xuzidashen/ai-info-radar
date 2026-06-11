type Tone = "radar" | "amber" | "danger" | "ink";

const toneClasses: Record<Tone, string> = {
  radar: "border-radar-500/28 bg-radar-500/10 text-radar-600",
  amber: "border-signal-500/35 bg-signal-500/12 text-amber-700",
  danger: "border-danger-500/30 bg-danger-500/10 text-danger-500",
  ink: "border-ink-950/12 bg-ink-950/6 text-ink-700"
};

function inferTone(value: number | null | undefined, dangerHigh = false): Tone {
  if (typeof value !== "number") {
    return "ink";
  }

  if (dangerHigh) {
    if (value >= 70) {
      return "danger";
    }

    if (value >= 40) {
      return "amber";
    }

    return "radar";
  }

  if (value >= 70) {
    return "radar";
  }

  if (value >= 40) {
    return "amber";
  }

  return "ink";
}

export function FactorBadge({
  label,
  value,
  dangerHigh = false
}: {
  label: string;
  value: number | null | undefined;
  dangerHigh?: boolean;
}) {
  const tone = inferTone(value, dangerHigh);
  const width = typeof value === "number" ? Math.max(3, Math.min(100, value)) : 0;

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-black ${toneClasses[tone]}`}>
      <span className="truncate">{label}</span>
      <span className="tabular-nums">{typeof value === "number" ? Math.round(value) : "未评估"}</span>
      {typeof value === "number" ? (
        <span className="h-1.5 w-10 overflow-hidden rounded-full bg-ink-950/10">
          <span className="block h-full rounded-full bg-current" style={{ width: `${width}%` }} />
        </span>
      ) : null}
    </span>
  );
}

