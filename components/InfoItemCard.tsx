import { ChevronDown, ExternalLink, Gauge } from "lucide-react";

import { FactorBadge } from "@/components/FactorBadge";
import type { InfoItemDTO, Importance, Sentiment } from "@/lib/types";

const importanceLabels: Record<Importance, string> = {
  high: "高优先级",
  medium: "中优先级",
  low: "低优先级"
};

const importanceClasses: Record<Importance, string> = {
  high: "border-danger-500/25 bg-danger-500/10 text-danger-500",
  medium: "border-signal-500/30 bg-signal-500/12 text-amber-700",
  low: "border-ink-950/12 bg-ink-950/6 text-ink-700"
};

const sentimentLabels: Record<Sentiment, string> = {
  positive: "正向",
  neutral: "中性",
  negative: "负向"
};

const sentimentClasses: Record<Sentiment, string> = {
  positive: "bg-radar-500/10 text-radar-600",
  neutral: "bg-ink-950/6 text-ink-700",
  negative: "bg-danger-500/10 text-danger-500"
};

const credibilityClasses: Record<NonNullable<InfoItemDTO["credibilityLabel"]>, string> = {
  high: "bg-radar-500/10 text-radar-600",
  medium: "bg-signal-500/12 text-amber-700",
  low: "bg-danger-500/10 text-danger-500",
  unknown: "bg-ink-950/6 text-ink-700"
};

const credibilityLabels: Record<NonNullable<InfoItemDTO["credibilityLabel"]>, string> = {
  high: "高可信",
  medium: "中可信",
  low: "低可信",
  unknown: "未知可信度"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatSearchScore(value: number | null) {
  if (typeof value !== "number") {
    return null;
  }

  return `${Math.round(value * 100)}%`;
}

function formatCredibilityScore(value: number | null) {
  if (typeof value !== "number") {
    return "";
  }

  return ` ${Math.round(value * 100)}%`;
}

export function InfoItemCard({ item }: { item: InfoItemDTO }) {
  const score = formatSearchScore(item.score);
  const credibilityLabel = item.credibilityLabel ?? "unknown";
  const hasFactor = typeof item.impactScore === "number" || typeof item.factorConfidence === "number";

  return (
    <article className="rounded-2xl border border-ink-950/10 bg-white/78 p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${importanceClasses[item.importance]}`}>
              {importanceLabels[item.importance]}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${sentimentClasses[item.sentiment]}`}>
              {sentimentLabels[item.sentiment]}
            </span>
            <span className="rounded-full border border-ink-950/10 bg-white px-2.5 py-1 text-xs font-black text-ink-700">
              {item.provider}
            </span>
            {score ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-radar-500/10 px-2.5 py-1 text-xs font-black text-radar-600">
                <Gauge className="h-3 w-3" />
                {score}
              </span>
            ) : null}
            <span className={`rounded-full px-2.5 py-1 text-xs font-black ${credibilityClasses[credibilityLabel]}`}>
              {credibilityLabels[credibilityLabel]}
              {formatCredibilityScore(item.credibilityScore)}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-black leading-7 text-ink-950">{item.title}</h3>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="radar-button border-ink-950/10 bg-white px-3 py-2 text-sm text-ink-800 hover:border-radar-500/30 hover:text-radar-600"
        >
          来源
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <p className="mt-4 text-sm leading-7 text-ink-700">{item.summary}</p>

      {item.credibilityReason ? (
        <p className="mt-3 rounded-xl border border-ink-950/8 bg-white/65 p-3 text-xs font-bold leading-6 text-ink-700">
          可信度说明：{item.credibilityReason}
        </p>
      ) : null}

      {hasFactor ? (
        <details className="group mt-4 rounded-xl border border-ink-950/8 bg-white/65 p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-ink-950">
            <span>信息因子评分</span>
            <ChevronDown className="h-4 w-4 text-ink-700 transition group-open:rotate-180" />
          </summary>
          <div className="mt-4 flex flex-wrap gap-2">
            <FactorBadge label="情绪" value={item.sentimentScore} />
            <FactorBadge label="影响" value={item.impactScore} />
            <FactorBadge label="风险" value={item.riskScore} dangerHigh />
            <FactorBadge label="政策" value={item.policyScore} />
            <FactorBadge label="技术" value={item.techScore} />
            <FactorBadge label="财经" value={item.financialScore} />
            <FactorBadge label="关注" value={item.attentionScore} />
            <FactorBadge label="置信" value={item.factorConfidence} />
          </div>

          <div className="mt-4 grid gap-3 text-xs font-bold leading-6 text-ink-700 sm:grid-cols-2">
            <p>
              <span className="text-ink-950">事件类型：</span>
              {item.eventType ?? "未评估"}
              {item.eventSubtype ? ` / ${item.eventSubtype}` : ""}
            </p>
            <p>
              <span className="text-ink-950">时间尺度：</span>
              {item.timeHorizon ?? "未评估"}
            </p>
            <p>
              <span className="text-ink-950">相关公司：</span>
              {item.relatedCompanies.length > 0 ? item.relatedCompanies.join("、") : "无明确关联"}
            </p>
            <p>
              <span className="text-ink-950">相关行业：</span>
              {item.relatedIndustries.length > 0 ? item.relatedIndustries.join("、") : "无明确关联"}
            </p>
          </div>

          {item.factorReason ? (
            <p className="mt-3 rounded-xl border border-ink-950/8 bg-paper-50/80 p-3 text-xs font-bold leading-6 text-ink-700">
              因子理由：{item.factorReason}
            </p>
          ) : null}
        </details>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-ink-950/16 bg-white/50 p-3 text-xs font-bold text-ink-700">
          尚未分析信息因子。点击详情页的“分析信息因子”后会显示评分。
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 border-t border-ink-950/8 pt-4 text-xs font-bold text-ink-700 sm:flex-row sm:items-center sm:justify-between">
        <span>{item.source}</span>
        <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
      </div>
    </article>
  );
}

