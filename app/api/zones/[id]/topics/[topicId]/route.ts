import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { deleteZoneTopic, getZoneTopicDetail, updateZoneTopic } from "@/lib/services/zoneService";
import { isSearchMode } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    id: string;
    topicId: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { topicId } = await context.params;

  try {
    const topic = await getZoneTopicDetail(topicId);
    if (!topic) {
      return NextResponse.json({ error: "Topic 不存在" }, { status: 404 });
    }
    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Failed to get topic", error);
    return NextResponse.json({ error: "获取 Topic 详情失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { topicId } = await context.params;

  try {
    const body = (await request.json()) as {
      name?: unknown;
      category?: unknown;
      description?: unknown;
      searchMode?: unknown;
      summaryTemplate?: unknown;
      analysisEnabled?: unknown;
      factorEnabled?: unknown;
      linkageEnabled?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : "自定义";

    if (!name) {
      return NextResponse.json({ error: "Topic 名称不能为空" }, { status: 400 });
    }

    if (!isSearchMode(body.searchMode)) {
      return NextResponse.json({ error: "检索模式不合法" }, { status: 400 });
    }

    const topic = await updateZoneTopic(topicId, {
      name,
      category,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      searchMode: body.searchMode,
      summaryTemplate: typeof body.summaryTemplate === "string" ? body.summaryTemplate.trim() || null : null,
      analysisEnabled: typeof body.analysisEnabled === "boolean" ? body.analysisEnabled : undefined,
      factorEnabled: typeof body.factorEnabled === "boolean" ? body.factorEnabled : undefined,
      linkageEnabled: typeof body.linkageEnabled === "boolean" ? body.linkageEnabled : undefined
    });

    return NextResponse.json({ topic });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Topic 不存在" }, { status: 404 });
    }
    console.error("Failed to update topic", error);
    return NextResponse.json({ error: "更新 Topic 失败" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { topicId } = await context.params;

  try {
    await deleteZoneTopic(topicId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Topic 不存在" }, { status: 404 });
    }
    console.error("Failed to delete topic", error);
    return NextResponse.json({ error: "删除 Topic 失败" }, { status: 500 });
  }
}
