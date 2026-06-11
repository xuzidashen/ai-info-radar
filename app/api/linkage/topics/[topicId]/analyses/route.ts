import { NextResponse } from "next/server";

import { listLinkageAnalyses } from "@/lib/services/linkageService";

type RouteContext = {
  params: Promise<{ topicId: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { topicId } = await context.params;

  try {
    return NextResponse.json({ analyses: await listLinkageAnalyses(topicId) });
  } catch (error) {
    console.error("Failed to list linkage analyses", error);
    return NextResponse.json({ error: "获取联动分析历史失败" }, { status: 500 });
  }
}

