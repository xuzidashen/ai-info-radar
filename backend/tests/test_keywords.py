from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app


@pytest.fixture()
def client(tmp_path) -> Generator[TestClient, None, None]:
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


def test_health(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_list_and_delete_keyword(client: TestClient) -> None:
    create_response = client.post("/keywords", json={"text": " AI 搜索 "})
    assert create_response.status_code == 201
    keyword = create_response.json()
    assert keyword["text"] == "AI 搜索"

    list_response = client.get("/keywords")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    delete_response = client.delete(f"/keywords/{keyword['id']}")
    assert delete_response.status_code == 204

    empty_response = client.get("/keywords")
    assert empty_response.json() == []

