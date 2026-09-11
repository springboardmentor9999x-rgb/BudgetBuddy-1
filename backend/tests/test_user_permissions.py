import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile


# Setup FastAPI TestClient
client = TestClient(app)


# Mock user fixture helper
def create_mock_user(user_id: int = 1, email: str = "user@example.com", role: str = "user") -> User:
    """Helper to create an in-memory mock User with profile."""
    user = User(
        id=user_id,
        email=email,
        hashed_password="fakehashedpassword",
        role=role,
        is_verified=True,
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    user.profile = Profile(
        id=user_id,
        user_id=user_id,
        full_name="Test User",
        monthly_income=50000.0,
        currency="INR"
    )
    return user


@pytest.fixture(autouse=True)
def clean_dependency_overrides():
    """Ensure dependency overrides are cleared before and after each test."""
    app.dependency_overrides.clear()
    # Mock database session to prevent any real DB operations during tests
    app.dependency_overrides[get_db] = lambda: MagicMock()
    yield
    app.dependency_overrides.clear()


# =====================================================================
# 10 Permission Test Cases for User Module
# =====================================================================

def test_01_unauthenticated_user_cannot_access_profile():
    """Test 1: Unauthenticated request to /users/me returns 401 Unauthorized."""
    # No user override or token provided
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]


def test_02_authenticated_regular_user_can_access_own_profile():
    """Test 2: Authenticated user with 'user' role can access their own profile."""
    regular_user = create_mock_user(user_id=1, email="alice@example.com", role="user")
    app.dependency_overrides[get_current_user] = lambda: regular_user

    response = client.get("/api/v1/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == "alice@example.com"
    assert response.json()["role"] == "user"


def test_03_regular_user_cannot_directly_upgrade_tier():
    """Test 3: Regular user is forbidden (403) from directly upgrading role tier."""
    regular_user = create_mock_user(user_id=1, email="alice@example.com", role="user")
    app.dependency_overrides[get_current_user] = lambda: regular_user

    payload = {"tier": "premium"}
    response = client.post("/api/v1/users/upgrade-tier", json=payload)
    assert response.status_code == 403
    assert "Direct tier upgrades are disabled" in response.json()["detail"]


def test_04_premium_user_cannot_directly_upgrade_tier():
    """Test 4: Premium user is forbidden (403) from directly switching role tier."""
    premium_user = create_mock_user(user_id=2, email="bob@example.com", role="premium")
    app.dependency_overrides[get_current_user] = lambda: premium_user

    payload = {"tier": "admin"}
    response = client.post("/api/v1/users/upgrade-tier", json=payload)
    assert response.status_code == 403
    assert "Direct tier upgrades are disabled" in response.json()["detail"]


def test_05_regular_user_cannot_list_users():
    """Test 5: Regular user without USER_MANAGEMENT permission cannot list users (403)."""
    regular_user = create_mock_user(user_id=1, email="alice@example.com", role="user")
    app.dependency_overrides[get_current_user] = lambda: regular_user

    response = client.get("/api/v1/admin/users")
    assert response.status_code == 403
    assert "Permission denied" in response.json()["detail"]


def test_06_premium_user_cannot_list_users():
    """Test 6: Premium user without USER_MANAGEMENT permission cannot list users (403)."""
    premium_user = create_mock_user(user_id=2, email="bob@example.com", role="premium")
    app.dependency_overrides[get_current_user] = lambda: premium_user

    response = client.get("/api/v1/admin/users")
    assert response.status_code == 403
    assert "Permission denied" in response.json()["detail"]


def test_07_regular_user_cannot_view_other_users_data():
    """Test 7: Regular user cannot inspect another user's financial overview (403)."""
    regular_user = create_mock_user(user_id=1, email="alice@example.com", role="user")
    app.dependency_overrides[get_current_user] = lambda: regular_user

    response = client.get("/api/v1/admin/users/99/data")
    assert response.status_code == 403
    assert "Permission denied" in response.json()["detail"]


def test_08_regular_user_cannot_access_system_analytics():
    """Test 8: Regular user cannot access system-wide analytics (403)."""
    regular_user = create_mock_user(user_id=1, email="alice@example.com", role="user")
    app.dependency_overrides[get_current_user] = lambda: regular_user

    response = client.get("/api/v1/admin/system/analytics")
    assert response.status_code == 403
    assert "Permission denied" in response.json()["detail"]


def test_09_regular_user_cannot_access_system_audit_logs():
    """Test 9: Regular user cannot access system audit logs (403)."""
    regular_user = create_mock_user(user_id=1, email="alice@example.com", role="user")
    app.dependency_overrides[get_current_user] = lambda: regular_user

    response = client.get("/api/v1/admin/system/logs")
    assert response.status_code == 403
    assert "Permission denied" in response.json()["detail"]


def test_10_regular_user_cannot_access_admin_subscription_requests():
    """Test 10: Regular user cannot access administrative subscription requests (403)."""
    regular_user = create_mock_user(user_id=1, email="alice@example.com", role="user")
    app.dependency_overrides[get_current_user] = lambda: regular_user

    response = client.get("/api/v1/subscriptions/admin/requests")
    assert response.status_code == 403
    assert "Access forbidden" in response.json()["detail"]
