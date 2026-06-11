import { NextResponse } from "next/server";

import { markAllAsRead } from "@/lib/services/notificationService";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await markAllAsRead();

  return NextResponse.json(result);
}
