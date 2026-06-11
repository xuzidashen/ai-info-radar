from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Keyword(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str = Field(index=True, unique=True, min_length=1, max_length=80)
    created_at: datetime = Field(default_factory=utc_now, index=True)


class SearchRun(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    keyword_id: int = Field(foreign_key="keyword.id", index=True)
    keyword_text: str = Field(index=True, max_length=80)
    results_json: str
    summary: str
    created_at: datetime = Field(default_factory=utc_now, index=True)

