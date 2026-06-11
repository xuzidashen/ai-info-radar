import { zoneProductCopy } from "@/lib/design/copy";
import { zoneTone } from "@/lib/design/status";
import { CinematicHero } from "@/components/brand/CinematicHero";
import { StatusPill } from "@/components/ui/StatusPill";
import type { WorkspaceZoneDTO, ZoneType } from "@/lib/types";

const moodByZone: Record<ZoneType, "search" | "analysis" | "linkage"> = {
  search: "search",
  analysis: "analysis",
  linkage: "linkage"
};

export function ZoneHero({ zone }: { zone: WorkspaceZoneDTO }) {
  const copy = zoneProductCopy[zone.type];

  return (
    <div className="space-y-4">
      <CinematicHero
        eyebrow={copy.eyebrow}
        title={zone.name || copy.title}
        subtitle={copy.title}
        description={zone.description || copy.description}
        mood={moodByZone[zone.type]}
        compact
        stats={[
          { label: "Topic", value: String(zone.topicCount ?? 0), hint: "当前追踪主题" },
          { label: "Reports", value: String(zone.reportCount ?? 0), hint: "历史报告" },
          { label: "Workflow", value: zone.type.toUpperCase(), hint: "专区类型" }
        ]}
      />
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone={zoneTone(zone.type)}>{copy.process}</StatusPill>
      </div>
    </div>
  );
}
