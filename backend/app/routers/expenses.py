from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.expense import ExpenseCreate, ExpenseOut
from app.models.user import User
from app.crud.expense import (
    create_expense,
    get_expenses_by_user,
    get_expense,
    update_expense,
    delete_expense,
)

router = APIRouter()

@router.post("/add-expense", response_model=ExpenseOut, status_code=201)
def add_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_expense(db, current_user.id, expense_in.category, expense_in.amount, expense_in.description, expense_in.date)

@router.get("/get-expenses", response_model=list[ExpenseOut], status_code=200)
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    return get_expenses_by_user(db, current_user.id, skip, limit)

@router.get("/get-expense/{expense_id}", response_model=ExpenseOut, status_code=200)
def get_expense_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_expense(db, expense_id, current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/update-expense/{expense_id}", response_model=ExpenseOut, status_code=200)
def update_expense_by_id(
    expense_id: int,
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = update_expense(db, expense_id, current_user.id, expense_in)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.delete("/delete-expense/{expense_id}", response_model=dict[str, str], status_code=200)
def delete_expense_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = delete_expense(db, expense_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    return result