import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { serializeTopicSchedule } from "@/lib/serializers";
import { createNotification } from "@/lib/services/notificationService";
import { runZoneTopic } from "@/lib/services/topicRunService";
import type { TopicScheduleFrequency } from "@/lib/types";

export type ScheduleInput = {
  topicId: string;
  zoneId: string;
  name: string;
  enabled?: boolean;
  frequency: TopicScheduleFrequency;
  hour?: number | null;
  minute?: number | null;
  dayOfWeek?: number | null;
  timezone?: string;
};

export function calculateNextRunAt(input: {
  frequency: TopicScheduleFrequency;
  hour?: number | null;
  minute?: number | null;
  dayOfWeek?: number | null;
  from?: Date;
}) {
  if (input.frequency === "manual_only") {
    return null;
  }

  const from = input.from ?? new Date();
  const hour = Math.max(0, Math.min(23, input.hour ?? 9));
  const minute = Math.max(0, Math.min(59, input.minute ?? 0));
  const next = new Date(from);
  next.setSeconds(0, 0);
  next.setHours(hour, minute, 0, 0);

  if (input.frequency === "daily") {
    if (next <= from) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  const targetDay = Math.max(0, Math.min(6, input.dayOfWeek ?? 1));
  const currentDay = next.getDay();
  let daysToAdd = (targetDay - currentDay + 7) % 7;

  if (daysToAdd === 0 && next <= from) {
    daysToAdd = 7;
  }

  next.setDate(next.getDate() + daysToAdd);
  return next;
}

function normalizeScheduleInput(input: ScheduleInput) {
  return {
    topicId: input.topicId,
    zoneId: input.zoneId,
    name: input.name.trim(),
    enabled: input.enabled ?? true,
    frequency: input.frequency,
    hour: input.frequency === "manual_only" ? null : input.hour ?? 9,
    minute: input.frequency === "manual_only" ? null : input.minute ?? 0,
    dayOfWeek: input.frequency === "weekly" ? input.dayOfWeek ?? 1 : null,
    timezone: input.timezone || process.env.DEFAULT_TIMEZONE || "Asia/Shanghai"
  };
}

export async function createSchedule(input: ScheduleInput) {
  const data = normalizeScheduleInput(input);
  const topic = await prisma.zoneTopic.findFirst({
    where: {
      id: data.topicId,
      zoneId: data.zoneId
    }
  });

  if (!topic) {
    throw new Error("Topic 不存在或不属于所选专区");
  }

  const schedule = await prisma.topicSchedule.create({
    data: {
      ...data,
      nextRunAt: data.enabled
        ? calculateNextRunAt({
            frequency: data.frequency as TopicScheduleFrequency,
            hour: data.hour,
            minute: data.minute,
            dayOfWeek: data.dayOfWeek
          })
        : null
    },
    include: scheduleInclude
  });

  return serializeTopicSchedule(schedule);
}

export async function updateSchedule(
  id: string,
  input: Partial<ScheduleInput> & {
    enabled?: boolean;
  }
) {
  const existing = await prisma.topicSchedule.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new Error("定时规则不存在");
  }

  const data = normalizeScheduleInput({
    topicId: input.topicId ?? existing.topicId,
    zoneId: input.zoneId ?? existing.zoneId,
    name: input.name ?? existing.name,
    enabled: input.enabled ?? existing.enabled,
    frequency: input.frequency ?? (existing.frequency as TopicScheduleFrequency),
    hour: input.hour ?? existing.hour,
    minute: input.minute ?? existing.minute,
    dayOfWeek: input.dayOfWeek ?? existing.dayOfWeek,
    timezone: input.timezone ?? existing.timezone
  });

  const schedule = await prisma.topicSchedule.update({
    where: { id },
    data: {
      ...data,
      nextRunAt: data.enabled
        ? calculateNextRunAt({
            frequency: data.frequency as TopicScheduleFrequency,
            hour: data.hour,
            minute: data.minute,
            dayOfWeek: data.dayOfWeek
          })
        : null
    },
    include: scheduleInclude
  });

  return serializeTopicSchedule(schedule);
}

