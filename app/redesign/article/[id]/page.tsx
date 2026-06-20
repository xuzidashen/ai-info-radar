import { notFound } from "next/navigation";

import { ArticleBody, ArticleHeader, RelatedArticles } from "@/components/redesign/ArticleComponents";
import { RankingCard } from "@/components/redesign/DiscoverCards";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { getRedesignArticle, rankingItems, redesignArticles } from "@/lib/mock/redesignData";

export default async function RedesignArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getRedesignArticle(id);

  if (!article) {
    notFound();
  }

  const related = redesignArticles.filter((item) => item.id !== article.id).slice(0, 3);

  return (
    <RedesignShell showBottomNav={false} aside={<div className="sticky top-8"><RankingCard items={rankingItems} /></div>}>
      <ArticleHeader article={article} />
      <ArticleBody article={article} />
      <RelatedArticles articles={related} />
    </RedesignShell>
  );
}
