import os

import httpx

from app.providers.errors import ProviderConfigurationError, ProviderRuntimeError
from app.providers.search_base import SearchProvider, SearchResult


class TavilySearchProvider(SearchProvider):
    provider_name = "tavily"

    def __init__(self) -> None:
        self.api_key = os.getenv("TAVILY_API_KEY", "")
        self.endpoint = "https://api.tavily.com/search"

    async def search(self, keyword: str, limit: int = 8) -> list[SearchResult]:
        if not self.api_key:
            raise ProviderConfigurationError(
                "SEARCH_PROVIDER=tavily requires TAVILY_API_KEY in backend .env."
            )

        payload = {
            "api_key": self.api_key,
            "query": keyword,
            "search_depth": "basic",
            "max_results": limit,
            "include_answer": False,
            "include_raw_content": False,
        }

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(self.endpoint, json=payload)
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise ProviderRuntimeError(
                f"Tavily search failed with HTTP {exc.response.status_code}."
            ) from exc
        except httpx.RequestError as exc:
            raise ProviderRuntimeError(f"Tavily search request failed: {exc}") from exc

        data = response.json()
        items = data.get("results", [])
        results: list[SearchResult] = []
        for item in items[:limit]:
            url = item.get("url") or item.get("source_url") or ""
            if not url:
                continue
            results.append(
                SearchResult(
                    title=item.get("title") or "Untitled source",
                    snippet=item.get("content") or item.get("snippet") or "",
                    source_url=url,
                    published_at=item.get("published_at") or item.get("published_date"),
                )
            )
        return results
