from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.budget import BudgetCreate, BudgetOut, BudgetUpdate
from app.models.user import User
from app.crud.budget import (
    create_budget,
    get_budgets_by_user,
    get_budget,
    update_budget,
    delete_budget,
)
from app.core.authorization import (
    check_tier_limit,
    check_resource_ownership,
    Permission,
    require_permission,
)
from app.services.notification_service import check_budget_notifications

router = APIRouter()


@router.post("/add-budget", response_model=BudgetOut, status_code=201)
async def add_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.BUDGET_BASIC))
):
    """
    Creates a new budget category. Basic users are limited to 5 active budgets;
    Premium and Admin users enjoy unlimited budgets.
    """
    existing_budgets = get_budgets_by_user(db, current_user.id, limit=1000)
    check_tier_limit(user=current_user, feature="budget", current_count=len(existing_budgets))

    budget = create_budget(db, current_user.id, **budget_in.model_dump())
    try:
        await check_budget_notifications(db, current_user.id, budget.category)
    except Exception as e:
        print(f"Notification error on add_budget: {e}")
    return budget


@router.get("/get-budgets", response_model=list[BudgetOut], status_code=200)
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.BUDGET_BASIC)),
    skip: int = 0,
    limit: int = 100
):
    """Retrieve all budgets belonging to the authenticated user."""
    return get_budgets_by_user(db, current_user.id, skip, limit)


@router.get("/get-budget/{budget_id}", response_model=BudgetOut, status_code=200)
def get_budget_by_id(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.BUDGET_BASIC))
):
    """Retrieve a specific budget ensuring user ownership or admin read access."""
    budget = get_budget(db, budget_id, current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    check_resource_ownership(budget.user_id, current_user, allow_admin_read_only=True)
    return budget


@router.put("/update-budget/{budget_id}", response_model=BudgetOut, status_code=200)
async def update_budget_by_id(
    budget_id: int,
    budget_in: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.BUDGET_BASIC))
):
    """Update a specific budget owned by the authenticated user."""
    existing_budget = get_budget(db, budget_id, current_user.id)
    if not existing_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    check_resource_ownership(existing_budget.user_id, current_user, is_write_operation=True)

    budget = update_budget(db, budget_id, current_user.id, **budget_in.model_dump(exclude_unset=True))
    try:
        await check_budget_notifications(db, current_user.id, budget.category)
    except Exception as e:
        print(f"Notification error on update_budget: {e}")
    return budget


@router.delete("/delete-budget/{budget_id}", status_code=200)
def delete_budget_by_id(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.BUDGET_BASIC))
):
    """Delete a budget owned by the authenticated user."""
    existing_budget = get_budget(db, budget_id, current_user.id)
    if not existing_budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    check_resource_ownership(existing_budget.user_id, current_user, is_write_operation=True)

    result = delete_budget(db, budget_id, current_user.id)
    return result