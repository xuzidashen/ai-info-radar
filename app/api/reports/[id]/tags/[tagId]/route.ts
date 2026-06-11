import { NextResponse } from "next/server";

import { removeReportTag } from "@/lib/services/reportCenterService";

type RouteContext = {
  params: Promise<{ id: string; tagId: string }>;
};

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, tagId } = await context.params;
  const report = await removeReportTag(id, tagId);

  return NextResponse.json({ report });
}
