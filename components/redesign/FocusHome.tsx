import Link from "next/link";
import { ArrowRight, ArrowSquareOut, BookmarkSimple, CheckCircle, Clock, FileText, FolderSimple, Plus, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { UnreadBadge } from "@/components/redesign/ReadState";
import type { FollowTopic, Insight, RedesignArticle } from "@/lib/mock/redesignData";



export function DailyBriefing({
  stats,
  articles
}: {
  stats: { todayItemCount: number; updatedTopicCount?: number; highTrustCount?: number; needsReviewCount?: number; lastUpdated: string };
  articles: RedesignArticle[];
}) {
  const topArticles = articles
    .filter((article) => article.topicId || article.topicTitle)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);
  const tiles = [
    { label: "\u4eca\u65e5\u65b0\u589e", value: stats.todayItemCount, tone: "text-[#0f8b62] bg-[#e7f7f1]" },
    { label: "\u6709\u66f4\u65b0\u4e3b\u9898", value: stats.updatedTopicCount ?? 0, tone: "text-[#2563eb] bg-[#e9f0ff]" },
    { label: "\u9ad8\u53ef\u4fe1", value: stats.highTrustCount ?? 0, tone: "text-[#0f8b62] bg-[#e7f7f1]" },
    { label: "\u9700\u590d\u6838", value: stats.needsReviewCount ?? 0, tone: "text-[#b45309] bg-[#fff4df]" }
  ];

  return (
    <section className="rounded-lg border border-[#c9ddff] bg-gradient-to-br from-[#f6f9ff] to-white p-5 shadow-[0_18px_60px_rgba(37,99,235,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="app-chip text-[var(--app-primary)]">{"\u4eca\u65e5\u60c5\u62a5\u7b80\u62a5"}</span>
          <h2 className="mt-3 text-2xl font-black leading-tight">{"\u53ea\u770b\u5173\u6ce8\u4e3b\u9898\u7684\u65b0\u53d8\u5316"}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">
            {"\u6700\u8fd1\u66f4\u65b0\uff1a"}{stats.lastUpdated}{"\u3002\u81ea\u52a8\u68c0\u67e5\u9ed8\u8ba4\u5173\u95ed\uff0c\u624b\u52a8\u66f4\u65b0\u4f1a\u6d88\u8017\u641c\u7d22\u989d\u5ea6\u3002"}
          </p>
        </div>
        <Link href="/topics" className="app-button shrink-0">{"\u66f4\u65b0\u5173\u6ce8\u4e3b\u9898"}<ArrowRight size={16} /></Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className={`rounded-lg px-4 py-3 ${tile.tone}`}>
            <strong className="block text-2xl font-black">{tile.value}</strong>
            <span className="mt-1 block text-xs font-black">{tile.label}</span>
          </div>
        ))}
      </div>

      {topArticles.length ? (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-black">{"\u4eca\u65e5\u6700\u503c\u5f97\u770b"}</h3>
            <Link href="/search" className="text-sm font-black text-[var(--app-primary)]">{"\u641c\u7d22\u5df2\u6709\u5185\u5bb9"}</Link>
          </div>
          {topArticles.map((article) => (
            <article key={article.id} className="rounded-lg border border-[var(--app-line)] bg-white/82 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="app-chip text-[var(--app-primary)]">{article.topicTitle || article.category}</span>
                {article.credibilityLabel ? (
                  <span className={`app-chip ${article.credibilityLabel === "high" ? "text-[#0f8b62]" : article.credibilityLabel === "low" ? "text-[#b45309]" : ""}`}>
                    {"\u53ef\u4fe1\u5ea6 "}{article.credibilityLabel}
                  </span>
                ) : null}
                {article.changeType ? <span className="app-chip text-[#6d5bd0]">{article.changeType}</span> : null}
              </div>
              <Link href={`/articles/${article.id}`} className="mt-3 block hover:text-[var(--app-primary)]">
                <h3 className="line-clamp-2 text-base font-black leading-6">{article.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">{article.excerpt}</p>
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--app-text-muted)]">
                <span>{"\u6765\u6e90\uff1a"}{article.source || "\u672a\u62ab\u9732"}</span>
                <span>{article.score.toFixed(1)}{" \u5206"}</span>
                <span>{article.time}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.url ? <a href={article.url} target="_blank" rel="noreferrer" className="app-button-secondary min-h-9 px-2.5 py-1.5 text-xs"><ArrowSquareOut size={15} />{"\u539f\u5e16\u94fe\u63a5"}</a> : null}
                <Link href={`/articles/${article.id}`} className="app-button-secondary min-h-9 px-2.5 py-1.5 text-xs"><Sparkle size={15} />{"\u67e5\u770b\u6458\u8981"}</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-[#c9ddff] bg-white/70 p-6 text-center">
          <p className="font-black">{"\u4eca\u5929\u8fd8\u6ca1\u6709\u53d1\u73b0\u660e\u663e\u53d8\u5316"}</p>
          <p className="mt-2 text-sm font-semibold text-[var(--app-text-muted)]">{"\u53ef\u4ee5\u624b\u52a8\u66f4\u65b0\u5173\u6ce8\u4e3b\u9898\uff1b\u5982\u679c\u6ca1\u6709\u65b0\u5185\u5bb9\uff0c\u7cfb\u7edf\u4e0d\u4f1a\u751f\u6210\u65e0\u610f\u4e49\u6458\u8981\u3002"}</p>
        </div>
      )}
    </section>
  );
}

