from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.deps import get_db
from app.core.roles import require_admin, VALID_ROLES
from app.models.user import User
from app.models.expense import Expense
from app.models.income import Income
from app.models.budget import Budget
from app.models.savings_goal import SavingsGoal
from app.crud.admin_report_pdf import generate_report_pdf
from app.crud.admin_report_excel import generate_admin_report_excel


router = APIRouter()


# ==========================================
# ADMIN - LIST USERS
# ==========================================

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    users = db.query(User).order_by(User.id).all()

    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at,
        }
        for user in users
    ]


# ==========================================
# ADMIN - VIEW USER
# ==========================================

@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.date.desc())
        .all()
    )

    incomes = (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .order_by(Income.date.desc())
        .all()
    )

    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .all()
    )

    savings_goals = (
        db.query(SavingsGoal)
        .filter(SavingsGoal.user_id == user_id)
        .all()
    )

    total_expenses = sum(float(item.amount or 0) for item in expenses)
    total_income = sum(float(item.amount or 0) for item in incomes)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at,
        },
        "summary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "expense_count": len(expenses),
            "income_count": len(incomes),
            "budget_count": len(budgets),
            "savings_goal_count": len(savings_goals),
        },
        "expenses": [
            {
                "id": item.id,
                "category": item.category,
                "amount": float(item.amount or 0),
                "payment_method": item.payment_method,
                "description": item.description,
                "date": item.date,
                "account_id": item.account_id,
            }
            for item in expenses
        ],
        "income": [
            {
                "id": item.id,
                "category": item.category,
                "amount": float(item.amount or 0),
                "description": item.description,
                "date": item.date,
                "account_id": item.account_id,
            }
            for item in incomes
        ],
        "budgets": [
            {
                "id": item.id,
                "category": item.category,
                "amount": float(item.limit or 0),
            }
            for item in budgets
        ],
        "savings_goals": [
            {
                "id": item.id,
                "name": item.title,
                "target_amount": float(item.target_amount or 0),
                "current_amount": float(item.current_amount or 0),
                "status": item.status,
            }
            for item in savings_goals
        ],
    }

@router.put("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Allowed roles: normal, premium, admin.",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.id == current_admin.id and role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own admin role.",
        )

    user.role = role

    db.commit()
    db.refresh(user)

    return {
        "message": "User role updated successfully.",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        },
    }


# ==========================================
# ADMIN - ACTIVATE / DEACTIVATE USER
# ==========================================

@router.put("/users/{user_id}/status")
def change_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.id == current_admin.id and not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return {
        "message": "User status updated successfully.",
        "user": {
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active,
        },
    }


# ==========================================
# ADMIN - SYSTEM ANALYTICS
# ==========================================

