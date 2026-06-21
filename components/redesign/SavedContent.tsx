"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookmarkSimple, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";

import type { Insight, RedesignArticle } from "@/lib/mock/redesignData";

type Filter = "全部" | "内容" | "分析";

export function SavedContent({ articles, insights }: { articles: RedesignArticle[]; insights: Insight[] }) {
  const [filter, setFilter] = useState<Filter>("全部");
  const showArticles = filter !== "分析";
  const showInsights = filter !== "内容";

  return (
    <>
      <div className="flex gap-2" role="tablist" aria-label="收藏筛选">{(["全部", "内容", "分析"] as Filter[]).map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={`min-h-10 rounded-lg px-4 text-sm font-black ${filter === item ? "bg-[var(--app-primary)] text-white" : "border border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-text-muted)]"}`}>{item}</button>)}</div>
      <section className="app-card mt-5 overflow-hidden">
        {showArticles ? articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.id}`} className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 border-t border-[var(--app-line)] p-4 first:border-t-0 hover:bg-[var(--app-surface-muted)] sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:p-5">
            <div className="relative aspect-[1.25/1] overflow-hidden rounded-lg"><Image src={article.image} alt="" fill className="object-cover" sizes="120px" /></div>
            <span className="min-w-0"><span className="text-xs font-black text-[var(--app-primary)]">内容</span><strong className="mt-1 line-clamp-2 block text-sm font-black leading-6 sm:text-base">{article.title}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{article.source} · {article.time}</span></span>
            <ArrowRight size={17} className="text-[var(--app-text-muted)]" />
          </Link>
        )) : null}
        {showInsights ? insights.map((insight) => (
          <Link key={insight.id} href={`/insights/${insight.id}`} className="flex min-h-24 items-center gap-4 border-t border-[var(--app-line)] p-5 first:border-t-0 hover:bg-[var(--app-surface-muted)]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e7f7f1] text-[#0f9f6e]"><Sparkle size={22} weight="duotone" /></span>
            <span className="min-w-0 flex-1"><span className="text-xs font-black text-[#0f8b62]">分析</span><strong className="mt-1 line-clamp-2 block text-base font-black">{insight.title}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{insight.topicTitle}</span></span><ArrowRight size={17} className="text-[var(--app-text-muted)]" />
          </Link>
        )) : null}
        {!showArticles && !showInsights ? <div className="p-10 text-center"><BookmarkSimple size={30} className="mx-auto text-[var(--app-text-muted)]" /><p className="mt-3 font-black">这里还没有收藏</p></div> : null}
      </section>
    </>
  );
}
