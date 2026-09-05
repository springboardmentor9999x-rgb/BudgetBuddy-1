from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.schemas.savings_goal import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
    SavingsGoalOut,
    SavingsGoalContribution,
)

from app.crud.savings_goal import (
    create_savings_goal,
    get_savings_goals_by_user,
    get_savings_goal,
    update_savings_goal,
    delete_savings_goal,
    contribute_to_savings_goal,
)


router = APIRouter()


# ==========================================
# CREATE SAVINGS GOAL
# ==========================================

@router.post(
    "/",
    response_model=SavingsGoalOut,
    status_code=201,
)
def add_savings_goal(
    goal_in: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_savings_goal(
        db=db,
        user_id=current_user.id,
        goal_in=goal_in,
    )


# ==========================================
# GET ALL SAVINGS GOALS
# ==========================================

@router.get(
    "/",
    response_model=list[SavingsGoalOut],
)
def list_savings_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_savings_goals_by_user(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# GET ONE SAVINGS GOAL
# ==========================================

@router.get(
    "/{goal_id}",
    response_model=SavingsGoalOut,
)
def read_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = get_savings_goal(
        db=db,
        goal_id=goal_id,
        user_id=current_user.id,
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found",
        )

    return goal


# ==========================================
# UPDATE SAVINGS GOAL
# ==========================================

@router.put(
    "/{goal_id}",
    response_model=SavingsGoalOut,
)
def edit_savings_goal(
    goal_id: int,
    goal_in: SavingsGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = update_savings_goal(
        db=db,
        goal_id=goal_id,
        user_id=current_user.id,
        goal_in=goal_in,
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found",
        )

    return goal


# ==========================================
# DELETE SAVINGS GOAL
# ==========================================

@router.delete(
    "/{goal_id}",
)
def remove_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = delete_savings_goal(
        db=db,
        goal_id=goal_id,
        user_id=current_user.id,
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found",
        )

    return {
        "message": "Savings goal deleted successfully",
    }


# ==========================================
# CONTRIBUTE TO SAVINGS GOAL
# ==========================================

@router.post(
    "/{goal_id}/contribute",
    response_model=SavingsGoalOut,
)
def contribute_to_goal(
    goal_id: int,
    contribution: SavingsGoalContribution,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = contribute_to_savings_goal(
        db=db,
        goal_id=goal_id,
        user_id=current_user.id,
        amount=contribution.amount,
        account_id=contribution.account_id,
    )

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found",
        )

    return goal
