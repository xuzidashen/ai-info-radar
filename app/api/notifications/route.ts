import { NextResponse } from "next/server";

import { listNotifications } from "@/lib/services/notificationService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const readParam = url.searchParams.get("read");
  const read = readParam === null ? undefined : readParam === "true" || readParam === "1";
  const limit = Number(url.searchParams.get("limit") ?? 100);
  const result = await listNotifications({
    read,
    limit: Number.isFinite(limit) ? limit : 100
  });

  return NextResponse.json(result);
}
