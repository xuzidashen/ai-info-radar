import json

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, delete, select

from app.models import Keyword, SearchRun
from app.providers.search_base import SearchResult
from app.schemas import ProviderInfoRead, RunRead, SearchResultRead
from app.services.result_quality import enrich_result


def normalize_keyword(text: str) -> str:
    return " ".join(text.strip().split())


def list_keywords(session: Session) -> list[Keyword]:
    statement = select(Keyword).order_by(Keyword.created_at.desc())
    return list(session.exec(statement).all())


def get_keyword(session: Session, keyword_id: int) -> Keyword | None:
    return session.get(Keyword, keyword_id)


def create_keyword(session: Session, text: str) -> Keyword:
    keyword = Keyword(text=normalize_keyword(text))
    session.add(keyword)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise
    session.refresh(keyword)
    return keyword


def delete_keyword(session: Session, keyword: Keyword) -> None:
    session.exec(delete(SearchRun).where(SearchRun.keyword_id == keyword.id))
    session.delete(keyword)
    session.commit()


def create_run(
    session: Session,
    keyword: Keyword,
    results: list[SearchResult],
    summary: str,
) -> SearchRun:
    run = SearchRun(
        keyword_id=keyword.id,
        keyword_text=keyword.text,
        results_json=json.dumps([result.to_dict() for result in results], ensure_ascii=False),
        summary=summary,
    )
    session.add(run)
    session.commit()
    session.refresh(run)
    return run


def list_runs_for_keyword(session: Session, keyword_id: int) -> list[SearchRun]:
    statement = (
        select(SearchRun)
        .where(SearchRun.keyword_id == keyword_id)
        .order_by(SearchRun.created_at.desc())
    )
    return list(session.exec(statement).all())


def run_to_read(
    run: SearchRun,
    provider_info: ProviderInfoRead | None = None,
    warnings: list[str] | None = None,
) -> RunRead:
    raw_results = json.loads(run.results_json)
    results: list[SearchResultRead] = []
    for item in raw_results:
        enriched = enrich_result(SearchResult(**item))
        results.append(SearchResultRead(**enriched.to_dict()))
    return RunRead(
        id=run.id,
        run_id=run.id,
        keyword_id=run.keyword_id,
        keyword=run.keyword_text,
        keyword_text=run.keyword_text,
        results=results,
        summary=run.summary,
        created_at=run.created_at,
        provider_info=provider_info,
        warnings=warnings or [],
    )
