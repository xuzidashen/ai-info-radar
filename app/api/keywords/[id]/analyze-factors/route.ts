import { NextResponse } from "next/server";

import { findKeywordDetail } from "@/lib/keywordQueries";
import { prisma } from "@/lib/prisma";
import { runFactorProvider } from "@/lib/providers/factor";
import type { FactorInfoItemInput } from "@/lib/providers/factor/types";
import { serializeDailySignal } from "@/lib/serializers";
import type { Importance, KeywordCategory, Sentiment } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function getRecentInfoItems(keywordId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.infoItem.findMany({
    where: {
      keywordId,
      createdAt: {
        gte: since
      }
    },
    orderBy: [{ createdAt: "desc" }, { publishedAt: "desc" }],
    take: 20
  });

  if (recent.length > 0) {
    return recent;
  }

  return prisma.infoItem.findMany({
    where: {
      keywordId
    },
    orderBy: [{ createdAt: "desc" }, { publishedAt: "desc" }],
    take: 20
  });
}

function toFactorInput(item: Awaited<ReturnType<typeof getRecentInfoItems>>[number]): FactorInfoItemInput {
  return {
    id: item.id,
    title: item.title,
    source: item.source,
    url: item.url,
    publishedAt: item.publishedAt.toISOString(),
    summary: item.summary,
    importance: item.importance as Importance,
    sentiment: item.sentiment as Sentiment,
    provider: item.provider,
    score: item.score,
    credibilityLabel: item.credibilityLabel as FactorInfoItemInput["credibilityLabel"],
    credibilityScore: item.credibilityScore,
    credibilityReason: item.credibilityReason,
    rawContent: item.rawContent
  };
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const keyword = await prisma.keyword.findUnique({
      where: { id }
    });

    if (!keyword) {
      return NextResponse.json({ error: "关键词不存在" }, { status: 404 });
    }

    const infoItems = await getRecentInfoItems(id);

    if (infoItems.length === 0) {
      return NextResponse.json({ error: "该关键词还没有可分析的信息卡片，请先生成简报。" }, { status: 400 });
    }

    const factorRun = await runFactorProvider({
      keyword: {
        id: keyword.id,
        name: keyword.name,
        category: keyword.category as KeywordCategory,
        description: keyword.description
      },
      infoItems: infoItems.map(toFactorInput)
    });

    const today = startOfToday();

    const dailySignal = await prisma.$transaction(async (tx) => {
      await Promise.all(
        factorRun.itemFactors.map((factor) =>
          tx.infoItem.update({
            where: { id: factor.infoItemId },
            data: {
              eventType: factor.eventType,
              eventSubtype: factor.eventSubtype,
              sentimentScore: factor.sentimentScore,
              impactScore: factor.impactScore,
              riskScore: factor.riskScore,
              policyScore: factor.policyScore,
              techScore: factor.techScore,
              financialScore: factor.financialScore,
              attentionScore: factor.attentionScore,
              timeHorizon: factor.timeHorizon,
              factorConfidence: factor.factorConfidence,
              factorReason: factor.factorReason,
              relatedCompanies: JSON.stringify(factor.relatedCompanies),
              relatedIndustries: JSON.stringify(factor.relatedIndustries)
            }
          })
        )
      );

      return tx.dailySignal.upsert({
        where: {
          keywordId_date: {
            keywordId: id,
            date: today
          }
        },
        update: {
          newsCount: factorRun.dailySignal.newsCount,
          positiveCount: factorRun.dailySignal.positiveCount,
          negativeCount: factorRun.dailySignal.negativeCount,
          neutralCount: factorRun.dailySignal.neutralCount,
          avgSentiment: factorRun.dailySignal.avgSentiment,
          avgImpact: factorRun.dailySignal.avgImpact,
          avgRisk: factorRun.dailySignal.avgRisk,
          avgPolicy: factorRun.dailySignal.avgPolicy,
          avgTech: factorRun.dailySignal.avgTech,
          avgFinancial: factorRun.dailySignal.avgFinancial,
          avgAttention: factorRun.dailySignal.avgAttention,
          avgConfidence: factorRun.dailySignal.avgConfidence,
          signalLevel: factorRun.dailySignal.signalLevel,
          riskLevel: factorRun.dailySignal.riskLevel,
          attentionLevel: factorRun.dailySignal.attentionLevel,
          summary: factorRun.dailySignal.summary,
          factorSnapshot: factorRun.dailySignal.factorSnapshot
        },
        create: {
          keywordId: id,
          date: today,
          newsCount: factorRun.dailySignal.newsCount,
          positiveCount: factorRun.dailySignal.positiveCount,
          negativeCount: factorRun.dailySignal.negativeCount,
          neutralCount: factorRun.dailySignal.neutralCount,
          avgSentiment: factorRun.dailySignal.avgSentiment,
          avgImpact: factorRun.dailySignal.avgImpact,
          avgRisk: factorRun.dailySignal.avgRisk,
          avgPolicy: factorRun.dailySignal.avgPolicy,
          avgTech: factorRun.dailySignal.avgTech,
          avgFinancial: factorRun.dailySignal.avgFinancial,
          avgAttention: factorRun.dailySignal.avgAttention,
          avgConfidence: factorRun.dailySignal.avgConfidence,
          signalLevel: factorRun.dailySignal.signalLevel,
          riskLevel: factorRun.dailySignal.riskLevel,
          attentionLevel: factorRun.dailySignal.attentionLevel,
          summary: factorRun.dailySignal.summary,
          factorSnapshot: factorRun.dailySignal.factorSnapshot
        }
      });
    });

    const detail = await findKeywordDetail(id);

    return NextResponse.json({
      keyword: detail,
      itemFactors: factorRun.itemFactors,
      dailySignal: serializeDailySignal(dailySignal),
      factorProvider: factorRun.provider,
      requestedProvider: factorRun.requestedProvider,
      fallbackUsed: factorRun.fallbackUsed,
      error: factorRun.error ?? null
    });
  } catch (error) {
    console.error("Failed to analyze factors", error);
    return NextResponse.json({ error: "信息因子分析失败" }, { status: 500 });
  }
}

