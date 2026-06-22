import { notFound } from "next/navigation";
import Link from "next/link";
import { FolderSimple, MagnifyingGlass, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { ArticleBody, ArticleHeader, RelatedArticles } from "@/components/redesign/ArticleComponents";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { getMainFlowArticleDetail } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getMainFlowArticleDetail(id);
  if (!detail) notFound();
  const { article, related } = detail;
  return (
    <RedesignShell
      showBottomNav={false}
      aside={
        <aside className="sticky top-7">
          <section className="app-card p-5">
            <Sparkle size={22} weight="duotone" className="text-[var(--app-primary)]" />
            <h2 className="mt-3 text-lg font-black">围绕主题继续追踪</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-text-muted)]">这篇内容会和同主题的新来源一起沉淀到分析结果里。</p>
            <div className="mt-4 grid gap-2">
              <Link href="/topics" className="app-button-secondary justify-center"><FolderSimple size={17} />查看我的主题</Link>
              <Link href={`/search?q=${encodeURIComponent(article.title)}`} className="app-button-secondary justify-center"><MagnifyingGlass size={17} />搜索相关内容</Link>
            </div>
          </section>
        </aside>
      }
    >
      <ArticleHeader article={article} />
      <ArticleBody article={article} />
      <RelatedArticles articles={related} />
    </RedesignShell>
  );
}
