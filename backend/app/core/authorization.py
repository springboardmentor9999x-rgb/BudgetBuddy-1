from enum import Enum
from typing import Callable, List, Optional
from fastapi import Depends, HTTPException, status
# from sqlalchemy.orm import Session

# from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_user


class UserRole(str, Enum):
    USER = "user"
    PREMIUM = "premium"
    ADMIN = "admin"


class Permission(str, Enum):
    # Expense Permissions
    EXPENSE_READ_OWN = "expense:read_own"
    EXPENSE_WRITE_OWN = "expense:write_own"

    # Income Permissions
    INCOME_READ_OWN = "income:read_own"
    INCOME_WRITE_OWN = "income:write_own"

    # Account Permissions
    ACCOUNT_READ_OWN = "account:read_own"
    ACCOUNT_WRITE_OWN = "account:write_own"

    # Budget Tier Permissions
    BUDGET_BASIC = "budget:basic"
    BUDGET_ADVANCED = "budget:advanced"

    # Savings Goals Tier Permissions
    SAVINGS_BASIC = "savings:basic"
    SAVINGS_ADVANCED = "savings:advanced"

    # Analytics Dashboard Tier Permissions
    ANALYTICS_BASIC = "analytics:basic"
    ANALYTICS_FULL = "analytics:full"

    # Report Export Tier Permissions
    EXPORT_LIMITED = "export:limited"
    EXPORT_FULL = "export:full"

    # Notifications Permissions
    NOTIFICATIONS_ACCESS = "notifications:access"

    # Cross-User & Admin Capabilities
    VIEW_OTHER_USERS_DATA = "users:view_cross_data"  # Read-only inspection
    USER_MANAGEMENT = "users:manage"
    SYSTEM_WIDE_ANALYTICS = "system:analytics"
    SYSTEM_LOGS = "system:logs"


# Permission Matrix configuration
ROLE_PERMISSIONS: dict[str, set[Permission]] = {
    UserRole.USER.value: {
        Permission.EXPENSE_READ_OWN,
        Permission.EXPENSE_WRITE_OWN,
        Permission.INCOME_READ_OWN,
        Permission.INCOME_WRITE_OWN,
        Permission.ACCOUNT_READ_OWN,
        Permission.ACCOUNT_WRITE_OWN,
        Permission.BUDGET_BASIC,
        Permission.SAVINGS_BASIC,
        Permission.ANALYTICS_BASIC,
        Permission.EXPORT_LIMITED,
        Permission.NOTIFICATIONS_ACCESS,
    },
    UserRole.PREMIUM.value: {
        Permission.EXPENSE_READ_OWN,
        Permission.EXPENSE_WRITE_OWN,
        Permission.INCOME_READ_OWN,
        Permission.INCOME_WRITE_OWN,
        Permission.ACCOUNT_READ_OWN,
        Permission.ACCOUNT_WRITE_OWN,
        Permission.BUDGET_BASIC,
        Permission.BUDGET_ADVANCED,
        Permission.SAVINGS_BASIC,
        Permission.SAVINGS_ADVANCED,
        Permission.ANALYTICS_BASIC,
        Permission.ANALYTICS_FULL,
        Permission.EXPORT_LIMITED,
        Permission.EXPORT_FULL,
        Permission.NOTIFICATIONS_ACCESS,
    },
    UserRole.ADMIN.value: {
        # Admin has full own data capabilities
        Permission.EXPENSE_READ_OWN,
        Permission.EXPENSE_WRITE_OWN,
        Permission.INCOME_READ_OWN,
        Permission.INCOME_WRITE_OWN,
        Permission.ACCOUNT_READ_OWN,
        Permission.ACCOUNT_WRITE_OWN,
        Permission.BUDGET_BASIC,
        Permission.BUDGET_ADVANCED,
        Permission.SAVINGS_BASIC,
        Permission.SAVINGS_ADVANCED,
        Permission.ANALYTICS_BASIC,
        Permission.ANALYTICS_FULL,
        Permission.EXPORT_LIMITED,
        Permission.EXPORT_FULL,
        Permission.NOTIFICATIONS_ACCESS,
        # Admin exclusive capabilities
        Permission.VIEW_OTHER_USERS_DATA,
        Permission.USER_MANAGEMENT,
        Permission.SYSTEM_WIDE_ANALYTICS,
        Permission.SYSTEM_LOGS,
    },
}

