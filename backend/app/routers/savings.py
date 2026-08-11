from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session


from app.database import get_db
from app.schemas.saving import SavingGoalCreate, SavingGoalUpdate, SavingGoalResponse
from app.crud.saving import (
    get_saving_goal_by_id,
    get_saving_goal_by_user_and_name,
    get_saving_goals_by_user,
    create_saving_goal,
    update_saving_goal,
    delete_saving_goal,
)
from app.models.saving import SavingsGoal
from app.models.user import User
from app.core.deps import get_current_user


router = APIRouter()

@router.get("/saving-goals", response_model=list[SavingGoalResponse])
def read_saving_goals(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Retrieve all saving goals for a specific user."""
    saving_goals = get_saving_goals_by_user(db, user_id=user.id, skip=skip, limit=limit)
    return saving_goals

@router.post("/saving-goals", response_model=SavingGoalResponse, status_code=status.HTTP_201_CREATED)
def create_saving_goal_endpoint(
    saving_goal: SavingGoalCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new saving goal for a specific user."""
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
    return new_goal

@router.get("/saving-goals/{goal_id}", response_model=SavingGoalResponse)
def read_saving_goal(
    goal_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve a specific saving goal by its ID for a specific user."""
    saving_goal = get_saving_goal_by_id(db, user_id=user.id, goal_id=goal_id)
    if not saving_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saving goal not found."
        )
    return saving_goal

@router.put("/saving-goals/{goal_id}", response_model=SavingGoalResponse)
def update_saving_goal_endpoint(
    goal_id: int,
    saving_goal_update: SavingGoalUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific saving goal by its ID for a specific user."""
    existing_goal = get_saving_goal_by_id(db, user_id=user.id, goal_id=goal_id)
    if not existing_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saving goal not found."
        )
    updated_goal = update_saving_goal(db, goal_id=goal_id, user_id=user.id, **saving_goal_update.model_dump(exclude_unset=True))
    return updated_goal

@router.delete("/saving-goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saving_goal_endpoint(
    goal_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific saving goal by its ID for a specific user."""
    existing_goal = get_saving_goal_by_id(db, user_id=user.id, goal_id=goal_id)
    if not existing_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saving goal not found."
        )
    delete_saving_goal(db, user_id=user.id, goal_id=goal_id)
    return None