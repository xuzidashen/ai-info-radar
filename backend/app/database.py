import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()


def _database_url() -> str:
    return os.getenv("DATABASE_URL", "sqlite:///./radar.db")


def _connect_args(url: str) -> dict[str, bool]:
    if url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


DATABASE_URL = _database_url()
engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args(DATABASE_URL),
)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

