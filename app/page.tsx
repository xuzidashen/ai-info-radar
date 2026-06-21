import Link from "next/link";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { RankingCard } from "@/components/redesign/DiscoverCards";
import { CategoryTabs, TopNav } from "@/components/redesign/Navigation";
import { BriefStats, HeroNewsCard, HomeActions, NewsListCard } from "@/components/redesign/NewsCards";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { featuredArticle, homeFeed, rankingItems } from "@/lib/mock/redesignData";

export default function HomePage() {
  return (
    <RedesignShell
      aside={
        <div className="sticky top-7 space-y-5">
          <RankingCard items={rankingItems} />
          <section className="app-card p-5">
            <Sparkle size={22} weight="fill" className="text-[var(--app-primary)]" />
            <h2 className="mt-3 text-lg font-black">更简单的资讯入口</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">创建关注主题后，内容、更新和分析结果会集中在一个页面。</p>
            <Link href="/topics" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[var(--app-primary)]">查看我的关注 <ArrowRight size={15} /></Link>
          </section>
        </div>
      }
    >
      <div className="space-y-6">
        <TopNav />
        <CategoryTabs items={["推荐", "科技", "商业", "AI", "世界", "视频"]} />
        <HeroNewsCard article={featuredArticle} />
        <BriefStats />
        <HomeActions />
        <div className="xl:hidden"><RankingCard items={rankingItems} /></div>
        <NewsListCard articles={homeFeed} />
      </div>
    </RedesignShell>
  );
}
