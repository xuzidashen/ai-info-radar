import { NextResponse } from "next/server";

import { createReportTag, listReportTags } from "@/lib/services/reportCenterService";

export const dynamic = "force-dynamic";

export async function GET() {
  const tags = await listReportTags();

  return NextResponse.json({ tags });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { name?: string; color?: string | null };

  try {
    const tag = await createReportTag({
      name: body.name ?? "",
      color: body.color ?? null
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "创建标签失败" }, { status: 400 });
  }
}
