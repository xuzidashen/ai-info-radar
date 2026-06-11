import os

import httpx

from app.providers.errors import ProviderConfigurationError, ProviderRuntimeError
from app.providers.prompting import build_summary_prompt
from app.providers.search_base import SearchResult
from app.providers.summarizer_base import Summarizer


class DeepSeekSummarizer(Summarizer):
    provider_name = "deepseek"

    def __init__(self) -> None:
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
        self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

    async def summarize(self, keyword: str, results: list[SearchResult]) -> str:
        if not self.api_key:
            raise ProviderConfigurationError(
                "SUMMARY_PROVIDER=deepseek requires DEEPSEEK_API_KEY in backend .env."
            )

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "你是谨慎的信息整理助手，只基于用户提供的来源写中文摘要。",
                },
                {"role": "user", "content": build_summary_prompt(keyword, results)},
            ],
            "temperature": 0.2,
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}

        try:
            async with httpx.AsyncClient(timeout=40) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise ProviderRuntimeError(
                f"DeepSeek summary failed with HTTP {exc.response.status_code}."
            ) from exc
        except httpx.RequestError as exc:
            raise ProviderRuntimeError(f"DeepSeek summary request failed: {exc}") from exc

        data = response.json()
        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ProviderRuntimeError("DeepSeek summary response format was unexpected.") from exc
        if not content:
            raise ProviderRuntimeError("DeepSeek returned an empty summary.")
        return content
