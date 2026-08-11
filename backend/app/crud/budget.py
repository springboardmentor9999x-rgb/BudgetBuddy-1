from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.budget import Budget

def create_budget(db: Session, user_id: int, category: str, monthly_limit: float, created_at: datetime = None)-> Budget:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the budget
        category (str): the category of the budget
        monthly_limit (float): the monthly limit for the budget
        created_at (datetime, optional): the date and time when the budget was created. Defaults to None.

    Returns:
        Budget: the created budget
    """
    budget = Budget(user_id=user_id, category=category, monthly_limit=monthly_limit, created_at=created_at)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

def get_budget(db: Session, budget_id: int, user_id: int)-> Budget | None:
    """_summary_

    Args:
        db (Session): the database session
        budget_id (int): the ID of the budget to retrieve
        user_id (int): the ID of the user who owns the budget

    Returns:
        Budget | None: the retrieved budget or None if not found
    """
    smt = select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id)
    return db.execute(smt).scalar()

def get_budgets_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100)-> list[Budget] | None:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user for whom to retrieve budgets
        skip (int, optional): the number of budgets to skip. Defaults to 0.
        limit (int, optional): the maximum number of budgets to retrieve. Defaults to 100.

    Returns:
        list[Budget] | None: the list of retrieved budgets or None if not found
    """
    smt = select(Budget).where(Budget.user_id == user_id).offset(skip).limit(limit)
    return db.execute(smt).scalars().all()

def update_budget(db: Session, budget_id: int, user_id: int, category: str | None = None, monthly_limit: float | None = None)-> Budget | None:
    """_summary_

    Args:
        db (Session): the database session
        budget_id (int): the ID of the budget to update
        user_id (int): the ID of the user who owns the budget
        category (str | None, optional): the new category for the budget. Defaults to None.
        monthly_limit (float | None, optional): the new monthly limit for the budget. Defaults to None.

    Returns:
        Budget | None: the updated budget or None if not found
    """
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return None
    if category is not None:
        budget.category = category
    if monthly_limit is not None:
        budget.monthly_limit = monthly_limit
    db.commit()
    db.refresh(budget)
    return budget

def delete_budget(db: Session, budget_id: int, user_id: int)-> dict[str, str] | None:
    """_summary_

    Args:
        db (Session): the database session
        budget_id (int): the ID of the budget to delete
        user_id (int): the ID of the user who owns the budget

    Returns:
        dict[str, str] | None: a success message or None if not found
    """
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return None
    
    db.delete(budget)
    db.commit()
    return {
        "message": f"Budget with id {budget_id} deleted successfully",
    }