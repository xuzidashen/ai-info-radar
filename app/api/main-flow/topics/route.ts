import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { updateMainFlowTopic } from "@/lib/services/mainFlowService";
import { ensureDefaultZones } from "@/lib/services/zoneService";
import type { SearchMode } from "@/lib/types";

export const dynamic = "force-dynamic";

function canUseDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  return Boolean(databaseUrl?.startsWith("postgresql://") || databaseUrl?.startsWith("postgres://"));
}

function inferSearchMode(title: string, direction: string): SearchMode {
  const text = `${title} ${direction}`;

  if (/政策|考公|公务员/.test(text)) return "policy";
  if (/AI|Agent|芯片|半导体|软件|科技/.test(text)) return "tech";
  if (/公司|商业|财/.test(text)) return "finance";
  if (/学习|比赛|软件杯/.test(text)) return "custom";
  return "news";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      title?: string;
      description?: string;
      direction?: string;
      keywords?: string[];
      excludeWords?: string[];
      sourcePreference?: "官方优先" | "媒体优先" | "全网";
      depth?: "简短" | "标准" | "深度";
      searchScope?: "只搜索已有内容" | "允许全网搜索";
      autoSummary?: boolean;
      dailyAutoCheck?: boolean;
    };
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "请先填写关注主题" }, { status: 400 });
    }

    if (!canUseDatabase()) {
      return NextResponse.json({
        topic: {
          id: `custom-${Date.now()}`,
          title
        },
        localFallback: true
      });
    }

    await ensureDefaultZones();

    const zone =
      (await prisma.workspaceZone.findFirst({ where: { type: "analysis" }, orderBy: { createdAt: "asc" } })) ??
      (await prisma.workspaceZone.findFirst({ where: { type: "search" }, orderBy: { createdAt: "asc" } }));

    if (!zone) {
      return NextResponse.json({ error: "没有可用的主题空间" }, { status: 500 });
    }

    const direction = body.direction?.trim() || "新闻动态";
    const keywords = body.keywords?.map((item) => item.trim()).filter(Boolean) ?? [];
    const excludeWords = body.excludeWords?.map((item) => item.trim()).filter(Boolean).slice(0, 12) ?? [];
    const topic = await prisma.zoneTopic.create({
      data: {
        zoneId: zone.id,
        name: title,
        category: direction,
        description: body.description?.trim() || `持续整理与“${title}”有关的重要变化。${keywords.length ? `关键词：${keywords.join("、")}` : ""}`,
        searchMode: inferSearchMode(title, direction),
        summaryTemplate: null,
        analysisEnabled: true,
        factorEnabled: zone.type === "analysis",
        linkageEnabled: false
      }
    });

    await updateMainFlowTopic(topic.id, {
      title,
      description: body.description?.trim() || `持续整理与“${title}”有关的重要变化。`,
      category: direction,
      keywords: keywords.length ? keywords : [title],
      excludeWords,
      contentDirections: [direction],
      sourcePreference: body.sourcePreference ?? "官方优先",
      depth: body.depth ?? "标准",
      searchScope: body.searchScope ?? "允许全网搜索",
      autoSummary: body.autoSummary ?? true,
      dailyAutoCheck: body.dailyAutoCheck ?? false
    });

    return NextResponse.json({ topic: { id: topic.id, title: topic.name } });
  } catch (error) {
    console.error("Failed to create main flow topic", error);
    return NextResponse.json({ error: "创建主题失败，请稍后再试" }, { status: 500 });
  }
}
