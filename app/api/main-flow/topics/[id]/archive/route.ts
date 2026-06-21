import { NextResponse } from "next/server";

import { markMainFlowTopicLifecycle } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const topic = await markMainFlowTopicLifecycle(id, "archived");
    if (!topic) {
      return NextResponse.json({ error: "主题不存在或当前环境无法归档" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      topic,
      strategy: "archive",
      message: "已归档该主题，主流程会隐藏它，相关内容和分析结果继续保留。"
    });
  } catch (error) {
    console.error("Failed to archive main flow topic", error);
    return NextResponse.json({ error: "归档主题失败，请稍后再试" }, { status: 500 });
  }
}
