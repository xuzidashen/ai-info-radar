import { RedesignShell } from "@/components/redesign/RedesignShell";
import { TopicsView } from "@/components/redesign/TopicComponents";
import { followTopics } from "@/lib/mock/redesignData";

export default function TopicsPage() {
  return <RedesignShell><TopicsView topics={followTopics} /></RedesignShell>;
}
