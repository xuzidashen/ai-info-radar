import { NextResponse } from "next/server";

import { createLinkageEdge } from "@/lib/services/linkageService";
import { isLinkageRelationType } from "@/lib/types";

type RouteContext = {
  params: Promise<{ topicId: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  const { topicId } = await context.params;

  try {
    const body = (await request.json()) as {
      fromModuleId?: unknown;
      toModuleId?: unknown;
      relationType?: unknown;
      strength?: unknown;
      direction?: unknown;
      reason?: unknown;
    };
    const fromModuleId = typeof body.fromModuleId === "string" ? body.fromModuleId : "";
    const toModuleId = typeof body.toModuleId === "string" ? body.toModuleId : "";

    if (!fromModuleId || !toModuleId || fromModuleId === toModuleId) {
      return NextResponse.json({ error: "请选择两个不同模块" }, { status: 400 });
    }

    if (!isLinkageRelationType(body.relationType)) {
      return NextResponse.json({ error: "关系类型不合法" }, { status: 400 });
    }

    const edge = await createLinkageEdge(topicId, {
      fromModuleId,
      toModuleId,
      relationType: body.relationType,
      strength: typeof body.strength === "number" ? body.strength : null,
      direction: typeof body.direction === "string" ? body.direction.trim() || null : null,
      reason: typeof body.reason === "string" ? body.reason.trim() || null : null
    });

    return NextResponse.json({ edge }, { status: 201 });
  } catch (error) {
    console.error("Failed to create linkage edge", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "创建模块关系失败" }, { status: 500 });
  }
}

