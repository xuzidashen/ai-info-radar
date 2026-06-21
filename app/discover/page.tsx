import { GrowthList, RankingCard, TopicGrid } from "@/components/redesign/DiscoverCards";
import { CategoryTabs, TopNav } from "@/components/redesign/Navigation";
import { NewsListCard } from "@/components/redesign/NewsCards";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { featuredTopics, growthItems, rankingItems, redesignArticles } from "@/lib/mock/redesignData";

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const normalized = q?.trim().toLowerCase();
  const results = normalized
    ? redesignArticles.filter((article) => `${article.title}${article.excerpt}${article.source}${article.tags.join("")}`.toLowerCase().includes(normalized))
    : redesignArticles.slice(0, 4);

  return (
    <RedesignShell aside={<div className="sticky top-7"><RankingCard items={rankingItems} /></div>}>
      <div className="space-y-6">
        <TopNav title="发现" subtitle="追踪热点、专题和快速上升内容" showBrand={false} />
        <CategoryTabs items={["全部", "热榜", "科技", "商业", "AI", "深度"]} initialActive={q ? "全部" : "热榜"} />
        {q ? <p className="text-sm font-bold text-[var(--app-text-muted)]">“{q}”的搜索结果：{results.length} 条</p> : null}
        <div className="xl:hidden"><RankingCard items={rankingItems} /></div>
        {!q ? <TopicGrid topics={featuredTopics} /> : null}
        {!q ? <GrowthList items={growthItems} /> : null}
        <NewsListCard articles={results} title={q ? "搜索结果" : "更多内容"} />
      </div>
    </RedesignShell>
  );
}
