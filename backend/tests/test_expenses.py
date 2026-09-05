from datetime import datetime, timezone
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.expense import Expense


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


def create_mock_expense(
    expense_id: int = 1,
    user_id: int = 1,
    category: str = "Groceries",
    amount: float = 1200.0,
    description: str = "Supermarket shopping",
    date: datetime = None,
    account: str = "HDFC Bank (1234567890)"
) -> Expense:
    """Helper to create an in-memory mock Expense."""
    return Expense(
        id=expense_id,
        user_id=user_id,
        category=category,
        amount=amount,
        description=description,
        date=date or datetime(2026, 1, 15, 12, 0, 0),
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

    monkeypatch.setattr("app.routers.expenses.check_budget_notifications", mock_notification)
    monkeypatch.setattr("app.routers.expenses.check_monthly_deficit_notifications", mock_notification)
    monkeypatch.setattr("app.routers.expenses.check_account_overdraft_notifications", mock_notification)

    yield
    app.dependency_overrides.clear()


# =====================================================================
# 10 Expense Test Cases
# =====================================================================

def test_01_add_expense_success(monkeypatch):
    """Test 1: Authenticated user can log an expense record successfully (201)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    mock_expense = create_mock_expense(expense_id=1, user_id=1, category="Food", amount=450.0)
    monkeypatch.setattr("app.routers.expenses.create_expense", lambda db, user_id, **kwargs: mock_expense)

    payload = {
        "category": "Food",
        "amount": 450.0,
        "description": "Lunch at cafe",
        "date": "2026-01-15T12:30:00",
        "account": "HDFC Bank (1234567890)"
    }
    response = client.post("/api/v1/expenses/add-expense", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1
    assert data["category"] == "Food"
    assert data["amount"] == 450.0


def test_02_add_expense_unauthenticated():
    """Test 2: Unauthenticated user cannot log an expense record (401)."""
    payload = {
        "category": "Utilities",
        "amount": 1500.0,
        "date": "2026-01-15T10:00:00",
        "account": "Cash"
    }
    response = client.post("/api/v1/expenses/add-expense", json=payload)
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]


def test_03_add_expense_invalid_amount():
    """Test 3: Expense amount must be greater than 0 (422)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    payload = {
        "category": "Shopping",
        "amount": -50.0,
        "date": "2026-01-15T10:00:00",
        "account": "Cash"
    }
    response = client.post("/api/v1/expenses/add-expense", json=payload)
    assert response.status_code == 422


def test_04_list_expenses_success(monkeypatch):
    """Test 4: Authenticated user can retrieve their expense records (200)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    mock_list = [
        create_mock_expense(expense_id=1, user_id=1, category="Groceries", amount=1200.0),
        create_mock_expense(expense_id=2, user_id=1, category="Transit", amount=150.0)
    ]
    monkeypatch.setattr("app.routers.expenses.get_expenses_by_user", lambda db, **kwargs: mock_list)

    response = client.get("/api/v1/expenses/get-expenses")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["category"] == "Groceries"
    assert data[1]["category"] == "Transit"


def test_05_list_expenses_unauthenticated():
    """Test 5: Unauthenticated user cannot retrieve expense records (401)."""
    response = client.get("/api/v1/expenses/get-expenses")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]


def test_06_get_expense_by_id_success(monkeypatch):
    """Test 6: Authenticated user can retrieve a specific expense record by ID (200)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    mock_expense = create_mock_expense(expense_id=1, user_id=1, category="Entertainment", amount=500.0)
    monkeypatch.setattr("app.routers.expenses.get_expense", lambda db, expense_id, user_id: mock_expense)

    response = client.get("/api/v1/expenses/get-expense/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["category"] == "Entertainment"
    assert data["amount"] == 500.0


def test_07_get_expense_by_id_not_found(monkeypatch):
    """Test 7: Fetching non-existent expense record returns 404 Not Found."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    monkeypatch.setattr("app.routers.expenses.get_expense", lambda db, expense_id, user_id: None)

    response = client.get("/api/v1/expenses/get-expense/999")
    assert response.status_code == 404
    assert "Expense not found" in response.json()["detail"]


def test_08_update_expense_success(monkeypatch):
    """Test 8: Authenticated user can update an existing expense record (200)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    existing_expense = create_mock_expense(expense_id=1, user_id=1, category="Food", amount=450.0)
    updated_expense = create_mock_expense(expense_id=1, user_id=1, category="Dining Out", amount=650.0)

    monkeypatch.setattr("app.routers.expenses.get_expense", lambda db, expense_id, user_id: existing_expense)
    monkeypatch.setattr("app.routers.expenses.update_expense", lambda db, expense_id, user_id, expense_in: updated_expense)

    update_payload = {
        "category": "Dining Out",
        "amount": 650.0,
        "description": "Dinner with colleagues",
        "date": "2026-01-15T20:00:00",
        "account": "HDFC Bank (1234567890)"
    }
    response = client.put("/api/v1/expenses/update-expense/1", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Dining Out"
    assert data["amount"] == 650.0


def test_09_update_expense_not_found(monkeypatch):
    """Test 9: Updating non-existent expense record returns 404 Not Found."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    monkeypatch.setattr("app.routers.expenses.get_expense", lambda db, expense_id, user_id: None)

    payload = {
        "category": "Food",
        "amount": 100.0,
        "date": "2026-01-15T10:00:00",
        "account": "Cash"
    }
    response = client.put("/api/v1/expenses/update-expense/999", json=payload)
    assert response.status_code == 404
    assert "Expense not found" in response.json()["detail"]


def test_10_delete_expense_success(monkeypatch):
    """Test 10: Authenticated user can delete an expense record (200)."""
    user = create_mock_user(user_id=1)
    app.dependency_overrides[get_current_user] = lambda: user

    existing_expense = create_mock_expense(expense_id=1, user_id=1)
    monkeypatch.setattr("app.routers.expenses.get_expense", lambda db, expense_id, user_id: existing_expense)
    monkeypatch.setattr("app.routers.expenses.delete_expense", lambda db, expense_id, user_id: {"success": True, "message": "Expense with id 1 deleted successfully"})

    response = client.delete("/api/v1/expenses/delete-expense/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "deleted successfully" in data["message"]
