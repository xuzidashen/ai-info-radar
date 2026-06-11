import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeDailySignal } from "@/lib/serializers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const keyword = await prisma.keyword.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!keyword) {
      return NextResponse.json({ error: "关键词不存在" }, { status: 404 });
    }

    const dailySignals = await prisma.dailySignal.findMany({
      where: {
        keywordId: id
      },
      orderBy: {
        date: "desc"
      },
      take: 30
    });

    return NextResponse.json({
      dailySignals: dailySignals.map(serializeDailySignal)
    });
  } catch (error) {
    console.error("Failed to get daily signals", error);
    return NextResponse.json({ error: "获取 DailySignal 失败" }, { status: 500 });
  }
}

