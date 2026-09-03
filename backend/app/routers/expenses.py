from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
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
    resolve_transaction_target_user,
)
from app.services.notification_service import (
    check_budget_notifications,
    check_monthly_deficit_notifications,
    check_account_overdraft_notifications,
)
from app.routers.incomes import parse_date_param

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
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Search keyword in description, category, or account"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD or ISO"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD or ISO"),
    category: Optional[str] = Query(None, description="Filter by expense category"),
    account: Optional[str] = Query(None, description="Filter by linked account"),
    min_amount: Optional[float] = Query(None, ge=0, description="Minimum amount"),
    max_amount: Optional[float] = Query(None, ge=0, description="Maximum amount"),
    sort_by: str = Query("date_desc", description="Sorting option"),
    user_id: Optional[str] = Query(None, description="User scope (Admin only: 'me', 'all', or user ID)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.EXPENSE_READ_OWN)),
):
    """Retrieve filterable expense records for authenticated user (or cross-user for Admin)."""
    target_user_id = resolve_transaction_target_user(current_user, user_id)
    parsed_start = parse_date_param(start_date, is_end_of_day=False)
    parsed_end = parse_date_param(end_date, is_end_of_day=True)

    return get_expenses_by_user(
        db=db,
        user_id=target_user_id,
        skip=skip,
        limit=limit,
        category=category,
        account=account,
        start_date=parsed_start,
        end_date=parsed_end,
        min_amount=min_amount,
        max_amount=max_amount,
        search=search,
        sort_by=sort_by,
    )



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