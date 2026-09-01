from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseOut
from app.models.user import User
from app.crud.expense import (
    create_expense,
    get_expenses_by_user,
    get_expense,
    update_expense,
    delete_expense,
)
from app.core.authorization import (
    Permission,
    require_permission,
    check_resource_ownership,
)
from app.services.notification_service import (
    check_budget_notifications,
    check_monthly_deficit_notifications,
    check_account_overdraft_notifications,
)

router = APIRouter()


@router.post("/add-expense", response_model=ExpenseOut, status_code=201)
async def add_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.EXPENSE_WRITE_OWN))
):
    """Log a new expense for the authenticated user."""
    expense = create_expense(db, current_user.id, **expense_in.model_dump())
    try:
        await check_budget_notifications(db, current_user.id, expense.category)
        await check_monthly_deficit_notifications(db, current_user.id)
        await check_account_overdraft_notifications(db, current_user.id)
    except Exception as e:
        print(f"Notification error on add_expense: {e}")
    return expense


@router.get("/get-expenses", response_model=list[ExpenseOut], status_code=200)
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.EXPENSE_READ_OWN)),
    skip: int = 0,
    limit: int = 100
):
    """Retrieve all expenses for the authenticated user."""
    return get_expenses_by_user(db, current_user.id, skip, limit)


@router.get("/get-expense/{expense_id}", response_model=ExpenseOut, status_code=200)
def get_expense_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.EXPENSE_READ_OWN))
):
    """Retrieve a specific expense ensuring resource ownership or admin read access."""
    expense = get_expense(db, expense_id, current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    check_resource_ownership(expense.user_id, current_user, allow_admin_read_only=True)
    return expense


@router.put("/update-expense/{expense_id}", response_model=ExpenseOut, status_code=200)
async def update_expense_by_id(
    expense_id: int,
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.EXPENSE_WRITE_OWN))
):
    """Update an expense owned by the authenticated user."""
    existing = get_expense(db, expense_id, current_user.id)
    if not existing:
        raise HTTPException(status_code=404, detail="Expense not found")
    check_resource_ownership(existing.user_id, current_user, is_write_operation=True)

    expense = update_expense(db, expense_id, current_user.id, expense_in)
    try:
        await check_budget_notifications(db, current_user.id, expense.category)
        await check_monthly_deficit_notifications(db, current_user.id)
        await check_account_overdraft_notifications(db, current_user.id)
    except Exception as e:
        print(f"Notification error on update_expense: {e}")
    return expense


@router.delete("/delete-expense/{expense_id}", status_code=200)
async def delete_expense_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.EXPENSE_WRITE_OWN))
):
    """Delete an expense owned by the authenticated user."""
    existing = get_expense(db, expense_id, current_user.id)
    if not existing:
        raise HTTPException(status_code=404, detail="Expense not found")
    check_resource_ownership(existing.user_id, current_user, is_write_operation=True)

    result = delete_expense(db, expense_id, current_user.id)
    try:
        await check_monthly_deficit_notifications(db, current_user.id)
        await check_account_overdraft_notifications(db, current_user.id)
    except Exception as e:
        print(f"Notification error on delete_expense: {e}")
    return result