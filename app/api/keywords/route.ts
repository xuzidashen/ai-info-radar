import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeKeyword } from "@/lib/serializers";
import { isKeywordCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const keywords = await prisma.keyword.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            infoItems: true,
            summaries: true
          }
        }
      }
    });

    return NextResponse.json({
      keywords: keywords.map(serializeKeyword)
    });
  } catch (error) {
    console.error("Failed to list keywords", error);
    return NextResponse.json({ error: "获取关键词列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  const payload = body as {
    name?: unknown;
    category?: unknown;
    description?: unknown;
  };

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const category = isKeywordCategory(payload.category) ? payload.category : "custom";
  const description =
    typeof payload.description === "string" && payload.description.trim().length > 0
      ? payload.description.trim()
      : null;

  if (!name) {
    return NextResponse.json({ error: "关键词名称不能为空" }, { status: 400 });
  }

  try {
    const keyword = await prisma.keyword.create({
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

    return NextResponse.json({ keyword: serializeKeyword(keyword) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "该关键词已存在" }, { status: 409 });
    }

    console.error("Failed to create keyword", error);
    return NextResponse.json({ error: "新增关键词失败" }, { status: 500 });
  }
}

