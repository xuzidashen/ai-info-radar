import { NextResponse } from "next/server";

import { TavilySearchProvider } from "@/lib/providers/search/tavilySearchProvider";

export const dynamic = "force-dynamic";

type CachedSearch = { at: number; results: Awaited<ReturnType<TavilySearchProvider["search"]>>["results"] };
const globalSearch = globalThis as typeof globalThis & { radarWebSearchCache?: Map<string, CachedSearch> };
const cache = globalSearch.radarWebSearchCache ?? new Map<string, CachedSearch>();
globalSearch.radarWebSearchCache = cache;
const COOLDOWN_MS = 45_000;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { q?: string };
    const query = body.q?.trim().slice(0, 100);
    if (!query) return NextResponse.json({ error: "请输入要搜索的关键词" }, { status: 400 });
    if (!process.env.TAVILY_API_KEY) return NextResponse.json({ error: "缺少 TAVILY_API_KEY，暂时无法搜索全网" }, { status: 503 });

    const key = query.toLocaleLowerCase("zh-CN");
    const previous = cache.get(key);
    const age = previous ? Date.now() - previous.at : COOLDOWN_MS;
    if (previous && age < COOLDOWN_MS) {
      return NextResponse.json({ error: "同一关键词 45 秒内不会重复调用 Tavily", retryAfter: Math.ceil((COOLDOWN_MS - age) / 1000), results: previous.results }, { status: 429 });
    }

    const result = await new TavilySearchProvider().search({ keywordName: query, queryText: query, category: "custom", maxResults: 5, timeRange: "week" });
    cache.set(key, { at: Date.now(), results: result.results });
    return NextResponse.json({ query, provider: result.provider, results: result.results.slice(0, 5), cooldownSeconds: 45 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "全网搜索失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
