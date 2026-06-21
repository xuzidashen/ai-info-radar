import { RedesignShell } from "@/components/redesign/RedesignShell";
import { TopicDetailClient } from "@/components/redesign/TopicComponents";
import { getMainFlowTopicDetail } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { topic, articles } = await getMainFlowTopicDetail(id);
  return <RedesignShell showBottomNav={false}><TopicDetailClient id={id} topic={topic} articles={articles} /></RedesignShell>;
}
