import { NextResponse } from "next/server";

import { runZoneTopic } from "@/lib/services/topicRunService";

type RouteContext = {
  params: Promise<{
    topicId: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: RouteContext) {
  const { topicId } = await context.params;

  try {
    return NextResponse.json(await runZoneTopic(topicId));
  } catch (error) {
    console.error("Failed to run topic", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "运行 Topic 失败" }, { status: 500 });
  }
}

