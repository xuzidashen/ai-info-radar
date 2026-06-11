import Link from "next/link";
import { Activity, ArrowRight, CalendarDays, RadioTower } from "lucide-react";

import { FactorBadge } from "@/components/FactorBadge";
import { SignalLevelBadge } from "@/components/SignalLevelBadge";
import { categoryLabels, type DailySignalDTO } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

export function DailySignalCard({
  signal,
  compact = false
}: {
  signal: DailySignalDTO;
  compact?: boolean;
}) {
  const keyword = signal.keyword;

  return (
    <article className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SignalLevelBadge kind="signal" value={signal.signalLevel} />
            <SignalLevelBadge kind="risk" value={signal.riskLevel} />
            <SignalLevelBadge kind="attention" value={signal.attentionLevel} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-slate-950">{keyword?.name ?? "当前关键词"}</h3>
            {keyword ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">
                {categoryLabels[keyword.category]}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <CalendarDays className="h-4 w-4 text-radar-500" />
          <time dateTime={signal.date}>{formatDate(signal.date)}</time>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <FactorBadge label="情绪" value={signal.avgSentiment} />
        <FactorBadge label="影响" value={signal.avgImpact} />
        <FactorBadge label="风险" value={signal.avgRisk} dangerHigh />
        <FactorBadge label="关注" value={signal.avgAttention} />
        {!compact ? (
          <>
            <FactorBadge label="政策" value={signal.avgPolicy} />
            <FactorBadge label="技术" value={signal.avgTech} />
            <FactorBadge label="财经" value={signal.avgFinancial} />
            <FactorBadge label="置信" value={signal.avgConfidence} />
          </>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
          <p className="flex items-center gap-1.5 text-slate-500">
            <RadioTower className="h-3.5 w-3.5 text-radar-500" />
            信息数
          </p>
          <p className="mt-1 font-black text-slate-950">{signal.newsCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
          <p className="text-slate-500">正面</p>
          <p className="mt-1 font-black text-radar-600">{signal.positiveCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
          <p className="text-slate-500">负面</p>
          <p className="mt-1 font-black text-danger-500">{signal.negativeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
          <p className="text-slate-500">中性</p>
          <p className="mt-1 font-black text-slate-950">{signal.neutralCount}</p>
        </div>
      </div>

      {!compact && signal.summary ? (
        <p className="mt-5 whitespace-pre-line rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          {signal.summary}
        </p>
      ) : null}

      {keyword ? (
        <Link
          href={`/keywords/${keyword.id}`}
          className="radar-button mt-5 border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-sky-200 hover:text-sky-700"
        >
          查看关键词
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Activity className="h-4 w-4 text-radar-500" />
          DailySignal 会在每次因子分析后创建或更新
        </div>
      )}
    </article>
  );
}
