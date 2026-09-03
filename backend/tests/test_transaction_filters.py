import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.user import User
from app.models.income import Income
from app.models.expense import Expense
from app.core.authorization import resolve_transaction_target_user
from app.crud.income import get_incomes_by_user
from app.crud.expense import get_expenses_by_user
from app.routers.incomes import parse_date_param


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Create test users
    u1 = User(id=1, email="user1@test.com", hashed_password="hash1", role="user")
    u2 = User(id=2, email="user2@test.com", hashed_password="hash2", role="user")
    session.add_all([u1, u2])
    session.commit()
    
    # Create test incomes
    now = datetime(2026, 3, 10, 10, 0, 0)
    incomes = [
        Income(id=1, user_id=1, source="Salary", amount=50000.0, date=now, account="HDFC Bank"),
        Income(id=2, user_id=1, source="Freelance", amount=15000.0, date=now - timedelta(days=5), account="Cash"),
        Income(id=3, user_id=1, source="Investment", amount=5000.0, date=now - timedelta(days=20), account="ICICI Bank"),
        Income(id=4, user_id=2, source="Salary", amount=60000.0, date=now, account="SBI Bank"),
    ]
    session.add_all(incomes)

    # Create test expenses
    expenses = [
        Expense(id=1, user_id=1, category="Food", amount=500.0, description="Groceries at Mart", date=now, account="Cash"),
        Expense(id=2, user_id=1, category="Transport", amount=1200.0, description="Fuel for car", date=now - timedelta(days=3), account="HDFC Bank"),
        Expense(id=3, user_id=1, category="Entertainment", amount=3000.0, description="Movie and dinner", date=now - timedelta(days=15), account="Cash"),
        Expense(id=4, user_id=2, category="Food", amount=800.0, description="Dinner with family", date=now, account="SBI Bank"),
    ]
    session.add_all(expenses)
    session.commit()

    yield session
    session.close()


def test_resolve_transaction_target_user_regular_user_enforced():
    """Regular users must always be confined to their own user ID."""
    regular_user = User(id=5, email="user@budgetbuddy.com", role="user")
    assert resolve_transaction_target_user(regular_user, None) == 5
    assert resolve_transaction_target_user(regular_user, "all") == 5
    assert resolve_transaction_target_user(regular_user, "99") == 5


def test_resolve_transaction_target_user_premium_user_enforced():
    """Premium users must also be confined to their own user ID."""
    premium_user = User(id=12, email="premium@budgetbuddy.com", role="premium")
    assert resolve_transaction_target_user(premium_user, None) == 12
    assert resolve_transaction_target_user(premium_user, "all") == 12
    assert resolve_transaction_target_user(premium_user, "42") == 12


def test_resolve_transaction_target_user_admin():
    """Admin users can scope to all users, specific user, or own data."""
    admin_user = User(id=1, email="admin@budgetbuddy.com", role="admin")
    assert resolve_transaction_target_user(admin_user, None) == 1
    assert resolve_transaction_target_user(admin_user, "me") == 1
    assert resolve_transaction_target_user(admin_user, "") == 1
    assert resolve_transaction_target_user(admin_user, "all") is None
    assert resolve_transaction_target_user(admin_user, "42") == 42
    assert resolve_transaction_target_user(admin_user, "invalid") == 1


def test_parse_date_param():
    """Test date string parsing helper."""
    assert parse_date_param(None) is None
    assert parse_date_param("") is None

    dt_start = parse_date_param("2026-03-15", is_end_of_day=False)
    assert dt_start == datetime(2026, 3, 15, 0, 0, 0)

    dt_end = parse_date_param("2026-03-15", is_end_of_day=True)
    assert dt_end == datetime(2026, 3, 15, 23, 59, 59, 999999)

    dt_iso = parse_date_param("2026-03-15T14:30:00Z")
    assert dt_iso == datetime(2026, 3, 15, 14, 30, 0)


def test_filter_incomes_by_source(db_session):
    """Test income filtering by source."""
    results = get_incomes_by_user(db_session, user_id=1, source="Salary")
    assert len(results) == 1
    assert results[0].source == "Salary"
    assert results[0].amount == 50000.0


def test_filter_incomes_by_account(db_session):
    """Test income filtering by account."""
    results = get_incomes_by_user(db_session, user_id=1, account="Cash")
    assert len(results) == 1
    assert results[0].source == "Freelance"


def test_filter_incomes_by_date_range(db_session):
    """Test income filtering by date range."""
    now = datetime(2026, 3, 10, 10, 0, 0)
    start = now - timedelta(days=10)
    results = get_incomes_by_user(db_session, user_id=1, start_date=start, end_date=now)
    assert len(results) == 2  # Salary and Freelance, not Investment (20 days ago)


def test_filter_incomes_by_amount_and_sorting(db_session):
    """Test income filtering by min/max amount and sorting."""
    # Min amount 10000
    results = get_incomes_by_user(db_session, user_id=1, min_amount=10000.0, sort_by="amount_asc")
    assert len(results) == 2
    assert results[0].amount == 15000.0
    assert results[1].amount == 50000.0

    # Max amount 20000
    results_max = get_incomes_by_user(db_session, user_id=1, max_amount=20000.0, sort_by="amount_desc")
    assert len(results_max) == 2
    assert results_max[0].amount == 15000.0
    assert results_max[1].amount == 5000.0


def test_filter_incomes_search(db_session):
    """Test income keyword search across source and account."""
    results = get_incomes_by_user(db_session, user_id=1, search="ICICI")
    assert len(results) == 1
    assert results[0].source == "Investment"


def test_filter_incomes_cross_user_admin(db_session):
    """Test cross-user income retrieval when user_id is None (admin mode)."""
    results = get_incomes_by_user(db_session, user_id=None, source="Salary")
    assert len(results) == 2
    user_ids = {r.user_id for r in results}
    assert user_ids == {1, 2}


def test_filter_expenses_by_category(db_session):
    """Test expense filtering by category."""
    results = get_expenses_by_user(db_session, user_id=1, category="Food")
    assert len(results) == 1
    assert results[0].category == "Food"
    assert results[0].amount == 500.0


def test_filter_expenses_by_account(db_session):
    """Test expense filtering by account."""
    results = get_expenses_by_user(db_session, user_id=1, account="Cash")
    assert len(results) == 2  # Food and Entertainment


def test_filter_expenses_by_amount_and_sorting(db_session):
    """Test expense filtering by amount range and sorting."""
    results = get_expenses_by_user(db_session, user_id=1, min_amount=1000.0, sort_by="amount_desc")
    assert len(results) == 2
    assert results[0].amount == 3000.0  # Entertainment
    assert results[1].amount == 1200.0  # Transport


def test_filter_expenses_search(db_session):
    """Test expense keyword search in description."""
    results = get_expenses_by_user(db_session, user_id=1, search="fuel")
    assert len(results) == 1
    assert results[0].category == "Transport"


def test_filter_expenses_cross_user_admin(db_session):
    """Test cross-user expense retrieval when user_id is None (admin mode)."""
    results = get_expenses_by_user(db_session, user_id=None, category="Food")
    assert len(results) == 2
    user_ids = {r.user_id for r in results}
    assert user_ids == {1, 2}
