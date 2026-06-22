import { NextResponse } from "next/server";

import { runSummaryProvider } from "@/lib/providers/summary";
import { parseStructuredSummary } from "@/lib/utils/summaryParser";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { query?: string; results?: Array<{ title?: string; source?: string; url?: string; content?: string; publishedAt?: string | null }> };
    const query = body.query?.trim().slice(0, 100);
    const results = body.results?.slice(0, 5) ?? [];
    if (!query || !results.length) return NextResponse.json({ error: "没有可总结的全网结果" }, { status: 400 });
    const run = await runSummaryProvider({
      keyword: { name: query, category: "custom", description: "用户手动全网搜索结果" },
      infoItems: results.flatMap((item) => item.title && item.url ? [{
        title: item.title.slice(0, 180),
        source: (item.source || "公开来源").slice(0, 120),
        url: item.url.slice(0, 800),
        summary: (item.content || "暂无摘要").slice(0, 700),
        importance: "medium" as const,
        publishedAt: item.publishedAt ?? undefined
      }] : [])
    }, { allowFallback: true });
    return NextResponse.json({ provider: run.provider, summary: parseStructuredSummary(run.content) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "生成摘要失败" }, { status: 500 });
  }
}
