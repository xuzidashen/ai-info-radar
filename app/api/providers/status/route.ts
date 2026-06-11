import { NextResponse } from "next/server";

import { getSearchProviderStatus } from "@/lib/providers/search";
import { getSummaryProviderStatus } from "@/lib/providers/summary";
import { getFactorProviderStatus } from "@/lib/providers/factor";
import { getLinkageProviderStatus } from "@/lib/providers/linkage";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    search: getSearchProviderStatus(),
    summary: getSummaryProviderStatus(),
    factor: getFactorProviderStatus(),
    linkage: getLinkageProviderStatus()
  });
}
