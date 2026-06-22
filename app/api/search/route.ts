import { NextResponse } from "next/server";

import { searchAppContent } from "@/lib/services/appSearchService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchAppContent(q);

  return NextResponse.json(results);
}
