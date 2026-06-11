import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import keywords, providers, runs
from app.schemas import HealthRead


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="AI Information Radar API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "capacitor://localhost",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(keywords.router)
app.include_router(runs.router)
app.include_router(providers.router)


@app.get("/health", response_model=HealthRead)
def health() -> HealthRead:
    return HealthRead(
        status="ok",
        database=os.getenv("DATABASE_URL", "sqlite:///./radar.db"),
        search_provider=os.getenv("SEARCH_PROVIDER", "mock"),
        summary_provider=os.getenv("SUMMARY_PROVIDER", "mock"),
    )
