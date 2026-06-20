import { CategoryTabs, TopNav } from "@/components/redesign/Navigation";
import { GrowthList, RankingCard, TopicGrid } from "@/components/redesign/DiscoverCards";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { featuredTopics, growthItems, rankingItems } from "@/lib/mock/redesignData";

export default function RedesignDiscoverPage() {
  return (
    <RedesignShell aside={<div className="sticky top-8"><RankingCard items={rankingItems} /></div>}>
      <div className="space-y-6">
        <TopNav title="发现" subtitle="追踪热点与专题" showBrand={false} />
        <CategoryTabs items={["全部", "热榜", "科榜", "商业", "AI", "深度"]} initialActive="热榜" />
        <div className="xl:hidden"><RankingCard items={rankingItems} /></div>
        <TopicGrid topics={featuredTopics} />
        <GrowthList items={growthItems} />
      </div>
    </RedesignShell>
  );
}
