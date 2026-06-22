import { MockSearchProvider } from "@/lib/providers/search/mockSearchProvider";
import { TavilySearchProvider } from "@/lib/providers/search/tavilySearchProvider";
import type { SearchProviderInput, SearchProviderName, SearchRunResult } from "@/lib/providers/search/types";

type ProviderRunOptions = {
  allowFallback?: boolean;
};

function requestedSearchProvider(): SearchProviderName {
  return process.env.SEARCH_PROVIDER === "tavily" ? "tavily" : "mock";
}

export function getSearchProviderStatus() {
  const requestedProvider = requestedSearchProvider();
  const hasKey = Boolean(process.env.TAVILY_API_KEY);

  return {
    requestedProvider,
    activeProvider: requestedProvider === "tavily" && hasKey ? "tavily" : "mock",
    hasTavilyApiKey: hasKey,
    fallbackWillBeUsed: requestedProvider === "tavily" && !hasKey
  };
}

export async function runSearchProvider(input: SearchProviderInput, options: ProviderRunOptions = {}): Promise<SearchRunResult> {
  const requestedProvider = requestedSearchProvider();
  const mock = new MockSearchProvider();
  const allowFallback = options.allowFallback ?? true;

  if (requestedProvider !== "tavily") {
    const result = await mock.search(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: false
    };
  }

  if (!process.env.TAVILY_API_KEY) {
    if (!allowFallback) {
      throw new Error("缺少 TAVILY_API_KEY：当前 SEARCH_PROVIDER=tavily，但没有配置 Tavily API Key。请在 Vercel 环境变量中添加 TAVILY_API_KEY，或切回 SEARCH_PROVIDER=mock。");
    }

    const result = await mock.search(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: true,
      error: "缺少 TAVILY_API_KEY，已回退到 mock 搜索。"
    };
  }

  try {
    const result = await new TavilySearchProvider().search(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: false
    };
  } catch (error) {
    if (!allowFallback) {
      throw new Error(error instanceof Error ? `Tavily 搜索失败：${error.message}` : "Tavily 搜索失败");
    }

    console.error("Tavily provider failed, falling back to mock search", error);
    const result = await mock.search(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: true,
      error: error instanceof Error ? error.message : "Tavily provider failed"
    };
  }
}
