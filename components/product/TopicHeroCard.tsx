import { Pencil } from "lucide-react";
import type { ReactNode } from "react";

import { HeroArtwork } from "@/components/brand/HeroArtwork";
import { StatusPill } from "@/components/ui/StatusPill";
import { zoneProductCopy } from "@/lib/design/copy";
import { zoneTone } from "@/lib/design/status";
import { searchModeLabels, type ZoneTopicDetailDTO, type ZoneTopicDTO, type ZoneType } from "@/lib/types";

type TopicLike = ZoneTopicDTO | ZoneTopicDetailDTO;

const moodByZone: Record<ZoneType, "search" | "analysis" | "linkage"> = {
  search: "search",
  analysis: "analysis",
  linkage: "linkage"
};

export function TopicHeroCard({
  topic,
  zoneType,
  zoneName,
  lastRunLabel,
  actions
}: {
  topic: TopicLike;
  zoneType: ZoneType;
  zoneName: string;
  lastRunLabel?: string;
  actions?: ReactNode;
}) {
  const copy = zoneProductCopy[zoneType];

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/88 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <HeroArtwork mood={moodByZone[zoneType]} compact className="min-h-[13rem] rounded-none">
        <div className="flex min-h-[13rem] flex-col justify-end p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/62">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">{topic.name}</h1>
        </div>
      </HeroArtwork>
      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={zoneTone(zoneType)}>{zoneName}</StatusPill>
              <StatusPill>{searchModeLabels[topic.searchMode]}</StatusPill>
              <StatusPill tone="neutral">最近运行：{lastRunLabel ?? "暂无"}</StatusPill>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{topic.description || topic.category}</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
            {actions}
            {!actions ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">
                <Pencil className="h-4 w-4" />
                可编辑
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
