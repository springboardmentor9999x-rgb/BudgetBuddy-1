from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.account import Account
from app.models.income import Income
from app.models.expense import Expense

from app.schemas.account import (
    AccountCreate,
    AccountUpdate,
    AccountResponse,
)


router = APIRouter()


# ==========================================
# CREATE ACCOUNT
# ==========================================

@router.post("/", response_model=AccountResponse)
def create_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ==========================================
    # ONE ACCOUNT PER BANK PER USER
    # ==========================================

    bank_name = account_in.bank_name.strip()

    existing_account = (
        db.query(Account)
        .filter(
            Account.user_id == current_user.id,
            func.lower(func.trim(Account.bank_name)) == bank_name.lower(),
        )
        .first()
    )

    if existing_account:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Bank account already exists",
                "bank_name": existing_account.bank_name,
            },
        )

    account = Account(
        user_id=current_user.id,
        bank_name=bank_name,
        account_holder_name=account_in.account_holder_name,
        account_number=account_in.account_number,
        account_type=account_in.account_type,
        description=account_in.description,
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return account


# ==========================================
# GET ALL ACCOUNTS FOR CURRENT USER
# ==========================================

@router.get("/", response_model=list[AccountResponse])
def get_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    accounts = (
        db.query(Account)
        .filter(Account.user_id == current_user.id)
        .order_by(Account.created_at.desc())
        .all()
    )

    result = []

    for account in accounts:
        total_income = (
            db.query(func.coalesce(func.sum(Income.amount), 0))
            .filter(
                Income.account_id == account.id,
                Income.user_id == current_user.id,
            )
            .scalar()
        )

        total_expense = (
            db.query(func.coalesce(func.sum(Expense.amount), 0))
            .filter(
                Expense.account_id == account.id,
                Expense.user_id == current_user.id,
            )
            .scalar()
        )

        account.available_balance = float(
            total_income - total_expense
        )

        result.append(account)

    return result


# ==========================================
# GET ONE ACCOUNT
# ==========================================

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(Account)
        .filter(
            Account.id == account_id,
            Account.user_id == current_user.id,
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found",
        )

    return account


# ==========================================
# UPDATE ACCOUNT
# ==========================================

@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    account_in: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(Account)
        .filter(
            Account.id == account_id,
            Account.user_id == current_user.id,
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found",
        )

    update_data = account_in.model_dump(exclude_unset=True)

    # ==========================================
    # PREVENT DUPLICATE BANK DURING UPDATE
    # ==========================================

    if "bank_name" in update_data:
        new_bank_name = update_data["bank_name"].strip()

        duplicate_account = (
            db.query(Account)
            .filter(
                Account.user_id == current_user.id,
                Account.id != account.id,
                func.lower(func.trim(Account.bank_name))
                == new_bank_name.lower(),
            )
            .first()
        )

        if duplicate_account:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Bank account already exists",
                    "bank_name": duplicate_account.bank_name,
                },
            )

        update_data["bank_name"] = new_bank_name

    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)

    return account


# ==========================================
# DELETE ACCOUNT
# ==========================================

@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(Account)
        .filter(
            Account.id == account_id,
            Account.user_id == current_user.id,
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found",
        )

    db.delete(account)
    db.commit()

    return {
        "message": "Account deleted successfully"
    }
