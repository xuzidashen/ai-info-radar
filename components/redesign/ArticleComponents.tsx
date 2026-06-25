import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowSquareOut, Info, ListChecks } from "@phosphor-icons/react/dist/ssr";

import type { RedesignArticle } from "@/lib/mock/redesignData";
import { ArticleActionRow } from "@/components/redesign/NewsCards";

export function ArticleHeader({ article }: { article: RedesignArticle }) {
  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <Link href="/discover" aria-label="返回发现" className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:text-[var(--app-primary)]">
          <ArrowLeft size={20} />
        </Link>
        <ArticleActionRow />
      </div>
      <div className="mt-7">
        <span className="app-chip text-[var(--app-primary)]">{article.category}</span>
        <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.3] sm:text-4xl">{article.title}</h1>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[var(--app-text-muted)] sm:text-lg">{article.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-[var(--app-text-muted)]">
          <span className="text-[var(--app-primary)]">{article.source}</span><span>{article.time}</span><span>{article.readTime}</span>
        </div>
      </div>
      <div className="relative mt-7 aspect-[1.8/1] overflow-hidden rounded-lg bg-[var(--app-surface-muted)] sm:aspect-[2.2/1]">
        <Image src={article.image} alt="" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 820px" />
      </div>
    </header>
  );
}

export function ArticleBody({ article }: { article: RedesignArticle }) {
  const facts = article.body.slice(0, 3);
  const keyNumbers = article.excerpt.match(/(?:\d+(?:\.\d+)?%?|\d+(?:\.\d+)?\s*(?:万|亿|元|人|家|项|年|月|日|亿元|万元))/g)?.slice(0, 6).join("、") || "未披露";

  return (
    <article className="mx-auto max-w-3xl py-8 sm:py-10">
      <section className="mb-8 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-5">
        <h2 className="flex items-center gap-2 text-xl font-black"><ListChecks size={21} weight="fill" className="text-[var(--app-primary)]" />核心事实</h2>
        <div className="mt-4 space-y-3">
          {facts.map((fact, index) => (
            <div key={`${fact}-${index}`} className="flex items-start gap-3 text-sm font-semibold leading-7 sm:text-base">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--app-surface-muted)] text-xs font-black text-[var(--app-primary)]">{index + 1}</span>
              <span>{fact}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
            <p className="text-xs font-black text-[var(--app-text-muted)]">关键数字</p>
            <p className="mt-2 text-sm font-bold">{keyNumbers}</p>
          </div>
          <div className="rounded-lg border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
            <p className="text-xs font-black text-[var(--app-text-muted)]">来源可信度</p>
            <p className="mt-2 text-sm font-bold">{article.credibilityLabel || "未知"}{article.credibilityReason ? ` · ${article.credibilityReason}` : ""}</p>
          </div>
        </div>
        {article.url ? (
          <a href={article.url} target="_blank" rel="noreferrer" className="app-button-secondary mt-5 inline-flex">
            <ArrowSquareOut size={17} />打开原帖
          </a>
        ) : null}
      </section>

      <div className="space-y-6 text-base font-medium leading-8 text-[var(--app-text)] sm:text-lg sm:leading-9">
        {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <section className="mt-8 rounded-lg border border-[#f0d5a4] bg-[#fff9ed] p-4 text-sm font-semibold leading-7 text-[#79521c]">
        <div className="flex items-start gap-3"><Info size={18} className="mt-1 shrink-0" />以上内容来自公开来源摘要，重要政策、公告和财经信息请以原文为准。</div>
      </section>
      <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--app-line)] pt-6">
        {article.tags.map((tag) => <span key={tag} className="app-chip">{tag}</span>)}
      </div>
    </article>
  );
}

export function RelatedArticles({ articles }: { articles: RedesignArticle[] }) {
  return (
    <section className="border-t border-[var(--app-line)] pt-7">
      <h2 className="text-xl font-black">继续阅读</h2>
      <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.id}`} className="flex min-h-20 items-center justify-between gap-4 py-4 hover:text-[var(--app-primary)]">
            <span>
              <strong className="line-clamp-2 text-base font-black">{article.title}</strong>
              <span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{article.source} · {article.readTime}</span>
            </span>
            <ArrowRight size={18} className="shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}
