from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.income import Income


# ==========================================
# BUILD DATE RANGE
# ==========================================

def get_report_date_range(
    period: str,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Build a [start, end) date range.

    Supported periods:
    - day
    - week
    - month
    - custom
    """

    now = datetime.now()

    period = period.lower().strip()

    # ------------------------------------------
    # DAY
    # ------------------------------------------

    if period == "day":
        start = datetime(
            now.year,
            now.month,
            now.day,
        )

        end = start + timedelta(days=1)

    # ------------------------------------------
    # WEEK
    # Monday -> Sunday
    # ------------------------------------------

    elif period == "week":
        start = datetime(
            now.year,
            now.month,
            now.day,
        ) - timedelta(days=now.weekday())

        end = start + timedelta(days=7)

    # ------------------------------------------
    # MONTH
    # ------------------------------------------

    elif period == "month":
        start = datetime(
            now.year,
            now.month,
            1,
        )

        if now.month == 12:
            end = datetime(
                now.year + 1,
                1,
                1,
            )
        else:
            end = datetime(
                now.year,
                now.month + 1,
                1,
            )

    # ------------------------------------------
    # CUSTOM
    # ------------------------------------------

    elif period == "custom":
        if start_date is None or end_date is None:
            raise ValueError(
                "start_date and end_date are required "
                "for custom reports"
            )

        start = datetime(
            start_date.year,
            start_date.month,
            start_date.day,
        )

        end = datetime(
            end_date.year,
            end_date.month,
            end_date.day,
        ) + timedelta(days=1)

        if start >= end:
            raise ValueError(
                "start_date must be before or equal to end_date"
            )

    else:
        raise ValueError(
            "Invalid period. Use day, week, month, or custom."
        )

    return start, end


# ==========================================
# REPORT
# ==========================================

def get_report(
    db: Session,
    user_id: int,
    period: str,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Generate a complete financial report for
    the authenticated user's selected period.
    """

    start, end = get_report_date_range(
        period=period,
        start_date=start_date,
        end_date=end_date,
    )

    # ==========================================
    # TOTAL INCOME
    # ==========================================

    income_result = (
        db.query(
            func.coalesce(
                func.sum(Income.amount),
                0,
            ),
            func.count(Income.id),
        )
        .filter(
            Income.user_id == user_id,
            Income.date >= start,
            Income.date < end,
        )
        .first()
    )

    total_income = float(
        income_result[0] or 0
    )

    income_count = int(
        income_result[1] or 0
    )

    # ==========================================
    # TOTAL EXPENSES
    # ==========================================

    expense_result = (
        db.query(
            func.coalesce(
                func.sum(Expense.amount),
                0,
            ),
            func.count(Expense.id),
        )
        .filter(
            Expense.user_id == user_id,
            Expense.date >= start,
            Expense.date < end,
        )
        .first()
    )

    total_expenses = float(
        expense_result[0] or 0
    )

    expense_count = int(
        expense_result[1] or 0
    )

    # ==========================================
    # NET BALANCE / SAVINGS
    # ==========================================

    net_balance = (
        total_income
        - total_expenses
    )

    savings = net_balance

    # ==========================================
    # EXPENSE CATEGORY BREAKDOWN
    # ==========================================

    normalized_category = func.lower(
        func.trim(Expense.category)
    )

    category_rows = (
        db.query(
            normalized_category.label("category"),
            func.coalesce(
                func.sum(Expense.amount),
                0,
            ).label("total_amount"),
            func.count(
                Expense.id
            ).label("transaction_count"),
        )
        .filter(
            Expense.user_id == user_id,
            Expense.date >= start,
            Expense.date < end,
        )
        .group_by(
            normalized_category
        )
        .order_by(
            func.sum(Expense.amount).desc()
        )
        .all()
    )

    expense_categories = []

    for row in category_rows:
        category = row.category or "other"

        expense_categories.append(
            {
                "category": category.strip().title(),
                "total_amount": float(
                    row.total_amount or 0
                ),
                "transaction_count": int(
                    row.transaction_count or 0
                ),
            }
        )

    # ==========================================
    # EXPENSE TRANSACTIONS
    # ==========================================

    expense_rows = (
        db.query(Expense)
        .filter(
            Expense.user_id == user_id,
            Expense.date >= start,
            Expense.date < end,
        )
        .order_by(
            Expense.date.desc()
        )
        .all()
    )

    expenses = []

    for expense in expense_rows:
        expenses.append(
            {
                "id": expense.id,
                "type": "expense",
                "date": expense.date,
                "category": expense.category,
                "amount": float(
                    expense.amount
                ),
                "payment_method": (
                    expense.payment_method
                ),
                "description": expense.description,
                "account_id": expense.account_id,
            }
        )

    # ==========================================
    # INCOME TRANSACTIONS
    # ==========================================

    income_rows = (
        db.query(Income)
        .filter(
            Income.user_id == user_id,
            Income.date >= start,
            Income.date < end,
        )
        .order_by(
            Income.date.desc()
        )
        .all()
    )

    incomes = []

    for income in income_rows:
        incomes.append(
            {
                "id": income.id,
                "type": "income",
                "date": income.date,
                "source": income.source,
                "category": income.category,
                "amount": float(
                    income.amount
                ),
                "description": income.description,
                "account_id": income.account_id,
            }
        )

    # ==========================================
    # COMBINED TRANSACTIONS
    # ==========================================

    transactions = expenses + incomes

    transactions.sort(
        key=lambda item: item["date"],
        reverse=True,
    )

    # ==========================================
    # VERIFICATION INFORMATION
    # ==========================================

    transaction_count = (
        expense_count
        + income_count
    )

    return {
        "period": period,
        "start_date": start,
        "end_date": end - timedelta(days=1),

        "summary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_balance": net_balance,
            "savings": savings,
        },

        "expense_categories": expense_categories,

        "transactions": transactions,

        "verification": {
            "income_count": income_count,
            "expense_count": expense_count,
            "transaction_count": transaction_count,
        },
    }
