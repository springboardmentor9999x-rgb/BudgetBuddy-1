from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_, desc, extract
from fastapi import HTTPException, status

from app.models.user import User
from app.models.profile import Profile
from app.models.account import Account
from app.models.budget import Budget
from app.models.saving import SavingsGoal
from app.models.expense import Expense
from app.models.income import Income
from app.models.audit_log import AuditLog
from app.schemas.admin import AdminUserListItem, CrossUserDataResponse, SystemAnalyticsResponse
from app.core.authorization import normalize_role, UserRole


def log_activity(
    db: Session,
    action: str,
    details: Optional[str] = None,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    status_str: str = "SUCCESS"
) -> AuditLog:
    """Records an audit log entry for system and security tracking."""
    try:
        log_entry = AuditLog(
            user_id=user_id,
            user_email=user_email,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            details=details,
            ip_address=ip_address,
            status=status_str,
            created_at=datetime.now(timezone.utc),
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        db.rollback()
        print(f"Failed to record audit log: {e}")
        return None


def get_admin_users(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None
) -> Tuple[int, List[AdminUserListItem]]:
    """Retrieve paginated list of users with profile and activity metrics for admin review."""
    query = db.query(User).join(Profile, User.id == Profile.user_id, isouter=True)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(User.email).like(s),
                func.lower(Profile.full_name).like(s)
            )
        )

    if role:
        norm_r = normalize_role(role)
        query = query.filter(User.role == norm_r)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()
    offset = (page - 1) * page_size
    users = query.order_by(desc(User.created_at)).offset(offset).limit(page_size).all()

    results: List[AdminUserListItem] = []
    for u in users:
        acc_count = db.query(Account).filter(Account.user_id == u.id).count()
        bud_count = db.query(Budget).filter(Budget.user_id == u.id).count()
        goal_count = db.query(SavingsGoal).filter(SavingsGoal.user_id == u.id).count()
        inc_count = db.query(Income).filter(Income.user_id == u.id).count()
        exp_count = db.query(Expense).filter(Expense.user_id == u.id).count()

        prof = u.profile
        results.append(
            AdminUserListItem(
                id=u.id,
                email=u.email,
                role=normalize_role(u.role),
                is_verified=u.is_verified,
                is_active=u.is_active,
                created_at=u.created_at,
                full_name=prof.full_name if prof else None,
                monthly_income=float(prof.monthly_income) if prof and prof.monthly_income else 0.0,
                currency=prof.currency if prof and prof.currency else "INR",
                account_count=acc_count,
                budget_count=bud_count,
                goal_count=goal_count,
                transaction_count=inc_count + exp_count,
            )
        )

    return total, results


def get_cross_user_financial_data(db: Session, target_user_id: int) -> CrossUserDataResponse:
    """Aggregates a target user's financial overview for read-only admin inspection."""
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")

    prof = target_user.profile
    accounts = db.query(Account).filter(Account.user_id == target_user_id).all()
    budgets = db.query(Budget).filter(Budget.user_id == target_user_id).all()
    goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == target_user_id).all()
    recent_exp = db.query(Expense).filter(Expense.user_id == target_user_id).order_by(desc(Expense.date)).limit(20).all()
    recent_inc = db.query(Income).filter(Income.user_id == target_user_id).order_by(desc(Income.date)).limit(20).all()

    total_balance = sum([float(a.balance or 0.0) for a in accounts])
    total_income_logged = db.query(func.coalesce(func.sum(Income.amount), 0.0)).filter(Income.user_id == target_user_id).scalar()
    total_expense_logged = db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(Expense.user_id == target_user_id).scalar()

    return CrossUserDataResponse(
        user_id=target_user.id,
        email=target_user.email,
        role=normalize_role(target_user.role),
        is_active=target_user.is_active,
        is_verified=target_user.is_verified,
        full_name=prof.full_name if prof else None,
        monthly_income=float(prof.monthly_income) if prof and prof.monthly_income else 0.0,
        currency=prof.currency if prof and prof.currency else "INR",
        created_at=target_user.created_at,
        accounts=[
            {
                "id": a.id,
                "bank_name": a.bank_name,
                "account_number": a.account_number,
                "balance": float(a.balance),
            }
            for a in accounts
        ],
        budgets=[
            {
                "id": b.id,
                "category": b.category,
                "monthly_limit": float(b.monthly_limit),
                "created_at": b.created_at.isoformat() if b.created_at else None,
            }
            for b in budgets
        ],
        saving_goals=[
            {
                "id": g.id,
                "goal_name": g.goal_name,
                "target_amount": float(g.target_amount),
                "current_amount": float(g.current_amount),
                "target_date": g.target_date.isoformat() if g.target_date else None,
            }
            for g in goals
        ],
        recent_expenses=[
            {
                "id": e.id,
                "category": e.category,
                "amount": float(e.amount),
                "description": e.description,
                "date": e.date.isoformat() if e.date else None,
                "account": e.account,
            }
            for e in recent_exp
        ],
        recent_incomes=[
            {
                "id": i.id,
                "source": i.source,
                "amount": float(i.amount),
                "date": i.date.isoformat() if i.date else None,
                "account": i.account,
            }
            for i in recent_inc
        ],
        total_balance=total_balance,
        total_income_logged=float(total_income_logged),
        total_expense_logged=float(total_expense_logged),
    )


