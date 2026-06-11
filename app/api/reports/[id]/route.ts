import { NextResponse } from "next/server";

import { getReportById } from "@/lib/services/reportCenterService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const report = await getReportById(id);

  if (!report) {
    return NextResponse.json({ error: "报告不存在" }, { status: 404 });
  }

  return NextResponse.json({ report });
}
