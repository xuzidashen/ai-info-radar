import Link from "next/link";
import { ArrowRight, BookmarkSimple } from "@phosphor-icons/react/dist/ssr";

import { TopNav } from "@/components/redesign/Navigation";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { SavedContent } from "@/components/redesign/SavedContent";
import { getMainFlowSavedView } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const { articles, insights } = await getMainFlowSavedView();

  return (
    <RedesignShell
      aside={<section className="app-card sticky top-7 p-5"><BookmarkSimple size={22} weight="duotone" className="text-[var(--app-primary)]" /><h2 className="mt-3 text-lg font-black">你的长期信息库</h2><p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">收藏内容和分析结果，稍后继续阅读。</p><Link href="/discover" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[var(--app-primary)]">发现更多内容 <ArrowRight size={15} /></Link></section>}
    >
      <div className="space-y-6">
        <TopNav title="收藏" subtitle="留住值得反复阅读的内容" showBrand={false} />
        <SavedContent articles={articles} insights={insights} />
      </div>
    </RedesignShell>
  );
}
