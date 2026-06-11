import { NextResponse } from "next/server";

import { requireInternalSecret } from "@/lib/security/apiGuard";
import { runDueSchedules } from "@/lib/services/scheduleService";

export const dynamic = "force-dynamic";

async function handleRunDue(request: Request) {
  const guard = requireInternalSecret(request);

  if (!guard.ok) {
    return guard.response;
  }

  const result = await runDueSchedules();

  return NextResponse.json({
    ...result,
    warning: guard.warning
  });
}

export async function GET(request: Request) {
  return handleRunDue(request);
}

export async function POST(request: Request) {
  return handleRunDue(request);
}
