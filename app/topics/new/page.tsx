import { RedesignShell } from "@/components/redesign/RedesignShell";
import { TopicCreateWizard } from "@/components/redesign/TopicComponents";

export default async function NewTopicPage({ searchParams }: { searchParams: Promise<{ title?: string; category?: string; keywords?: string }> }) {
  const query = await searchParams;
  return <RedesignShell showBottomNav={false}><TopicCreateWizard initialTitle={query.title} initialCategory={query.category} initialKeywords={query.keywords?.split(",").filter(Boolean)} /></RedesignShell>;
}
