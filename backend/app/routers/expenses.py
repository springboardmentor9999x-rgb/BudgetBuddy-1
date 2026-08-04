from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseOut,
)

from app.crud.expense import (
    create_expense,
    get_expenses_by_user,
    get_expense,
    update_expense,
    delete_expense,
)


router = APIRouter()


# ==========================================
# CREATE EXPENSE
# ==========================================

@router.post("/", response_model=ExpenseOut)
def add_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_expense(
        db=db,
        user_id=current_user.id,
        expense_in=expense_in,
    )


# ==========================================
# GET ALL EXPENSES
# ==========================================

@router.get("/", response_model=list[ExpenseOut])
def list_expenses(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_expenses_by_user(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )


# ==========================================
# GET ONE EXPENSE
# ==========================================

@router.get("/{expense_id}", response_model=ExpenseOut)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense(
        db=db,
        expense_id=expense_id,
        user_id=current_user.id,
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    return expense


# ==========================================
# UPDATE EXPENSE
# ==========================================

@router.put("/{expense_id}", response_model=ExpenseOut)
def edit_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = update_expense(
        db=db,
        expense_id=expense_id,
        user_id=current_user.id,
        expense_in=expense_in,
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    return expense


# ==========================================
# DELETE EXPENSE
# ==========================================

@router.delete("/{expense_id}")
def remove_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = delete_expense(
        db=db,
        expense_id=expense_id,
        user_id=current_user.id,
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    return {
        "message": "Expense deleted successfully"
    }