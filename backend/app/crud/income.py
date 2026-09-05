from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.income import Income
from app.models.account import Account
from app.schemas.income import IncomeCreate, IncomeUpdate


# ==========================================
# CHECK ACCOUNT BELONGS TO USER
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
# CREATE INCOME
# ==========================================

def create_income(
    db: Session,
    user_id: int,
    income_in: IncomeCreate,
):
    income = Income(
        user_id=user_id,
        **income_in.model_dump()
    )

    db.add(income)
    db.commit()
    db.refresh(income)

    return income


# ==========================================
# GET ALL INCOME FOR USER
# ==========================================

def get_incomes_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
):
    return (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .order_by(Income.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ==========================================
# GET ONE INCOME
# ==========================================

def get_income(
    db: Session,
    income_id: int,
    user_id: int,
):
    return (
        db.query(Income)
        .filter(
            Income.id == income_id,
            Income.user_id == user_id,
        )
        .first()
    )


# ==========================================
# GET TOTAL INCOME
# ==========================================

def get_income_summary(
    db: Session,
    user_id: int,
):
    total_income = (
        db.query(
            func.coalesce(
                func.sum(Income.amount),
                0.0
            )
        )
        .filter(
            Income.user_id == user_id
        )
        .scalar()
    )

    return {
        "total_income": float(total_income)
    }


# ==========================================
# UPDATE INCOME
# ==========================================

def update_income(
    db: Session,
    income_id: int,
    user_id: int,
    income_in: IncomeUpdate,
):
    income = get_income(
        db=db,
        income_id=income_id,
        user_id=user_id,
    )

    if not income:
        return None

    update_data = income_in.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(income, field, value)

    db.commit()
    db.refresh(income)

    return income


# ==========================================
# DELETE INCOME
# ==========================================

def delete_income(
    db: Session,
    income_id: int,
    user_id: int,
):
    income = get_income(
        db=db,
        income_id=income_id,
        user_id=user_id,
    )

    if not income:
        return None

    db.delete(income)
    db.commit()

    return income