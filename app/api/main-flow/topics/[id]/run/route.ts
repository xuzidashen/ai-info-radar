import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createZoneReport } from "@/lib/services/zoneReportService";
import type { Importance, Sentiment } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const mockSources = ["雷达快讯", "智见研究", "产业观察"];
const sentiments: Sentiment[] = ["neutral", "positive", "neutral"];
const importances: Importance[] = ["high", "medium", "medium"];

function canUseDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  return Boolean(databaseUrl?.startsWith("postgresql://") || databaseUrl?.startsWith("postgres://"));
}

function buildMockItems(topicName: string) {
  return [
    {
      title: `${topicName} 出现新的公开进展`,
      summary: `围绕“${topicName}”的最新信息显示，相关进展正在从讨论进入更具体的执行阶段。`
    },
    {
      title: `${topicName} 相关场景开始进入验证`,
      summary: "多个来源提到，实际落地仍需要关注成本、流程和可靠性。"
    },
    {
      title: `${topicName} 后续关注重点逐渐清晰`,
      summary: "短期建议关注正式公告、产品交付和可验证的数据反馈。"
    }
  ];
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const fallbackTitle = id.startsWith("custom-") ? "新关注主题" : id.replace(/[-_]/g, " ");

  try {
    if (!canUseDatabase()) {
      return NextResponse.json({
        message: "已完成本次更新：发现 3 条新内容，生成 1 条分析结果。",
        reportId: "generated",
        runLogId: `local-${Date.now()}`,
        insightHref: `/insights/generated?topic=${encodeURIComponent(fallbackTitle)}&category=${encodeURIComponent("综合资讯")}&topicId=${encodeURIComponent(id)}`,
        contentHref: `/topics/${id}`,
        localFallback: true
      });
    }

    const topic = await prisma.zoneTopic.findUnique({
      where: { id },
      include: { zone: true, keyword: true }
    });

    if (!topic) {
      return NextResponse.json({ error: "主题不存在" }, { status: 404 });
    }

    const keyword =
      topic.keyword ??
      (await prisma.keyword.upsert({
        where: { name: topic.name },
        update: {},
        create: {
          name: topic.name,
          category: topic.searchMode === "policy" ? "policy" : topic.searchMode === "tech" ? "ai-tech" : "custom",
          description: topic.description
        }
      }));

    if (!topic.keywordId) {
      await prisma.zoneTopic.update({
        where: { id: topic.id },
        data: { keywordId: keyword.id }
      });
    }

    const runLog = await prisma.topicRunLog.create({
      data: {
        topicId: topic.id,
        zoneId: topic.zoneId,
        runType: topic.zone.type === "linkage" ? "linkage" : topic.zone.type === "analysis" ? "analysis" : "search",
        triggerType: "manual",
        status: "success",
        finishedAt: new Date(),
        durationMs: 900,
        searchProvider: "mock-main-flow",
        summaryProvider: "mock-main-flow",
        fallbackUsed: true,
        rawResultCount: 3,
        filteredCount: 3,
        dedupedCount: 3,
        savedItemCount: 3,
        reportCount: 1,
        metadata: JSON.stringify({ source: "main-flow" })
      }
    });

    const now = new Date();
    const items = await prisma.$transaction(
      buildMockItems(topic.name).map((item, index) =>
        prisma.infoItem.create({
          data: {
            title: item.title,
            source: mockSources[index] ?? "雷达快讯",
            url: `https://example.com/main-flow/${topic.id}/${Date.now()}-${index}`,
            publishedAt: new Date(now.getTime() - index * 12 * 60000),
            summary: item.summary,
            importance: importances[index] ?? "medium",
            sentiment: sentiments[index] ?? "neutral",
            provider: "mock-main-flow",
            score: 8.6 - index * 0.4,
            rawContent: `${item.summary}\n\n这是一条由主流程 mock provider 生成的半真实内容，用于验证主题更新、内容列表和分析结果链路。`,
            keywordId: keyword.id
          }
        })
      )
    );

    const summary = `本次更新围绕“${topic.name}”整理了 ${items.length} 条新内容。整体来看，相关变化正在从信息释放走向更可验证的执行与落地阶段。`;

    await prisma.summary.create({
      data: {
        keywordId: keyword.id,
        content: summary,
        provider: "mock-main-flow"
      }
    });

    const report = await createZoneReport({
      zoneId: topic.zoneId,
      runLogId: runLog.id,
      title: `${topic.name}：本次更新的重要变化`,
      type: "topic",
      summary,
      markdown: `# ${topic.name}：本次更新的重要变化

## 摘要
${summary}

## 关键观点
1. ${items[0].summary}
2. ${items[1].summary}
3. ${items[2].summary}

## 来源列表
${items.map((item, index) => `${index + 1}. [${item.title}](${item.url}) - ${item.source}`).join("\n")}

## 后续关注
继续关注正式来源、交付进度和可验证结果。`,
      metadata: {
        topicId: topic.id,
        keywordId: keyword.id,
        itemCount: items.length,
        averageScore: 8.2,
        topTags: [topic.category, topic.searchMode, "最新更新"],
        fallbackUsed: true,
        searchProvider: "mock-main-flow",
        summaryProvider: "mock-main-flow",
        highScoreItems: items.map((item) => ({
          title: item.title,
          source: item.source,
          url: `/articles/${item.id}`,
          summary: item.summary,
          tags: [topic.category]
        }))
      }
    });

    await prisma.zoneTopic.update({
      where: { id: topic.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      message: `已完成本次更新：发现 ${items.length} 条新内容，生成 1 条分析结果。`,
      reportId: report.id,
      runLogId: runLog.id,
      insightHref: `/insights/${report.id}`,
      contentHref: `/topics/${topic.id}`
    });
  } catch (error) {
    console.error("Failed to run main flow topic", error);
    return NextResponse.json({ error: "更新失败，请稍后再试" }, { status: 500 });
  }
}
