"use client";

import { ArrowSquareOut, CheckCircle, Info, ListChecks, ShieldWarning, Sparkle, Target } from "@phosphor-icons/react";

import { SummaryFeedback } from "@/components/redesign/SummaryFeedback";
import { parseStructuredSummary, type StructuredSummary } from "@/lib/utils/summaryParser";

const contentTypeLabels: Record<StructuredSummary["contentType"], string> = {
  policy: "政策",
  financial_report: "财报/公告",
  news_event: "新闻事件",
  industry_update: "行业动态",
  person_event: "人物动态",
  general: "综合"
};

const sourceTypeLabels: Record<StructuredSummary["sources"][number]["type"], string> = {
  official: "官方",
  media: "媒体",
  social: "社交平台",
  self_media: "自媒体",
  unknown: "未知"
};

function BulletList({ items, tone = "blue" }: { items: string[]; tone?: "blue" | "green" | "amber" }) {
  const color = tone === "green" ? "bg-[#0f9f6e]" : tone === "amber" ? "bg-[#d97706]" : "bg-[var(--app-primary)]";
  if (!items.length) return <p className="text-sm font-semibold text-[var(--app-text-muted)]">暂无明确内容。</p>;
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm font-semibold leading-7 sm:text-base">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SummaryRenderer({
  content,
  summary,
  compact = false,
  feedbackId,
  feedbackType = "summary"
}: {
  content?: string | null;
  summary?: StructuredSummary;
  compact?: boolean;
  feedbackId?: string;
  feedbackType?: "article" | "insight" | "summary" | "report";
}) {
  const data = summary ?? parseStructuredSummary(content);
  const facts = compact ? data.coreFacts.slice(0, 3) : data.coreFacts;
  const details = compact ? data.keyDetails.slice(0, 4) : data.keyDetails;
  const resolvedFeedbackId = feedbackId || `${data.title}-${data.overview}`.slice(0, 120);

  return (
    <div className="space-y-7">
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <span className="app-chip text-[var(--app-primary)]">{contentTypeLabels[data.contentType]}</span>
          <span className="flex items-center gap-1 text-sm font-black text-[var(--app-primary)]"><Sparkle size={17} weight="fill" />事实型情报卡</span>
        </div>
        <h2 className="mt-3 text-2xl font-black leading-tight">{data.title}</h2>
        <p className="mt-4 rounded-lg border border-[#c7d7f7] bg-[var(--app-primary-soft)] p-5 text-base font-black leading-7 sm:text-lg">{data.overview}</p>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-xl font-black"><ListChecks size={21} weight="fill" className="text-[var(--app-primary)]" />核心事实</h2>
        <div className="mt-4 grid gap-3">
          {facts.length ? facts.map((fact, index) => (
            <article key={`${fact}-${index}`} className="rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--app-surface-muted)] text-xs font-black text-[var(--app-primary)]">{index + 1}</span>
                <p className="min-w-0 text-sm font-semibold leading-7 sm:text-base">{fact}</p>
              </div>
            </article>
          )) : <p className="text-sm font-semibold text-[var(--app-text-muted)]">现有来源不足以形成明确事实。</p>}
        </div>
      </section>

      <section className="border-t border-[var(--app-line)] pt-7">
        <h2 className="text-xl font-black">关键信息</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {details.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
              <p className="text-xs font-black text-[var(--app-text-muted)]">{item.label}</p>
              <p className="mt-2 text-sm font-bold leading-6">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {data.impactTargets.length ? (
        <section className="border-t border-[var(--app-line)] pt-7">
          <h2 className="flex items-center gap-2 text-xl font-black"><Target size={21} weight="fill" className="text-[#0f9f6e]" />影响对象</h2>
          <div className="mt-4 flex flex-wrap gap-2">{data.impactTargets.map((item) => <span key={item} className="app-chip text-[#0f8b62]">{item}</span>)}</div>
        </section>
      ) : null}

      <section className="border-t border-[var(--app-line)] pt-7">
        <h2 className="flex items-center gap-2 text-xl font-black"><CheckCircle size={21} weight="fill" className="text-[#0f9f6e]" />为什么值得关注</h2>
        <div className="mt-4"><BulletList items={data.whyItMatters} tone="green" /></div>
      </section>

      {!compact ? (
        <section className="border-t border-[var(--app-line)] pt-7">
          <h2 className="text-xl font-black">后续跟踪点</h2>
          <div className="mt-4"><BulletList items={data.followUp} /></div>
        </section>
      ) : null}

      <section className="border-t border-[var(--app-line)] pt-7">
        <h2 className="flex items-center gap-2 text-xl font-black"><ShieldWarning size={21} weight="fill" className="text-[#d97706]" />风险与不确定</h2>
        <ul className="mt-4 space-y-3 rounded-lg border border-[#f0d5a4] bg-[#fff9ed] p-4 sm:p-5">
          {data.uncertainties.length ? data.uncertainties.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm font-semibold leading-7 text-[#79521c]">
              <Info size={18} className="mt-1 shrink-0" />
              <span className="min-w-0">{item}</span>
            </li>
          )) : <li className="text-sm font-semibold leading-7 text-[#79521c]">暂无明确风险，仍建议人工复核来源。</li>}
        </ul>
      </section>

      {!compact ? (
        <section className="border-t border-[var(--app-line)] pt-7">
          <h2 className="text-xl font-black">来源</h2>
          {data.sources.length ? (
            <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">
              {data.sources.map((item, index) => {
                const body = (
                  <>
                    <span className="flex flex-wrap items-center gap-2">
                      <strong className="min-w-0 text-sm font-black">{item.title}</strong>
                      <span className="app-chip text-[0.68rem]">{sourceTypeLabels[item.type]}</span>
                    </span>
                    <span className="mt-1 block text-xs font-semibold leading-6 text-[var(--app-text-muted)]">{item.note}</span>
                  </>
                );
                return item.url ? (
                  <a key={`${item.title}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="flex min-h-16 items-center gap-3 py-3 hover:text-[var(--app-primary)]">
                    <span className="min-w-0 flex-1">{body}</span>
                    <ArrowSquareOut size={17} className="shrink-0" />
                  </a>
                ) : (
                  <div key={`${item.title}-${index}`} className="py-3">{body}</div>
                );
              })}
            </div>
          ) : <p className="mt-3 text-sm font-semibold text-[var(--app-text-muted)]">暂无来源链接，请结合原始内容继续复核。</p>}
        </section>
      ) : null}

      {!compact ? <SummaryFeedback targetId={resolvedFeedbackId} targetType={feedbackType} /> : null}
    </div>
  );
}
