import { NextResponse } from "next/server";

import { retryRunLog } from "@/lib/services/runLogService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const result = await retryRunLog(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "重试运行失败" }, { status: 400 });
  }
}
