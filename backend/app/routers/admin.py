from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.authorization import (
    Permission,
    require_permission,
    UserRole,
)
from app.schemas.admin import (
    AdminUserListResponse,
    AdminUserListItem,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
    CrossUserDataResponse,
    SystemAnalyticsResponse,
    AuditLogListResponse,
    AuditLogItem,
)
from app.crud.admin import (
    get_admin_users,
    get_cross_user_financial_data,
    update_user_role_admin,
    update_user_status_admin,
    delete_user_admin,
    get_system_wide_analytics,
    get_system_audit_logs,
    log_activity,
)

router = APIRouter()


@router.get("/users", response_model=AdminUserListResponse, status_code=200)
def list_users_for_admin(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_permission(Permission.USER_MANAGEMENT))
):
    """
    Administrator endpoint to retrieve paginated list of registered users with search and filter controls.
    """
    total, users = get_admin_users(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        role=role,
        is_active=is_active
    )
    return AdminUserListResponse(
        total=total,
        page=page,
        page_size=page_size,
        users=users
    )


@router.get("/users/{user_id}/data", response_model=CrossUserDataResponse, status_code=200)
def view_cross_user_data(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_permission(Permission.VIEW_OTHER_USERS_DATA))
):
    """
    Read-only administrative inspection of another user's financial overview, budgets, expenses, and accounts.
    """
    cross_data = get_cross_user_financial_data(db=db, target_user_id=user_id)
    log_activity(
        db=db,
        action="CROSS_USER_DATA_VIEWED",
        details=f"Admin {current_admin.email} viewed read-only financial data of user {cross_data.email} (ID: {user_id}).",
        user_id=current_admin.id,
        user_email=current_admin.email,
        resource_type="user_data",
        resource_id=str(user_id),
        status_str="SUCCESS"
    )
    return cross_data


@router.put("/users/{user_id}/role", response_model=AdminUserListItem, status_code=200)
def change_user_role(
    user_id: int,
    payload: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_permission(Permission.USER_MANAGEMENT))
):
    """
    Administrator endpoint to change a user's role tier ('user', 'premium', 'admin').
    """
    if payload.role not in [UserRole.USER.value, UserRole.PREMIUM.value, UserRole.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'. Must be one of: {', '.join([r.value for r in UserRole])}"
        )
    
    updated_user = update_user_role_admin(
        db=db,
        user_id=user_id,
        new_role=payload.role,
        admin_user=current_admin
    )

    prof = updated_user.profile
    return AdminUserListItem(
        id=updated_user.id,
        email=updated_user.email,
        role=updated_user.role,
        is_verified=updated_user.is_verified,
        is_active=updated_user.is_active,
        created_at=updated_user.created_at,
        full_name=prof.full_name if prof else None,
        monthly_income=float(prof.monthly_income) if prof and prof.monthly_income else 0.0,
        currency=prof.currency if prof and prof.currency else "INR",
        account_count=len(updated_user.accounts or []),
        budget_count=len(updated_user.budgets or []),
        goal_count=len(updated_user.savings_goals or []),
        transaction_count=len(updated_user.expenses or []) + len(updated_user.incomes or []),
    )


@router.put("/users/{user_id}/status", response_model=AdminUserListItem, status_code=200)
def change_user_status(
    user_id: int,
    payload: UpdateUserStatusRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_permission(Permission.USER_MANAGEMENT))
):
    """
    Administrator endpoint to activate or suspend a user account.
    """
    updated_user = update_user_status_admin(
        db=db,
        user_id=user_id,
        is_active=payload.is_active,
        admin_user=current_admin
    )

    prof = updated_user.profile
    return AdminUserListItem(
        id=updated_user.id,
        email=updated_user.email,
        role=updated_user.role,
        is_verified=updated_user.is_verified,
        is_active=updated_user.is_active,
        created_at=updated_user.created_at,
        full_name=prof.full_name if prof else None,
        monthly_income=float(prof.monthly_income) if prof and prof.monthly_income else 0.0,
        currency=prof.currency if prof and prof.currency else "INR",
        account_count=len(updated_user.accounts or []),
        budget_count=len(updated_user.budgets or []),
        goal_count=len(updated_user.savings_goals or []),
        transaction_count=len(updated_user.expenses or []) + len(updated_user.incomes or []),
    )


@router.delete("/users/{user_id}", status_code=200)
def delete_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_permission(Permission.USER_MANAGEMENT))
):
    """
    Administrator endpoint to permanently remove a user account.
    """
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own administrator account via admin portal."
        )

    deleted = delete_user_admin(db=db, user_id=user_id, admin_user=current_admin)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {"message": f"User ID {user_id} successfully deleted by admin."}


@router.get("/system/analytics", response_model=SystemAnalyticsResponse, status_code=200)
def get_platform_analytics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_permission(Permission.SYSTEM_WIDE_ANALYTICS))
):
    """
    Administrator endpoint retrieving platform-level volume, user growth metrics, and active financial liquidity.
    """
    return get_system_wide_analytics(db=db)


@router.get("/system/logs", response_model=AuditLogListResponse, status_code=200)
def list_system_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    action: Optional[str] = Query(None),
    user_email: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_permission(Permission.SYSTEM_LOGS))
):
    """
    Administrator endpoint retrieving filterable system audit logs.
    """
    total, logs = get_system_audit_logs(
        db=db,
        page=page,
        page_size=page_size,
        action=action,
        user_email=user_email,
        status_filter=status_filter
    )
    return AuditLogListResponse(total=total, logs=logs)
