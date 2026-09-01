from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeUpdate, IncomeResponse
from app.crud.income import (
    create_income, 
    get_incomes_by_user, 
    get_income, 
    update_income, 
    delete_income
)
from app.database import get_db
from app.core.authorization import (
    Permission,
    require_permission,
    check_resource_ownership,
)
from app.services.notification_service import check_monthly_deficit_notifications

router = APIRouter()


@router.post("/add-income", response_model=IncomeResponse, status_code=201)
async def add_income(
    income: IncomeCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.INCOME_WRITE_OWN))
):
    """Log an income record for the authenticated user."""
    result = create_income(db, user_id=current_user.id, **income.model_dump())
    try:
        await check_monthly_deficit_notifications(db, current_user.id)
    except Exception as e:
        print(f"Notification error on add_income: {e}")
    return result


@router.get("/get-incomes", response_model=list[IncomeResponse], status_code=200)
def list_incomes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.INCOME_READ_OWN))
):
    """Retrieve all income records for the authenticated user."""
    return get_incomes_by_user(db, current_user.id, skip, limit)


@router.get("/get-income/{income_id}", response_model=IncomeResponse, status_code=200)
def get_income_by_id(
    income_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.INCOME_READ_OWN))
):
    """Retrieve a specific income record ensuring ownership or admin read access."""
    income = get_income(db, income_id, current_user.id)
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    check_resource_ownership(income.user_id, current_user, allow_admin_read_only=True)
    return income


@router.put("/update-income/{income_id}", response_model=IncomeResponse, status_code=200)
async def update_income_by_id(
    income_id: int, 
    income_update: IncomeUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.INCOME_WRITE_OWN))
):
    """Update an income record owned by the authenticated user."""
    existing = get_income(db, income_id, current_user.id)
    if not existing:
        raise HTTPException(status_code=404, detail="Income not found")
    check_resource_ownership(existing.user_id, current_user, is_write_operation=True)

    updated_income = update_income(db, current_user.id, income_id, **income_update.model_dump(exclude_unset=True))
    try:
        await check_monthly_deficit_notifications(db, current_user.id)
    except Exception as e:
        print(f"Notification error on update_income: {e}")
    return updated_income


@router.delete("/delete-income/{income_id}", status_code=200)
async def delete_income_by_id(
    income_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.INCOME_WRITE_OWN))
):
    """Delete an income record owned by the authenticated user."""
    existing = get_income(db, income_id, current_user.id)
    if not existing:
        raise HTTPException(status_code=404, detail="Income not found")
    check_resource_ownership(existing.user_id, current_user, is_write_operation=True)

    result = delete_income(db, current_user.id, income_id)
    try:
        await check_monthly_deficit_notifications(db, current_user.id)
    except Exception as e:
        print(f"Notification error on delete_income: {e}")
    return result