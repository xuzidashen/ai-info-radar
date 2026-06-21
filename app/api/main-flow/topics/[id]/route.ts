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
}) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "资讯";
  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean).slice(0, 8)
    : [];

  return {
    title,
    description,
    category,
    keywords: keywords.length ? keywords : title ? [title] : []
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
