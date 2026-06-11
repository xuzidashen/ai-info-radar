from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app import crud
from app.database import get_session
from app.schemas import RunRead

router = APIRouter(prefix="/keywords", tags=["runs"])


@router.get("/{keyword_id}/runs", response_model=list[RunRead])
def get_keyword_runs(
    keyword_id: int,
    session: Session = Depends(get_session),
) -> list[RunRead]:
    keyword = crud.get_keyword(session, keyword_id)
    if keyword is None:
        raise HTTPException(status_code=404, detail="Keyword not found.")
    return [crud.run_to_read(run) for run in crud.list_runs_for_keyword(session, keyword_id)]

