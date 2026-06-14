import { NextResponse } from "next/server";

import { createZoneTopic, listZoneTopics } from "@/lib/services/zoneService";
import { isSearchMode } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    return NextResponse.json({ topics: await listZoneTopics(id) });
  } catch (error) {
    console.error("Failed to list zone topics", error);
    return NextResponse.json({ error: "获取 Topic 列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

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

    const topic = await createZoneTopic(id, {
      name,
      category,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      searchMode: body.searchMode,
      summaryTemplate: typeof body.summaryTemplate === "string" ? body.summaryTemplate.trim() || null : null,
      analysisEnabled: typeof body.analysisEnabled === "boolean" ? body.analysisEnabled : undefined,
      factorEnabled: typeof body.factorEnabled === "boolean" ? body.factorEnabled : undefined,
      linkageEnabled: typeof body.linkageEnabled === "boolean" ? body.linkageEnabled : undefined
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error("Failed to create topic", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "创建 Topic 失败" }, { status: 500 });
  }
}