export async function deleteSchedule(id: string) {
  await prisma.topicSchedule.delete({
    where: { id }
  });
}

export async function listSchedules(input: {
  zoneId?: string;
  topicId?: string;
  enabled?: boolean;
  limit?: number;
} = {}) {
  const schedules = await prisma.topicSchedule.findMany({
    where: {
      zoneId: input.zoneId,
      topicId: input.topicId,
      enabled: input.enabled
    },
    orderBy: [{ enabled: "desc" }, { nextRunAt: "asc" }, { updatedAt: "desc" }],
    take: Math.min(input.limit ?? 100, 500),
    include: scheduleInclude
  });

  return schedules.map(serializeTopicSchedule);
}

export async function getSchedule(id: string) {
  const schedule = await prisma.topicSchedule.findUnique({
    where: { id },
    include: scheduleInclude
  });

  return schedule ? serializeTopicSchedule(schedule) : null;
}

export async function findDueSchedules(now = new Date()) {
  const schedules = await prisma.topicSchedule.findMany({
    where: {
      enabled: true,
      frequency: {
        not: "manual_only"
      },
      nextRunAt: {
        lte: now
      }
    },
    orderBy: { nextRunAt: "asc" },
    include: scheduleInclude
  });

  return schedules.map(serializeTopicSchedule);
}

export async function runDueSchedules(now = new Date()) {
  const schedules = await prisma.topicSchedule.findMany({
    where: {
      enabled: true,
      frequency: {
        not: "manual_only"
      },
      nextRunAt: {
        lte: now
      }
    },
    orderBy: { nextRunAt: "asc" }
  });
  const results: Array<{
    scheduleId: string;
    topicId: string;
    ok: boolean;
    error?: string;
  }> = [];

  for (const schedule of schedules) {
    try {
      await runZoneTopic(schedule.topicId, {
        triggerType: "schedule",
        scheduleId: schedule.id
      });
      const nextRunAt = calculateNextRunAt({
        frequency: schedule.frequency as TopicScheduleFrequency,
        hour: schedule.hour,
        minute: schedule.minute,
        dayOfWeek: schedule.dayOfWeek,
        from: new Date()
      });
      await prisma.topicSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt
        }
      });
      await createNotification({
        type: "schedule_completed",
        title: "定时刷新完成",
        message: `${schedule.name} 已完成自动刷新。`,
        severity: "success",
        zoneId: schedule.zoneId,
        topicId: schedule.topicId
      });
      results.push({
        scheduleId: schedule.id,
        topicId: schedule.topicId,
        ok: true
      });
    } catch (error) {
      const nextRunAt = calculateNextRunAt({
        frequency: schedule.frequency as TopicScheduleFrequency,
        hour: schedule.hour,
        minute: schedule.minute,
        dayOfWeek: schedule.dayOfWeek,
        from: new Date()
      });
      await prisma.topicSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt
        }
      });
      await createNotification({
        type: "schedule_completed",
        title: "定时刷新失败",
        message: `${schedule.name} 执行失败：${error instanceof Error ? error.message : "运行定时任务失败"}`,
        severity: "danger",
        zoneId: schedule.zoneId,
        topicId: schedule.topicId
      });
      results.push({
        scheduleId: schedule.id,
        topicId: schedule.topicId,
        ok: false,
        error: error instanceof Error ? error.message : "运行定时任务失败"
      });
    }
  }

  return {
    total: schedules.length,
    successCount: results.filter((item) => item.ok).length,
    failedCount: results.filter((item) => !item.ok).length,
    results
  };
}

const scheduleInclude = Prisma.validator<Prisma.TopicScheduleInclude>()({
  zone: {
    include: {
      _count: {
        select: { topics: true, reports: true }
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 20
      }
    }
  },
  topic: {
    include: {
      keyword: {
        include: {
          _count: {
            select: { infoItems: true, summaries: true }
          }
        }
      },
      moduleLinks: true,
      linkageAnalyses: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  }
});
