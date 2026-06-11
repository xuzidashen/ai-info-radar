import { ArrowRight, Boxes, FileText, RadioTower, Route } from "lucide-react";

import { SignalLevelBadge } from "@/components/SignalLevelBadge";
import { TopicRunButton } from "@/components/TopicRunButton";
import { ActionButton } from "@/components/ui/ActionButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { searchModeLabels, type WorkspaceZoneDTO, type ZoneTopicDTO } from "@/lib/types";

function formatDate(value?: string | null) {
  if (!value) {
    return "暂无报告";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function zoneActionLabel(type: WorkspaceZoneDTO["type"]) {
  if (type === "analysis") {
    return "运行分析";
  }

  if (type === "linkage") {
    return "运行联动";
  }

  return "运行检索";
}

export function ZoneTopicCard({
  zone,
  topic,
  onRunDone
}: {
  zone: WorkspaceZoneDTO;
  topic: ZoneTopicDTO;
  onRunDone?: () => void;
}) {
  const analysis = topic.latestLinkageAnalysis;

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="neutral">{searchModeLabels[topic.searchMode]}</StatusPill>
            {topic.factorEnabled ? <StatusPill tone="warning">因子分析</StatusPill> : null}
            {topic.linkageEnabled ? <StatusPill tone="danger">联动分析</StatusPill> : null}
          </div>
          <h3 className="mt-3 text-xl font-black leading-7 text-slate-950">{topic.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{topic.description || topic.category}</p>
        </div>
        <TopicRunButton zoneId={zone.id} topicId={topic.id} compact label={zoneActionLabel(zone.type)} onDone={onRunDone} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <FileText className="h-3.5 w-3.5 text-radar-500" />
            最近报告
          </p>
          <p className="mt-2 text-sm font-black text-slate-950">{formatDate(topic.latestReport?.createdAt)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            {zone.type === "linkage" ? <Boxes className="h-3.5 w-3.5 text-danger-500" /> : <RadioTower className="h-3.5 w-3.5 text-signal-500" />}
            {zone.type === "linkage" ? "模块数" : "信息卡"}
          </p>
          <p className="mt-2 text-xl font-black text-slate-950">{zone.type === "linkage" ? topic.moduleCount ?? 0 : topic.keyword?.infoItemCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/88 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Route className="h-3.5 w-3.5 text-radar-500" />
            {zone.type === "linkage" ? "联动分" : "报告数"}
          </p>
          <p className="mt-2 text-xl font-black text-slate-950">
            {zone.type === "linkage" ? analysis?.linkageScore ?? "未知" : topic.keyword?.summaryCount ?? 0}
          </p>
        </div>
      </div>

      {zone.type === "analysis" && topic.latestDailySignal ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/88 p-3">
          <SignalLevelBadge kind="signal" value={topic.latestDailySignal.signalLevel} />
          <SignalLevelBadge kind="risk" value={topic.latestDailySignal.riskLevel} />
          <SignalLevelBadge kind="attention" value={topic.latestDailySignal.attentionLevel} />
        </div>
      ) : null}

      <ActionButton href={`/zones/${zone.id}/topics/${topic.id}`} variant="ghost" size="sm" className="mt-5">
        查看 Topic
        <ArrowRight className="h-4 w-4" />
      </ActionButton>
    </article>
  );
}
