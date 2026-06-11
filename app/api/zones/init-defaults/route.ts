import { NextResponse } from "next/server";

import { ensureDefaultZones, listZones } from "@/lib/services/zoneService";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await ensureDefaultZones();
    return NextResponse.json({ zones: await listZones() });
  } catch (error) {
    console.error("Failed to initialize default zones", error);
    return NextResponse.json({ error: "初始化默认专区失败" }, { status: 500 });
  }
}

