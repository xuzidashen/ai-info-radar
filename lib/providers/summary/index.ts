import { DeepSeekSummaryProvider } from "@/lib/providers/summary/deepseekSummaryProvider";
import { MockSummaryProvider } from "@/lib/providers/summary/mockSummaryProvider";
import type { SummaryProviderInput, SummaryProviderName, SummaryRunResult } from "@/lib/providers/summary/types";

type ProviderRunOptions = {
  allowFallback?: boolean;
};

function requestedSummaryProvider(): SummaryProviderName {
  return process.env.SUMMARY_PROVIDER === "deepseek" ? "deepseek" : "mock";
}

export function getSummaryProviderStatus() {
  const requestedProvider = requestedSummaryProvider();
  const hasKey = Boolean(process.env.DEEPSEEK_API_KEY);

  return {
    requestedProvider,
    activeProvider: requestedProvider === "deepseek" && hasKey ? "deepseek" : "mock",
    hasDeepSeekApiKey: hasKey,
    model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    fallbackWillBeUsed: requestedProvider === "deepseek" && !hasKey
  };
}

export async function runSummaryProvider(input: SummaryProviderInput, options: ProviderRunOptions = {}): Promise<SummaryRunResult> {
  const requestedProvider = requestedSummaryProvider();
  const mock = new MockSummaryProvider();
  const allowFallback = options.allowFallback ?? true;

  if (requestedProvider !== "deepseek") {
    const result = await mock.generate(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: false
    };
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    if (!allowFallback) {
      throw new Error("缺少 DEEPSEEK_API_KEY：当前 SUMMARY_PROVIDER=deepseek，但没有配置 DeepSeek API Key。请在 Vercel 环境变量中添加 DEEPSEEK_API_KEY，或切回 SUMMARY_PROVIDER=mock。");
    }

    const result = await mock.generate(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: true,
      error: "缺少 DEEPSEEK_API_KEY，已回退到 mock 总结。"
    };
  }

  try {
    const result = await new DeepSeekSummaryProvider().generate(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: false
    };
  } catch (error) {
    if (!allowFallback) {
      throw new Error(error instanceof Error ? `AI 总结失败：${error.message}` : "AI 总结失败");
    }

    console.error("DeepSeek provider failed, falling back to mock summary", error);
    const result = await mock.generate(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: true,
      error: error instanceof Error ? error.message : "DeepSeek provider failed"
    };
  }
}
