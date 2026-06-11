import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { deleteZone, getZoneDetail, updateZone } from "@/lib/services/zoneService";
import { isZoneType } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const zone = await getZoneDetail(id);
    if (!zone) {
      return NextResponse.json({ error: "专区不存在" }, { status: 404 });
    }
    return NextResponse.json({ zone });
  } catch (error) {
    console.error("Failed to get zone", error);
    return NextResponse.json({ error: "获取专区详情失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      name?: unknown;
      type?: unknown;
      description?: unknown;
      icon?: unknown;
      color?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "专区名称不能为空" }, { status: 400 });
    }

    if (!isZoneType(body.type)) {
      return NextResponse.json({ error: "专区类型不合法" }, { status: 400 });
    }

    const zone = await updateZone(id, {
      name,
      type: body.type,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      icon: typeof body.icon === "string" ? body.icon.trim() || null : null,
      color: typeof body.color === "string" ? body.color.trim() || null : null
    });

    return NextResponse.json({ zone });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "专区不存在" }, { status: 404 });
    }
    console.error("Failed to update zone", error);
    return NextResponse.json({ error: "更新专区失败" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await deleteZone(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "专区不存在" }, { status: 404 });
    }
    console.error("Failed to delete zone", error);
    return NextResponse.json({ error: "删除专区失败" }, { status: 500 });
  }
}

