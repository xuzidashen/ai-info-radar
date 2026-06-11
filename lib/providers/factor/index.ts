import { DeepSeekFactorProvider } from "@/lib/providers/factor/deepseekFactorProvider";
import { MockFactorProvider } from "@/lib/providers/factor/mockFactorProvider";
import type { FactorAnalyzeInput, FactorProviderName, FactorRunResult } from "@/lib/providers/factor/types";

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

export async function runFactorProvider(input: FactorAnalyzeInput): Promise<FactorRunResult> {
  const requestedProvider = requestedFactorProvider();
  const mock = new MockFactorProvider();

  if (requestedProvider !== "deepseek" || !process.env.DEEPSEEK_API_KEY) {
    const result = await mock.analyze(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: requestedProvider === "deepseek"
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

