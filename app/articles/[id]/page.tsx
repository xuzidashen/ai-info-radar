import { notFound } from "next/navigation";

import { ArticleBody, ArticleHeader, RelatedArticles } from "@/components/redesign/ArticleComponents";
import { RankingCard } from "@/components/redesign/DiscoverCards";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { rankingItems } from "@/lib/mock/redesignData";
import { getMainFlowArticleDetail } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getMainFlowArticleDetail(id);
  if (!detail) notFound();
  const { article, related } = detail;
  return <RedesignShell showBottomNav={false} aside={<div className="sticky top-7"><RankingCard items={rankingItems} /></div>}><ArticleHeader article={article} /><ArticleBody article={article} /><RelatedArticles articles={related} /></RedesignShell>;
}
