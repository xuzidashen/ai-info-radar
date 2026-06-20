import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Sparkle
} from "@phosphor-icons/react/dist/ssr";

import { ArticleActionRow } from "@/components/redesign/NewsCards";
import type { RedesignArticle } from "@/lib/mock/redesignData";

export function ArticleHeader({ article }: { article: RedesignArticle }) {
  return (
    <header>
      <div className="flex items-center justify-between gap-3">
        <Link href="/redesign" aria-label="返回首页" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dfe8f3] bg-white text-[#26364e] shadow-[0_8px_24px_rgba(65,91,130,0.06)] transition hover:text-[#2878ff]">
          <ArrowLeft size={22} />
        </Link>
        <ArticleActionRow />
      </div>
      <div className="mt-8 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eaf2ff] px-3 py-1.5 text-xs font-black text-[#1769e8]">{article.category}</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8793a5]"><Sparkle size={14} weight="fill" className="text-[#ff8d5d]" />编辑精选</span>
        </div>
        <h1 className="mt-5 text-[2rem] font-black leading-[1.25] tracking-[0] text-[#10213b] sm:text-4xl lg:text-5xl">{article.title}</h1>
        <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-[#607089] sm:text-lg">{article.excerpt}</p>
        <ArticleMeta article={article} />
      </div>
    </header>
  );
}

export function ArticleMeta({ article }: { article: RedesignArticle }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold text-[#7d899b]">
      <span className="rounded-full bg-white px-3 py-2 shadow-sm">{article.source}</span>
      <span>{article.time}</span>
      <span className="inline-flex items-center gap-1"><Clock size={15} />{article.readTime}</span>
      <span className="rounded-full bg-[#f0f6ff] px-3 py-1.5 text-[#2878ff]">信息评分 {article.score.toFixed(1)}</span>
    </div>
  );
}

export function ArticleBody({ article }: { article: RedesignArticle }) {
  return (
    <article className="mt-8 overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_14px_38px_rgba(65,91,130,0.09)]">
      <div className="relative aspect-[2.15/1] min-h-48 overflow-hidden bg-[#dceafb] sm:aspect-[2.6/1] lg:min-h-80">
        <Image src={article.image} alt="文章主图" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 1000px" />
      </div>
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="space-y-6 text-[1.02rem] font-medium leading-8 text-[#33445e] sm:text-lg sm:leading-9">
          {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="mt-9 flex flex-wrap gap-2 border-t border-[#edf1f6] pt-6">
          {article.tags.map((tag) => <span key={tag} className="rounded-full border border-[#dfe8f3] bg-[#f7faff] px-3 py-1.5 text-xs font-bold text-[#607089]">#{tag}</span>)}
        </div>
      </div>
    </article>
  );
}

export function RelatedArticles({ articles }: { articles: RedesignArticle[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black text-[#10213b]">相关阅读</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.id} href={`/redesign/article/${article.id}`} className="group overflow-hidden rounded-[22px] border border-white bg-white shadow-[0_10px_28px_rgba(65,91,130,0.08)]">
            <div className="relative aspect-[1.75/1] overflow-hidden bg-[#e8eef6]">
              <Image src={article.image} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="320px" />
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 font-black leading-6 text-[#10213b]">{article.title}</h3>
              <p className="mt-2 text-xs font-bold text-[#8793a5]">{article.source} · {article.time}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
