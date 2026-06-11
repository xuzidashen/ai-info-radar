import { NextResponse } from "next/server";

import { createLinkageModule } from "@/lib/services/linkageService";
import { isLinkageModuleRole } from "@/lib/types";

type RouteContext = {
  params: Promise<{ topicId: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  const { topicId } = await context.params;

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

    const module = await createLinkageModule(topicId, {
      name,
      role: body.role,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      weight: typeof body.weight === "number" ? body.weight : null
    });

    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    console.error("Failed to create linkage module", error);
    return NextResponse.json({ error: "创建模块失败" }, { status: 500 });
  }
}

