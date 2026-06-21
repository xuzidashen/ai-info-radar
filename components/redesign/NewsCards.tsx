"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookmarkSimple,
  Fire,
  FolderSimple,
  Newspaper,
  Plus,
  ShareNetwork,
  Sparkle
} from "@phosphor-icons/react";
import { useState } from "react";

import type { RedesignArticle } from "@/lib/mock/redesignData";
import { SectionHeader } from "@/components/redesign/Navigation";

function SaveButton({ compact = false }: { compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={saved ? "取消收藏" : "收藏内容"}
      aria-pressed={saved}
      onClick={() => setSaved((current) => !current)}
      className={`flex items-center justify-center rounded-md text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-primary)] ${compact ? "h-9 w-9" : "h-10 w-10"}`}
    >
      <BookmarkSimple size={compact ? 19 : 22} weight={saved ? "fill" : "regular"} className={saved ? "text-[var(--app-primary)]" : ""} />
    </button>
  );
}

export function HeroNewsCard({ article }: { article: RedesignArticle }) {
  return (
    <article className="app-card overflow-hidden">
      <Link href={`/articles/${article.id}`} className="block">
        <div className="relative aspect-[1.7/1] min-h-48 overflow-hidden bg-[var(--app-surface-muted)] sm:aspect-[2.35/1] lg:min-h-64">
          <Image src={article.image} alt="未来城市与智能基础设施" fill priority className="object-cover transition-transform duration-500 hover:scale-[1.02]" sizes="(max-width: 768px) 100vw, 820px" />
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#1d4ed8] shadow-sm">今日头条</span>
        </div>
        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-black leading-8 sm:text-2xl">{article.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)] sm:text-base">{article.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[var(--app-text-muted)]">
            <span className="app-chip text-[var(--app-primary)]">{article.source}</span>
            <span>{article.time} · {article.readTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function BriefStats({
  stats = { articleCount: 12, hotCount: 8, topicCount: 3 }
}: {
  stats?: { articleCount: number; hotCount: number; topicCount: number };
}) {
  const statItems = [
    { label: "条资讯", value: stats.articleCount, icon: Newspaper, color: "text-[#2563eb] bg-[#e9f0ff]" },
    { label: "个热点", value: stats.hotCount, icon: Fire, color: "text-[#e9543f] bg-[#fff0ed]" },
    { label: "个主题", value: stats.topicCount, icon: FolderSimple, color: "text-[#0f9f6e] bg-[#e7f7f1]" }
  ];

  return (
    <section className="app-card p-5">
      <SectionHeader title="今日简报" href="/discover" />
      <div className="mt-5 grid grid-cols-3 divide-x divide-[var(--app-line)]">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex min-w-0 flex-col items-center px-2 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon size={21} weight="duotone" />
              </span>
              <span className="mt-2 sm:mt-0">
                <strong className="block text-xl font-black sm:text-2xl">{stat.value}</strong>
                <span className="text-xs font-bold text-[var(--app-text-muted)]">{stat.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HomeActions() {
  return (
    <section className="grid gap-3 sm:grid-cols-2" aria-label="常用操作">
      <Link href="/topics/new" className="group flex min-h-28 items-center gap-4 rounded-lg border border-[#b8cdf8] bg-[var(--app-primary-soft)] p-5 transition-colors hover:border-[var(--app-primary)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-white"><Plus size={22} weight="bold" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-black text-[var(--app-primary)]">创建关注</span>
          <strong className="mt-1 block text-base font-black">开始创建关注主题</strong>
          <span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">用一个主题持续追踪变化</span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-[var(--app-primary)] transition-transform group-hover:translate-x-1" />
      </Link>
      <Link href="/insights" className="group flex min-h-28 items-center gap-4 rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-5 transition-colors hover:border-[var(--app-primary)]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e7f7f1] text-[#0f9f6e]"><Sparkle size={22} weight="duotone" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-black text-[#0f8b62]">最新整理</span>
          <strong className="mt-1 block text-base font-black">查看分析结果</strong>
          <span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">快速读懂主题中的重要变化</span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-[var(--app-text-muted)] transition-transform group-hover:translate-x-1" />
      </Link>
    </section>
  );
}

export function NewsListCard({ articles, title = "为你推荐" }: { articles: RedesignArticle[]; title?: string }) {
  return (
    <section className="app-card overflow-hidden">
      <div className="px-5 pb-2 pt-5">
        <SectionHeader title={title} href="/discover" />
      </div>
      <div>
        {articles.map((article) => (
          <article key={article.id} className="relative grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-t border-[var(--app-line)] p-4 transition-colors hover:bg-[var(--app-surface-muted)] sm:grid-cols-[9rem_minmax(0,1fr)] sm:p-5">
            <Link href={`/articles/${article.id}`} className="group contents">
              <div className="relative aspect-[1.25/1] overflow-hidden rounded-lg bg-[var(--app-surface-muted)]">
                <Image src={article.image} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="160px" />
              </div>
              <div className="min-w-0 pr-7">
                <h3 className="line-clamp-2 text-[0.95rem] font-black leading-6 sm:text-lg">{article.title}</h3>
                <p className="mt-1 hidden line-clamp-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)] sm:block">{article.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--app-text-muted)]">
                  <span className="text-[var(--app-primary)]">{article.source}</span>
                  <span>{article.time}</span>
                  <span className="app-chip">{article.score.toFixed(1)} 分</span>
                </div>
              </div>
            </Link>
            <div className="absolute right-3 top-3 sm:right-4 sm:top-4"><SaveButton compact /></div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ArticleActionRow() {
  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: document.title, url: window.location.href });
    }
  }

  return (
    <div className="flex items-center gap-1">
      <SaveButton />
      <button type="button" aria-label="分享内容" onClick={share} className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-primary)]">
        <ShareNetwork size={21} />
      </button>
    </div>
  );
}
