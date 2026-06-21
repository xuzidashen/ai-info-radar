import { notFound } from "next/navigation";

import { InsightArticle } from "@/components/redesign/InsightComponents";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { getInsight, redesignArticles, type Insight } from "@/lib/mock/redesignData";

export default async function InsightPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ topic?: string; category?: string; topicId?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  let insight = getInsight(id);
  if (id === "generated") {
    const topic = query.topic?.trim() || "新关注主题";
    const category = query.category?.trim() || "综合资讯";
    insight = {
      id: "generated",
      title: `${topic}：本次更新的重要变化`,
      topicId: query.topicId?.trim() || "custom",
      topicTitle: topic,
      generatedAt: "刚刚",
      summary: `本次更新围绕“${topic}”整理了最新公开信息。当前变化主要集中在产品进展、行业应用和后续验证三个方向，建议继续关注正式发布与真实使用反馈。`,
      points: [`${category}方向出现新的公开进展。`, "后续判断应优先参考正式来源和可验证结果。", "雷达会继续合并重复信息并保留重要变化。"],
      tags: [topic, category, "最新更新"],
      references: [
        { title: "人工智能发展进入系统化落地阶段", source: "智见研究", url: "/articles/ai-plan-2030" },
        { title: "国产 AI 芯片算力效率持续提升", source: "36氪", url: "/articles/domestic-ai-chip" }
      ],
      relatedArticleIds: ["ai-plan-2030", "domestic-ai-chip"]
    } satisfies Insight;
  }
  if (!insight) notFound();
  const related = redesignArticles.filter((article) => insight.relatedArticleIds.includes(article.id));
  return <RedesignShell showBottomNav={false}><InsightArticle insight={insight} related={related} /></RedesignShell>;
}
