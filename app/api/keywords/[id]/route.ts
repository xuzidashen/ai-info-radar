import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { findKeywordDetail } from "@/lib/keywordQueries";
import { prisma } from "@/lib/prisma";
import { serializeKeyword } from "@/lib/serializers";
import { isKeywordCategory } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const keyword = await findKeywordDetail(id);

    if (!keyword) {
      return NextResponse.json({ error: "关键词不存在" }, { status: 404 });
    }

    return NextResponse.json({ keyword });
  } catch (error) {
    console.error("Failed to get keyword detail", error);
    return NextResponse.json({ error: "获取关键词详情失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      name?: unknown;
      category?: unknown;
      description?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = isKeywordCategory(body.category) ? body.category : null;
    const description =
      typeof body.description === "string" && body.description.trim().length > 0
        ? body.description.trim()
        : null;

    if (!name) {
      return NextResponse.json({ error: "关键词名称不能为空" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "关键词类型不合法" }, { status: 400 });
    }

    const keyword = await prisma.keyword.update({
      where: { id },
      data: {
        name,
        category,
        description
      },
      include: {
        _count: {
          select: {
            infoItems: true,
            summaries: true
          }
        }
      }
    });

    return NextResponse.json({ keyword: serializeKeyword(keyword) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "关键词不存在" }, { status: 404 });
      }

      if (error.code === "P2002") {
        return NextResponse.json({ error: "该关键词名称已存在" }, { status: 409 });
      }
    }

    console.error("Failed to update keyword", error);
    return NextResponse.json({ error: "更新关键词失败" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await prisma.keyword.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "关键词不存在" }, { status: 404 });
    }

    console.error("Failed to delete keyword", error);
    return NextResponse.json({ error: "删除关键词失败" }, { status: 500 });
  }
}

