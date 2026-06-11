import { MockSearchProvider } from "@/lib/providers/search/mockSearchProvider";
import { TavilySearchProvider } from "@/lib/providers/search/tavilySearchProvider";
import type { SearchProviderInput, SearchProviderName, SearchRunResult } from "@/lib/providers/search/types";

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

export async function runSearchProvider(input: SearchProviderInput): Promise<SearchRunResult> {
  const requestedProvider = requestedSearchProvider();
  const mock = new MockSearchProvider();

  if (requestedProvider !== "tavily" || !process.env.TAVILY_API_KEY) {
    const result = await mock.search(input);

    return {
      ...result,
      requestedProvider,
      fallbackUsed: requestedProvider === "tavily"
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
