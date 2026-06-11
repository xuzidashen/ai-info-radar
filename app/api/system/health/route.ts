import { NextResponse } from "next/server";

import { requireAdminToken } from "@/lib/security/apiGuard";
import { getEnvHealthCheck } from "@/lib/services/envHealthService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = requireAdminToken(request);
  const health = getEnvHealthCheck();

  if (!guard.ok) {
    return NextResponse.json(
      {
        status: health.status,
        appEnv: health.appEnv,
        restricted: true,
        message: "详细系统健康信息需要 APP_ADMIN_TOKEN。"
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    ...health,
    warning: guard.warning
  });
}
