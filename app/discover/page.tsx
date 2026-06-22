import { TopNav } from "@/components/redesign/Navigation";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { TopicTemplateExplorer } from "@/components/redesign/TopicExplore";
import { getMainFlowTopics } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const topics = await getMainFlowTopics();

  return (
    <RedesignShell>
      <div className="space-y-7">
        <TopNav title="探索主题" subtitle="发现值得持续追踪的新方向" showBrand={false} />
        <TopicTemplateExplorer recentTopics={topics} />
      </div>
    </RedesignShell>
  );
}
