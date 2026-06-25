"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowsClockwise, BookmarkSimple, LinkSimple, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";

import { SummaryRenderer } from "@/components/redesign/SummaryRenderer";
import type { Insight, RedesignArticle } from "@/lib/mock/redesignData";
import type { StructuredSummary } from "@/lib/utils/summaryParser";

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <section className="app-card overflow-hidden">
      {insights.map((insight) => (
        <Link key={insight.id} href={`/insights/${insight.id}`} className="flex min-h-28 items-start gap-4 border-t border-[var(--app-line)] p-5 first:border-t-0 hover:bg-[var(--app-surface-muted)] sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e7f7f1] text-[#0f9f6e]"><Sparkle size={22} weight="duotone" /></span>
          <span className="min-w-0 flex-1"><span className="text-xs font-black text-[var(--app-primary)]">{insight.topicTitle}</span><strong className="mt-1 block text-lg font-black leading-7">{insight.title}</strong><span className="mt-2 line-clamp-2 block text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{insight.summary}</span><span className="mt-2 block text-xs font-bold text-[var(--app-text-muted)]">生成于 {insight.generatedAt}</span></span>
          <ArrowRight size={18} className="mt-3 shrink-0 text-[var(--app-text-muted)]" />
        </Link>
      ))}
    </section>
  );
}

function structuredInsight(insight: Insight): StructuredSummary {
  const sourceNotes = insight.sourceNotes ?? insight.references.map((item) => ({ source: item.source, note: item.note || item.title, url: item.url }));
  const coreFacts = insight.keyChanges?.length
    ? insight.keyChanges.map((item) => `${item.title}：${item.detail}`)
    : insight.points.slice(0, 3);
  return {
    contentType: "general",
    title: insight.title,
    overview: insight.summary,
    coreFacts: coreFacts.length ? coreFacts : [insight.summary],
    keyDetails: [
      { label: "发布方/主体", value: sourceNotes[0]?.source ?? "未披露" },
      { label: "时间", value: insight.generatedAt },
      { label: "核心内容", value: coreFacts[0] ?? insight.summary },
      { label: "关键数字", value: "未披露" }
    ],
    impactTargets: insight.tags.slice(0, 5),
    keyChanges: insight.keyChanges?.length
      ? insight.keyChanges
      : insight.points.map((point, index) => ({ title: `重要变化 ${index + 1}`, detail: point, confidence: "medium" as const })),
    whyItMatters: insight.whyItMatters?.length ? insight.whyItMatters : ["这些变化会影响该主题后续的判断依据、关注优先级和行动节奏。"],
    followUp: ["继续关注高可信来源是否更新。", "复核后续是否出现新的时间节点、数字或官方说明。"],
    uncertainties: insight.risks?.length ? insight.risks : ["公开信息可能存在延迟，重要判断仍需结合后续来源验证。"],
    sources: sourceNotes.map((item) => ({
      title: item.source,
      url: item.url,
      type: "unknown" as const,
      note: item.note
    })),
    risks: insight.risks?.length ? insight.risks : ["公开信息可能存在延迟，重要判断仍需结合后续来源验证。"],
    sourceNotes
  };
}

export function InsightArticle({ insight, related }: { insight: Insight; related: RedesignArticle[] }) {
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function regenerate() {
    if (running) return;
    setRunning(true);
    setError("");
    try {
      const response = await fetch(`/api/main-flow/topics/${insight.topicId}/run`, { method: "POST" });
      const data = await response.json().catch(() => ({})) as { insightHref?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "重新生成失败");
      window.location.href = data.insightHref || `/topics/${insight.topicId}`;
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "重新生成失败，请稍后重试。");
    } finally {
      setRunning(false);
    }
  }

  return (
    <article>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/topics/${insight.topicId}`} className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回关注主题</Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={saved} onClick={() => setSaved((current) => !current)} className="app-button-secondary min-h-10 px-3 py-2 text-xs"><BookmarkSimple size={16} weight={saved ? "fill" : "regular"} />{saved ? "已收藏" : "收藏"}</button>
          <button type="button" onClick={regenerate} disabled={running} className="app-button-secondary min-h-10 px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-60"><ArrowsClockwise size={16} className={running ? "animate-spin" : ""} />{running ? "重新生成中" : "重新生成"}</button>
        </div>
      </div>
      {error ? <p className="mt-3 rounded-lg border border-[#f2bbb2] bg-[#fff2ef] p-3 text-sm font-bold text-[#b93828]">{error}</p> : null}

      <header className="mt-6 border-b border-[var(--app-line)] pb-7">
        <div className="flex items-center gap-2 text-sm font-black text-[var(--app-primary)]"><Sparkle size={18} weight="fill" />分析结果</div>
        <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.3] sm:text-4xl">{insight.title}</h1>
        <p className="mt-4 text-sm font-bold text-[var(--app-text-muted)]">所属主题：{insight.topicTitle} · 生成于 {insight.generatedAt}</p>
      </header>

      <section className="py-7"><SummaryRenderer summary={structuredInsight(insight)} feedbackId={insight.id} feedbackType="insight" /></section>

      <section className="border-t border-[var(--app-line)] py-7">
        <h2 className="text-xl font-black">来源列表</h2>
        <details className="mt-4 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-4" open>
          <summary className="cursor-pointer text-sm font-black">查看 {insight.references.length} 个来源</summary>
          <div className="mt-3 divide-y divide-[var(--app-line)]">{insight.references.map((reference, index) => {
            const content = <><LinkSimple size={18} className="shrink-0" /><span className="min-w-0 flex-1"><strong className="block text-sm font-black">{reference.title}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{reference.source}{reference.note ? ` · ${reference.note}` : ""}</span></span><ArrowRight size={16} className="shrink-0" /></>;
            return reference.url.startsWith("http")
              ? <a key={`${reference.url}-${index}`} href={reference.url} target="_blank" rel="noreferrer" className="flex min-h-16 items-center gap-3 py-3 hover:text-[var(--app-primary)]">{content}</a>
              : <Link key={`${reference.url}-${index}`} href={reference.url} className="flex min-h-16 items-center gap-3 py-3 hover:text-[var(--app-primary)]">{content}</Link>;
          })}</div>
        </details>
      </section>

      {related.length ? (
        <section className="border-t border-[var(--app-line)] py-7">
          <h2 className="text-xl font-black">本主题相关内容</h2>
          <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{related.map((article) => <Link key={article.id} href={`/articles/${article.id}`} className="flex min-h-20 items-center justify-between gap-4 py-4 hover:text-[var(--app-primary)]"><span className="min-w-0"><strong className="line-clamp-2 text-base font-black">{article.title}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{article.source} · {article.time}</span></span><ArrowRight size={17} className="shrink-0" /></Link>)}</div>
        </section>
      ) : null}
    </article>
  );
}
