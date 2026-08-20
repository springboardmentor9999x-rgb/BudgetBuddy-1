from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.budget import Budget

def get_budget_by_category(db: Session, user_id: int, category: str)-> Budget | None:
    """Retrieve a budget by category (case-insensitive) for a user."""
    smt = select(Budget).where(
        Budget.user_id == user_id,
        func.lower(Budget.category) == func.lower(category.strip())
    )
    return db.execute(smt).scalar()


def create_budget(db: Session, user_id: int, category: str, monthly_limit: float, created_at: datetime = None)-> Budget:
    """Create a new budget ensuring no duplicate category exists."""
    clean_cat = category.strip()
    if monthly_limit <= 0:
        raise HTTPException(status_code=400, detail="Monthly limit must be greater than 0")

    budget_exists = get_budget_by_category(db, user_id, clean_cat)
    if budget_exists:
        raise HTTPException(status_code=400, detail=f"A budget for '{clean_cat}' already exists. Please edit the existing budget.")
    
    if created_at is None:
        created_at = datetime.now(timezone.utc)
    
    budget = Budget(user_id=user_id, category=clean_cat, monthly_limit=monthly_limit, created_at=created_at)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget

def get_budget(db: Session, budget_id: int, user_id: int)-> Budget | None:
    """Retrieve a budget by ID for a user."""
    smt = select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id)
    return db.execute(smt).scalar()

def get_budgets_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100)-> list[Budget]:
    """Retrieve all budgets for a user."""
    smt = select(Budget).where(Budget.user_id == user_id).order_by(Budget.created_at.desc()).offset(skip).limit(limit)
    return db.execute(smt).scalars().all()

def update_budget(db: Session, budget_id: int, user_id: int, category: str | None = None, monthly_limit: float | None = None)-> Budget | None:
    """Update a budget ensuring no collision with other categories."""
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return None

    if category is not None:
        clean_cat = category.strip()
        # Check collision with other budgets of this user
        collision_stmt = select(Budget).where(
            Budget.user_id == user_id,
            Budget.id != budget_id,
            func.lower(Budget.category) == func.lower(clean_cat)
        )
        collision = db.execute(collision_stmt).scalar()
        if collision:
            raise HTTPException(status_code=400, detail=f"A budget for '{clean_cat}' already exists.")
        budget.category = clean_cat

    if monthly_limit is not None:
        if monthly_limit <= 0:
            raise HTTPException(status_code=400, detail="Monthly limit must be greater than 0")
        budget.monthly_limit = monthly_limit

    db.commit()
    db.refresh(budget)
    return budget

def delete_budget(db: Session, budget_id: int, user_id: int)-> dict[str, str] | None:
    """Delete a budget by ID."""
    budget = get_budget(db, budget_id, user_id)
    if not budget:
        return None
    
    db.delete(budget)
    db.commit()
    return {
        "message": f"Budget with id {budget_id} deleted successfully",
    }