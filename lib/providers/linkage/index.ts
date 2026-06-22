import { DeepSeekLinkageProvider } from "@/lib/providers/linkage/deepseekLinkageProvider";
import { MockLinkageProvider } from "@/lib/providers/linkage/mockLinkageProvider";
import type { LinkageAnalyzeInput, LinkageAnalyzeResult, LinkageProviderName } from "@/lib/providers/linkage/types";

type ProviderRunOptions = {
  allowFallback?: boolean;
};

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

export async function runLinkageProvider(input: LinkageAnalyzeInput, options: ProviderRunOptions = {}): Promise<LinkageAnalyzeResult> {
  const requestedProvider = requestedLinkageProvider();
  const mock = new MockLinkageProvider();
  const allowFallback = options.allowFallback ?? true;

  if (requestedProvider !== "deepseek") {
    const result = await mock.analyze(input);
    return {
      ...result,
      provider: result.provider,
      fallbackUsed: false
    };
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    if (!allowFallback) {
      throw new Error("缺少 DEEPSEEK_API_KEY：当前 LINKAGE_PROVIDER=deepseek，但没有配置 DeepSeek API Key。请在 Vercel 环境变量中添加 DEEPSEEK_API_KEY，或切回 LINKAGE_PROVIDER=mock。");
    }

    const result = await mock.analyze(input);
    return {
      ...result,
      fallbackUsed: true
    };
  }

  try {
    return await new DeepSeekLinkageProvider().analyze(input);
  } catch (error) {
    if (!allowFallback) {
      throw new Error(error instanceof Error ? `AI 联动分析失败：${error.message}` : "AI 联动分析失败");
    }

    console.error("DeepSeek linkage provider failed, falling back to mock linkage analysis", error);
    const result = await mock.analyze(input);
    return {
      ...result,
      fallbackUsed: true
    };
  }
}
