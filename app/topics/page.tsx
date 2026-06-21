import { RedesignShell } from "@/components/redesign/RedesignShell";
import { TopicsView } from "@/components/redesign/TopicComponents";
import { getMainFlowTopics } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const topics = await getMainFlowTopics();
  return <RedesignShell><TopicsView topics={topics} /></RedesignShell>;
}
