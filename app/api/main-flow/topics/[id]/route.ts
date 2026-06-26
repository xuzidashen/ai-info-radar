import { NextResponse } from "next/server";

import { markMainFlowTopicLifecycle, updateMainFlowTopic } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeTopicInput(body: {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  keywords?: unknown;
  excludeWords?: unknown;
  contentDirections?: unknown;
  sourcePreference?: unknown;
  depth?: unknown;
  searchScope?: unknown;
  autoSummary?: unknown;
  dailyAutoCheck?: unknown;
}) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "资讯";
  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean).slice(0, 8)
    : [];
  const excludeWords = Array.isArray(body.excludeWords)
    ? body.excludeWords.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean).slice(0, 12)
    : undefined;
  const contentDirections = Array.isArray(body.contentDirections)
    ? body.contentDirections.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean).slice(0, 6)
    : undefined;
  const sourcePreference = body.sourcePreference === "官方优先" || body.sourcePreference === "媒体优先" || body.sourcePreference === "全网"
    ? body.sourcePreference as "官方优先" | "媒体优先" | "全网"
    : undefined;
  const depth = body.depth === "简短" || body.depth === "标准" || body.depth === "深度"
    ? body.depth as "简短" | "标准" | "深度"
    : undefined;
  const searchScope = body.searchScope === "只搜索已有内容" || body.searchScope === "允许全网搜索"
    ? body.searchScope as "只搜索已有内容" | "允许全网搜索"
    : undefined;

  return {
    title,
    description,
    category,
    keywords: keywords.length ? keywords : title ? [title] : [],
    excludeWords,
    contentDirections,
    sourcePreference,
    depth,
    searchScope,
    autoSummary: typeof body.autoSummary === "boolean" ? body.autoSummary : undefined,
    dailyAutoCheck: typeof body.dailyAutoCheck === "boolean" ? body.dailyAutoCheck : undefined
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const input = normalizeTopicInput(await request.json());
    if (!input.title) {
      return NextResponse.json({ error: "主题名称不能为空" }, { status: 400 });
    }

    const topic = await updateMainFlowTopic(id, input);
    if (!topic) {
      return NextResponse.json({ error: "主题不存在或当前环境无法保存" }, { status: 404 });
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Failed to update main flow topic", error);
    return NextResponse.json({ error: "保存主题失败，请稍后再试" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const topic = await markMainFlowTopicLifecycle(id, "deleted");
    if (!topic) {
      return NextResponse.json({ error: "主题不存在或当前环境无法删除" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      topic,
      strategy: "soft-delete",
      message: "已隐藏该主题，相关内容和分析结果会按当前数据策略保留。"
    });
  } catch (error) {
    console.error("Failed to delete main flow topic", error);
    return NextResponse.json({ error: "删除主题失败，请稍后再试" }, { status: 500 });
  }
}
