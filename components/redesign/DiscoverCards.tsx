import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Fire, TrendUp } from "@phosphor-icons/react/dist/ssr";

import type { FollowTopic, RedesignArticle } from "@/lib/mock/redesignData";
import { SectionHeader } from "@/components/redesign/Navigation";

export function RankingCard({ items }: { items: { rank: number; title: string; heat: string; articleId: string }[] }) {
  return (
    <section className="app-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black"><Fire size={20} weight="fill" className="text-[#ef5f4c]" />实时热榜</h2>
        <span className="text-xs font-bold text-[var(--app-text-muted)]">每 5 分钟更新</span>
      </div>
      <ol className="mt-4 space-y-1">
        {items.map((item) => (
          <li key={item.rank}>
            <Link href={`/articles/${item.articleId}`} className="grid min-h-11 grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-1 hover:bg-[var(--app-surface-muted)]">
              <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-black ${item.rank <= 3 ? "bg-[#ef5f4c] text-white" : "bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]"}`}>{item.rank}</span>
              <span className="line-clamp-1 text-sm font-bold">{item.title}</span>
              <span className="text-xs font-bold text-[var(--app-text-muted)]">{item.heat}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link href="/discover" className="mt-4 flex min-h-10 items-center justify-center border-t border-[var(--app-line)] pt-3 text-xs font-black text-[var(--app-primary)]">查看完整热榜</Link>
    </section>
  );
}

export function TopicGrid({ topics }: { topics: Array<FollowTopic & { image?: string }> }) {
  return (
    <section>
      <SectionHeader title="精选专题" href="/topics" actionLabel="我的关注" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {topics.map((topic) => (
          <Link key={topic.id} href={`/topics/${topic.id}`} className="group overflow-hidden rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)]">
            <div className="relative aspect-[1.8/1] overflow-hidden">
              <Image src={topic.image ?? "/redesign-assets/ai-chip.webp"} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, 260px" />
            </div>
            <div className="p-4">
              <h3 className="font-black">{topic.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[var(--app-text-muted)]">{topic.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[var(--app-primary)]">查看专题 <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GrowthList({ items }: { items: { article: RedesignArticle; growth: number }[] }) {
  return (
    <section className="app-card overflow-hidden">
      <div className="p-5"><SectionHeader title="快速上升" /></div>
      {items.map(({ article, growth }) => (
        <Link key={article.id} href={`/articles/${article.id}`} className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-[var(--app-line)] p-4 hover:bg-[var(--app-surface-muted)] sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
          <div className="relative aspect-[1.25/1] overflow-hidden rounded-lg">
            <Image src={article.image} alt="" fill className="object-cover" sizes="120px" />
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-black leading-6 sm:text-base">{article.title}</h3>
            <p className="mt-1 text-xs font-bold text-[var(--app-text-muted)]">{article.source} · {article.time}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-black text-[#0f9f6e]"><TrendUp size={16} />{growth}%</span>
        </Link>
      ))}
    </section>
  );
}
