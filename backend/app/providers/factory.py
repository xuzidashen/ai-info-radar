import os
from dataclasses import dataclass

from app.providers.deepseek_summarizer import DeepSeekSummarizer
from app.providers.errors import ProviderConfigurationError
from app.providers.mock_search import MockSearchProvider
from app.providers.mock_summarizer import MockSummarizer
from app.providers.openai_summarizer import OpenAISummarizer
from app.providers.openai_web_search import OpenAIWebSearchProvider
from app.providers.search_base import SearchProvider
from app.providers.summarizer_base import Summarizer
from app.providers.tavily_search import TavilySearchProvider
from app.services.result_quality import get_search_max_results

SUPPORTED_SEARCH_PROVIDERS = {"mock", "openai", "tavily"}
SUPPORTED_SUMMARY_PROVIDERS = {"mock", "openai", "deepseek"}


@dataclass(frozen=True)
class ProviderStatus:
    search_provider: str
    summary_provider: str
    search_key_configured: bool
    summary_key_configured: bool
    search_max_results: int
    warnings: list[str]


def current_search_provider_name() -> str:
    return os.getenv("SEARCH_PROVIDER", "mock").strip().lower() or "mock"


def current_summary_provider_name() -> str:
    return os.getenv("SUMMARY_PROVIDER", "mock").strip().lower() or "mock"


def _has_env(name: str) -> bool:
    return bool(os.getenv(name, "").strip())


def is_search_key_configured(provider: str) -> bool:
    if provider == "mock":
        return False
    if provider == "tavily":
        return _has_env("TAVILY_API_KEY")
    if provider == "openai":
        return _has_env("OPENAI_API_KEY")
    return False


def is_summary_key_configured(provider: str) -> bool:
    if provider == "mock":
        return False
    if provider == "openai":
        return _has_env("OPENAI_API_KEY")
    if provider == "deepseek":
        return _has_env("DEEPSEEK_API_KEY")
    return False


def get_search_provider() -> SearchProvider:
    provider = current_search_provider_name()
    if provider == "mock":
        return MockSearchProvider()
    if provider == "openai":
        return OpenAIWebSearchProvider()
    if provider == "tavily":
        return TavilySearchProvider()
    raise ProviderConfigurationError(
        f"Unsupported SEARCH_PROVIDER={provider}. Supported: mock, openai, tavily."
    )


def get_summary_provider() -> Summarizer:
    provider = current_summary_provider_name()
    if provider == "mock":
        return MockSummarizer()
    if provider == "openai":
        return OpenAISummarizer()
    if provider == "deepseek":
        return DeepSeekSummarizer()
    raise ProviderConfigurationError(
        f"Unsupported SUMMARY_PROVIDER={provider}. Supported: mock, openai, deepseek."
    )


def get_provider_status() -> ProviderStatus:
    search_provider = current_search_provider_name()
    summary_provider = current_summary_provider_name()
    warnings: list[str] = []

    if search_provider not in SUPPORTED_SEARCH_PROVIDERS:
        warnings.append(
            f"Unsupported SEARCH_PROVIDER={search_provider}. Supported: mock, openai, tavily."
        )
    if summary_provider not in SUPPORTED_SUMMARY_PROVIDERS:
        warnings.append(
            f"Unsupported SUMMARY_PROVIDER={summary_provider}. Supported: mock, openai, deepseek."
        )
    if search_provider != "mock" and not is_search_key_configured(search_provider):
        warnings.append(f"{search_provider} search provider is selected but its API key is missing.")
    if summary_provider != "mock" and not is_summary_key_configured(summary_provider):
        warnings.append(
            f"{summary_provider} summary provider is selected but its API key is missing."
        )

    return ProviderStatus(
        search_provider=search_provider,
        summary_provider=summary_provider,
        search_key_configured=is_search_key_configured(search_provider),
        summary_key_configured=is_summary_key_configured(summary_provider),
        search_max_results=get_search_max_results(),
        warnings=warnings,
    )
