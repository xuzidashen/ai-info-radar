import { DeepSeekLinkageProvider } from "@/lib/providers/linkage/deepseekLinkageProvider";
import { MockLinkageProvider } from "@/lib/providers/linkage/mockLinkageProvider";
import type { LinkageAnalyzeInput, LinkageAnalyzeResult, LinkageProviderName } from "@/lib/providers/linkage/types";

function requestedLinkageProvider(): LinkageProviderName {
  return process.env.LINKAGE_PROVIDER === "deepseek" ? "deepseek" : "mock";
}

export function getLinkageProviderStatus() {
  const requestedProvider = requestedLinkageProvider();
  const hasKey = Boolean(process.env.DEEPSEEK_API_KEY);

  return {
    requestedProvider,
    activeProvider: requestedProvider === "deepseek" && hasKey ? "deepseek" : "mock",
    hasDeepSeekApiKey: hasKey,
    model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
    fallbackWillBeUsed: requestedProvider === "deepseek" && !hasKey
  };
}

export async function runLinkageProvider(input: LinkageAnalyzeInput): Promise<LinkageAnalyzeResult> {
  const requestedProvider = requestedLinkageProvider();
  const mock = new MockLinkageProvider();

  if (requestedProvider !== "deepseek" || !process.env.DEEPSEEK_API_KEY) {
    const result = await mock.analyze(input);
    return {
      ...result,
      provider: result.provider,
      fallbackUsed: requestedProvider === "deepseek"
    };
  }

  try {
    return await new DeepSeekLinkageProvider().analyze(input);
  } catch (error) {
    console.error("DeepSeek linkage provider failed, falling back to mock linkage analysis", error);
    const result = await mock.analyze(input);
    return {
      ...result,
      fallbackUsed: true
    };
  }
}

