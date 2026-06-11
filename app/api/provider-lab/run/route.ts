import { NextResponse } from "next/server";

import { runFactorProvider } from "@/lib/providers/factor";
import { runLinkageProvider } from "@/lib/providers/linkage";
import { runSummaryProvider } from "@/lib/providers/summary";
import { recordProviderSnapshot } from "@/lib/services/providerQualityService";
import { isKeywordCategory, type Importance, type KeywordCategory, type Sentiment } from "@/lib/types";
import { runSearchForTest } from "@/lib/utils/providerTest";

export const dynamic = "force-dynamic";

type LabKind = "search" | "summary" | "factor" | "linkage";

function isLabKind(value: unknown): value is LabKind {
  return value === "search" || value === "summary" || value === "factor" || value === "linkage";
}

const sampleModules = [
  { id: "ai-demand", name: "AI 算力需求", role: "market", description: "模型训练和推理带来的算力需求。" },
  { id: "pcb", name: "高速 PCB", role: "midstream", description: "服务器和网络设备的关键材料。" },
  { id: "optical", name: "光模块", role: "downstream", description: "数据中心网络传输组件。" }
];

export async function POST(request: Request) {
  const startedAt = Date.now();
  const body = (await request.json().catch(() => ({}))) as {
    kind?: unknown;
    keywordName?: unknown;
    category?: unknown;
    description?: unknown;
  };
  const kind = isLabKind(body.kind) ? body.kind : "search";
  const keywordName = typeof body.keywordName === "string" && body.keywordName.trim() ? body.keywordName.trim() : "OpenAI";
  const category: KeywordCategory = isKeywordCategory(body.category) ? body.category : "custom";
  const description = typeof body.description === "string" ? body.description : "";

  try {
    const searchRun = await runSearchForTest({ keywordName, category, description });

    if (kind === "search") {
      const latencyMs = Date.now() - startedAt;
      await recordProviderSnapshot({
        providerType: "search",
        providerName: searchRun.provider,
        success: searchRun.results.length > 0,
        fallbackUsed: searchRun.fallbackUsed,
        latencyMs,
        resultCount: searchRun.results.length,
        errorMessage: searchRun.error ?? null
      });

      return NextResponse.json({
        kind,
        latencyMs,
        provider: searchRun.provider,
        requestedProvider: searchRun.requestedProvider,
        fallbackUsed: searchRun.fallbackUsed,
        error: searchRun.error ?? null,
        resultCount: searchRun.results.length,
        result: searchRun
      });
    }

    const infoItems = searchRun.results.map((item, index) => ({
      id: `lab-${index}`,
      title: item.title,
      source: item.source,
      url: item.url,
      publishedAt: item.publishedAt ?? new Date().toISOString(),
      summary: item.content,
      importance: index === 0 ? ("high" as Importance) : ("medium" as Importance),
      sentiment: "neutral" as Sentiment,
      provider: searchRun.provider,
      score: item.score ?? null,
      credibilityLabel: item.credibility.label,
      credibilityScore: item.credibility.score,
      credibilityReason: item.credibility.reason,
      rawContent: item.rawContent ?? item.content
    }));

    if (kind === "summary") {
      const result = await runSummaryProvider({
        keyword: { name: keywordName, category, description },
        infoItems
      });
      const latencyMs = Date.now() - startedAt;
      await recordProviderSnapshot({
        providerType: "summary",
        providerName: result.provider,
        success: result.content.trim().length > 0,
        fallbackUsed: result.fallbackUsed || searchRun.fallbackUsed,
        latencyMs,
        resultCount: result.content.length,
        errorMessage: searchRun.error ?? result.error ?? null
      });

      return NextResponse.json({ kind, latencyMs, ...result, searchProvider: searchRun.provider, sourceCount: infoItems.length });
    }

    if (kind === "factor") {
      const result = await runFactorProvider({
        keyword: { id: "provider-lab", name: keywordName, category, description },
        infoItems
      });
      const latencyMs = Date.now() - startedAt;
      await recordProviderSnapshot({
        providerType: "factor",
        providerName: result.provider,
        success: result.itemFactors.length > 0 && Boolean(result.dailySignal),
        fallbackUsed: result.fallbackUsed || searchRun.fallbackUsed,
        latencyMs,
        resultCount: result.itemFactors.length,
        errorMessage: searchRun.error ?? result.error ?? null
      });

      return NextResponse.json({ kind, latencyMs, ...result, searchProvider: searchRun.provider });
    }

    const linkage = await runLinkageProvider({
      topic: {
        id: "provider-lab-linkage",
        name: keywordName,
        category: "provider-lab",
        description
      },
      modules: sampleModules.map((module) => ({
        ...module,
        searchResults: searchRun.results.slice(0, 3).map((item) => ({
          title: item.title,
          source: item.source,
          url: item.url,
          summary: item.content,
          publishedAt: item.publishedAt
        }))
      })),
      edges: [
        { from: "ai-demand", to: "pcb", relationType: "demand_pull", strength: 0.72, reason: "AI 服务器需求可能影响高速 PCB 需求。" },
        { from: "ai-demand", to: "optical", relationType: "demand_pull", strength: 0.76, reason: "数据中心网络升级可能影响光模块需求。" }
      ]
    });
    const latencyMs = Date.now() - startedAt;
    await recordProviderSnapshot({
      providerType: "linkage",
      providerName: linkage.provider,
      success: linkage.keyPaths.length > 0,
      fallbackUsed: linkage.fallbackUsed || searchRun.fallbackUsed,
      latencyMs,
      resultCount: linkage.keyPaths.length,
      errorMessage: searchRun.error ?? null
    });

    return NextResponse.json({ kind, latencyMs, ...linkage, searchProvider: searchRun.provider });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Provider Lab 测试失败" }, { status: 500 });
  }
}
