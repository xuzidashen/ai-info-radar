import { NextResponse } from "next/server";

import { setReportFavorite } from "@/lib/services/reportCenterService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const report = await setReportFavorite(id, true);

  return NextResponse.json({ report });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const report = await setReportFavorite(id, false);

  return NextResponse.json({ report });
}