export function AttentionOverview({ stats }: { stats: { topicCount: number; todayItemCount: number; insightCount: number; lastUpdated: string; updatedTopicCount?: number; highTrustCount?: number; needsReviewCount?: number } }) {
  const items = [
    { label: "关注主题", value: stats.topicCount, icon: FolderSimple, tone: "text-[#2563eb] bg-[#e9f0ff]" },
    { label: "今日新增", value: stats.todayItemCount, icon: FileText, tone: "text-[#0f9f6e] bg-[#e7f7f1]" },
    { label: "有更新主题", value: stats.updatedTopicCount ?? 0, icon: Clock, tone: "text-[#6d5bd0] bg-[#f0edff]" },
    { label: "需复核", value: stats.needsReviewCount ?? 0, icon: Sparkle, tone: "text-[#b45309] bg-[#fff4df]" }
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

export function TrustOverview({ stats }: { stats: { highTrustCount?: number; needsReviewCount?: number; lastUpdated: string } }) {
  return (
    <section className="rounded-lg border border-[#cfe5d9] bg-[#f3fbf7] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-[#0f8b62]">今日变化提醒</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#285f4b]">
            高可信 {stats.highTrustCount ?? 0} 条，需复核 {stats.needsReviewCount ?? 0} 条。最近更新：{stats.lastUpdated}。
          </p>
        </div>
        <Link href="/topics" className="app-button-secondary shrink-0">查看更新主题</Link>
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
            {(article.qualityLabels?.length ? article.qualityLabels : article.tags.slice(0, 2)).map((tag) => <span key={tag} className={`app-chip ${tag === "高可信" ? "text-[#0f8b62]" : tag.includes("复核") || tag.includes("低") || tag.includes("旧") || tag.includes("重复") ? "text-[#b45309]" : ""}`}>{tag}</span>)}
            <UnreadBadge kind="article" id={article.id} />
          </div>
          <Link href={`/articles/${article.id}`} className="mt-3 block hover:text-[var(--app-primary)]">
            <h3 className="text-base font-black leading-6 sm:text-lg">{article.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">AI 速读：{article.excerpt}</p>
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--app-text-muted)]">
            <span>来源：{article.source || "未披露"}</span>
            <span>类型：{article.sourceType || "unknown"}</span>
            <span>时间：{article.time}</span>
            <span>{article.score.toFixed(1)} 分</span>
          </div>
          {!article.url ? <p className="mt-2 text-xs font-bold text-[#b45309]">来源链接缺失，建议复核。</p> : null}
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
