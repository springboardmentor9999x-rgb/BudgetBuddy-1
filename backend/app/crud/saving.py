from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import date
from fastapi import HTTPException

from app.models.saving import SavingsGoal
from app.models.account import Account

def get_saving_goal_by_id(db: Session, user_id: int, goal_id: int) -> SavingsGoal | None:
    stmt = select(SavingsGoal).where(SavingsGoal.user_id == user_id, SavingsGoal.id == goal_id)
    return db.execute(stmt).scalar_one_or_none()

def get_saving_goal_by_user_and_name(db: Session, user_id: int, goal_name: str) -> SavingsGoal | None:
    stmt = select(SavingsGoal).where(
        SavingsGoal.user_id == user_id,
        func.lower(SavingsGoal.goal_name) == func.lower(goal_name.strip())
    )
    return db.execute(stmt).scalar_one_or_none()

def get_saving_goals_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list[SavingsGoal]:
    stmt = select(SavingsGoal).where(SavingsGoal.user_id == user_id).order_by(SavingsGoal.target_date.asc()).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()


def create_saving_goal(db: Session, user_id: int, goal_name: str, target_amount: float, current_amount: float, target_date: date) -> SavingsGoal:
    clean_name = goal_name.strip()
    if target_amount <= 0:
        raise HTTPException(status_code=400, detail="Target amount must be greater than 0")

    existing = get_saving_goal_by_user_and_name(db, user_id, clean_name)
    if existing:
        raise HTTPException(status_code=400, detail=f"A saving goal with name '{clean_name}' already exists.")

    saving_goal = SavingsGoal(
        user_id=user_id,
        goal_name=clean_name,
        target_amount=target_amount,
        current_amount=current_amount,
        target_date=target_date
    )
    db.add(saving_goal)
    db.commit()
    db.refresh(saving_goal)
    return saving_goal

def update_saving_goal(db: Session, goal_id: int, user_id: int, goal_name: str | None = None, target_amount: float | None = None, current_amount: float | None = None, target_date: date | None = None) -> SavingsGoal:
    saving_goal = get_saving_goal_by_id(db, user_id=user_id, goal_id=goal_id)
    if not saving_goal:
        raise HTTPException(status_code=404, detail="Saving goal not found")

    if goal_name is not None:
        clean_name = goal_name.strip()
        collision_stmt = select(SavingsGoal).where(
            SavingsGoal.user_id == user_id,
            SavingsGoal.id != goal_id,
            func.lower(SavingsGoal.goal_name) == func.lower(clean_name)
        )
        if db.execute(collision_stmt).scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"A saving goal with name '{clean_name}' already exists.")
        saving_goal.goal_name = clean_name

    if target_amount is not None:
        if target_amount <= 0:
            raise HTTPException(status_code=400, detail="Target amount must be greater than 0")
        saving_goal.target_amount = target_amount

    if current_amount is not None:
        saving_goal.current_amount = current_amount
    if target_date is not None:
        saving_goal.target_date = target_date

    db.commit()
    db.refresh(saving_goal)
    return saving_goal


def contribute_to_saving_goal(db: Session, user_id: int, goal_id: int, amount: float, account_id: int | None = None) -> SavingsGoal:
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Contribution amount must be greater than 0")

    saving_goal = get_saving_goal_by_id(db, user_id=user_id, goal_id=goal_id)
    if not saving_goal:
        raise HTTPException(status_code=404, detail="Saving goal not found")

    # If linked bank account is selected, deduct contribution from the account
    if account_id is not None:
        acct_stmt = select(Account).where(Account.id == account_id, Account.user_id == user_id)
        acct = db.execute(acct_stmt).scalar_one_or_none()
        if not acct:
            raise HTTPException(status_code=404, detail="Selected bank account not found")
        acct.balance = float(acct.balance) - float(amount)

    saving_goal.current_amount = float(saving_goal.current_amount) + float(amount)
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