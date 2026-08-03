from fastapi.testclient import TestClient
from uuid import uuid4

from app.main import app


def test_healthcheck() -> None:
    response = TestClient(app).get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_registration_and_agent_run() -> None:
    client = TestClient(app)
    email = f"test-owner-{uuid4().hex[:8]}@example.com"
    registration = client.post("/api/v1/auth/register", json={"full_name": "Test Owner", "email": email, "password": "correct-horse-battery", "organization_name": "Test MSME"})
    assert registration.status_code == 201
    token = registration.json()["access_token"]
    run = client.post("/api/v1/agent-runs", headers={"Authorization": f"Bearer {token}"}, json={"task": "Show inventory insights"})
    assert run.status_code == 201
    assert run.json()["status"] == "completed"
