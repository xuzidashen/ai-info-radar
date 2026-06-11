import { prisma } from "@/lib/prisma";
import { serializeDailySignal, serializeInfoItem, serializeKeyword, serializeSummary } from "@/lib/serializers";
import type { KeywordDetailDTO } from "@/lib/types";

export async function findKeywordDetail(id: string): Promise<KeywordDetailDTO | null> {
  const keyword = await prisma.keyword.findUnique({
    where: { id },
    include: {
      infoItems: {
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
      },
      summaries: {
        orderBy: { createdAt: "desc" }
      },
      dailySignals: {
        orderBy: { date: "desc" },
        take: 30
      },
      _count: {
        select: {
          infoItems: true,
          summaries: true
        }
      }
    }
  });

  if (!keyword) {
    return null;
  }

  return {
    ...serializeKeyword(keyword),
    infoItems: keyword.infoItems.map(serializeInfoItem),
    summaries: keyword.summaries.map(serializeSummary),
    dailySignals: keyword.dailySignals.map(serializeDailySignal)
  };
}
