import { NextResponse } from "next/server";

import { runSummaryProvider } from "@/lib/providers/summary";
import { isKeywordCategory } from "@/lib/types";
import { runSearchForTest } from "@/lib/utils/providerTest";
import type { Importance } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      keywordName?: unknown;
      category?: unknown;
      description?: unknown;
    };
    const keywordName = typeof body.keywordName === "string" ? body.keywordName.trim() : "";

    if (!keywordName) {
      return NextResponse.json({ error: "测试关键词不能为空" }, { status: 400 });
    }

    const category = isKeywordCategory(body.category) ? body.category : "custom";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const searchRun = await runSearchForTest({
      keywordName,
      category,
      description
    });
    const summaryRun = await runSummaryProvider({
      keyword: {
        name: keywordName,
        category,
        description
      },
      infoItems: searchRun.results.map((item, index) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        summary: item.content,
        importance: index === 0 ? ("high" as Importance) : ("medium" as Importance),
        publishedAt: item.publishedAt ?? null,
        provider: searchRun.provider,
        score: item.score ?? null,
        credibilityLabel: item.credibility.label,
        credibilityScore: item.credibility.score,
        credibilityReason: item.credibility.reason
      }))
    });

    return NextResponse.json({
      ...summaryRun,
      searchProvider: searchRun.provider,
      fallbackUsed: searchRun.fallbackUsed || summaryRun.fallbackUsed,
      searchFallbackUsed: searchRun.fallbackUsed,
      summaryFallbackUsed: summaryRun.fallbackUsed,
      usedMock: searchRun.provider === "mock" || summaryRun.provider === "mock",
      usedTavily: searchRun.provider === "tavily",
      usedDeepSeek: summaryRun.provider === "deepseek",
      error: searchRun.error ?? summaryRun.error ?? null,
      sourceCount: searchRun.results.length
    });
  } catch (error) {
    console.error("Provider summary test failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "总结测试失败"
      },
      { status: 500 }
    );
  }
}
