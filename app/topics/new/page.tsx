import { RedesignShell } from "@/components/redesign/RedesignShell";
import { TopicCreateWizard } from "@/components/redesign/TopicComponents";

export default function NewTopicPage() {
  return <RedesignShell showBottomNav={false}><TopicCreateWizard /></RedesignShell>;
}
