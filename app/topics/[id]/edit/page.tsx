import { RedesignShell } from "@/components/redesign/RedesignShell";
import { TopicEditClient } from "@/components/redesign/TopicComponents";
import { getEditableMainFlowTopic } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function TopicEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await getEditableMainFlowTopic(id);

  return <RedesignShell showBottomNav={false}><TopicEditClient id={id} topic={topic} /></RedesignShell>;
}
