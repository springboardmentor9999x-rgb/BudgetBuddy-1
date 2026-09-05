from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetOut,
)

from app.crud.budget import (
    create_budget,
    get_budgets_by_user,
    get_budget,
    update_budget,
    delete_budget,
)

router = APIRouter()


# ==========================================
# CREATE BUDGET
# ==========================================

@router.post("/", response_model=BudgetOut)
def add_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_budget(
        db=db,
        user_id=current_user.id,
        budget_in=budget_in,
    )


# ==========================================
# GET ALL BUDGETS
# ==========================================

@router.get("/", response_model=list[BudgetOut])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_budgets_by_user(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# GET ONE BUDGET
# ==========================================

@router.get("/{budget_id}", response_model=BudgetOut)
def read_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = get_budget(
        db=db,
        budget_id=budget_id,
        user_id=current_user.id,
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found",
        )

    return budget


# ==========================================
# UPDATE BUDGET
# ==========================================

@router.put("/{budget_id}", response_model=BudgetOut)
def edit_budget(
    budget_id: int,
    budget_in: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = update_budget(
        db=db,
        budget_id=budget_id,
        user_id=current_user.id,
        budget_in=budget_in,
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found",
        )

    return budget


# ==========================================
# DELETE BUDGET
# ==========================================

@router.delete("/{budget_id}")
def remove_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = delete_budget(
        db=db,
        budget_id=budget_id,
        user_id=current_user.id,
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found",
        )

    return {
        "message": "Budget deleted successfully"
    }
