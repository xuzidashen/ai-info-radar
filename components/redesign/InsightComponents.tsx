import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, LinkSimple, Sparkle } from "@phosphor-icons/react/dist/ssr";

import type { Insight, RedesignArticle } from "@/lib/mock/redesignData";

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <section className="app-card overflow-hidden">
      {insights.map((insight) => (
        <Link key={insight.id} href={`/insights/${insight.id}`} className="flex min-h-28 items-start gap-4 border-t border-[var(--app-line)] p-5 first:border-t-0 hover:bg-[var(--app-surface-muted)] sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e7f7f1] text-[#0f9f6e]"><Sparkle size={22} weight="duotone" /></span>
          <span className="min-w-0 flex-1"><span className="text-xs font-black text-[var(--app-primary)]">{insight.topicTitle}</span><strong className="mt-1 block text-lg font-black leading-7">{insight.title}</strong><span className="mt-2 block text-xs font-bold text-[var(--app-text-muted)]">生成于 {insight.generatedAt}</span></span>
          <ArrowRight size={18} className="mt-3 shrink-0 text-[var(--app-text-muted)]" />
        </Link>
      ))}
    </section>
  );
}

export function InsightArticle({ insight, related }: { insight: Insight; related: RedesignArticle[] }) {
  return (
    <article>
      <Link href={`/topics/${insight.topicId}`} className="inline-flex items-center gap-2 text-sm font-black text-[var(--app-text-muted)] hover:text-[var(--app-primary)]"><ArrowLeft size={17} />返回关注主题</Link>
      <header className="mt-6 border-b border-[var(--app-line)] pb-7">
        <div className="flex items-center gap-2 text-sm font-black text-[var(--app-primary)]"><Sparkle size={18} weight="fill" />分析结果</div>
        <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.3] sm:text-4xl">{insight.title}</h1>
        <p className="mt-4 text-sm font-bold text-[var(--app-text-muted)]">来自“{insight.topicTitle}” · 生成于 {insight.generatedAt}</p>
      </header>

      <section className="py-7">
        <h2 className="text-xl font-black">内容摘要</h2>
        <p className="mt-4 rounded-lg bg-[var(--app-primary-soft)] p-5 text-base font-semibold leading-8 sm:p-6 sm:text-lg">{insight.summary}</p>
      </section>

      <section className="border-t border-[var(--app-line)] py-7">
        <h2 className="text-xl font-black">关键观点</h2>
        <ol className="mt-5 space-y-4">{insight.points.map((point) => <li key={point} className="flex items-start gap-3 text-base font-semibold leading-7"><CheckCircle size={21} weight="fill" className="mt-0.5 shrink-0 text-[#0f9f6e]" /><span>{point}</span></li>)}</ol>
        <div className="mt-6 flex flex-wrap gap-2">{insight.tags.map((tag) => <span key={tag} className="app-chip">{tag}</span>)}</div>
      </section>

      <section className="border-t border-[var(--app-line)] py-7">
        <h2 className="text-xl font-black">参考链接</h2>
        <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{insight.references.map((reference) => <Link key={reference.url} href={reference.url} className="flex min-h-16 items-center gap-3 py-3 hover:text-[var(--app-primary)]"><LinkSimple size={18} className="shrink-0" /><span className="min-w-0 flex-1"><strong className="block text-sm font-black">{reference.title}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{reference.source}</span></span><ArrowRight size={16} /></Link>)}</div>
      </section>

      <section className="border-t border-[var(--app-line)] py-7">
        <h2 className="text-xl font-black">相关推荐</h2>
        <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{related.map((article) => <Link key={article.id} href={`/articles/${article.id}`} className="flex min-h-20 items-center justify-between gap-4 py-4 hover:text-[var(--app-primary)]"><span><strong className="line-clamp-2 text-base font-black">{article.title}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{article.source} · {article.readTime}</span></span><ArrowRight size={17} className="shrink-0" /></Link>)}</div>
      </section>
    </article>
  );
}
