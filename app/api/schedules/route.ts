import { NextResponse } from "next/server";

import { createSchedule, listSchedules } from "@/lib/services/scheduleService";
import { isTopicScheduleFrequency } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseOptionalInt(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const enabled = url.searchParams.get("enabled");
  const schedules = await listSchedules({
    zoneId: url.searchParams.get("zoneId") || undefined,
    topicId: url.searchParams.get("topicId") || undefined,
    enabled: enabled === null ? undefined : enabled === "true",
    limit: Number(url.searchParams.get("limit") ?? 100)
  });

  return NextResponse.json({ schedules });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const frequency = body.frequency;
    const topicId = typeof body.topicId === "string" ? body.topicId : "";
    const zoneId = typeof body.zoneId === "string" ? body.zoneId : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!topicId || !zoneId || !name) {
      return NextResponse.json({ error: "zone、topic 和名称不能为空" }, { status: 400 });
    }

    if (!isTopicScheduleFrequency(frequency)) {
      return NextResponse.json({ error: "frequency 不合法" }, { status: 400 });
    }

    const schedule = await createSchedule({
      topicId,
      zoneId,
      name,
      enabled: typeof body.enabled === "boolean" ? body.enabled : true,
      frequency,
      hour: parseOptionalInt(body.hour),
      minute: parseOptionalInt(body.minute),
      dayOfWeek: parseOptionalInt(body.dayOfWeek),
      timezone: typeof body.timezone === "string" ? body.timezone : undefined
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "创建定时规则失败" }, { status: 400 });
  }
}
