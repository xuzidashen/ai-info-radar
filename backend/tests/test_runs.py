from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app
from app.providers.search_base import SearchResult
from app.services.result_quality import deduplicate_and_enrich_results


@pytest.fixture()
def client(tmp_path, monkeypatch) -> Generator[TestClient, None, None]:
    monkeypatch.setenv("SEARCH_PROVIDER", "mock")
    monkeypatch.setenv("SUMMARY_PROVIDER", "mock")
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


def test_run_keyword_search_and_get_history(client: TestClient) -> None:
    keyword_response = client.post("/keywords", json={"text": "低空经济"})
    keyword = keyword_response.json()

    run_response = client.post(f"/keywords/{keyword['id']}/run")
    assert run_response.status_code == 201
    run = run_response.json()
    assert run["run_id"] == run["id"]
    assert run["keyword"] == "低空经济"
    assert run["keyword_text"] == "低空经济"
    assert len(run["results"]) == 8
    assert "【关键词】" in run["summary"]
    assert "七、来源链接" in run["summary"]
    assert run["results"][0]["source_url"].startswith("https://example.com/radar/")
    assert run["results"][0]["source_domain"] == "example.com"
    assert run["results"][0]["source_type"] == "unknown"
    assert run["results"][0]["credibility_score"] == 1
    assert run["provider_info"]["search_provider"] == "mock"
    assert run["provider_info"]["summary_provider"] == "mock"
    assert run["warnings"]

    history_response = client.get(f"/keywords/{keyword['id']}/runs")
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 1
    assert history[0]["id"] == run["id"]


def test_deduplicate_and_enrich_results() -> None:
    results = [
        SearchResult(
            title="OpenAI 发布新模型",
            snippet="A",
            source_url="https://openai.com/news/model?utm_source=test",
        ),
        SearchResult(
            title="OpenAI发布新模型!",
            snippet="Duplicate title",
            source_url="https://openai.com/news/model?utm_source=other",
        ),
        SearchResult(
            title="GitHub repository update",
            snippet="B",
            source_url="https://github.com/example/repo",
        ),
    ]

    cleaned, warnings = deduplicate_and_enrich_results(results, max_results=8)

    assert len(cleaned) == 2
    assert cleaned[0].source_domain == "openai.com"
    assert cleaned[0].source_type == "official"
    assert cleaned[0].credibility_score == 5
    assert cleaned[1].source_type == "technical"
    assert warnings


def test_missing_real_provider_key_returns_clear_error(client: TestClient, monkeypatch) -> None:
    monkeypatch.setenv("SEARCH_PROVIDER", "tavily")
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)
    keyword_response = client.post("/keywords", json={"text": "AI"})
    keyword = keyword_response.json()

    response = client.post(f"/keywords/{keyword['id']}/run")

    assert response.status_code == 400
    assert "TAVILY_API_KEY" in response.json()["detail"]
