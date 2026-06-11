import { NextResponse } from "next/server";

import { addReportTag } from "@/lib/services/reportCenterService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { tagId?: string; name?: string; color?: string | null };

  try {
    const report = await addReportTag(id, {
      tagId: body.tagId,
      name: body.name,
      color: body.color ?? null
    });

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "添加标签失败" }, { status: 400 });
  }
}
