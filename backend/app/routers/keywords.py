from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app import crud
from app.database import get_session
from app.providers.errors import ProviderConfigurationError, ProviderRuntimeError
from app.schemas import KeywordCreate, KeywordRead, RunRead
from app.services.radar_service import run_keyword_radar

router = APIRouter(prefix="/keywords", tags=["keywords"])


@router.get("", response_model=list[KeywordRead])
def get_keywords(session: Session = Depends(get_session)) -> list[KeywordRead]:
    return crud.list_keywords(session)


@router.post("", response_model=KeywordRead, status_code=status.HTTP_201_CREATED)
def post_keyword(
    payload: KeywordCreate,
    session: Session = Depends(get_session),
) -> KeywordRead:
    text = crud.normalize_keyword(payload.text)
    if not text:
        raise HTTPException(status_code=422, detail="Keyword cannot be blank.")
    try:
        return crud.create_keyword(session, text)
    except IntegrityError as exc:
        raise HTTPException(status_code=409, detail="Keyword already exists.") from exc


@router.delete("/{keyword_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_keyword(
    keyword_id: int,
    session: Session = Depends(get_session),
) -> None:
    keyword = crud.get_keyword(session, keyword_id)
    if keyword is None:
        raise HTTPException(status_code=404, detail="Keyword not found.")
    crud.delete_keyword(session, keyword)


@router.post("/{keyword_id}/run", response_model=RunRead, status_code=status.HTTP_201_CREATED)
async def run_keyword(
    keyword_id: int,
    session: Session = Depends(get_session),
) -> RunRead:
    keyword = crud.get_keyword(session, keyword_id)
    if keyword is None:
        raise HTTPException(status_code=404, detail="Keyword not found.")
    try:
        return await run_keyword_radar(session, keyword)
    except ProviderConfigurationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ProviderRuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
