from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.account import Account
from app.models.budget import Budget
from app.models.notification import Notification

from app.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
)


# ==========================================
# VERIFY ACCOUNT OWNERSHIP
# ==========================================

def get_user_account(
    db: Session,
    account_id: int,
    user_id: int,
):
    return (
        db.query(Account)
        .filter(
            Account.id == account_id,
            Account.user_id == user_id,
        )
        .first()
    )


# ==========================================
# CREATE EXPENSE
# ==========================================

def create_expense(
    db: Session,
    user_id: int,
    expense_in: ExpenseCreate,
):
    expense_data = expense_in.model_dump()

    account_id = expense_data.get("account_id")

    # ------------------------------------------
    # VERIFY ACCOUNT BELONGS TO USER
    # ------------------------------------------

    if account_id is not None:
        account = get_user_account(
            db=db,
            account_id=account_id,
            user_id=user_id,
        )

        if not account:
            return None

    # ------------------------------------------
    # CREATE EXPENSE
    # ------------------------------------------

    expense = Expense(
        user_id=user_id,
        **expense_data,
    )

    db.add(expense)

    # Flush so the expense is available
    # for the spending calculation before commit.
    db.flush()

    # ==========================================
    # BUDGET ALERT LOGIC
    # ==========================================

    # ------------------------------------------
    # FIND BUDGET FOR EXPENSE CATEGORY
    # ------------------------------------------

    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.category == expense.category,
        )
        .first()
    )

    if budget:

        # --------------------------------------
        # CURRENT MONTH START
        # --------------------------------------

        now = datetime.utcnow()

        month_start = datetime(
            now.year,
            now.month,
            1,
        )

        # --------------------------------------
        # CALCULATE CURRENT MONTH SPENDING
        # --------------------------------------

        total_spent = (
            db.query(
                func.coalesce(
                    func.sum(Expense.amount),
                    0,
                )
            )
            .filter(
                Expense.user_id == user_id,
                Expense.category == expense.category,
                Expense.date >= month_start,
            )
            .scalar()
        )

        total_spent = float(
            total_spent or 0
        )

        # --------------------------------------
        # CHECK WHETHER BUDGET IS EXCEEDED
        # --------------------------------------

        if total_spent > budget.limit:

            notification = Notification(
                user_id=user_id,
                message=(
                    f"Budget alert! Your spending for "
                    f"'{expense.category}' has exceeded "
                    f"your budget limit of "
                    f"₹{budget.limit:.2f}."
                ),
                type="budget_alert",
                is_read=False,
            )

            db.add(notification)

    # ==========================================
    # SAVE EXPENSE + NOTIFICATION
    # ==========================================

    db.commit()
    db.refresh(expense)

    return expense


# ==========================================
# GET ALL EXPENSES FOR CURRENT USER
# ==========================================

def get_expenses_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
):
    return (
        db.query(Expense)
        .filter(
            Expense.user_id == user_id
        )
        .order_by(
            Expense.date.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


# ==========================================
# GET EXPENSE SUMMARY BY CATEGORY
# ==========================================

def get_expense_summary(
    db: Session,
    user_id: int,
):
    results = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label(
                "amount"
            ),
        )
        .filter(
            Expense.user_id == user_id
        )
        .group_by(
            Expense.category
        )
        .order_by(
            func.sum(Expense.amount).desc()
        )
        .all()
    )

    categories = [
        {
            "category": category,
            "amount": float(amount),
        }
        for category, amount in results
    ]

    total_expense = sum(
        item["amount"]
        for item in categories
    )

    return {
        "total_expense": total_expense,
        "categories": categories,
    }


# ==========================================
# GET ONE EXPENSE
# ==========================================

def get_expense(
    db: Session,
    expense_id: int,
    user_id: int,
):
    return (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == user_id,
        )
        .first()
    )


# ==========================================
# UPDATE EXPENSE
# ==========================================

def update_expense(
    db: Session,
    expense_id: int,
    user_id: int,
    expense_in: ExpenseUpdate,
):
    expense = get_expense(
        db=db,
        expense_id=expense_id,
        user_id=user_id,
    )

    if not expense:
        return None

    update_data = expense_in.model_dump(
        exclude_unset=True
    )

    # ------------------------------------------
    # VERIFY NEW ACCOUNT OWNERSHIP
    # ------------------------------------------

    if "account_id" in update_data:

        account_id = update_data["account_id"]

        if account_id is not None:

            account = get_user_account(
                db=db,
                account_id=account_id,
                user_id=user_id,
            )

            if not account:
                return None

    # ------------------------------------------
    # UPDATE EXPENSE
    # ------------------------------------------

    for field, value in update_data.items():
        setattr(
            expense,
            field,
            value,
        )

    db.commit()
    db.refresh(expense)

    return expense


# ==========================================
# DELETE EXPENSE
# ==========================================

def delete_expense(
    db: Session,
    expense_id: int,
    user_id: int,
):
    expense = get_expense(
        db=db,
        expense_id=expense_id,
        user_id=user_id,
    )

    if not expense:
        return None

    db.delete(expense)
    db.commit()

    return expense