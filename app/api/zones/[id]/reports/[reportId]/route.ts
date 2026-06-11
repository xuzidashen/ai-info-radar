import { NextResponse } from "next/server";

import { getZoneReport } from "@/lib/services/zoneReportService";

type RouteContext = {
  params: Promise<{
    id: string;
    reportId: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { id, reportId } = await context.params;

  try {
    const report = await getZoneReport(id, reportId);
    if (!report) {
      return NextResponse.json({ error: "报告不存在" }, { status: 404 });
    }
    return NextResponse.json({ report });
  } catch (error) {
    console.error("Failed to get zone report", error);
    return NextResponse.json({ error: "获取报告失败" }, { status: 500 });
  }
}