@router.get("/analytics")
def system_analytics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    # ------------------------------------------
    # USER COUNTS
    # ------------------------------------------

    total_users = db.query(func.count(User.id)).scalar() or 0

    normal_users = (
        db.query(func.count(User.id))
        .filter(User.role == "normal")
        .scalar()
        or 0
    )

    premium_users = (
        db.query(func.count(User.id))
        .filter(User.role == "premium")
        .scalar()
        or 0
    )

    admin_users = (
        db.query(func.count(User.id))
        .filter(User.role == "admin")
        .scalar()
        or 0
    )

    # Keep legacy "student" users visible instead of losing them.
    student_users = (
        db.query(func.count(User.id))
        .filter(User.role == "student")
        .scalar()
        or 0
    )

    active_users = (
        db.query(func.count(User.id))
        .filter(User.is_active.is_(True))
        .scalar()
        or 0
    )

    inactive_users = max(total_users - active_users, 0)

    verified_users = (
        db.query(func.count(User.id))
        .filter(User.is_verified.is_(True))
        .scalar()
        or 0
    )

    unverified_users = max(total_users - verified_users, 0)

    # ------------------------------------------
    # FINANCIAL TOTALS
    # ------------------------------------------

    total_expenses = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .scalar()
        or 0
    )

    total_income = (
        db.query(func.coalesce(func.sum(Income.amount), 0))
        .scalar()
        or 0
    )

    total_budgets = (
        db.query(func.count(Budget.id))
        .scalar()
        or 0
    )

    total_savings_goals = (
        db.query(func.count(SavingsGoal.id))
        .scalar()
        or 0
    )

    # ------------------------------------------
    # SAVINGS GOAL TOTALS
    # ------------------------------------------

    savings_target = (
        db.query(func.coalesce(func.sum(SavingsGoal.target_amount), 0))
        .scalar()
        or 0
    )

    savings_current = (
        db.query(func.coalesce(func.sum(SavingsGoal.current_amount), 0))
        .scalar()
        or 0
    )

    # ------------------------------------------
    # MONTHLY INCOME / EXPENSE DATA
    # Last 6 months including current month.
    # ------------------------------------------

    now = datetime.utcnow()

    month_starts = []

    year = now.year
    month = now.month

    for offset in range(5, -1, -1):
        current_month = month - offset
        current_year = year

        while current_month <= 0:
            current_month += 12
            current_year -= 1

        month_starts.append(
            datetime(
                current_year,
                current_month,
                1,
            )
        )

    monthly_financial = []

    for index, start in enumerate(month_starts):
        if index < len(month_starts) - 1:
            end = month_starts[index + 1]
        else:
            if start.month == 12:
                end = datetime(start.year + 1, 1, 1)
            else:
                end = datetime(start.year, start.month + 1, 1)

        income_total = (
            db.query(func.coalesce(func.sum(Income.amount), 0))
            .filter(
                Income.date >= start,
                Income.date < end,
            )
            .scalar()
            or 0
        )

        expense_total = (
            db.query(func.coalesce(func.sum(Expense.amount), 0))
            .filter(
                Expense.date >= start,
                Expense.date < end,
            )
            .scalar()
            or 0
        )

        monthly_financial.append(
            {
                "month": start.strftime("%b"),
                "year": start.year,
                "income": float(income_total),
                "expenses": float(expense_total),
            }
        )

    # ------------------------------------------
    # USER REGISTRATION DATA
    # Last 6 months.
    # ------------------------------------------

    monthly_users = []

    for index, start in enumerate(month_starts):
        if index < len(month_starts) - 1:
            end = month_starts[index + 1]
        else:
            if start.month == 12:
                end = datetime(start.year + 1, 1, 1)
            else:
                end = datetime(start.year, start.month + 1, 1)

        registered = (
            db.query(func.count(User.id))
            .filter(
                User.created_at >= start,
                User.created_at < end,
            )
            .scalar()
            or 0
        )

        monthly_users.append(
            {
                "month": start.strftime("%b"),
                "year": start.year,
                "users": registered,
            }
        )

    # ------------------------------------------
    # EXPENSE CATEGORY DATA
    # ------------------------------------------

    expense_category_rows = (
        db.query(
            Expense.category,
            func.sum(Expense.amount),
        )
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    expense_categories = [
        {
            "category": category or "Other",
            "amount": float(amount or 0),
        }
        for category, amount in expense_category_rows
    ]

    # ------------------------------------------
    # INCOME CATEGORY DATA
    # ------------------------------------------

    income_category_rows = (
        db.query(
            Income.category,
            func.sum(Income.amount),
        )
        .group_by(Income.category)
        .order_by(func.sum(Income.amount).desc())
        .all()
    )

    income_categories = [
        {
            "category": category or "Other",
            "amount": float(amount or 0),
        }
        for category, amount in income_category_rows
    ]

    # ------------------------------------------
    # SAVINGS GOAL STATUS
    # ------------------------------------------

    savings_status_rows = (
        db.query(
            SavingsGoal.status,
            func.count(SavingsGoal.id),
        )
        .group_by(SavingsGoal.status)
        .all()
    )

    savings_status = [
        {
            "status": status_name or "unknown",
            "count": count or 0,
        }
        for status_name, count in savings_status_rows
    ]

    # ------------------------------------------
    # RESPONSE
    # ------------------------------------------

    return {
        "users": {
            "total": total_users,
            "normal": normal_users,
            "premium": premium_users,
            "admin": admin_users,
            "student": student_users,
            "active": active_users,
            "inactive": inactive_users,
            "verified": verified_users,
            "unverified": unverified_users,
        },
        "financial": {
            "total_income": float(total_income),
            "total_expenses": float(total_expenses),
            "total_budgets": total_budgets,
            "total_savings_goals": total_savings_goals,
            "savings_target": float(savings_target),
            "savings_current": float(savings_current),
        },
        "charts": {
            "monthly_financial": monthly_financial,
            "monthly_users": monthly_users,
            "expense_categories": expense_categories,
            "income_categories": income_categories,
            "savings_status": savings_status,
        },
    }





# ==========================================
# ADMIN - DOWNLOAD OVERALL SYSTEM REPORT
# ==========================================

@router.get("/reports/download")
def download_system_report(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    pdf_buffer = generate_report_pdf(db)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="Budget_Buddy_Overall_System_Report.pdf"'
        },
    )

# ==========================================
# ADMIN - PREMIUM REQUESTS
# ==========================================

# ==========================================
# ADMIN - DOWNLOAD OVERALL SYSTEM EXCEL REPORT
# ==========================================

@router.get("/reports/excel")
def download_system_report_excel(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    excel_buffer = generate_admin_report_excel(db)

    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="Budget_Buddy_Overall_System_Report.xlsx"'
        },
    )

@router.get("/premium-requests")
def list_premium_requests(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    users = (
        db.query(User)
        .filter(User.premium_request_status == "pending")
        .order_by(User.id.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "premium_request_status": user.premium_request_status,
            "created_at": user.created_at,
        }
        for user in users
    ]


@router.put("/premium-requests/{user_id}/approve")
def approve_premium_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.premium_request_status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending Premium request for this user.",
        )

    user.role = "premium"
    user.premium_request_status = "approved"

    notification = __import__(
        "app.models.notification",
        fromlist=["Notification"],
    ).Notification(
        user_id=user.id,
        message="🎉 You are now a Premium User!",
        type="premium",
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(user)

    return {
        "message": "Premium Access approved successfully.",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "premium_request_status": user.premium_request_status,
        },
    }


@router.put("/premium-requests/{user_id}/reject")
def reject_premium_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.premium_request_status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending Premium request for this user.",
        )

    user.premium_request_status = "rejected"

    notification = __import__(
        "app.models.notification",
        fromlist=["Notification"],
    ).Notification(
        user_id=user.id,
        message="Your Premium Access request was rejected by an administrator.",
        type="premium",
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(user)

    return {
        "message": "Premium Access request rejected.",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "premium_request_status": user.premium_request_status,
        },
    }
