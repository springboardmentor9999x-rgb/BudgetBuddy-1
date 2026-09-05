from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.income import Income
from app.models.expense import Expense
from app.models.savings_goal import SavingsGoal


# ==========================================
# FINANCIAL SUMMARY
# ==========================================

def get_analytics_summary(
    db: Session,
    user_id: int,
):
    total_income = (
        db.query(
            func.coalesce(
                func.sum(Income.amount),
                0,
            )
        )
        .filter(
            Income.user_id == user_id
        )
        .scalar()
        or 0
    )

    total_expenses = (
        db.query(
            func.coalesce(
                func.sum(Expense.amount),
                0,
            )
        )
        .filter(
            Expense.user_id == user_id
        )
        .scalar()
        or 0
    )

    total_income = float(total_income)
    total_expenses = float(total_expenses)

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_savings": total_income - total_expenses,
    }


# ==========================================
# MONTHLY ANALYTICS
# ==========================================

def get_monthly_analytics(
    db: Session,
    user_id: int,
):
    income_rows = (
        db.query(
            func.extract(
                "year",
                Income.date,
            ).label("year"),
            func.extract(
                "month",
                Income.date,
            ).label("month"),
            func.coalesce(
                func.sum(Income.amount),
                0,
            ).label("income"),
        )
        .filter(
            Income.user_id == user_id
        )
        .group_by(
            func.extract("year", Income.date),
            func.extract("month", Income.date),
        )
        .all()
    )

    expense_rows = (
        db.query(
            func.extract(
                "year",
                Expense.date,
            ).label("year"),
            func.extract(
                "month",
                Expense.date,
            ).label("month"),
            func.coalesce(
                func.sum(Expense.amount),
                0,
            ).label("expenses"),
        )
        .filter(
            Expense.user_id == user_id
        )
        .group_by(
            func.extract("year", Expense.date),
            func.extract("month", Expense.date),
        )
        .all()
    )

    monthly_data = {}

    for row in income_rows:
        key = (
            int(row.year),
            int(row.month),
        )

        monthly_data[key] = {
            "year": int(row.year),
            "month": int(row.month),
            "income": float(row.income or 0),
            "expenses": 0.0,
            "net_savings": 0.0,
        }

    for row in expense_rows:
        key = (
            int(row.year),
            int(row.month),
        )

        if key not in monthly_data:
            monthly_data[key] = {
                "year": int(row.year),
                "month": int(row.month),
                "income": 0.0,
                "expenses": 0.0,
                "net_savings": 0.0,
            }

        monthly_data[key]["expenses"] = float(
            row.expenses or 0
        )

    for data in monthly_data.values():
        data["net_savings"] = (
            data["income"]
            - data["expenses"]
        )

    return sorted(
        monthly_data.values(),
        key=lambda item: (
            item["year"],
            item["month"],
        ),
        reverse=True,
    )


# ==========================================
# CATEGORY ANALYTICS
# ==========================================

def get_category_analytics(
    db: Session,
    user_id: int,
):
    """
    Return expense totals grouped by category.

    Category names are normalized using:
    - trim()  -> removes extra spaces
    - lower() -> makes comparison case-insensitive

    Therefore:
        Food
        food
        FOOD
        Food

    are treated as the same category.
    """

    normalized_category = func.lower(
        func.trim(Expense.category)
    )

    rows = (
        db.query(
            normalized_category.label("category"),
            func.coalesce(
                func.sum(Expense.amount),
                0,
            ).label("total_amount"),
        )
        .filter(
            Expense.user_id == user_id
        )
        .group_by(
            normalized_category
        )
        .order_by(
            func.sum(Expense.amount).desc()
        )
        .all()
    )

    result = []

    for row in rows:
        category = row.category or "other"

        # Display category names neatly.
        # Example:
        # "food" -> "Food"
        # "travel" -> "Travel"
        # "other" -> "Other"
        display_category = category.strip().title()

        result.append(
            {
                "category": display_category,
                "total_amount": float(
                    row.total_amount or 0
                ),
            }
        )

    return result


# ==========================================
# COMPLETE ANALYTICS OVERVIEW
# ==========================================

def get_analytics_overview(
    db: Session,
    user_id: int,
):
    return {
        "summary": get_analytics_summary(
            db=db,
            user_id=user_id,
        ),
        "monthly": get_monthly_analytics(
            db=db,
            user_id=user_id,
        ),
        "categories": get_category_analytics(
            db=db,
            user_id=user_id,
        ),
    }

# ==========================================
# SAVINGS GOAL ANALYTICS
# ==========================================

def get_savings_goal_analytics(
    db: Session,
    user_id: int,
):
    goals = (
        db.query(SavingsGoal)
        .filter(
            SavingsGoal.user_id == user_id
        )
        .order_by(
            SavingsGoal.id.asc()
        )
        .all()
    )

    result = []

    for goal in goals:
        target = float(goal.target_amount or 0)
        current = float(goal.current_amount or 0)

        progress = (
            (current / target) * 100
            if target > 0
            else 0
        )

        result.append(
            {
                "id": goal.id,
                "title": goal.title,
                "target_amount": target,
                "current_amount": current,
                "progress": min(progress, 100),
                "status": goal.status,
            }
        )

    return result





