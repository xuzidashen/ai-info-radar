import { AttentionOverview, FocusActions, FocusFilters, FollowedTopics, RecentInsights, TopicActivity, TrustOverview } from "@/components/redesign/FocusHome";
import { UnreadOverview } from "@/components/redesign/ReadState";
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
        <FocusFilters />
        <AttentionOverview stats={stats} />
        <TrustOverview stats={stats} />
        <UnreadOverview articleIds={articles.map((article) => article.id)} insightIds={insights.map((insight) => insight.id)} />
        <FocusActions />
        <FollowedTopics topics={topics} />
        {topics.length ? <TopicActivity articles={articles} /> : null}
        {topics.length ? <RecentInsights insights={insights} /> : null}
      </div>
    </RedesignShell>
  );
}
