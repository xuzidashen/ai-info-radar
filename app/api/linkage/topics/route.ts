import { NextResponse } from "next/server";

import { listLinkageTopics } from "@/lib/services/linkageService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ topics: await listLinkageTopics() });
  } catch (error) {
    console.error("Failed to list linkage topics", error);
    return NextResponse.json({ error: "获取联动主题失败" }, { status: 500 });
  }
}

