import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.supabase_service import supabase_service

client = TestClient(app)

def test_unauthenticated_corporation_access_forbidden():
    """
    Test that anonymous/unauthenticated users cannot access corporation endpoints.
    """
    response = client.get("/api/corporation/dashboard")
    assert response.status_code in [401, 403]

def test_citizen_cannot_access_corporation_dashboard():
    """
    Test that users with role 'citizen' are rejected with 403 Forbidden on corporation endpoints.
    """
    headers = {
        "x-user-id": "cit_test_12345",
        "x-user-role": "citizen"
    }
    response = client.get("/api/corporation/dashboard", headers=headers)
    assert response.status_code == 403
    assert "Access denied" in response.json().get("detail", "")

def test_worker_cannot_access_corporation_dashboard():
    """
    Test that users with role 'worker' cannot access corporation-only endpoints.
    """
    headers = {
        "x-user-id": "w1000000-0000-0000-0000-000000000001",
        "x-user-role": "worker"
    }
    response = client.get("/api/corporation/dashboard", headers=headers)
    assert response.status_code == 403

def test_corporation_officer_can_access_dashboard():
    """
    Test that users with role 'corporation' can access the corporation dashboard.
    """
    headers = {
        "x-user-id": "c9000000-0000-0000-0000-000000000001",
        "x-user-role": "corporation"
    }
    response = client.get("/api/corporation/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_active_issues" in data
    assert "critical_issues" in data

def test_citizen_cannot_access_worker_dashboard():
    """
    Test that citizen cannot access field worker tasks/dashboard.
    """
    headers = {
        "x-user-id": "cit_test_12345",
        "x-user-role": "citizen"
    }
    response = client.get("/api/worker/dashboard?worker_id=cit_test_12345", headers=headers)
    assert response.status_code == 403

def test_worker_can_access_worker_dashboard():
    """
    Test that field worker can access their worker dashboard.
    """
    worker_id = "w1000000-0000-0000-0000-000000000001"
    headers = {
        "x-user-id": worker_id,
        "x-user-role": "worker"
    }
    response = client.get(f"/api/worker/dashboard?worker_id={worker_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "worker_name" in data
    assert "assigned_count" in data

def test_citizen_support_toggle_and_deduplication():
    """
    Test that citizen can support an issue, and toggling it correctly tracks support state.
    """
    # 1. Get an existing issue ID
    issues_res = client.get("/api/issues?limit=1")
    assert issues_res.status_code == 200
    issues = issues_res.json()
    assert len(issues) > 0
    issue_id = issues[0]["id"]
    initial_support = issues[0]["support_count"]

    citizen_headers = {
        "x-user-id": "test_citizen_unique_99",
        "x-user-role": "citizen"
    }

    # 2. Add support
    res1 = client.post(f"/api/issues/{issue_id}/support", json={"citizen_id": "test_citizen_unique_99"}, headers=citizen_headers)
    assert res1.status_code == 200
    res1_data = res1.json()
    assert res1_data["is_supported"] is True
    assert res1_data["support_count"] >= initial_support

    # 3. Toggle support again (removes support)
    res2 = client.post(f"/api/issues/{issue_id}/support", json={"citizen_id": "test_citizen_unique_99"}, headers=citizen_headers)
    assert res2.status_code == 200
    res2_data = res2.json()
    assert res2_data["is_supported"] is False
