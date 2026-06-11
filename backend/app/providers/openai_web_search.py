import os

from app.providers.errors import ProviderConfigurationError, ProviderRuntimeError
from app.providers.search_base import SearchProvider, SearchResult


class OpenAIWebSearchProvider(SearchProvider):
    """Placeholder for a future OpenAI Web Search provider.

    The MVP defaults to the mock provider. This class intentionally keeps API keys
    on the backend and fails loudly if selected before implementation is complete.
    """

    provider_name = "openai"

    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = os.getenv("OPENAI_MODEL", "")

    async def search(self, keyword: str, limit: int = 8) -> list[SearchResult]:
        if not self.api_key:
            raise ProviderConfigurationError(
                "SEARCH_PROVIDER=openai requires OPENAI_API_KEY in backend .env."
            )
        raise ProviderRuntimeError(
            "OpenAI web search provider is a skeleton for a later round. "
            "Keep the key in backend .env and map provider responses to SearchResult."
        )