# Normalize legacy or custom role names (e.g., student -> user)
def normalize_role(role: Optional[str]) -> str:
    if not role:
        return UserRole.USER.value
    r = role.lower().strip()
    if r in (UserRole.USER.value, "student"):
        return UserRole.USER.value
    if r in (UserRole.PREMIUM.value, "premium user"):
        return UserRole.PREMIUM.value
    if r in (UserRole.ADMIN.value, "administrator"):
        return UserRole.ADMIN.value
    return UserRole.USER.value


def get_user_permissions(user: User) -> set[Permission]:
    role = normalize_role(user.role)
    return ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS[UserRole.USER.value])


def has_permission(user: User, permission: Permission) -> bool:
    perms = get_user_permissions(user)
    return permission in perms


def require_permission(permission: Permission) -> Callable:
    """
    FastAPI dependency that enforces a specific permission on the authenticated user.
    """
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if not has_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: Required capability '{permission.value}' not granted for role '{current_user.role}'."
            )
        return current_user
    return permission_checker


def require_role(allowed_roles: List[UserRole]) -> Callable:
    """
    FastAPI dependency that restricts endpoint access to specific roles.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = normalize_role(current_user.role)
        allowed_values = [r.value for r in allowed_roles]
        if user_role not in allowed_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Role '{current_user.role}' is not authorized. Required: {', '.join(allowed_values)}."
            )
        return current_user
    return role_checker


def check_resource_ownership(
    resource_user_id: int,
    current_user: User,
    allow_admin_read_only: bool = False,
    is_write_operation: bool = False
) -> None:
    """
    Validates resource ownership.
    - Owners can read and write their own data.
    - Admins can read other users' data if allow_admin_read_only is True and is_write_operation is False.
    - Non-owners (or write operations on another user's data) raise 403 Forbidden.
    """
    if resource_user_id == current_user.id:
        return

    # Check if admin is performing a read-only cross-user inspection
    if allow_admin_read_only and not is_write_operation:
        if has_permission(current_user, Permission.VIEW_OTHER_USERS_DATA):
            return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: You do not have permission to access or modify this user's resource."
    )


# Tier limits for Basic users
BASIC_TIER_LIMITS = {
    "budget": 5,       # Max 5 active budgets for Basic User
    "saving_goal": 2,  # Max 2 active savings goals for Basic User
    "export_txns": 10, # Max 10 transactions in basic preview export
}


def check_tier_limit(user: User, feature: str, current_count: int) -> None:
    """
    Enforces feature limits for basic users. Premium and Admin users have unlimited access.
    """
    user_role = normalize_role(user.role)
    if user_role in (UserRole.PREMIUM.value, UserRole.ADMIN.value):
        return  # Unlimited for Premium & Admin

    limit = BASIC_TIER_LIMITS.get(feature)
    if limit is not None and current_count >= limit:
        feature_label = "budgets" if feature == "budget" else "savings goals" if feature == "saving_goal" else feature
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Basic tier limit reached ({limit} {feature_label}). Upgrade to Premium for unlimited {feature_label} and advanced features."
        )


def resolve_transaction_target_user(current_user: User, user_id_param: Optional[str]) -> Optional[int]:
    """
    Resolves the target user ID for queries (incomes, expenses, dashboard).
    - Non-admin callers are strictly confined to their own user ID.
    - Admin callers:
      - None, '', 'me', or invalid non-numeric strings return current_user.id (defaults to own data).
      - 'all' returns None (system-wide across all users).
      - numeric string returns the parsed integer user ID.
    """
    is_admin = (
        has_permission(current_user, Permission.VIEW_OTHER_USERS_DATA)
        or normalize_role(current_user.role) == UserRole.ADMIN.value
    )
    if not is_admin:
        return current_user.id

    if not user_id_param or user_id_param.strip().lower() in ("", "me"):
        return current_user.id
    if user_id_param.strip().lower() == "all":
        return None
    try:
        return int(user_id_param.strip())
    except ValueError:
        return current_user.id

