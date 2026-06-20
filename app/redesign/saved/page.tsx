import Link from "next/link";
import { ArrowRight, BookmarkSimple, ClockCounterClockwise, FolderSimple } from "@phosphor-icons/react/dist/ssr";

import { CategoryTabs, TopNav } from "@/components/redesign/Navigation";
import { NewsListCard } from "@/components/redesign/NewsCards";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { savedArticles } from "@/lib/mock/redesignData";

const collectionStats = [
  { label: "已收藏", value: "23", icon: BookmarkSimple, color: "bg-[#e8f2ff] text-[#2878ff]" },
  { label: "稍后阅读", value: "8", icon: ClockCounterClockwise, color: "bg-[#fff0e9] text-[#ff7448]" },
  { label: "专题夹", value: "5", icon: FolderSimple, color: "bg-[#f0edff] text-[#7868e8]" }
];

export default function RedesignSavedPage() {
  return (
    <RedesignShell
      aside={
        <section className="sticky top-8 rounded-[24px] border border-[#dce8f8] bg-[#f7faff] p-5">
          <BookmarkSimple size={24} weight="duotone" className="text-[#2878ff]" />
          <h2 className="mt-3 text-lg font-black text-[#10213b]">你的长期信息库</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#718096]">先收藏，稍后阅读。真实接入后可同步现有报告和关注内容。</p>
          <Link href="/redesign/discover" className="mt-4 inline-flex items-center gap-1 text-xs font-black text-[#1769e8]">发现更多内容 <ArrowRight size={15} /></Link>
        </section>
      }
    >
      <div className="space-y-6">
        <TopNav title="收藏" subtitle="留住值得反复阅读的内容" showBrand={false} />
        <CategoryTabs items={["全部", "稍后阅读", "专题", "笔记"]} />

        <section className="grid grid-cols-3 gap-3">
          {collectionStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-[22px] border border-white bg-white p-4 shadow-[0_10px_28px_rgba(65,91,130,0.08)] sm:flex sm:items-center sm:gap-4 sm:p-5">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color}`}><Icon size={23} weight="duotone" /></span>
                <div className="mt-3 sm:mt-0">
                  <strong className="block text-xl font-black text-[#10213b]">{stat.value}</strong>
                  <span className="text-[0.7rem] font-bold text-[#718096] sm:text-xs">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </section>

        <NewsListCard articles={savedArticles} title="最近收藏" />
      </div>
    </RedesignShell>
  );
}
