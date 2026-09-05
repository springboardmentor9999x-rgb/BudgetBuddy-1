from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate


def create_budget(
    db: Session,
    user_id: int,
    budget_in: BudgetCreate,
):
    budget = Budget(
        user_id=user_id,
        category=budget_in.category,
        limit=budget_in.limit,
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return budget


def get_budgets_by_user(
    db: Session,
    user_id: int,
):
    return (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .order_by(Budget.id.desc())
        .all()
    )


def get_budget(
    db: Session,
    budget_id: int,
    user_id: int,
):
    return (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == user_id,
        )
        .first()
    )


def update_budget(
    db: Session,
    budget_id: int,
    user_id: int,
    budget_in: BudgetUpdate,
):
    budget = get_budget(
        db=db,
        budget_id=budget_id,
        user_id=user_id,
    )

    if not budget:
        return None

    update_data = budget_in.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)

    return budget


def delete_budget(
    db: Session,
    budget_id: int,
    user_id: int,
):
    budget = get_budget(
        db=db,
        budget_id=budget_id,
        user_id=user_id,
    )

    if not budget:
        return None

    db.delete(budget)
    db.commit()

    return budget