def update_user_role_admin(db: Session, user_id: int, new_role: str, admin_user: User) -> User:
    """Updates user role and logs the administrative intervention."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    norm_new = normalize_role(new_role)
    old_role = target_user.role
    target_user.role = norm_new
    db.commit()
    db.refresh(target_user)

    log_activity(
        db=db,
        action="USER_ROLE_UPDATED",
        details=f"Admin {admin_user.email} changed role of user {target_user.email} from '{old_role}' to '{norm_new}'.",
        user_id=admin_user.id,
        user_email=admin_user.email,
        resource_type="user",
        resource_id=str(user_id),
        status_str="SUCCESS"
    )

    return target_user


def update_user_status_admin(db: Session, user_id: int, is_active: bool, admin_user: User) -> User:
    """Toggles user activation status."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    target_user.is_active = is_active
    db.commit()
    db.refresh(target_user)

    status_word = "Activated" if is_active else "Suspended"
    log_activity(
        db=db,
        action="USER_STATUS_UPDATED",
        details=f"Admin {admin_user.email} {status_word.lower()} account for {target_user.email}.",
        user_id=admin_user.id,
        user_email=admin_user.email,
        resource_type="user",
        resource_id=str(user_id),
        status_str="SUCCESS"
    )

    return target_user


def delete_user_admin(db: Session, user_id: int, admin_user: User) -> bool:
    """Admin-level user deletion with audit recording."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        return False

    target_email = target_user.email
    db.delete(target_user)
    db.commit()

    log_activity(
        db=db,
        action="USER_DELETED_BY_ADMIN",
        details=f"Admin {admin_user.email} permanently deleted user {target_email} (ID: {user_id}).",
        user_id=admin_user.id,
        user_email=admin_user.email,
        resource_type="user",
        resource_id=str(user_id),
        status_str="SUCCESS"
    )

    return True


def get_system_wide_analytics(db: Session) -> SystemAnalyticsResponse:
    """Aggregates platform-wide metrics and growth distribution."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    inactive_users = total_users - active_users
    verified_users = db.query(User).filter(User.is_verified == True).count()

    # User role distribution
    all_users = db.query(User.role).all()
    role_counts: Dict[str, int] = {
        UserRole.USER.value: 0,
        UserRole.PREMIUM.value: 0,
        UserRole.ADMIN.value: 0,
    }
    for (r,) in all_users:
        norm_r = normalize_role(r)
        role_counts[norm_r] = role_counts.get(norm_r, 0) + 1

    total_platform_income = float(db.query(func.coalesce(func.sum(Income.amount), 0.0)).scalar() or 0.0)
    total_platform_expenses = float(db.query(func.coalesce(func.sum(Expense.amount), 0.0)).scalar() or 0.0)
    total_platform_liquidity = float(db.query(func.coalesce(func.sum(Account.balance), 0.0)).scalar() or 0.0)

    total_budgets = db.query(Budget).count()
    total_goals = db.query(SavingsGoal).count()
    total_txns = db.query(Income).count() + db.query(Expense).count()

    # Monthly signups over current year
    current_year = datetime.now().year
    signup_records = (
        db.query(
            extract('month', User.created_at).label('month_num'),
            func.count(User.id).label('count')
        )
        .filter(extract('year', User.created_at) == current_year)
        .group_by('month_num')
        .order_by('month_num')
        .all()
    )

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    signup_map = {int(m): c for m, c in signup_records if m is not None}
    monthly_signups = [
        {"month": month_names[i], "signups": signup_map.get(i + 1, 0)}
        for i in range(12)
    ]

    return SystemAnalyticsResponse(
        total_users=total_users,
        active_users=active_users,
        inactive_users=inactive_users,
        verified_users=verified_users,
        users_by_role=role_counts,
        total_platform_income=round(total_platform_income, 2),
        total_platform_expenses=round(total_platform_expenses, 2),
        total_platform_liquidity=round(total_platform_liquidity, 2),
        total_budgets_created=total_budgets,
        total_goals_created=total_goals,
        total_transactions_count=total_txns,
        monthly_signups=monthly_signups,
    )


def get_system_audit_logs(
    db: Session,
    page: int = 1,
    page_size: int = 50,
    action: Optional[str] = None,
    user_email: Optional[str] = None,
    status_filter: Optional[str] = None
) -> Tuple[int, List[AuditLog]]:
    """Queries audit logs with pagination and filters."""
    query = db.query(AuditLog)

    if action:
        query = query.filter(AuditLog.action == action)
    if user_email:
        query = query.filter(func.lower(AuditLog.user_email).like(f"%{user_email.strip().lower()}%"))
    if status_filter:
        query = query.filter(AuditLog.status == status_filter)

    total = query.count()
    offset = (page - 1) * page_size
    logs = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(page_size).all()
    return total, logs
