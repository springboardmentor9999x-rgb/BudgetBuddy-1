import pytest
from unittest.mock import MagicMock
from app.models.user import User
from app.routers.reports import resolve_target_user_id


def test_resolve_target_user_id_admin_defaults_to_own_id():
    admin = User(id=1, email="admin@budgetbuddy.com", role="admin")
    target_id, is_admin = resolve_target_user_id(admin, None)
    assert is_admin is True
    assert target_id == 1


def test_resolve_target_user_id_admin_me_string():
    admin = User(id=1, email="admin@budgetbuddy.com", role="admin")
    target_id, is_admin = resolve_target_user_id(admin, "me")
    assert is_admin is True
    assert target_id == 1


def test_resolve_target_user_id_admin_empty_string():
    admin = User(id=1, email="admin@budgetbuddy.com", role="admin")
    target_id, is_admin = resolve_target_user_id(admin, "")
    assert is_admin is True
    assert target_id == 1


def test_resolve_target_user_id_admin_all_string():
    admin = User(id=1, email="admin@budgetbuddy.com", role="admin")
    target_id, is_admin = resolve_target_user_id(admin, "all")
    assert is_admin is True
    assert target_id is None


def test_resolve_target_user_id_admin_specific_user():
    admin = User(id=1, email="admin@budgetbuddy.com", role="admin")
    target_id, is_admin = resolve_target_user_id(admin, "42")
    assert is_admin is True
    assert target_id == 42


def test_resolve_target_user_id_admin_invalid_user_id():
    admin = User(id=1, email="admin@budgetbuddy.com", role="admin")
    target_id, is_admin = resolve_target_user_id(admin, "invalid-id")
    assert is_admin is True
    assert target_id == 1



def test_resolve_target_user_id_regular_user_cannot_view_others():
    user = User(id=10, email="user@budgetbuddy.com", role="user")
    # Even if regular user attempts to pass another user's ID
    target_id, is_admin = resolve_target_user_id(user, "42")
    assert is_admin is False
    assert target_id == 10


def test_resolve_target_user_id_premium_user_cannot_view_others():
    premium_user = User(id=20, email="prem@budgetbuddy.com", role="premium")
    target_id, is_admin = resolve_target_user_id(premium_user, "all")
    assert is_admin is False
    assert target_id == 20
