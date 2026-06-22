import { NextResponse } from "next/server";

import { canUseDatabase } from "@/lib/services/mainFlowService";
import { runZoneTopic } from "@/lib/services/topicRunService";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MainFlowRunResult = Awaited<ReturnType<typeof runZoneTopic>>;

function fallbackTitle(id: string) {
  return id.startsWith("custom-") ? "新关注主题" : id.replace(/[-_]/g, " ");
}

function classifyRunError(message: string) {
  if (message.includes("TAVILY_API_KEY")) {
    return "missing_tavily_key";
  }

  if (message.includes("DEEPSEEK_API_KEY")) {
    return "missing_deepseek_key";
  }

  if (message.includes("Tavily") || message.includes("搜索")) {
    return "search_failed";
  }

  if (message.includes("总结") || message.includes("评分") || message.includes("DeepSeek") || message.includes("AI")) {
    return "ai_failed";
  }

  return "run_failed";
}

function readReportId(result: MainFlowRunResult) {
  return "report" in result ? result.report?.id : null;
}

function readInfoItemCount(result: MainFlowRunResult) {
  const infoItems = "infoItems" in result ? result.infoItems : undefined;
  return Array.isArray(infoItems) ? infoItems.length : 0;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!canUseDatabase() || id.startsWith("custom-")) {
    const title = fallbackTitle(id);

    return NextResponse.json({
      message: "已完成本次更新：当前为本地演示模式，可查看临时分析结果。",
      reportId: "generated",
      runLogId: `local-${Date.now()}`,
      insightHref: `/insights/generated?topic=${encodeURIComponent(title)}&category=${encodeURIComponent("综合资讯")}&topicId=${encodeURIComponent(id)}`,
      contentHref: `/topics/${id}`,
      localFallback: true,
      itemCount: 0,
      reportCount: 1,
      provider: {
        searchProvider: "mock",
        summaryProvider: "mock",
        factorProvider: "mock",
        fallbackUsed: true
      },
      stages: ["正在搜索最新信息", "正在筛选有效内容", "正在生成摘要", "正在生成分析结果", "已完成本次更新"]
    });
  }

  try {
    const result = await runZoneTopic(id, { triggerType: "manual" });
    const reportId = readReportId(result);
    const itemCount = result.runLog.savedItemCount || readInfoItemCount(result);
    const reportCount = result.runLog.reportCount || (reportId ? 1 : 0);

    return NextResponse.json({
      message: `已完成本次更新：发现 ${itemCount} 条新内容，生成 ${reportCount} 条分析结果。`,
      reportId,
      runLogId: result.runLog.id,
      insightHref: reportId ? `/insights/${reportId}` : `/topics/${id}`,
      contentHref: `/topics/${id}`,
      itemCount,
      reportCount,
      provider: {
        searchProvider: result.runLog.searchProvider,
        summaryProvider: result.runLog.summaryProvider,
        factorProvider: result.runLog.factorProvider,
        linkageProvider: result.runLog.linkageProvider,
        fallbackUsed: result.runLog.fallbackUsed
      },
      stages: ["正在搜索最新信息", "正在筛选有效内容", "正在生成摘要", "正在生成分析结果", "已完成本次更新"]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新失败，请稍后再试。";

    console.error("Failed to run main flow topic", error);
    return NextResponse.json(
      {
        error: message,
        reason: classifyRunError(message),
        retryable: true
      },
      { status: 500 }
    );
  }
}
