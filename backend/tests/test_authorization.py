import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException

from app.models.user import User
from app.core.authorization import (
    UserRole,
    Permission,
    ROLE_PERMISSIONS,
    normalize_role,
    has_permission,
    check_tier_limit,
    check_resource_ownership,
    require_permission,
    require_role,
)


def test_role_normalization():
    assert normalize_role("user") == "user"
    assert normalize_role("student") == "user"
    assert normalize_role("PREMIUM") == "premium"
    assert normalize_role("Premium User") == "premium"
    assert normalize_role("admin") == "admin"
    assert normalize_role("Administrator") == "admin"
    assert normalize_role(None) == "user"
    assert normalize_role("") == "user"


def test_permission_matrix_user():
    user = User(id=1, email="user@test.com", role="user")
    assert has_permission(user, Permission.EXPENSE_READ_OWN) is True
    assert has_permission(user, Permission.EXPENSE_WRITE_OWN) is True
    assert has_permission(user, Permission.BUDGET_BASIC) is True
    assert has_permission(user, Permission.SAVINGS_BASIC) is True
    assert has_permission(user, Permission.ANALYTICS_BASIC) is True
    assert has_permission(user, Permission.EXPORT_LIMITED) is True
    assert has_permission(user, Permission.NOTIFICATIONS_ACCESS) is True

    # User should NOT have premium / admin capabilities
    assert has_permission(user, Permission.BUDGET_ADVANCED) is False
    assert has_permission(user, Permission.SAVINGS_ADVANCED) is False
    assert has_permission(user, Permission.ANALYTICS_FULL) is False
    assert has_permission(user, Permission.EXPORT_FULL) is False
    assert has_permission(user, Permission.VIEW_OTHER_USERS_DATA) is False
    assert has_permission(user, Permission.USER_MANAGEMENT) is False
    assert has_permission(user, Permission.SYSTEM_WIDE_ANALYTICS) is False
    assert has_permission(user, Permission.SYSTEM_LOGS) is False


def test_permission_matrix_premium():
    premium_user = User(id=2, email="premium@test.com", role="premium")
    assert has_permission(premium_user, Permission.EXPENSE_READ_OWN) is True
    assert has_permission(premium_user, Permission.EXPENSE_WRITE_OWN) is True
    assert has_permission(premium_user, Permission.BUDGET_BASIC) is True
    assert has_permission(premium_user, Permission.BUDGET_ADVANCED) is True
    assert has_permission(premium_user, Permission.SAVINGS_BASIC) is True
    assert has_permission(premium_user, Permission.SAVINGS_ADVANCED) is True
    assert has_permission(premium_user, Permission.ANALYTICS_BASIC) is True
    assert has_permission(premium_user, Permission.ANALYTICS_FULL) is True
    assert has_permission(premium_user, Permission.EXPORT_LIMITED) is True
    assert has_permission(premium_user, Permission.EXPORT_FULL) is True
    assert has_permission(premium_user, Permission.NOTIFICATIONS_ACCESS) is True

    # Premium user should NOT have admin capabilities
    assert has_permission(premium_user, Permission.VIEW_OTHER_USERS_DATA) is False
    assert has_permission(premium_user, Permission.USER_MANAGEMENT) is False
    assert has_permission(premium_user, Permission.SYSTEM_WIDE_ANALYTICS) is False
    assert has_permission(premium_user, Permission.SYSTEM_LOGS) is False


def test_permission_matrix_admin():
    admin_user = User(id=3, email="admin@test.com", role="admin")
    # Admin has all permissions including cross-user and system management
    assert has_permission(admin_user, Permission.EXPENSE_READ_OWN) is True
    assert has_permission(admin_user, Permission.EXPENSE_WRITE_OWN) is True
    assert has_permission(admin_user, Permission.BUDGET_ADVANCED) is True
    assert has_permission(admin_user, Permission.SAVINGS_ADVANCED) is True
    assert has_permission(admin_user, Permission.ANALYTICS_FULL) is True
    assert has_permission(admin_user, Permission.EXPORT_FULL) is True
    assert has_permission(admin_user, Permission.VIEW_OTHER_USERS_DATA) is True
    assert has_permission(admin_user, Permission.USER_MANAGEMENT) is True
    assert has_permission(admin_user, Permission.SYSTEM_WIDE_ANALYTICS) is True
    assert has_permission(admin_user, Permission.SYSTEM_LOGS) is True


