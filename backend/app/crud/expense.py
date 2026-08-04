from sqlalchemy.orm import Session
from sqlalchemy import select
from app.schemas.expense import ExpenseCreate
from app.models.expense import Expense
from datetime import datetime


def create_expense(db: Session, user_id: int, category: str, amount: float, description: str | None, date: datetime)-> Expense:
    expense = Expense(user_id=user_id, category=category, amount=amount, description=description, date=date)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

def get_expenses_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100)-> list[Expense] | None:
    smt = select(Expense).where(Expense.user_id == user_id).offset(skip).limit(limit)
    return db.execute(smt).scalars().all()

def get_expense(db: Session, expense_id: int, user_id: int)-> Expense | None:
    smt = select(Expense).where(Expense.id == expense_id, Expense.user_id == user_id)
    return db.execute(smt).scalar()

def update_expense(db: Session, expense_id: int, user_id: int, expense_in: ExpenseCreate)-> Expense | None:
    expense = get_expense(db, expense_id, user_id)
    if not expense:
        return None
    for field, value in expense_in.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense

def delete_expense(db: Session, expense_id: int, user_id: int)-> dict[str, str] | None:
    expense = get_expense(db, expense_id, user_id)
    if not expense:
        return None
    
    db.delete(expense)
    db.commit()
    return {
        "success": True,
        "message": f"Expense with id {expense_id} deleted successfully",
    }