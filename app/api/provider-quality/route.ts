import { NextResponse } from "next/server";

import { requireAdminToken } from "@/lib/security/apiGuard";
import { getProviderDashboardStats } from "@/lib/services/providerQualityService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = requireAdminToken(request);

  if (!guard.ok) {
    return guard.response;
  }

  return NextResponse.json({
    ...(await getProviderDashboardStats()),
    warning: guard.warning
  });
}
