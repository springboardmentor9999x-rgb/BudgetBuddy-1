from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.schemas.income import (
    IncomeCreate,
    IncomeUpdate,
    IncomeOut,
    IncomeSummary,
)

from app.crud.income import (
    create_income,
    get_incomes_by_user,
    get_income_summary,
    get_income,
    update_income,
    delete_income,
    get_user_account,
)


router = APIRouter()


# ==========================================
# CREATE INCOME
# ==========================================

@router.post("/", response_model=IncomeOut)
def add_income(
    income_in: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # If an account was selected, make sure
    # that account belongs to the logged-in user.
    if income_in.account_id is not None:
        account = get_user_account(
            db=db,
            account_id=income_in.account_id,
            user_id=current_user.id,
        )

        if not account:
            raise HTTPException(
                status_code=404,
                detail="Bank account not found",
            )

    return create_income(
        db=db,
        user_id=current_user.id,
        income_in=income_in,
    )


# ==========================================
# GET ALL INCOME
# ==========================================

@router.get("/", response_model=list[IncomeOut])
def list_income(
    skip: int = Query(
        default=0,
        ge=0,
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_incomes_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )


# ==========================================
# GET INCOME SUMMARY
#
# IMPORTANT:
# Keep this BEFORE /{income_id}
# ==========================================

@router.get(
    "/summary",
    response_model=IncomeSummary,
)
def income_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_income_summary(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# GET ONE INCOME
# ==========================================

@router.get(
    "/{income_id}",
    response_model=IncomeOut,
)
def read_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    income = get_income(
        db=db,
        income_id=income_id,
        user_id=current_user.id,
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found",
        )

    return income


# ==========================================
# UPDATE INCOME
# ==========================================

@router.put(
    "/{income_id}",
    response_model=IncomeOut,
)
def edit_income(
    income_id: int,
    income_in: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # First make sure the income itself
    # belongs to the logged-in user.
    existing_income = get_income(
        db=db,
        income_id=income_id,
        user_id=current_user.id,
    )

    if not existing_income:
        raise HTTPException(
            status_code=404,
            detail="Income not found",
        )

    # If account_id is being changed,
    # validate the selected bank account.
    if income_in.account_id is not None:
        account = get_user_account(
            db=db,
            account_id=income_in.account_id,
            user_id=current_user.id,
        )

        if not account:
            raise HTTPException(
                status_code=404,
                detail="Bank account not found",
            )

    income = update_income(
        db=db,
        income_id=income_id,
        user_id=current_user.id,
        income_in=income_in,
    )

    return income


# ==========================================
# DELETE INCOME
# ==========================================

@router.delete("/{income_id}")
def remove_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    income = delete_income(
        db=db,
        income_id=income_id,
        user_id=current_user.id,
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found",
        )

    return {
        "message": "Income deleted successfully"
    }