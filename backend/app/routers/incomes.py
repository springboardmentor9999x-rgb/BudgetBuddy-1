from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
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
    resolve_transaction_target_user,
)
from app.services.notification_service import check_monthly_deficit_notifications

router = APIRouter()


def parse_date_param(date_str: Optional[str], is_end_of_day: bool = False) -> Optional[datetime]:
    """Helper to parse date/datetime string with optional end-of-day timestamp."""
    if not date_str or not str(date_str).strip():
        return None
    cleaned = str(date_str).strip()
    if cleaned.endswith("Z"):
        cleaned = cleaned[:-1]
    if "T" in cleaned:
        try:
            return datetime.fromisoformat(cleaned)
        except Exception:
            pass
    try:
        parsed = datetime.strptime(cleaned, "%Y-%m-%d")
        if is_end_of_day:
            return parsed.replace(hour=23, minute=59, second=59, microsecond=999999)
        return parsed
    except ValueError:
        pass
    try:
        return datetime.fromisoformat(cleaned)
    except Exception:
        return None


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
    search: Optional[str] = Query(None, description="Search keyword in source or account"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD or ISO"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD or ISO"),
    source: Optional[str] = Query(None, description="Filter by income source"),
    account: Optional[str] = Query(None, description="Filter by linked account"),
    min_amount: Optional[float] = Query(None, ge=0, description="Minimum amount"),
    max_amount: Optional[float] = Query(None, ge=0, description="Maximum amount"),
    sort_by: str = Query("date_desc", description="Sorting option"),
    user_id: Optional[str] = Query(None, description="User scope (Admin only: 'me', 'all', or user ID)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.INCOME_READ_OWN))
):
    """Retrieve filterable income records for authenticated user (or cross-user for Admin)."""
    target_user_id = resolve_transaction_target_user(current_user, user_id)
    parsed_start = parse_date_param(start_date, is_end_of_day=False)
    parsed_end = parse_date_param(end_date, is_end_of_day=True)

    return get_incomes_by_user(
        db=db,
        user_id=target_user_id,
        skip=skip,
        limit=limit,
        source=source,
        account=account,
        start_date=parsed_start,
        end_date=parsed_end,
        min_amount=min_amount,
        max_amount=max_amount,
        search=search,
        sort_by=sort_by
    )



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