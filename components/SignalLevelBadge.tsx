import type { AttentionLevel, RiskLevel, SignalLevel } from "@/lib/types";
import { attentionLevelLabels, riskLevelLabels, signalLevelLabels } from "@/lib/types";

type BadgeKind = "signal" | "risk" | "attention";

const signalClasses: Record<SignalLevel, string> = {
  strong_positive: "border-radar-500/30 bg-radar-500/12 text-radar-600",
  positive: "border-radar-500/24 bg-radar-500/10 text-radar-600",
  neutral: "border-ink-950/12 bg-ink-950/6 text-ink-700",
  negative: "border-danger-500/24 bg-danger-500/10 text-danger-500",
  high_risk: "border-danger-500/35 bg-danger-500/12 text-danger-500",
  insufficient_info: "border-signal-500/30 bg-signal-500/12 text-amber-700"
};

const riskClasses: Record<RiskLevel, string> = {
  low: "border-radar-500/24 bg-radar-500/10 text-radar-600",
  medium: "border-signal-500/30 bg-signal-500/12 text-amber-700",
  high: "border-danger-500/35 bg-danger-500/12 text-danger-500",
  unknown: "border-ink-950/12 bg-ink-950/6 text-ink-700"
};

const attentionClasses: Record<AttentionLevel, string> = {
  low: "border-ink-950/12 bg-ink-950/6 text-ink-700",
  medium: "border-signal-500/30 bg-signal-500/12 text-amber-700",
  high: "border-radar-500/28 bg-radar-500/10 text-radar-600"
};

export function SignalLevelBadge({
  kind,
  value
}: {
  kind: BadgeKind;
  value: SignalLevel | RiskLevel | AttentionLevel;
}) {
  if (kind === "risk") {
    const risk = value as RiskLevel;

    return (
      <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${riskClasses[risk]}`}>
        {riskLevelLabels[risk]}
      </span>
    );
  }

  if (kind === "attention") {
    const attention = value as AttentionLevel;

    return (
      <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${attentionClasses[attention]}`}>
        {attentionLevelLabels[attention]}
      </span>
    );
  }

  const signal = value as SignalLevel;

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${signalClasses[signal]}`}>
      {signalLevelLabels[signal]}
    </span>
  );
}

