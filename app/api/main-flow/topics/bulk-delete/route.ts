import { NextResponse } from "next/server";

import { bulkMarkMainFlowTopics } from "@/lib/services/mainFlowService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { ids?: unknown };
    const ids = Array.isArray(body.ids)
      ? body.ids.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean).slice(0, 50)
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "请先选择要删除的主题" }, { status: 400 });
    }

    const result = await bulkMarkMainFlowTopics(ids, "deleted");

    return NextResponse.json({
      ok: result.failed === 0,
      ...result,
      strategy: "soft-delete",
      message: result.failed
        ? `成功隐藏 ${result.updated} 个主题，${result.failed} 个未处理。`
        : `成功隐藏 ${result.updated} 个主题。`
    });
  } catch (error) {
    console.error("Failed to bulk delete main flow topics", error);
    return NextResponse.json({ error: "批量删除失败，请稍后再试" }, { status: 500 });
  }
}
