from fastapi import APIRouter

from app.providers.factory import get_provider_status
from app.schemas import ProviderStatusRead

router = APIRouter(tags=["providers"])


@router.get("/providers", response_model=ProviderStatusRead)
def providers() -> ProviderStatusRead:
    return ProviderStatusRead(**get_provider_status().__dict__)
