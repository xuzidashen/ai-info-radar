import { TopNav } from "@/components/redesign/Navigation";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { SearchExperience } from "@/components/redesign/SearchComponents";
import { searchAppContent } from "@/lib/services/appSearchService";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = await searchParams;
  const results = await searchAppContent(query.q);
  return <RedesignShell><div className="space-y-6"><TopNav title="搜索" subtitle="先搜索 App 内已有内容，需要时再搜索全网" showBrand={false} showSearch={false} /><SearchExperience results={results} /></div></RedesignShell>;
}
