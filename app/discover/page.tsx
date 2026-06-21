import { GrowthList, RankingCard, TopicGrid } from "@/components/redesign/DiscoverCards";
import { CategoryTabs, TopNav } from "@/components/redesign/Navigation";
import { NewsListCard } from "@/components/redesign/NewsCards";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { getMainFlowDiscoverView } from "@/lib/services/mainFlowService";
import { growthItems } from "@/lib/mock/redesignData";

export const dynamic = "force-dynamic";

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const { articles, topics, rankingItems } = await getMainFlowDiscoverView(q);

  return (
    <RedesignShell aside={<div className="sticky top-7"><RankingCard items={rankingItems} /></div>}>
      <div className="space-y-6">
        <TopNav title="发现" subtitle="追踪热点、专题和快速上升内容" showBrand={false} />
        <CategoryTabs items={["全部", "热榜", "科技", "商业", "AI", "深度"]} initialActive={q ? "全部" : "热榜"} />
        {q ? <p className="text-sm font-bold text-[var(--app-text-muted)]">“{q}”的搜索结果：{articles.length} 条</p> : null}
        <div className="xl:hidden"><RankingCard items={rankingItems} /></div>
        {!q ? <TopicGrid topics={topics} /> : null}
        {!q ? <GrowthList items={growthItems} /> : null}
        <NewsListCard articles={articles} title={q ? "搜索结果" : "更多内容"} />
      </div>
    </RedesignShell>
  );
}
