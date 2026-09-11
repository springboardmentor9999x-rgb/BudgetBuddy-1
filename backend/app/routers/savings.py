from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.saving import SavingGoalCreate, SavingGoalUpdate, SavingGoalResponse, SavingGoalContribution
from app.crud.saving import (
    get_saving_goal_by_id,
    get_saving_goal_by_user_and_name,
    get_saving_goals_by_user,
    create_saving_goal,
    update_saving_goal,
    contribute_to_saving_goal,
    delete_saving_goal,
)
from app.models.saving import SavingsGoal
from app.models.user import User
from app.core.deps import get_current_user
from app.core.authorization import (
    check_tier_limit,
    check_resource_ownership,
    Permission,
    require_permission,
)
from app.services.notification_service import (
    check_savings_goal_notifications,
    check_account_overdraft_notifications,
)

router = APIRouter()


@router.get("/saving-goals", response_model=list[SavingGoalResponse])
def read_saving_goals(
    user: User = Depends(require_permission(Permission.SAVINGS_BASIC)),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Retrieve all saving goals for the authenticated user."""
    saving_goals = get_saving_goals_by_user(db, user_id=user.id, skip=skip, limit=limit)
    return saving_goals


@router.post("/saving-goals", response_model=SavingGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_saving_goal_endpoint(
    saving_goal: SavingGoalCreate,
    user: User = Depends(require_permission(Permission.SAVINGS_BASIC)),
    db: Session = Depends(get_db)
):
    """
    Create a new saving goal. Basic users are limited to 2 active saving goals;
    Premium and Admin users enjoy unlimited saving goals.
    """
    existing_goals = get_saving_goals_by_user(db, user_id=user.id, limit=1000)
    check_tier_limit(user=user, feature="saving_goal", current_count=len(existing_goals))

    existing_goal = get_saving_goal_by_user_and_name(db, user_id=user.id, goal_name=saving_goal.goal_name)
    if existing_goal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A saving goal with this name already exists for the user."
        )
    new_goal = create_saving_goal(
        db=db,
        user_id=user.id,
        **saving_goal.model_dump()
    )
    try:
        await check_savings_goal_notifications(db, user.id, new_goal.id)
    except Exception as e:
        print(f"Notification error on create_saving_goal: {e}")
    return new_goal


@router.get("/saving-goals/{goal_id}", response_model=SavingGoalResponse)
def read_saving_goal(
    goal_id: int,
    user: User = Depends(require_permission(Permission.SAVINGS_BASIC)),
    db: Session = Depends(get_db)
):
    """Retrieve a specific saving goal by its ID ensuring ownership or admin read access."""
    saving_goal = get_saving_goal_by_id(db, user_id=user.id, goal_id=goal_id)
    if not saving_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saving goal not found."
        )
    check_resource_ownership(saving_goal.user_id, user, allow_admin_read_only=True)
    return saving_goal


@router.put("/saving-goals/{goal_id}", response_model=SavingGoalResponse)
async def update_saving_goal_endpoint(
    goal_id: int,
    saving_goal_update: SavingGoalUpdate,
    user: User = Depends(require_permission(Permission.SAVINGS_BASIC)),
    db: Session = Depends(get_db)
):
    """Update a specific saving goal by its ID owned by the user."""
    existing_goal = get_saving_goal_by_id(db, user_id=user.id, goal_id=goal_id)
    if not existing_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saving goal not found."
        )
    check_resource_ownership(existing_goal.user_id, user, is_write_operation=True)

    updated_goal = update_saving_goal(db, goal_id=goal_id, user_id=user.id, **saving_goal_update.model_dump(exclude_unset=True))
    try:
        await check_savings_goal_notifications(db, user.id, updated_goal.id)
    except Exception as e:
        print(f"Notification error on update_saving_goal: {e}")
    return updated_goal


@router.post("/saving-goals/{goal_id}/contribute", response_model=SavingGoalResponse)
async def contribute_saving_goal_endpoint(
    goal_id: int,
    contribution: SavingGoalContribution,
    user: User = Depends(require_permission(Permission.SAVINGS_BASIC)),
    db: Session = Depends(get_db)
):
    """Contribute an amount towards a specific saving goal with optional bank deduction."""
    existing_goal = get_saving_goal_by_id(db, user_id=user.id, goal_id=goal_id)
    if not existing_goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saving goal not found.")
    check_resource_ownership(existing_goal.user_id, user, is_write_operation=True)

    result = contribute_to_saving_goal(
        db=db,
        user_id=user.id,
        goal_id=goal_id,
        amount=contribution.amount,
        account_id=contribution.account_id
    )
    try:
        await check_savings_goal_notifications(db, user.id, goal_id)
        if contribution.account_id:
            await check_account_overdraft_notifications(db, user.id, contribution.account_id)
    except Exception as e:
        print(f"Notification error on contribute_saving_goal: {e}")
    return result


@router.delete("/saving-goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saving_goal_endpoint(
    goal_id: int,
    user: User = Depends(require_permission(Permission.SAVINGS_BASIC)),
    db: Session = Depends(get_db)
):
    """Delete a specific saving goal by its ID owned by the user."""
    existing_goal = get_saving_goal_by_id(db, user_id=user.id, goal_id=goal_id)
    if not existing_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saving goal not found."
        )
    check_resource_ownership(existing_goal.user_id, user, is_write_operation=True)

    delete_saving_goal(db, user_id=user.id, goal_id=goal_id)
    return None