import { DeepSeekSummaryProvider } from "@/lib/providers/summary/deepseekSummaryProvider";
import { MockSummaryProvider } from "@/lib/providers/summary/mockSummaryProvider";
import type { SummaryProviderInput, SummaryProviderName, SummaryRunResult } from "@/lib/providers/summary/types";

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

export async function runSummaryProvider(input: SummaryProviderInput): Promise<SummaryRunResult> {
  const requestedProvider = requestedSummaryProvider();
  const mock = new MockSummaryProvider();

  if (requestedProvider !== "deepseek" || !process.env.DEEPSEEK_API_KEY) {
    const result = await mock.generate(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: requestedProvider === "deepseek"
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
