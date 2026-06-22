import { DeepSeekFactorProvider } from "@/lib/providers/factor/deepseekFactorProvider";
import { MockFactorProvider } from "@/lib/providers/factor/mockFactorProvider";
import type { FactorAnalyzeInput, FactorProviderName, FactorRunResult } from "@/lib/providers/factor/types";

type ProviderRunOptions = {
  allowFallback?: boolean;
};

function requestedFactorProvider(): FactorProviderName {
  return process.env.FACTOR_PROVIDER === "deepseek" ? "deepseek" : "mock";
}

export function getFactorProviderStatus() {
  const requestedProvider = requestedFactorProvider();
  const hasKey = Boolean(process.env.DEEPSEEK_API_KEY);

  return {
    requestedProvider,
    activeProvider: requestedProvider === "deepseek" && hasKey ? "deepseek" : "mock",
    hasDeepSeekApiKey: hasKey,
    model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    fallbackWillBeUsed: requestedProvider === "deepseek" && !hasKey
  };
}

export async function runFactorProvider(input: FactorAnalyzeInput, options: ProviderRunOptions = {}): Promise<FactorRunResult> {
  const requestedProvider = requestedFactorProvider();
  const mock = new MockFactorProvider();
  const allowFallback = options.allowFallback ?? true;

  if (requestedProvider !== "deepseek") {
    const result = await mock.analyze(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: false
    };
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    if (!allowFallback) {
      throw new Error("缺少 DEEPSEEK_API_KEY：当前 FACTOR_PROVIDER=deepseek，但没有配置 DeepSeek API Key。请在 Vercel 环境变量中添加 DEEPSEEK_API_KEY，或切回 FACTOR_PROVIDER=mock。");
    }

    const result = await mock.analyze(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: true,
      error: "缺少 DEEPSEEK_API_KEY，已回退到 mock 评分。"
    };
  }

  try {
    const result = await new DeepSeekFactorProvider().analyze(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: false
    };
  } catch (error) {
    if (!allowFallback) {
      throw new Error(error instanceof Error ? `AI 评分失败：${error.message}` : "AI 评分失败");
    }

    console.error("DeepSeek factor provider failed, falling back to mock factor analysis", error);
    const result = await mock.analyze(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: true,
      error: error instanceof Error ? error.message : "DeepSeek factor provider failed"
    };
  }
}
