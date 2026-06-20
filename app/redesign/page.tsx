import Link from "next/link";
import { ArrowRight, FileText, PlusCircle, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { RankingCard } from "@/components/redesign/DiscoverCards";
import { CategoryTabs, TopNav } from "@/components/redesign/Navigation";
import { BriefStats, HeroNewsCard, NewsListCard } from "@/components/redesign/NewsCards";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { featuredArticle, homeFeed, rankingItems } from "@/lib/mock/redesignData";

export default function RedesignHomePage() {
  return (
    <RedesignShell
      aside={
        <div className="sticky top-8 space-y-5">
          <RankingCard items={rankingItems} />
          <section className="rounded-[24px] border border-[#dce8f8] bg-[#f7faff] p-5">
            <Sparkle size={23} weight="fill" className="text-[#2878ff]" />
            <h2 className="mt-3 text-lg font-black text-[#10213b]">更简单的资讯入口</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#718096]">首页、发现、收藏、我的四个主入口，隐藏 Zone、Run、Provider 等系统概念。</p>
            <Link href="/redesign/preview" className="mt-4 inline-flex items-center gap-1 text-xs font-black text-[#1769e8]">查看新版总览 <ArrowRight size={15} /></Link>
          </section>
        </div>
      }
    >
      <div className="space-y-6">
        <TopNav />
        <CategoryTabs items={["推荐", "科技", "商业", "AI", "世界", "视频"]} />
        <HeroNewsCard article={featuredArticle} />
        <BriefStats />
        <section className="grid gap-3 sm:grid-cols-2">
          <Link href="/zones" className="group flex min-h-32 items-center gap-4 rounded-[24px] border border-[#d8e7fb] bg-[#eef5ff] p-5 shadow-[0_12px_30px_rgba(65,91,130,0.07)] transition hover:border-[#9fc3ff] hover:bg-[#e8f2ff]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2878ff] text-white shadow-[0_10px_24px_rgba(40,120,255,0.22)]">
              <PlusCircle size={25} weight="duotone" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black text-[#2878ff]">创建关注</span>
              <strong className="mt-1 block text-lg font-black text-[#10213b]">开始创建 Topic</strong>
              <span className="mt-1 block text-xs font-semibold leading-5 text-[#718096]">用一个主题持续追踪重要变化</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-[#7895bd] transition group-hover:translate-x-1 group-hover:text-[#2878ff]" />
          </Link>

          <Link href="/reports" className="group flex min-h-32 items-center gap-4 rounded-[24px] border border-white bg-white p-5 shadow-[0_12px_30px_rgba(65,91,130,0.08)] transition hover:border-[#c8d8ec] hover:bg-[#fbfdff]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0edff] text-[#7868e8]">
              <FileText size={25} weight="duotone" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black text-[#7868e8]">最近报告</span>
              <strong className="mt-1 block text-lg font-black text-[#10213b]">查看最新分析结果</strong>
              <span className="mt-1 block text-xs font-semibold leading-5 text-[#718096]">从简报进入完整报告和历史记录</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-[#8f8aad] transition group-hover:translate-x-1 group-hover:text-[#7868e8]" />
          </Link>
        </section>
        <div className="xl:hidden">
          <RankingCard items={rankingItems} />
        </div>
        <NewsListCard articles={homeFeed} title="为你推荐" />
      </div>
    </RedesignShell>
  );
}
