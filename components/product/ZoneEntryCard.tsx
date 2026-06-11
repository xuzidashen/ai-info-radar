import Link from "next/link";
import { ArrowRight, FileText, Layers3, RadioTower } from "lucide-react";
import type { ReactNode } from "react";

import { HeroArtwork } from "@/components/brand/HeroArtwork";
import { StatusPill } from "@/components/ui/StatusPill";
import { zoneProductCopy } from "@/lib/design/copy";
import { zoneTone } from "@/lib/design/status";
import type { WorkspaceZoneDTO, ZoneType } from "@/lib/types";

const moodByZone: Record<ZoneType, "search" | "analysis" | "linkage"> = {
  search: "search",
  analysis: "analysis",
  linkage: "linkage"
};

export function ZoneEntryCard({ zone }: { zone: WorkspaceZoneDTO }) {
  const copy = zoneProductCopy[zone.type];

  return (
    <article className="group min-w-0 max-w-full overflow-hidden rounded-[28px] border border-white/80 bg-white/88 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <HeroArtwork mood={moodByZone[zone.type]} compact className="min-h-[10rem] rounded-none">
        <div className="flex min-h-[10rem] items-end p-5">
          <StatusPill tone={zoneTone(zone.type)}>{copy.eyebrow}</StatusPill>
        </div>
      </HeroArtwork>
      <div className="min-w-0 p-5">
        <h3 className="break-words text-xl font-black leading-tight text-slate-950">{zone.name || copy.title}</h3>
        <p className="mt-3 break-words text-sm leading-7 text-slate-600">{copy.description}</p>
        <p className="mt-3 break-words rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-xs font-bold leading-6 text-slate-500 [overflow-wrap:anywhere]">{copy.scene}</p>
        <div className="mt-5 grid min-w-0 grid-cols-3 gap-2">
          <Metric icon={<Layers3 className="h-3.5 w-3.5" />} label="Topic" value={zone.topicCount ?? 0} />
          <Metric icon={<FileText className="h-3.5 w-3.5" />} label="Report" value={zone.reportCount ?? 0} />
          <Metric icon={<RadioTower className="h-3.5 w-3.5" />} label="Today" value={zone.todayReportCount ?? 0} />
        </div>
        <Link
          href={`/zones/${zone.id}`}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-sky-950"
        >
          进入专区
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3">
      <p className="flex items-center gap-1 text-[0.68rem] font-bold text-slate-500">{icon}{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}
