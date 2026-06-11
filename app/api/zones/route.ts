import { NextResponse } from "next/server";

import { createZone, listZones } from "@/lib/services/zoneService";
import { isZoneType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ zones: await listZones() });
  } catch (error) {
    console.error("Failed to list zones", error);
    return NextResponse.json({ error: "获取专区列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: unknown;
      type?: unknown;
      description?: unknown;
      icon?: unknown;
      color?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "专区名称不能为空" }, { status: 400 });
    }

    if (!isZoneType(body.type)) {
      return NextResponse.json({ error: "专区类型不合法" }, { status: 400 });
    }

    const zone = await createZone({
      name,
      type: body.type,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      icon: typeof body.icon === "string" ? body.icon.trim() || null : null,
      color: typeof body.color === "string" ? body.color.trim() || null : null
    });

    return NextResponse.json({ zone }, { status: 201 });
  } catch (error) {
    console.error("Failed to create zone", error);
    return NextResponse.json({ error: "创建专区失败" }, { status: 500 });
  }
}

