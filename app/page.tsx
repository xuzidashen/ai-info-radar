import { AttentionOverview, FocusActions, FollowedTopics, RecentInsights, TopicActivity } from "@/components/redesign/FocusHome";
import { TopNav } from "@/components/redesign/Navigation";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { getMainFlowHomeView } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { topics, articles, insights, stats } = await getMainFlowHomeView();

  return (
    <RedesignShell>
      <div className="space-y-8">
        <TopNav subtitle="只追踪你真正关注的信息" />
        <AttentionOverview stats={stats} />
        <FocusActions />
        <FollowedTopics topics={topics} />
        {topics.length ? <TopicActivity articles={articles} /> : null}
        {topics.length ? <RecentInsights insights={insights} /> : null}
      </div>
    </RedesignShell>
  );
}
