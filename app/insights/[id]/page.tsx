import { notFound } from "next/navigation";

import { InsightArticle } from "@/components/redesign/InsightComponents";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { getMainFlowInsightDetail } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function InsightPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ topic?: string; category?: string; topicId?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const detail = await getMainFlowInsightDetail(id, query);
  if (!detail) notFound();
  const { insight, related } = detail;
  return <RedesignShell showBottomNav={false}><InsightArticle insight={insight} related={related} /></RedesignShell>;
}
