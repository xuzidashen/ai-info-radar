import { NextResponse } from "next/server";

import { requireInternalSecret } from "@/lib/security/apiGuard";
import { runDailyMainFlowRefresh } from "@/lib/services/dailyRefreshService";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const guard = requireInternalSecret(request);
  if (!guard.ok) return guard.response;

  const result = await runDailyMainFlowRefresh();
  return NextResponse.json({ ...result, warning: guard.warning });
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
