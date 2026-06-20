"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookmarkSimple,
  Fire,
  FolderSimple,
  Newspaper,
  ShareNetwork
} from "@phosphor-icons/react";
import { useState } from "react";

import type { RedesignArticle } from "@/lib/mock/redesignData";
import { SectionHeader } from "@/components/redesign/Navigation";

function SaveButton({ compact = false }: { compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-label={saved ? "取消收藏" : "收藏文章"}
      onClick={() => setSaved((current) => !current)}
      className={`flex items-center justify-center rounded-xl text-[#63738b] transition hover:bg-[#edf3fb] hover:text-[#2878ff] ${compact ? "h-8 w-8" : "h-10 w-10"}`}
    >
      <BookmarkSimple size={compact ? 19 : 22} weight={saved ? "fill" : "regular"} className={saved ? "text-[#2878ff]" : ""} />
    </button>
  );
}

export function HeroNewsCard({ article }: { article: RedesignArticle }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_14px_38px_rgba(65,91,130,0.10)]">
      <Link href={`/redesign/article/${article.id}`} className="block">
        <div className="relative aspect-[2.2/1] min-h-44 overflow-hidden bg-[#dceafb] sm:aspect-[2.7/1] lg:min-h-72">
          <Image src={article.image} alt="未来城市与智能基础设施" fill priority className="object-cover transition duration-500 hover:scale-[1.02]" sizes="(max-width: 768px) 100vw, 900px" />
          <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-[#1769e8] shadow-sm backdrop-blur-md">今日头条</div>
        </div>
        <div className="p-5 sm:p-6">
          <h2 className="text-[1.35rem] font-black leading-8 tracking-[0] text-[#10213b] sm:text-2xl">{article.title}</h2>
          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-[#607089] sm:text-base">{article.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[#7d899b]">
            <span className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-[#1769e8]">{article.source}</span>
            <span>{article.time} · {article.readTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function BriefStats() {
  const stats = [
    { label: "条要闻", value: 12, icon: Newspaper, color: "bg-[#e8f2ff] text-[#2878ff]" },
    { label: "个热点", value: 8, icon: Fire, color: "bg-[#fff0e9] text-[#ff7448]" },
    { label: "个专题", value: 5, icon: FolderSimple, color: "bg-[#f0edff] text-[#7868e8]" }
  ];

  return (
    <section className="rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_34px_rgba(65,91,130,0.09)]">
      <SectionHeader title="今日简报" href="/redesign/discover" />
      <div className="mt-5 grid grid-cols-3 divide-x divide-[#e5ebf3]">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex min-w-0 flex-col items-center px-2 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${stat.color}`}>
                <Icon size={22} weight="duotone" />
              </span>
              <span className="mt-2 sm:mt-0">
                <strong className="block text-xl font-black text-[#10213b] sm:text-2xl">{stat.value}</strong>
                <span className="text-[0.7rem] font-bold text-[#718096] sm:text-xs">{stat.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function NewsListCard({ articles, title = "为你推荐" }: { articles: RedesignArticle[]; title?: string }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_12px_34px_rgba(65,91,130,0.09)]">
      <div className="px-5 pb-2 pt-5">
        <SectionHeader title={title} href="/redesign/discover" />
      </div>
      <div>
        {articles.map((article) => (
          <article key={article.id} className="relative grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-t border-[#edf1f6] p-4 transition hover:bg-[#f8fbff] sm:grid-cols-[10rem_minmax(0,1fr)] sm:p-5">
            <Link href={`/redesign/article/${article.id}`} className="group contents">
              <div className="relative aspect-[1.28/1] overflow-hidden rounded-2xl bg-[#e8eef6]">
                <Image src={article.image} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="160px" />
              </div>
              <div className="min-w-0 pr-8">
                <h3 className="line-clamp-2 text-[0.98rem] font-black leading-6 text-[#10213b] sm:text-lg">{article.title}</h3>
                <p className="mt-1 hidden line-clamp-2 text-sm font-semibold leading-6 text-[#718096] sm:block">{article.excerpt}</p>
                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-[0.7rem] font-bold text-[#8793a5] sm:text-xs">
                  <span className="text-[#2878ff]">{article.source}</span>
                  <span>{article.time}</span>
                  <span className="rounded-full bg-[#f2f6fb] px-2 py-1">{article.score.toFixed(1)} 分</span>
                </div>
              </div>
            </Link>
            <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
              <SaveButton compact />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ArticleActionRow() {
  return (
    <div className="flex items-center gap-1">
      <SaveButton />
      <button type="button" aria-label="分享文章" className="flex h-10 w-10 items-center justify-center rounded-xl text-[#63738b] transition hover:bg-[#edf3fb] hover:text-[#2878ff]">
        <ShareNetwork size={22} />
      </button>
    </div>
  );
}
