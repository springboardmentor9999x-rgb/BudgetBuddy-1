from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


# ==========================================
# CREATE EXPENSE
# ==========================================

def create_expense(
    db: Session,
    user_id: int,
    expense_in: ExpenseCreate
):
    expense = Expense(
        user_id=user_id,
        **expense_in.model_dump()
    )

    db.add(expense)
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
    limit: int = 100
):
    return (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ==========================================
# GET ONE EXPENSE
# ==========================================

def get_expense(
    db: Session,
    expense_id: int,
    user_id: int
):
    return (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == user_id
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
    expense_in: ExpenseUpdate
):
    expense = get_expense(
        db,
        expense_id,
        user_id
    )

    if not expense:
        return None

    update_data = expense_in.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)

    return expense


# ==========================================
# DELETE EXPENSE
# ==========================================

def delete_expense(
    db: Session,
    expense_id: int,
    user_id: int
):
    expense = get_expense(
        db,
        expense_id,
        user_id
    )

    if not expense:
        return None

    db.delete(expense)
    db.commit()

    return expense