def test_check_tier_limit_basic_user():
    user = User(id=1, email="user@test.com", role="user")

    # Under budget limit (limit is 3)
    check_tier_limit(user, "budget", current_count=0)
    check_tier_limit(user, "budget", current_count=2)

    # At or above budget limit
    with pytest.raises(HTTPException) as exc:
        check_tier_limit(user, "budget", current_count=3)
    assert exc.value.status_code == 403
    assert "Basic tier limit reached (3 budgets)" in exc.value.detail

    # Under savings goal limit (limit is 2)
    check_tier_limit(user, "saving_goal", current_count=0)
    check_tier_limit(user, "saving_goal", current_count=1)

    # At or above savings goal limit
    with pytest.raises(HTTPException) as exc:
        check_tier_limit(user, "saving_goal", current_count=2)
    assert exc.value.status_code == 403
    assert "Basic tier limit reached (2 savings goals)" in exc.value.detail


def test_check_tier_limit_premium_and_admin_unlimited():
    premium = User(id=2, email="prem@test.com", role="premium")
    admin = User(id=3, email="admin@test.com", role="admin")

    # Premium can exceed basic limit without error
    check_tier_limit(premium, "budget", current_count=100)
    check_tier_limit(premium, "saving_goal", current_count=50)

    # Admin can exceed basic limit without error
    check_tier_limit(admin, "budget", current_count=100)
    check_tier_limit(admin, "saving_goal", current_count=50)


def test_resource_ownership():
    user_a = User(id=10, email="a@test.com", role="user")
    user_b = User(id=20, email="b@test.com", role="user")
    admin = User(id=99, email="admin@test.com", role="admin")

    # Owner accessing own resource -> Allowed
    check_resource_ownership(resource_user_id=10, current_user=user_a)

    # Non-owner accessing another user's resource -> 403 Forbidden
    with pytest.raises(HTTPException) as exc:
        check_resource_ownership(resource_user_id=20, current_user=user_a)
    assert exc.value.status_code == 403

    # Admin inspecting another user's resource with allow_admin_read_only=True -> Allowed
    check_resource_ownership(resource_user_id=20, current_user=admin, allow_admin_read_only=True, is_write_operation=False)

    # Admin attempting to mutate another user's resource -> 403 Forbidden
    with pytest.raises(HTTPException) as exc:
        check_resource_ownership(resource_user_id=20, current_user=admin, allow_admin_read_only=True, is_write_operation=True)
    assert exc.value.status_code == 403


def test_require_permission_dependency():
    user = User(id=1, email="user@test.com", role="user")
    admin = User(id=3, email="admin@test.com", role="admin")

    user_mgmt_checker = require_permission(Permission.USER_MANAGEMENT)

    # Basic user checking USER_MANAGEMENT permission -> 403 Forbidden
    with pytest.raises(HTTPException) as exc:
        user_mgmt_checker(current_user=user)
    assert exc.value.status_code == 403
    assert "Permission denied" in exc.value.detail
    assert "users:manage" in exc.value.detail

    # Admin checking USER_MANAGEMENT permission -> Returns user
    res = user_mgmt_checker(current_user=admin)
    assert res == admin


def test_require_role_dependency():
    user = User(id=1, email="user@test.com", role="user")
    admin = User(id=3, email="admin@test.com", role="admin")

    admin_checker = require_role([UserRole.ADMIN])

    # Basic user checking ADMIN role requirement -> 403 Forbidden
    with pytest.raises(HTTPException) as exc:
        admin_checker(current_user=user)
    assert exc.value.status_code == 403

    # Admin checking ADMIN role -> Success
    res = admin_checker(current_user=admin)
    assert res == admin
