import { RedesignShell } from "@/components/redesign/RedesignShell";
import { TopicDetailClient } from "@/components/redesign/TopicComponents";
import { getFollowTopic, redesignArticles } from "@/lib/mock/redesignData";

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getFollowTopic(id);
  const articleIds = topic?.articleIds ?? ["ai-plan-2030", "domestic-ai-chip", "gene-editing"];
  const articles = redesignArticles.filter((article) => articleIds.includes(article.id));
  return <RedesignShell showBottomNav={false}><TopicDetailClient id={id} topic={topic} articles={articles} /></RedesignShell>;
}
