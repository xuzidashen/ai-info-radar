import { NextResponse } from "next/server";

import { findKeywordDetail } from "@/lib/keywordQueries";
import { prisma } from "@/lib/prisma";
import { MockSearchProvider } from "@/lib/providers/search/mockSearchProvider";
import { runSearchProvider } from "@/lib/providers/search";
import type { NormalizedSearchResult, SearchRunResult } from "@/lib/providers/search/types";
import { runSummaryProvider } from "@/lib/providers/summary";
import { serializeInfoItem, serializeSummary } from "@/lib/serializers";
import type { Importance, KeywordCategory, Sentiment } from "@/lib/types";
import { getSourceCredibility } from "@/lib/utils/sourceCredibility";
import { processSearchResults } from "@/lib/utils/providerTest";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type EnrichedSearchResult = NormalizedSearchResult & {
  credibility: ReturnType<typeof getSourceCredibility>;
};

const importancePool: Importance[] = ["high", "medium", "low"];
const sentimentPool: Sentiment[] = ["positive", "neutral", "negative"];

export const dynamic = "force-dynamic";

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function inferImportance(index: number, score?: number | null): Importance {
  if (index === 0) {
    return "high";
  }

  if (typeof score === "number") {
    if (score >= 0.75) {
      return "high";
    }

    if (score >= 0.45) {
      return "medium";
    }

    return "low";
  }

  return pick(importancePool);
}

function normalizePublishedAt(value?: string | null) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function prepareResults(results: NormalizedSearchResult[], keywordName: string): EnrichedSearchResult[] {
  return processSearchResults(results, keywordName);
}

async function runSearchWithQualityFallback(input: {
  keywordName: string;
  category: KeywordCategory;
  description?: string | null;
}): Promise<SearchRunResult & { processedResults: EnrichedSearchResult[] }> {
  const searchRun = await runSearchProvider({
    ...input,
    maxResults: 8
  });
  let processedResults = prepareResults(searchRun.results, input.keywordName);

  if (processedResults.length > 0) {
    return {
      ...searchRun,
      processedResults
    };
  }

  const mockResult = await new MockSearchProvider().search({
    ...input,
    maxResults: 8
  });
  processedResults = prepareResults(mockResult.results, input.keywordName);

  return {
    ...mockResult,
    requestedProvider: searchRun.requestedProvider,
    fallbackUsed: true,
    error: searchRun.error ?? "Search results were empty after quality filtering",
    processedResults
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

    const typedKeyword = {
      name: keyword.name,
      category: keyword.category as KeywordCategory,
      description: keyword.description
    };

    const searchRun = await runSearchWithQualityFallback({
      keywordName: typedKeyword.name,
      category: typedKeyword.category,
      description: typedKeyword.description
    });

    const now = new Date();

    const savedItems = await prisma.$transaction(async (tx) => {
      const createdItems = await Promise.all(
        searchRun.processedResults.map((result, index) =>
          tx.infoItem.create({
            data: {
              title: result.title,
              source: result.source,
              url: result.url,
              publishedAt: normalizePublishedAt(result.publishedAt),
              summary: result.content || result.rawContent || "该来源未返回可用摘要。",
              importance: inferImportance(index, result.score),
              sentiment: pick(sentimentPool),
              provider: searchRun.provider,
              score: result.score ?? null,
              rawContent: result.rawContent ?? null,
              fetchedAt: now,
              credibilityScore: result.credibility.score,
              credibilityLabel: result.credibility.label,
              credibilityReason: result.credibility.reason,
              keywordId: id
            }
          })
        )
      );

      await tx.keyword.update({
        where: { id },
        data: {
          lastSearchedAt: now
        }
      });

      return createdItems;
    });

    const summaryRun = await runSummaryProvider({
      keyword: typedKeyword,
      infoItems: savedItems.map((item) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        summary: item.summary,
        importance: item.importance as Importance,
        publishedAt: item.publishedAt.toISOString(),
        provider: item.provider,
        score: item.score,
        credibilityLabel: item.credibilityLabel as "high" | "medium" | "low" | "unknown" | null,
        credibilityScore: item.credibilityScore,
        credibilityReason: item.credibilityReason
      }))
    });

    const savedSummary = await prisma.summary.create({
      data: {
        keywordId: id,
        content: summaryRun.content,
        provider: summaryRun.provider
      }
    });

    const detail = await findKeywordDetail(id);
    const latestSummary = detail?.summaries.find((summary) => summary.id === savedSummary.id) ?? null;
    const fallbackUsed = searchRun.fallbackUsed || summaryRun.fallbackUsed;

    return NextResponse.json({
      keyword: detail,
      infoItems: savedItems.map(serializeInfoItem),
      summary: latestSummary ?? serializeSummary(savedSummary),
      searchProvider: searchRun.provider,
      summaryProvider: summaryRun.provider,
      fallbackUsed,
      error: searchRun.error ?? summaryRun.error ?? null
    });
  } catch (error) {
    console.error("Failed to generate briefing", error);
    return NextResponse.json({ error: "生成简报失败" }, { status: 500 });
  }
}
