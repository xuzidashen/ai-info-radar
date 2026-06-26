import { prisma } from "@/lib/prisma";

export type TopicActivityState = {
  todayItemCount: number;
  highTrustCount: number;
  needsReviewCount: number;
  articleIds: string[];
  lastRunState: "success" | "failed" | "waiting";
  lastRunAt: string | null;
  coolingDown: boolean;
  nextSuggestedUpdateAt: string | null;
};

type TopicActivityInput = {
  id: string;
  keywordId?: string | null;
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildNextSuggestedUpdateAt(lastRunAt?: Date | null) {
  if (!lastRunAt) return null;
  return new Date(lastRunAt.getTime() + 3 * 60 * 1000).toISOString();
}

function mapRunState(status?: string | null): TopicActivityState["lastRunState"] {
  if (status === "failed") return "failed";
  if (status === "running") return "waiting";
  return status ? "success" : "waiting";
}

export async function collectTopicActivities(topics: TopicActivityInput[]) {
  const keywordIds = Array.from(new Set(topics.map((topic) => topic.keywordId).filter((item): item is string => Boolean(item))));
  const topicIds = topics.map((topic) => topic.id);
  const today = startOfToday();

  const [infoItems, runLogs] = await Promise.all([
    keywordIds.length
      ? prisma.infoItem.findMany({
          where: { keywordId: { in: keywordIds } },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            keywordId: true,
            createdAt: true,
            credibilityLabel: true,
            eventType: true
          }
        })
      : [],
    topicIds.length
      ? prisma.topicRunLog.findMany({
          where: { topicId: { in: topicIds } },
          orderBy: { startedAt: "desc" },
          select: {
            topicId: true,
            status: true,
            startedAt: true
          }
        })
      : []
  ]);

  const runsByTopic = new Map<string, { status: string; startedAt: Date }>();
  for (const run of runLogs) {
    if (!run.topicId || runsByTopic.has(run.topicId)) continue;
    runsByTopic.set(run.topicId, { status: run.status, startedAt: run.startedAt });
  }

  const itemsByKeyword = new Map<string, typeof infoItems>();
  for (const item of infoItems) {
    const list = itemsByKeyword.get(item.keywordId) ?? [];
    list.push(item);
    itemsByKeyword.set(item.keywordId, list);
  }

  const activities = new Map<string, TopicActivityState>();

  for (const topic of topics) {
    const items = topic.keywordId ? itemsByKeyword.get(topic.keywordId) ?? [] : [];
    const latestRun = runsByTopic.get(topic.id);
    const lastRunAt = latestRun?.startedAt ?? null;
    activities.set(topic.id, {
      todayItemCount: items.filter((item) => item.createdAt >= today).length,
      highTrustCount: items.filter((item) => item.credibilityLabel === "high").length,
      needsReviewCount: items.filter((item) => item.credibilityLabel === "low" || item.eventType?.includes("needs_review") || item.eventType?.includes("low_signal")).length,
      articleIds: items.slice(0, 6).map((item) => item.id),
      lastRunState: mapRunState(latestRun?.status),
      lastRunAt: lastRunAt ? lastRunAt.toISOString() : null,
      coolingDown: Boolean(lastRunAt && Date.now() - lastRunAt.getTime() < 3 * 60 * 1000),
      nextSuggestedUpdateAt: buildNextSuggestedUpdateAt(lastRunAt)
    });
  }

  return activities;
}
