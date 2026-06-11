import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { deleteLinkageModule, updateLinkageModule } from "@/lib/services/linkageService";
import { isLinkageModuleRole } from "@/lib/types";

type RouteContext = {
  params: Promise<{ moduleId: string }>;
};

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: RouteContext) {
  const { moduleId } = await context.params;

  try {
    const body = (await request.json()) as {
      name?: unknown;
      role?: unknown;
      description?: unknown;
      weight?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "模块名称不能为空" }, { status: 400 });
    }

    if (!isLinkageModuleRole(body.role)) {
      return NextResponse.json({ error: "模块角色不合法" }, { status: 400 });
    }

    const module = await updateLinkageModule(moduleId, {
      name,
      role: body.role,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      weight: typeof body.weight === "number" ? body.weight : null
    });

    return NextResponse.json({ module });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "模块不存在" }, { status: 404 });
    }
    console.error("Failed to update linkage module", error);
    return NextResponse.json({ error: "更新模块失败" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { moduleId } = await context.params;

  try {
    await deleteLinkageModule(moduleId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "模块不存在" }, { status: 404 });
    }
    console.error("Failed to delete linkage module", error);
    return NextResponse.json({ error: "删除模块失败" }, { status: 500 });
  }
}

