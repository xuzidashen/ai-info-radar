from datetime import datetime

from pydantic import BaseModel, Field


class KeywordCreate(BaseModel):
    text: str = Field(min_length=1, max_length=80)


class KeywordRead(BaseModel):
    id: int
    text: str
    created_at: datetime


class SearchResultRead(BaseModel):
    title: str
    snippet: str
    source_url: str
    published_at: str | None = None
    source_domain: str = ""
    source_type: str = "unknown"
    credibility_score: int = 1


class ProviderInfoRead(BaseModel):
    search_provider: str
    summary_provider: str
    search_max_results: int


class RunRead(BaseModel):
    id: int
    run_id: int
    keyword_id: int
    keyword: str
    keyword_text: str
    results: list[SearchResultRead]
    summary: str
    created_at: datetime
    provider_info: ProviderInfoRead | None = None
    warnings: list[str] = Field(default_factory=list)


class HealthRead(BaseModel):
    status: str
    database: str
    search_provider: str
    summary_provider: str


class ProviderStatusRead(BaseModel):
    search_provider: str
    summary_provider: str
    search_key_configured: bool
    summary_key_configured: bool
    search_max_results: int
    warnings: list[str] = Field(default_factory=list)
