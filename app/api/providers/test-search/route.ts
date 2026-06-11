import { NextResponse } from "next/server";

import { runSearchForTest } from "@/lib/utils/providerTest";
import { isKeywordCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      keywordName?: unknown;
      category?: unknown;
      description?: unknown;
    };
    const keywordName = typeof body.keywordName === "string" ? body.keywordName.trim() : "";

    if (!keywordName) {
      return NextResponse.json({ error: "测试关键词不能为空" }, { status: 400 });
    }

    const category = isKeywordCategory(body.category) ? body.category : "custom";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const result = await runSearchForTest({
      keywordName,
      category,
      description
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Provider search test failed", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "搜索测试失败"
      },
      { status: 500 }
    );
  }
}
