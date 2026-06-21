import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";

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
  return (
    <article className="mx-auto max-w-3xl py-8 sm:py-10">
      <div className="space-y-6 text-base font-medium leading-8 text-[var(--app-text)] sm:text-lg sm:leading-9">
        {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
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
