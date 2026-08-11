from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date

from app.models.saving import SavingsGoal

def get_saving_goal_by_id(db: Session, user_id: int, goal_id: int) -> SavingsGoal | None:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the savings goal
        goal_id (int): the ID of the savings goal

    Returns:
        SavingsGoal | None: the found savings goal or None if not found
    """
    stmt = select(SavingsGoal).where(SavingsGoal.user_id == user_id, SavingsGoal.id == goal_id)
    result = db.execute(stmt).scalar_one_or_none()
    return result

def get_saving_goal_by_user_and_name(db: Session, user_id: int, goal_name: str) -> SavingsGoal | None:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the savings goal
        goal_name (str): the name of the savings goal

    Returns:
        SavingsGoal | None: the found savings goal or None if not found
    """
    stmt = select(SavingsGoal).where(SavingsGoal.user_id == user_id, SavingsGoal.goal_name == goal_name)
    result = db.execute(stmt).scalar_one_or_none()
    return result

def get_saving_goals_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list[SavingsGoal]:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the savings goals
        skip (int, optional): number of records to skip. Defaults to 0.
        limit (int, optional): maximum number of records to return. Defaults to 100.

    Returns:
        list[SavingsGoal]: a list of savings goals
    """
    stmt = select(SavingsGoal).where(SavingsGoal.user_id == user_id).offset(skip).limit(limit)
    result = db.execute(stmt).scalars().all()
    return result


def create_saving_goal(db: Session, user_id: int, goal_name: str, target_amount: float, current_amount: float, target_date: date) -> SavingsGoal:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the savings goal
        goal_name (str): the name of the savings goal
        target_amount (float): the target amount for the savings goal
        current_amount (float): the current amount saved towards the goal
        target_date (date): the target date for achieving the savings goal

    Returns:
        SavingsGoal: the created savings goal
    """    
    saving_goal = SavingsGoal(
        user_id=user_id,
        goal_name=goal_name,
        target_amount=target_amount,
        current_amount=current_amount,
        target_date=target_date
    )
    db.add(saving_goal)
    db.commit()
    db.refresh(saving_goal)
    return saving_goal

def update_saving_goal(db: Session, goal_id: int, user_id: int, goal_name: str | None = None, target_amount: float | None = None, current_amount: float | None = None, target_date: date | None = None) -> SavingsGoal:
    """_summary_

    Args:
        db (Session): the database session
        goal_id (int): the ID of the savings goal to update
        user_id (int): the ID of the user who owns the savings goal
        goal_name (str | None, optional): the new name of the savings goal. Defaults to None.
        target_amount (float | None, optional): the new target amount for the savings goal. Defaults to None.
        current_amount (float | None, optional): the new current amount saved towards the goal. Defaults to None.
        target_date (date | None, optional): the new target date for achieving the savings goal. Defaults to None.

    Returns:
        SavingsGoal: the updated savings goal
    """
    saving_goal = get_saving_goal_by_id(db, user_id=user_id, goal_id=goal_id)
    if goal_name is not None:
        saving_goal.goal_name = goal_name
    if target_amount is not None:
        saving_goal.target_amount = target_amount
    if current_amount is not None:
        saving_goal.current_amount = current_amount
    if target_date is not None:
        saving_goal.target_date = target_date

    db.commit()
    db.refresh(saving_goal)
    return saving_goal

def delete_saving_goal(db: Session, user_id: int, goal_id: int) -> bool:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the savings goal
        goal_id (int): the ID of the savings goal to delete

    Returns:
        bool: True if the savings goal was deleted, False otherwise
    """
    saving_goal = get_saving_goal_by_id(db, user_id=user_id, goal_id=goal_id)
    if saving_goal is None:
        return False
    db.delete(saving_goal)
    db.commit()
    return True