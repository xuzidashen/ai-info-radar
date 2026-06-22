import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { canUseDatabase } from "@/lib/services/mainFlowService";

export async function POST(request: Request) {
  try {
    if (!canUseDatabase()) return NextResponse.json({ error: "数据库未连接，暂时无法保存" }, { status: 503 });
    const body = await request.json() as { query?: string; result?: { title?: string; source?: string; url?: string; content?: string; publishedAt?: string | null; score?: number | null } };
    const query = body.query?.trim().slice(0, 100);
    const result = body.result;
    if (!query || !result?.title || !result.url || !/^https?:\/\//.test(result.url)) return NextResponse.json({ error: "保存内容无效" }, { status: 400 });

    const keywordName = `全网搜索：${query}`.slice(0, 160);
    const keyword = await prisma.keyword.upsert({
      where: { name: keywordName },
      update: { lastSearchedAt: new Date() },
      create: { name: keywordName, category: "custom", description: "用户手动触发的 Tavily 全网搜索", lastSearchedAt: new Date() }
    });
    const existing = await prisma.infoItem.findFirst({ where: { keywordId: keyword.id, url: result.url } });
    if (existing) return NextResponse.json({ id: existing.id, saved: true, duplicate: true });

    const publishedAt = result.publishedAt ? new Date(result.publishedAt) : new Date();
    const item = await prisma.infoItem.create({ data: {
      keywordId: keyword.id,
      title: result.title.slice(0, 500),
      source: (result.source || new URL(result.url).hostname).slice(0, 200),
      url: result.url.slice(0, 2000),
      publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
      summary: (result.content || "该来源未提供摘要").slice(0, 1200),
      importance: "medium",
      sentiment: "neutral",
      provider: "tavily-manual",
      score: typeof result.score === "number" ? result.score : null,
      fetchedAt: new Date()
    } });
    return NextResponse.json({ id: item.id, saved: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 });
  }
}
