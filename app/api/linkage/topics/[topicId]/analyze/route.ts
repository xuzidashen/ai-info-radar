import { NextResponse } from "next/server";

import { runZoneTopic } from "@/lib/services/topicRunService";

type RouteContext = {
  params: Promise<{ topicId: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: RouteContext) {
  const { topicId } = await context.params;

  try {
    const result = await runZoneTopic(topicId);
    if (result.mode !== "linkage") {
      return NextResponse.json({ error: "该 Topic 不是联动分析类型" }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to run linkage analysis", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "运行联动分析失败" }, { status: 500 });
  }
}

