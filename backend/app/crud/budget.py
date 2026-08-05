from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.budget import Budget

def create_budget(db: Session, user_id: int, category: str, monthly_limit: float)-> Budget:
    budget = Budget(user_id=user_id, category=category, monthly_limit=monthly_limit)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

def get_budget(db: Session, budget_id: int, user_id: int)-> Budget | None:
    smt = select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id)
    return db.execute(smt).scalar()

def get_budgets_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100)-> list[Budget] | None:
    smt = select(Budget).where(Budget.user_id == user_id).offset(skip).limit(limit)
    return db.execute(smt).scalars().all()

def update_budget(db: Session, budget_id: int, user_id: int, category: str | None = None, monthly_limit: float | None = None)-> Budget | None:
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
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return None
    
    db.delete(budget)
    db.commit()
    return {
        "success": True,
        "message": f"Budget with id {budget_id} deleted successfully",
    }