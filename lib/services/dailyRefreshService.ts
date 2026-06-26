import { prisma } from "@/lib/prisma";
import { canUseDatabase } from "@/lib/services/mainFlowService";
import { runZoneTopic } from "@/lib/services/topicRunService";

const META_PREFIX = "[radar-meta]";

type TopicMetadata = {
  lifecycle?: "active" | "archived" | "deleted";
  dailyAutoCheck?: boolean;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parseTopicMeta(value: string | null): TopicMetadata {
  if (!value?.startsWith(META_PREFIX)) return {};
  const lineBreak = value.indexOf("\n");
  const raw = lineBreak >= 0 ? value.slice(META_PREFIX.length, lineBreak).trim() : value.slice(META_PREFIX.length).trim();
  try {
    const parsed = JSON.parse(raw) as TopicMetadata;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function runDailyMainFlowRefresh() {
  if (!canUseDatabase()) {
    return { total: 0, ran: 0, skipped: 0, successCount: 0, failedCount: 0, results: [], localFallback: true };
  }

  const topics = await prisma.zoneTopic.findMany({
    where: {
      NOT: [
        { description: { startsWith: `${META_PREFIX}{"lifecycle":"archived"` } },
        { description: { startsWith: `${META_PREFIX}{"lifecycle":"deleted"` } }
      ]
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, description: true }
  });
  const autoTopics = topics.filter((topic) => parseTopicMeta(topic.description).dailyAutoCheck === true);
  const today = startOfToday();
  const results: Array<{ topicId: string; topicName: string; ok: boolean; skipped?: boolean; noChange?: boolean; error?: string }> = [];

  for (const topic of autoTopics) {
    const existing = await prisma.topicRunLog.findFirst({
      where: {
        topicId: topic.id,
        triggerType: "schedule",
        startedAt: { gte: today }
      },
      orderBy: { startedAt: "desc" }
    });

    if (existing) {
      results.push({ topicId: topic.id, topicName: topic.name, ok: true, skipped: true });
      continue;
    }

    try {
      const run = await runZoneTopic(topic.id, { triggerType: "schedule" });
      results.push({
        topicId: topic.id,
        topicName: topic.name,
        ok: true,
        noChange: "noChange" in run ? Boolean(run.noChange) : false
      });
    } catch (error) {
      results.push({
        topicId: topic.id,
        topicName: topic.name,
        ok: false,
        error: error instanceof Error ? error.message : "每日自动检查失败"
      });
    }
  }

  return {
    date: todayKey(),
    total: autoTopics.length,
    ran: results.filter((item) => !item.skipped).length,
    skipped: results.filter((item) => item.skipped).length,
    successCount: results.filter((item) => item.ok && !item.skipped).length,
    failedCount: results.filter((item) => !item.ok).length,
    results
  };
}
