from abc import ABC, abstractmethod

from app.providers.search_base import SearchResult


class Summarizer(ABC):
    provider_name = "unknown"

    @abstractmethod
    async def summarize(self, keyword: str, results: list[SearchResult]) -> str:
        raise NotImplementedError
