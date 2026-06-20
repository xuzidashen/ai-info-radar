import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Fire,
  Info,
  TrendUp
} from "@phosphor-icons/react/dist/ssr";

import { SectionHeader } from "@/components/redesign/Navigation";
import type { RedesignArticle } from "@/lib/mock/redesignData";

export function RankingCard({ items }: { items: Array<{ rank: number; title: string; heat: string }> }) {
  const rankColors = ["bg-[#ff594d]", "bg-[#ff9138]", "bg-[#ffc246]", "bg-[#dce5f2]", "bg-[#dce5f2]"];

  return (
    <section className="rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_34px_rgba(65,91,130,0.09)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Fire size={22} weight="fill" className="text-[#ff684d]" />
          <h2 className="text-lg font-black text-[#10213b]">实时热榜</h2>
        </div>
        <span className="text-xs font-bold text-[#8a96a8]">每 5 分钟更新</span>
      </div>
      <ol className="mt-4 space-y-1">
        {items.map((item, index) => (
          <li key={item.rank}>
            <Link href="/redesign/article/ai-plan-2030" className="grid min-h-12 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-1 transition hover:bg-[#f6f9fd]">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${rankColors[index]} ${index < 3 ? "text-white" : "text-[#718096]"}`}>{item.rank}</span>
              <span className="min-w-0 truncate text-sm font-bold text-[#24344d]">{item.title}</span>
              <span className={`text-xs font-bold ${index === 0 ? "text-[#ff6e55]" : "text-[#8793a5]"}`}>{item.heat}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/redesign/discover" className="mt-3 flex min-h-10 items-center justify-center border-t border-[#edf1f6] pt-3 text-xs font-black text-[#718096] hover:text-[#2878ff]">
        查看完整热榜
      </Link>
    </section>
  );
}

export function TopicGrid({ topics }: { topics: Array<{ id: string; title: string; subtitle: string; count: number; image: string }> }) {
  return (
    <section className="rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_34px_rgba(65,91,130,0.09)]">
      <SectionHeader title="精选专题" href="/redesign/discover" actionLabel="查看全部" />
      <div className="mt-4 grid grid-cols-[repeat(3,minmax(9.5rem,1fr))] gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {topics.map((topic) => (
          <Link key={topic.id} href="/redesign/discover" className="group relative aspect-[0.9/1] min-w-0 overflow-hidden rounded-[20px] bg-[#18304f]">
            <Image src={topic.image} alt="" fill className="object-cover opacity-78 transition duration-500 group-hover:scale-105" sizes="280px" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,25,48,0.04),rgba(10,25,48,0.82))]" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <h3 className="text-base font-black">{topic.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-white/78">{topic.subtitle}</p>
              <p className="mt-2 text-xs font-bold text-white/90">{topic.count} 篇文章</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GrowthList({ items }: { items: Array<{ article: RedesignArticle; growth: number }> }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_12px_34px_rgba(65,91,130,0.09)]">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendUp size={22} weight="bold" className="text-[#2878ff]" />
            <h2 className="text-lg font-black text-[#10213b]">快速上升</h2>
            <Info size={16} className="text-[#9aa7b8]" />
          </div>
          <span className="text-xs font-bold text-[#8793a5]">查看全部</span>
        </div>
      </div>
      <div>
        {items.map(({ article, growth }) => (
          <Link key={article.id} href={`/redesign/article/${article.id}`} className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-[#edf1f6] p-4 transition hover:bg-[#f8fbff] sm:grid-cols-[7.5rem_minmax(0,1fr)_auto]">
            <div className="relative aspect-[1.55/1] overflow-hidden rounded-2xl bg-[#e8eef6]">
              <Image src={article.image} alt="" fill className="object-cover" sizes="160px" />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-black leading-6 text-[#10213b] sm:text-base">{article.title}</h3>
              <p className="mt-1 text-xs font-bold text-[#8a96a8]">{article.category} · {article.time}</p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-base font-black text-[#ff684d]"><ArrowUpRight size={17} weight="bold" />{growth}%</p>
              <p className="mt-1 text-[0.68rem] font-bold text-[#9aa7b8]">热度上升</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
