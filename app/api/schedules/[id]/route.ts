import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { deleteSchedule, getSchedule, updateSchedule } from "@/lib/services/scheduleService";
import { isTopicScheduleFrequency } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function parseOptionalInt(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const schedule = await getSchedule(id);

  if (!schedule) {
    return NextResponse.json({ error: "定时规则不存在" }, { status: 404 });
  }

  return NextResponse.json({ schedule });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const frequency = body.frequency;
    const schedule = await updateSchedule(id, {
      topicId: typeof body.topicId === "string" ? body.topicId : undefined,
      zoneId: typeof body.zoneId === "string" ? body.zoneId : undefined,
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      frequency: isTopicScheduleFrequency(frequency) ? frequency : undefined,
      hour: "hour" in body ? parseOptionalInt(body.hour) : undefined,
      minute: "minute" in body ? parseOptionalInt(body.minute) : undefined,
      dayOfWeek: "dayOfWeek" in body ? parseOptionalInt(body.dayOfWeek) : undefined,
      timezone: typeof body.timezone === "string" ? body.timezone : undefined
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "定时规则不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "更新定时规则失败" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await deleteSchedule(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "定时规则不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: "删除定时规则失败" }, { status: 500 });
  }
}
