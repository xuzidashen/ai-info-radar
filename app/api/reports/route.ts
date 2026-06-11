import { NextResponse } from "next/server";

import { listAllReports } from "@/lib/services/reportCenterService";
import { zoneReportTypes, type ZoneReportType } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseDate(value: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseType(value: string | null): ZoneReportType | undefined {
  return value && zoneReportTypes.includes(value as ZoneReportType) ? (value as ZoneReportType) : undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reports = await listAllReports({
    zoneId: url.searchParams.get("zoneId") || undefined,
    topicId: url.searchParams.get("topicId") || undefined,
    type: parseType(url.searchParams.get("type")),
    query: url.searchParams.get("query") || undefined,
    favoriteOnly: url.searchParams.get("favorite") === "1" || url.searchParams.get("favorite") === "true",
    tagId: url.searchParams.get("tagId") || undefined,
    dateFrom: parseDate(url.searchParams.get("dateFrom")),
    dateTo: parseDate(url.searchParams.get("dateTo")),
    limit: Number(url.searchParams.get("limit") ?? 100)
  });

  return NextResponse.json({ reports });
}
