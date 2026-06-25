import Link from "next/link";
import { ArrowRight, ArrowSquareOut, BookmarkSimple, CheckCircle, Clock, FileText, FolderSimple, Plus, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { UnreadBadge } from "@/components/redesign/ReadState";
import type { FollowTopic, Insight, RedesignArticle } from "@/lib/mock/redesignData";

export function AttentionOverview({ stats }: { stats: { topicCount: number; todayItemCount: number; insightCount: number; lastUpdated: string } }) {
  const items = [
    { label: "关注主题", value: stats.topicCount, icon: FolderSimple, tone: "text-[#2563eb] bg-[#e9f0ff]" },
    { label: "今日新增", value: stats.todayItemCount, icon: FileText, tone: "text-[#0f9f6e] bg-[#e7f7f1]" },
    { label: "分析结果", value: stats.insightCount, icon: Sparkle, tone: "text-[#b45309] bg-[#fff4df]" },
    { label: "最近更新", value: stats.lastUpdated, icon: Clock, tone: "text-[#6d5bd0] bg-[#f0edff]" }
  ];

  return (
    <section>
      <h2 className="text-lg font-black sm:text-xl">我的关注概览</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return <div key={item.label} className="rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-4"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}><Icon size={19} weight="duotone" /></span><strong className="mt-3 block truncate text-xl font-black">{item.value}</strong><span className="mt-1 block text-xs font-bold text-[var(--app-text-muted)]">{item.label}</span></div>;
        })}
      </div>
    </section>
  );
}

export function FocusActions() {
  return (
    <section className="flex flex-wrap gap-2" aria-label="快速操作">
      <Link href="/topics/new" className="app-button"><Plus size={18} weight="bold" />创建关注主题</Link>
      <Link href="/insights" className="app-button-secondary"><Sparkle size={17} />查看最新分析结果</Link>
      <Link href="/topics" className="app-button-secondary"><FolderSimple size={17} />管理我的关注</Link>
    </section>
  );
}

export function FocusFilters() {
  const filters = ["全部", "未读", "有更新", "高价值", "已收藏", "按主题"];
  return (
    <section className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-2" role="tablist" aria-label="关注动态筛选">
        {filters.map((item, index) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={index === 0}
            className={`min-h-10 rounded-lg px-4 text-sm font-black ${index === 0 ? "bg-[var(--app-primary)] text-white" : "border border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-text-muted)]"}`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

export function FollowedTopics({ topics }: { topics: FollowTopic[] }) {
  if (!topics.length) {
    return <section className="rounded-lg border border-dashed border-[var(--app-line)] bg-[var(--app-surface)] p-8 text-center"><FolderSimple size={30} className="mx-auto text-[var(--app-text-muted)]" /><h2 className="mt-3 text-lg font-black">还没有关注主题</h2><p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">先创建一个你想持续追踪的话题。</p><Link href="/topics/new" className="app-button mt-5"><Plus size={17} />创建主题</Link></section>;
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black sm:text-xl">我的主题</h2><Link href="/topics" className="text-sm font-black text-[var(--app-primary)]">全部主题</Link></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {topics.slice(0, 4).map((topic) => <Link key={topic.id} href={`/topics/${topic.id}`} className="group rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-4 transition-colors hover:border-[var(--app-primary)]"><div className="flex items-start justify-between gap-3"><span className="app-chip">{topic.category}</span><ArrowRight size={17} className="shrink-0 text-[var(--app-text-muted)] transition-transform group-hover:translate-x-1" /></div><h3 className="mt-3 font-black">{topic.title}</h3><p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{topic.description}</p><p className="mt-3 text-xs font-bold text-[var(--app-text-muted)]">{topic.updatedAt} · {topic.resultCount} 条结果</p></Link>)}
      </div>
    </section>
  );
}

export function TopicActivity({ articles }: { articles: RedesignArticle[] }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black sm:text-xl">我的关注动态</h2><Link href="/search" className="text-sm font-black text-[var(--app-primary)]">搜索已有内容</Link></div>
      {articles.length ? <div className="mt-4 grid gap-3">{articles.map((article) => (
        <article key={article.id} className="rounded-lg border border-[var(--app-line)] bg-[var(--app-surface)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="app-chip text-[var(--app-primary)]">{article.topicTitle || article.category}</span>
            {article.tags.slice(0, 2).map((tag) => <span key={tag} className="app-chip">{tag}</span>)}
            <UnreadBadge kind="article" id={article.id} />
          </div>
          <Link href={`/articles/${article.id}`} className="mt-3 block hover:text-[var(--app-primary)]">
            <h3 className="text-base font-black leading-6 sm:text-lg">{article.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">AI 速读：{article.excerpt}</p>
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--app-text-muted)]">
            <span>来源：{article.source}</span>
            <span>时间：{article.time}</span>
            <span>{article.score.toFixed(1)} 分</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {article.url ? <a href={article.url} target="_blank" rel="noreferrer" className="app-button-secondary min-h-9 px-2.5 py-1.5 text-xs"><ArrowSquareOut size={15} />原帖</a> : null}
            <Link href={`/articles/${article.id}`} className="app-button-secondary min-h-9 px-2.5 py-1.5 text-xs"><Sparkle size={15} />摘要</Link>
            <button type="button" className="app-button-secondary min-h-9 px-2.5 py-1.5 text-xs"><BookmarkSimple size={15} />收藏</button>
            <Link href={`/articles/${article.id}`} className="app-button-secondary min-h-9 px-2.5 py-1.5 text-xs"><CheckCircle size={15} />标记已读</Link>
          </div>
        </article>
      ))}</div> : <p className="mt-4 rounded-lg border border-dashed border-[var(--app-line)] p-6 text-sm font-semibold text-[var(--app-text-muted)]">还没有主题动态。进入主题并运行一次“立即更新”后，最新内容会出现在这里。</p>}
    </section>
  );
}

export function RecentInsights({ insights }: { insights: Insight[] }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black sm:text-xl">最近分析结果</h2><Link href="/insights" className="text-sm font-black text-[var(--app-primary)]">全部分析</Link></div>
      {insights.length ? <div className="mt-4 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">{insights.slice(0, 4).map((insight) => <Link key={insight.id} href={`/insights/${insight.id}`} className="flex min-h-24 items-start gap-3 py-4 hover:text-[var(--app-primary)]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e7f7f1] text-[#0f9f6e]"><Sparkle size={19} weight="duotone" /></span><span className="min-w-0 flex-1"><span className="text-xs font-black text-[var(--app-primary)]">{insight.topicTitle}</span><span className="mt-1 flex flex-wrap items-center gap-2"><strong className="text-base font-black leading-6">{insight.title}</strong><UnreadBadge kind="insight" id={insight.id} /></span><span className="mt-1 line-clamp-1 block text-sm font-semibold text-[var(--app-text-muted)]">{insight.summary}</span><span className="mt-2 block text-xs font-bold text-[var(--app-text-muted)]">{insight.generatedAt}</span></span><ArrowRight size={17} className="mt-2 shrink-0" /></Link>)}</div> : <p className="mt-4 rounded-lg border border-dashed border-[var(--app-line)] p-6 text-sm font-semibold text-[var(--app-text-muted)]">还没有分析结果，运行一次主题更新后会出现在这里。</p>}
    </section>
  );
}
