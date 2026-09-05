import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.core.security import create_refresh_token


# Setup FastAPI TestClient
client = TestClient(app)


# Helper to build in-memory mock User objects
def create_mock_user(
    user_id: int = 1,
    email: str = "user@example.com",
    role: str = "user",
    is_verified: bool = True,
    is_active: bool = True,
    otp: str = "123456"
) -> User:
    """Helper to create an in-memory mock User with profile."""
    user = User(
        id=user_id,
        email=email,
        hashed_password="hashed_secret_password",
        role=role,
        is_verified=is_verified,
        is_active=is_active,
        otp=otp,
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
def clean_dependency_overrides(monkeypatch):
    """Ensure database is mocked and dependency overrides are cleared for every test."""
    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = lambda: MagicMock()

    # Prevent real audit logging during tests
    monkeypatch.setattr("app.routers.auth.log_activity", lambda *args, **kwargs: None)

    yield
    app.dependency_overrides.clear()


# =====================================================================
# 1. User Registration (Signup) Tests
# =====================================================================

def test_signup_success(monkeypatch):
    """Test successful user registration with valid details."""
    new_user = create_mock_user(user_id=10, email="newuser@example.com")

    # Mock DB lookups to simulate user not existing yet and successful creation
    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: None)
    monkeypatch.setattr("app.routers.auth.create_user", lambda *args, **kwargs: new_user)

    signup_data = {
        "email": "newuser@example.com",
        "password": "Password123!",
        "full_name": "New User",
        "monthly_income": 60000.0,
        "currency": "INR"
    }

    response = client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["id"] == 10
    assert data["role"] == "user"


def test_signup_duplicate_email(monkeypatch):
    """Test registration fails when email is already registered (400)."""
    existing_user = create_mock_user(email="existing@example.com")
    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: existing_user)

    signup_data = {
        "email": "existing@example.com",
        "password": "Password123!",
        "full_name": "Existing User",
        "monthly_income": 40000.0,
        "currency": "INR"
    }

    response = client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_signup_invalid_email():
    """Test registration fails validation when email format is invalid (422)."""
    signup_data = {
        "email": "not-a-valid-email",
        "password": "Password123!",
        "full_name": "Invalid Email User",
        "monthly_income": 40000.0,
        "currency": "INR"
    }

    response = client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 422


# =====================================================================
# 2. User Login Tests
# =====================================================================

def test_login_success(monkeypatch):
    """Test successful user login returning access token and setting cookies."""
    mock_user = create_mock_user(email="loginuser@example.com", is_verified=True, is_active=True)

    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: mock_user)
    monkeypatch.setattr("app.routers.auth.verify_password", lambda plain, hashed: True)

    login_data = {
        "username": "loginuser@example.com",
        "password": "CorrectPassword"
    }

    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "loginuser@example.com"
    # Ensure cookies are set
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies


def test_login_invalid_password(monkeypatch):
    """Test login fails when password is incorrect (401)."""
    mock_user = create_mock_user(email="loginuser@example.com")

    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: mock_user)
    monkeypatch.setattr("app.routers.auth.verify_password", lambda plain, hashed: False)

    login_data = {
        "username": "loginuser@example.com",
        "password": "WrongPassword"
    }

    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_login_nonexistent_user(monkeypatch):
    """Test login fails when user email is not found in the system (401)."""
    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: None)

    login_data = {
        "username": "unknown@example.com",
        "password": "AnyPassword"
    }

    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_login_unverified_email(monkeypatch):
    """Test login fails when user has not yet verified their email via OTP (401)."""
    mock_user = create_mock_user(email="unverified@example.com", is_verified=False)

    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: mock_user)
    monkeypatch.setattr("app.routers.auth.verify_password", lambda plain, hashed: True)

    login_data = {
        "username": "unverified@example.com",
        "password": "CorrectPassword"
    }

    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Email not verified" in response.json()["detail"]


def test_login_suspended_account(monkeypatch):
    """Test login fails when account is inactive or suspended by admin (403)."""
    mock_user = create_mock_user(email="suspended@example.com", is_verified=True, is_active=False)

    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: mock_user)
    monkeypatch.setattr("app.routers.auth.verify_password", lambda plain, hashed: True)

    login_data = {
        "username": "suspended@example.com",
        "password": "CorrectPassword"
    }

    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 403
    assert "account has been suspended" in response.json()["detail"]


# =====================================================================
# 3. OTP Verification Tests
# =====================================================================

def test_verify_otp_success(monkeypatch):
    """Test successful OTP verification marks the user as verified."""
    mock_user = create_mock_user(email="otp@example.com", is_verified=False, otp="654321")
    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: mock_user)

    payload = {
        "email": "otp@example.com",
        "otp": "654321"
    }

    response = client.post("/api/v1/auth/verify-otp", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "OTP verified successfully"
    assert mock_user.is_verified is True
    assert mock_user.otp is None


def test_verify_otp_invalid(monkeypatch):
    """Test OTP verification fails with incorrect OTP code (400)."""
    mock_user = create_mock_user(email="otp@example.com", is_verified=False, otp="654321")
    monkeypatch.setattr("app.routers.auth.get_user_by_email", lambda db, email: mock_user)

    payload = {
        "email": "otp@example.com",
        "otp": "999999"  # Wrong OTP
    }

    response = client.post("/api/v1/auth/verify-otp", json=payload)
    assert response.status_code == 400
    assert "Invalid OTP" in response.json()["detail"]


# =====================================================================
# 4. User Logout Tests
# =====================================================================

def test_logout_authenticated():
    """Test authenticated user logout succeeds and clears auth cookies."""
    mock_user = create_mock_user(email="activeuser@example.com")
    app.dependency_overrides[get_current_user] = lambda: mock_user

    response = client.get("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"


def test_logout_unauthenticated():
    """Test unauthenticated logout attempt returns 401 Unauthorized."""
    # No user override or token provided
    response = client.get("/api/v1/auth/logout")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]


# =====================================================================
# 5. Token Refresh Tests
# =====================================================================

def test_refresh_token_success():
    """Test refreshing access token using a valid refresh token cookie."""
    valid_refresh_token = create_refresh_token(data={"sub": "user@example.com", "role": "user"})

    # Send refresh_token as cookie
    client.cookies.set("refresh_token", valid_refresh_token)
    response = client.get("/api/v1/auth/refresh-token")
    client.cookies.clear()

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_refresh_token_missing():
    """Test refresh token endpoint returns 404 when refresh token cookie is absent."""
    client.cookies.clear()
    response = client.get("/api/v1/auth/refresh-token")
    assert response.status_code == 404
    assert "Refresh token missing" in response.json()["detail"]
