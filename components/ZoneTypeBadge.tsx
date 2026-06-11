import type { ZoneType } from "@/lib/types";
import { zoneTypeLabels, zoneTypeShortLabels } from "@/lib/types";

const classes: Record<ZoneType, string> = {
  search: "border-radar-500/28 bg-radar-500/10 text-radar-600",
  analysis: "border-signal-500/35 bg-signal-500/12 text-amber-700",
  linkage: "border-danger-500/28 bg-danger-500/10 text-danger-500"
};

export function ZoneTypeBadge({ type, compact = false }: { type: ZoneType; compact?: boolean }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${classes[type]}`}>
      {compact ? zoneTypeShortLabels[type] : zoneTypeLabels[type]}
    </span>
  );
}

