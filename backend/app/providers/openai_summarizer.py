import os

from app.providers.errors import ProviderConfigurationError, ProviderRuntimeError
from app.providers.prompting import build_summary_prompt
from app.providers.search_base import SearchResult
from app.providers.summarizer_base import Summarizer


class OpenAISummarizer(Summarizer):
    """Future real summarizer that reads credentials only from backend env vars."""

    provider_name = "openai"

    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

    async def summarize(self, keyword: str, results: list[SearchResult]) -> str:
        if not self.api_key:
            raise ProviderConfigurationError(
                "SUMMARY_PROVIDER=openai requires OPENAI_API_KEY in backend .env."
            )

        try:
            from openai import AsyncOpenAI
        except ImportError as exc:
            raise ProviderRuntimeError(
                "Install the optional 'openai' package before using SUMMARY_PROVIDER=openai."
            ) from exc

        client = AsyncOpenAI(api_key=self.api_key)
        response = await client.responses.create(
            model=self.model,
            input=build_summary_prompt(keyword, results),
        )
        return response.output_text
