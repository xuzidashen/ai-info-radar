import { NextResponse } from "next/server";

import { getRunLogDetail } from "@/lib/services/runLogService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const log = await getRunLogDetail(id);

  if (!log) {
    return NextResponse.json({ error: "运行日志不存在" }, { status: 404 });
  }

  return NextResponse.json({ log });
}
