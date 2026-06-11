import { NextResponse } from "next/server";

import { listRunLogs } from "@/lib/services/runLogService";
import { isTopicRunStatus, isTopicRunTriggerType, isTopicRunType } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseDate(value: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const runType = url.searchParams.get("runType");
  const triggerType = url.searchParams.get("triggerType");
  const limit = Number(url.searchParams.get("limit") ?? 100);

  const logs = await listRunLogs({
    status: isTopicRunStatus(status) ? status : undefined,
    runType: isTopicRunType(runType) ? runType : undefined,
    triggerType: isTopicRunTriggerType(triggerType) ? triggerType : undefined,
    zoneId: url.searchParams.get("zoneId") || undefined,
    topicId: url.searchParams.get("topicId") || undefined,
    dateFrom: parseDate(url.searchParams.get("dateFrom")),
    dateTo: parseDate(url.searchParams.get("dateTo")),
    limit: Number.isFinite(limit) ? limit : 100
  });

  return NextResponse.json({ logs });
}
