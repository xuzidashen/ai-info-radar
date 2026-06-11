import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeDailySignal } from "@/lib/serializers";

export const dynamic = "force-dynamic";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET() {
  try {
    const today = startOfToday();
    const dailySignals = await prisma.dailySignal.findMany({
      where: {
        date: today
      },
      orderBy: [{ avgAttention: "desc" }, { updatedAt: "desc" }],
      include: {
        keyword: {
          include: {
            _count: {
              select: {
                infoItems: true,
                summaries: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      dailySignals: dailySignals.map(serializeDailySignal)
    });
  } catch (error) {
    console.error("Failed to get today daily signals", error);
    return NextResponse.json({ error: "获取今日 DailySignal 失败" }, { status: 500 });
  }
}

