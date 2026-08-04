from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from app.models.income import Income



def create_income(db: Session, user_id: int, amount: float, source: str, date: datetime) -> Income:
    income_data = Income(user_id=user_id, amount=amount, source=source, date=date)
    db.add(income_data)
    db.commit()
    db.refresh(income_data)
    return income_data

def get_incomes_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list[Income]:
    smt = select(Income).where(Income.user_id == user_id).offset(skip).limit(limit)
    return db.execute(smt).scalars().all()

def get_income(db: Session, income_id: int, user_id: int) -> Income | None:
    smt = select(Income).where(Income.id == income_id, Income.user_id == user_id)
    return db.execute(smt).scalar_one_or_none()

def update_income(db: Session, user_id: int, income_id: int, amount: float = None, source: str = None, date: datetime = None) -> Income | None:
    income = get_income(db, income_id, user_id)
    if not income:
        return None

    if amount is not None:
        income.amount = amount
    if source is not None:
        income.source = source
    if date is not None:
        income.date = date

    db.commit()
    db.refresh(income)
    return income

def delete_income(db: Session, user_id: int, income_id: int) -> dict[str, str] | None:
    income = get_income(db, income_id, user_id)
    if not income:
        return None

    db.delete(income)
    db.commit()
    return {
        "success": True,
        "message": f"Income with ID {income_id} has been deleted."
    }