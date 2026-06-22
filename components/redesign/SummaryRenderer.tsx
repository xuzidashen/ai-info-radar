"use client";

import { ArrowSquareOut, CheckCircle, Info, ShieldWarning, Sparkle } from "@phosphor-icons/react";

import { parseStructuredSummary, type StructuredSummary } from "@/lib/utils/summaryParser";

const confidenceLabels = {
  high: "高置信",
  medium: "中等置信",
  low: "待验证"
};

export function SummaryRenderer({ content, summary, compact = false }: { content?: string | null; summary?: StructuredSummary; compact?: boolean }) {
  const data = summary ?? parseStructuredSummary(content);
  const changes = compact ? data.keyChanges.slice(0, 3) : data.keyChanges;

  return (
    <div className="space-y-7">
      <section>
        <div className="flex items-center gap-2 text-sm font-black text-[var(--app-primary)]"><Sparkle size={18} weight="fill" />一句话结论</div>
        <p className="mt-3 rounded-lg border border-[#c7d7f7] bg-[var(--app-primary-soft)] p-5 text-base font-black leading-7 sm:text-lg">{data.overview}</p>
      </section>

      <section>
        <h2 className="text-xl font-black">重要变化</h2>
        {changes.length ? (
          <ol className="mt-4 space-y-3">
            {changes.map((item, index) => (
              <li key={`${item.title}-${index}`} className="rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--app-surface-muted)] text-xs font-black text-[var(--app-primary)]">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black leading-6">{item.title}</h3>
                      <span className="app-chip text-[0.7rem]">{confidenceLabels[item.confidence]}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-7 text-[var(--app-text-muted)]">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="mt-3 text-sm font-semibold text-[var(--app-text-muted)]">当前没有足够信息形成明确变化。</p>}
      </section>

      {data.whyItMatters.length ? (
        <section className="border-t border-[var(--app-line)] pt-7">
          <h2 className="flex items-center gap-2 text-xl font-black"><CheckCircle size={21} weight="fill" className="text-[#0f9f6e]" />为什么值得关注</h2>
          <ul className="mt-4 space-y-3">{data.whyItMatters.map((item, index) => <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm font-semibold leading-7 sm:text-base"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0f9f6e]" />{item}</li>)}</ul>
        </section>
      ) : null}

      <section className="border-t border-[var(--app-line)] pt-7">
        <h2 className="flex items-center gap-2 text-xl font-black"><ShieldWarning size={21} weight="fill" className="text-[#d97706]" />风险与不确定性</h2>
        <ul className="mt-4 space-y-3 rounded-lg border border-[#f0d5a4] bg-[#fff9ed] p-4 sm:p-5">{data.risks.map((item, index) => <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm font-semibold leading-7 text-[#79521c]"><Info size={18} className="mt-1 shrink-0" />{item}</li>)}</ul>
      </section>

      {!compact ? (
        <section className="border-t border-[var(--app-line)] pt-7">
          <h2 className="text-xl font-black">来源说明</h2>
          {data.sourceNotes.length ? (
            <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">
              {data.sourceNotes.map((item, index) => {
                const body = <><strong className="block text-sm font-black">{item.source}</strong><span className="mt-1 block text-xs font-semibold leading-6 text-[var(--app-text-muted)]">{item.note}</span></>;
                return item.url ? <a key={`${item.source}-${index}`} href={item.url} target="_blank" rel="noreferrer" className="flex min-h-16 items-center gap-3 py-3 hover:text-[var(--app-primary)]"><span className="min-w-0 flex-1">{body}</span><ArrowSquareOut size={17} className="shrink-0" /></a> : <div key={`${item.source}-${index}`} className="py-3">{body}</div>;
              })}
            </div>
          ) : <p className="mt-3 text-sm font-semibold text-[var(--app-text-muted)]">来源链接请查看下方来源列表。</p>}
        </section>
      ) : null}
    </div>
  );
}
