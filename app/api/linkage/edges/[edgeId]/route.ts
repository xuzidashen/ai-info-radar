import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { deleteLinkageEdge, updateLinkageEdge } from "@/lib/services/linkageService";
import { isLinkageRelationType } from "@/lib/types";

type RouteContext = {
  params: Promise<{ edgeId: string }>;
};

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: RouteContext) {
  const { edgeId } = await context.params;

  try {
    const body = (await request.json()) as {
      relationType?: unknown;
      strength?: unknown;
      direction?: unknown;
      reason?: unknown;
    };

    if (!isLinkageRelationType(body.relationType)) {
      return NextResponse.json({ error: "关系类型不合法" }, { status: 400 });
    }

    const edge = await updateLinkageEdge(edgeId, {
      relationType: body.relationType,
      strength: typeof body.strength === "number" ? body.strength : null,
      direction: typeof body.direction === "string" ? body.direction.trim() || null : null,
      reason: typeof body.reason === "string" ? body.reason.trim() || null : null
    });

    return NextResponse.json({ edge });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "关系不存在" }, { status: 404 });
    }
    console.error("Failed to update linkage edge", error);
    return NextResponse.json({ error: "更新模块关系失败" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { edgeId } = await context.params;

  try {
    await deleteLinkageEdge(edgeId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "关系不存在" }, { status: 404 });
    }
    console.error("Failed to delete linkage edge", error);
    return NextResponse.json({ error: "删除模块关系失败" }, { status: 500 });
  }
}

