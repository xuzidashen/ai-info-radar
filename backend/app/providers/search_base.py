from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class SearchResult:
    title: str
    snippet: str
    source_url: str
    published_at: str | None = None
    source_domain: str = ""
    source_type: str = "unknown"
    credibility_score: int = 1

    def to_dict(self) -> dict[str, str | int | None]:
        return asdict(self)


class SearchProvider(ABC):
    provider_name = "unknown"

    @abstractmethod
    async def search(self, keyword: str, limit: int = 8) -> list[SearchResult]:
        raise NotImplementedError
