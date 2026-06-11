import { NextResponse } from "next/server";

import { listZoneReports } from "@/lib/services/zoneReportService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    return NextResponse.json({ reports: await listZoneReports(id) });
  } catch (error) {
    console.error("Failed to list zone reports", error);
    return NextResponse.json({ error: "获取专区报告失败" }, { status: 500 });
  }
}

