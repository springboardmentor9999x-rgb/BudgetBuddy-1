from fastapi import APIRouter, Depends, HTTPException
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

router = APIRouter()

@router.post("/add-budget", response_model=BudgetOut, status_code=201)
def add_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_budget(db, current_user.id, **budget_in.model_dump())

@router.get("/get-budgets", response_model=list[BudgetOut], status_code=200)
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    return get_budgets_by_user(db, current_user.id, skip, limit)

@router.get("/get-budget/{budget_id}", response_model=BudgetOut, status_code=200)
def get_budget_by_id(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = get_budget(db, budget_id, current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.put("/update-budget/{budget_id}", response_model=BudgetOut, status_code=200)
def update_budget_by_id(
    budget_id: int,
    budget_in: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = update_budget(db, budget_id, current_user.id, **budget_in.model_dump(exclude_unset=True))
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.delete("/delete-budget/{budget_id}", status_code=200)
def delete_budget_by_id(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = delete_budget(db, budget_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Budget not found")
    return result