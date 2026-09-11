from datetime import datetime, timezone
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.income import Income


client = TestClient(app)


def create_mock_user(user_id: int = 1, email: str = "user@example.com", role: str = "user") -> User:
    """Helper to create an in-memory mock User."""
    user = User(
        id=user_id,
        email=email,
        hashed_password="hashed_password",
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


def create_mock_income(
    income_id: int = 1,
    user_id: int = 1,
    amount: float = 25000.0,
    source: str = "Salary",
    date: datetime = None,
    account: str = "HDFC Bank (1234567890)"
) -> Income:
    """Helper to create an in-memory mock Income."""
    return Income(
        id=income_id,
        user_id=user_id,
        amount=amount,
        source=source,
        date=date or datetime(2026, 1, 15, 10, 0, 0),
        account=account
    )


@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    """Reset dependency overrides and mock notifications for clean isolation."""
    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = lambda: MagicMock()

    # Prevent notification background errors
    async def mock_notification(*args, **kwargs):
        pass

    monkeypatch.setattr("app.routers.incomes.check_monthly_deficit_notifications", mock_notification)

    yield
    app.dependency_overrides.clear()


# =====================================================================
# 10 Income Test Cases
# =====================================================================

def test_01_add_income_success(monkeypatch):
    """Test 1: Authenticated user can log an income record successfully (201)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    mock_income = create_mock_income(income_id=1, user_id=1, amount=30000.0, source="Freelance")
    monkeypatch.setattr("app.routers.incomes.create_income", lambda db, user_id, **kwargs: mock_income)

    payload = {
        "amount": 30000.0,
        "source": "Freelance",
        "date": "2026-01-15T10:00:00",
        "account": "HDFC Bank (1234567890)"
    }
    response = client.post("/api/v1/incomes/add-income", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1
    assert data["amount"] == 30000.0
    assert data["source"] == "Freelance"


def test_02_add_income_unauthenticated():
    """Test 2: Unauthenticated user cannot log an income record (401)."""
    payload = {
        "amount": 10000.0,
        "source": "Salary",
        "date": "2026-01-15T10:00:00",
        "account": "Cash"
    }
    response = client.post("/api/v1/incomes/add-income", json=payload)
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]


def test_03_add_income_validation_error():
    """Test 3: Missing required field fails schema validation (422)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    # Missing required 'source' and 'amount'
    payload = {
        "account": "Cash"
    }
    response = client.post("/api/v1/incomes/add-income", json=payload)
    assert response.status_code == 422


def test_04_list_incomes_success(monkeypatch):
    """Test 4: Authenticated user can retrieve their income records (200)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    mock_list = [
        create_mock_income(income_id=1, user_id=1, amount=20000.0, source="Salary"),
        create_mock_income(income_id=2, user_id=1, amount=5000.0, source="Dividends")
    ]
    monkeypatch.setattr("app.routers.incomes.get_incomes_by_user", lambda db, **kwargs: mock_list)

    response = client.get("/api/v1/incomes/get-incomes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["source"] == "Salary"
    assert data[1]["source"] == "Dividends"


def test_05_list_incomes_unauthenticated():
    """Test 5: Unauthenticated user cannot retrieve income records (401)."""
    response = client.get("/api/v1/incomes/get-incomes")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]


def test_06_get_income_by_id_success(monkeypatch):
    """Test 6: Authenticated user can retrieve a specific income record by ID (200)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    mock_income = create_mock_income(income_id=1, user_id=1, amount=15000.0, source="Bonus")
    monkeypatch.setattr("app.routers.incomes.get_income", lambda db, income_id, user_id: mock_income)

    response = client.get("/api/v1/incomes/get-income/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["source"] == "Bonus"
    assert data["amount"] == 15000.0


def test_07_get_income_by_id_not_found(monkeypatch):
    """Test 7: Fetching non-existent income record returns 404 Not Found."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    monkeypatch.setattr("app.routers.incomes.get_income", lambda db, income_id, user_id: None)

    response = client.get("/api/v1/incomes/get-income/999")
    assert response.status_code == 404
    assert "Income not found" in response.json()["detail"]


def test_08_update_income_success(monkeypatch):
    """Test 8: Authenticated user can update an existing income record (200)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    existing_income = create_mock_income(income_id=1, user_id=1, amount=20000.0, source="Salary")
    updated_income = create_mock_income(income_id=1, user_id=1, amount=25000.0, source="Salary Raised")

    monkeypatch.setattr("app.routers.incomes.get_income", lambda db, income_id, user_id: existing_income)
    monkeypatch.setattr("app.routers.incomes.update_income", lambda db, user_id, income_id, **kwargs: updated_income)

    update_payload = {
        "amount": 25000.0,
        "source": "Salary Raised"
    }
    response = client.put("/api/v1/incomes/update-income/1", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 25000.0
    assert data["source"] == "Salary Raised"


def test_09_update_income_not_found(monkeypatch):
    """Test 9: Updating non-existent income record returns 404 Not Found."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    monkeypatch.setattr("app.routers.incomes.get_income", lambda db, income_id, user_id: None)

    update_payload = {"amount": 30000.0}
    response = client.put("/api/v1/incomes/update-income/999", json=update_payload)
    assert response.status_code == 404
    assert "Income not found" in response.json()["detail"]


def test_10_delete_income_success(monkeypatch):
    """Test 10: Authenticated user can delete an income record (200)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    existing_income = create_mock_income(income_id=1, user_id=1)
    monkeypatch.setattr("app.routers.incomes.get_income", lambda db, income_id, user_id: existing_income)
    monkeypatch.setattr("app.routers.incomes.delete_income", lambda db, user_id, income_id: {"message": f"Income with ID {income_id} has been deleted."})

    response = client.delete("/api/v1/incomes/delete-income/1")
    assert response.status_code == 200
    assert "deleted" in response.json()["message"]
