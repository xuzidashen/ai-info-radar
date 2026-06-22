import { TopNav } from "@/components/redesign/Navigation";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { SavedContent } from "@/components/redesign/SavedContent";
import { getMainFlowSavedView } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const { articles, insights } = await getMainFlowSavedView();

  return (
    <RedesignShell>
      <div className="space-y-6">
        <TopNav title="收藏" subtitle="留住值得反复阅读的内容" showBrand={false} />
        <SavedContent articles={articles} insights={insights} />
      </div>
    </RedesignShell>
  );
}
