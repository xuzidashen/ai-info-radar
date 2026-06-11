import { NextResponse } from "next/server";

import { markAsRead } from "@/lib/services/notificationService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const notification = await markAsRead(id);

  return NextResponse.json({ notification });
}
