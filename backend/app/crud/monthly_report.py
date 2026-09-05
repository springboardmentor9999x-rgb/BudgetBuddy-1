from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.income import Income


def get_monthly_report(
    db: Session,
    user_id: int,
    year: int,
    month: int,
):
    start_date = datetime(year, month, 1)

    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    # ==========================================
    # TOTAL EXPENSES
    # ==========================================

    expense_result = (
        db.query(
            func.coalesce(func.sum(Expense.amount), 0),
            func.count(Expense.id),
        )
        .filter(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date < end_date,
        )
        .first()
    )

    total_expense = float(expense_result[0] or 0)
    expense_count = int(expense_result[1] or 0)

    # ==========================================
    # TOTAL INCOME
    # ==========================================

    income_result = (
        db.query(
            func.coalesce(func.sum(Income.amount), 0),
            func.count(Income.id),
        )
        .filter(
            Income.user_id == user_id,
            Income.date >= start_date,
            Income.date < end_date,
        )
        .first()
    )

    total_income = float(income_result[0] or 0)
    income_count = int(income_result[1] or 0)

    # ==========================================
    # HIGHEST EXPENSE CATEGORY
    # ==========================================

    category_result = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("amount"),
        )
        .filter(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date < end_date,
        )
        .group_by(Expense.category)
        .order_by(
            func.sum(Expense.amount).desc()
        )
        .first()
    )

    if category_result:
        highest_expense_category = category_result[0]
        highest_expense_amount = float(
            category_result[1] or 0
        )
    else:
        highest_expense_category = None
        highest_expense_amount = 0.0

    # ==========================================
    # NET SAVINGS
    # ==========================================

    net_savings = total_income - total_expense

    return {
        "month": f"{year:04d}-{month:02d}",
        "total_income": total_income,
        "total_expense": total_expense,
        "net_savings": net_savings,
        "expense_count": expense_count,
        "income_count": income_count,
        "highest_expense_category": highest_expense_category,
        "highest_expense_amount": highest_expense_amount,
    }
