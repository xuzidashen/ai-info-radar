from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch) -> Generator[TestClient, None, None]:
    monkeypatch.setenv("SEARCH_PROVIDER", "mock")
    monkeypatch.setenv("SUMMARY_PROVIDER", "mock")
    monkeypatch.setenv("SEARCH_MAX_RESULTS", "8")
    database_url = f"sqlite:///{tmp_path / 'test.db'}"
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)

    def override_get_session() -> Generator[Session, None, None]:
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_get_providers_default_mock(client: TestClient) -> None:
    response = client.get("/providers")

    assert response.status_code == 200
    body = response.json()
    assert body["search_provider"] == "mock"
    assert body["summary_provider"] == "mock"
    assert body["search_key_configured"] is False
    assert body["summary_key_configured"] is False
    assert body["search_max_results"] == 8


def test_get_providers_reports_missing_real_key(client: TestClient, monkeypatch) -> None:
    monkeypatch.setenv("SEARCH_PROVIDER", "tavily")
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)

    response = client.get("/providers")

    assert response.status_code == 200
    body = response.json()
    assert body["search_provider"] == "tavily"
    assert body["search_key_configured"] is False
    assert body["warnings"]
