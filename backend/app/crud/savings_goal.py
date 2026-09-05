from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.savings_goal import SavingsGoal
from app.models.notification import Notification
from app.models.expense import Expense
from app.models.account import Account
from app.models.income import Income

from app.schemas.savings_goal import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
)


# ==========================================
# CREATE SAVINGS GOAL
# ==========================================

def create_savings_goal(
    db: Session,
    user_id: int,
    goal_in: SavingsGoalCreate,
):
    goal = SavingsGoal(
        user_id=user_id,
        title=goal_in.title,
        target_amount=goal_in.target_amount,
        current_amount=0.0,
        target_date=goal_in.target_date,
        status="in_progress",
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return goal


# ==========================================
# GET ALL SAVINGS GOALS
# ==========================================

def get_savings_goals_by_user(
    db: Session,
    user_id: int,
):
    return (
        db.query(SavingsGoal)
        .filter(
            SavingsGoal.user_id == user_id
        )
        .order_by(
            SavingsGoal.id.desc()
        )
        .all()
    )


# ==========================================
# GET ONE SAVINGS GOAL
# ==========================================

def get_savings_goal(
    db: Session,
    goal_id: int,
    user_id: int,
):
    return (
        db.query(SavingsGoal)
        .filter(
            SavingsGoal.id == goal_id,
            SavingsGoal.user_id == user_id,
        )
        .first()
    )


# ==========================================
# UPDATE SAVINGS GOAL
# ==========================================

def update_savings_goal(
    db: Session,
    goal_id: int,
    user_id: int,
    goal_in: SavingsGoalUpdate,
):
    goal = get_savings_goal(
        db=db,
        goal_id=goal_id,
        user_id=user_id,
    )

    if not goal:
        return None

    update_data = goal_in.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)

    return goal


# ==========================================
# DELETE SAVINGS GOAL
# ==========================================

def delete_savings_goal(
    db: Session,
    goal_id: int,
    user_id: int,
):
    goal = get_savings_goal(
        db=db,
        goal_id=goal_id,
        user_id=user_id,
    )

    if not goal:
        return None

    db.delete(goal)
    db.commit()

    return goal


# ==========================================
# CONTRIBUTE TO SAVINGS GOAL
# ==========================================

def contribute_to_savings_goal(
    db: Session,
    goal_id: int,
    user_id: int,
    amount: float,
    account_id: int,
):
    goal = get_savings_goal(
        db=db,
        goal_id=goal_id,
        user_id=user_id,
    )

    if not goal:
        return None

    # ==========================================
    # SAFETY CHECKS
    # ==========================================

    if amount <= 0:
        raise ValueError(
            "Contribution amount must be greater than zero."
        )

    target_amount = float(
        goal.target_amount or 0
    )

    previous_amount = float(
        goal.current_amount or 0
    )

    if target_amount <= 0:
        raise ValueError(
            "Savings goal target amount must be greater than zero."
        )

    # ==========================================
    # SELECTED ACCOUNT VALIDATION
    # ==========================================

    account = (
        db.query(Account)
        .filter(
            Account.id == account_id,
            Account.user_id == user_id,
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Selected bank account not found.",
        )

    # ==========================================
    # CALCULATE ACCOUNT AVAILABLE BALANCE
    # ==========================================

    total_income = (
        db.query(Income)
        .filter(
            Income.account_id == account_id,
            Income.user_id == user_id,
        )
        .with_entities(Income.amount)
        .all()
    )

    total_expenses = (
        db.query(Expense)
        .filter(
            Expense.account_id == account_id,
            Expense.user_id == user_id,
        )
        .with_entities(Expense.amount)
        .all()
    )

    available_balance = (
        sum(float(row[0] or 0) for row in total_income)
        - sum(float(row[0] or 0) for row in total_expenses)
    )

    # ==========================================
    # INSUFFICIENT BALANCE CHECK
    # ==========================================

    available_balance = max(
        float(available_balance),
        0.0,
    )

    if float(amount) > available_balance:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Insufficient Balance",
                "available_balance": round(
                    available_balance,
                    2,
                ),
            },
        )

    # ==========================================
    # CALCULATE CONTRIBUTION
    # ==========================================

    remaining_before = max(
        target_amount - previous_amount,
        0,
    )

    # Never allow contribution to exceed
    # the remaining target amount.
    actual_contribution = min(
        float(amount),
        remaining_before,
    )

    if actual_contribution <= 0:
        raise ValueError(
            "This savings goal is already completed."
        )

    new_amount = (
        previous_amount +
        actual_contribution
    )

    previous_percentage = (
        previous_amount / target_amount
    )

    new_percentage = (
        new_amount / target_amount
    )

    # ==========================================
    # CREATE EXPENSE
    # ==========================================

    savings_expense = Expense(
        user_id=user_id,
        account_id=account_id,
        category="Savings",
        amount=actual_contribution,
        payment_method="Savings Goal",
        description=(
            f"Contribution to savings goal "
            f"'{goal.title}'"
        ),
        date=datetime.utcnow(),
    )

    db.add(savings_expense)

    # ==========================================
    # UPDATE SAVINGS GOAL
    # ==========================================

    goal.current_amount = new_amount

    # ==========================================
    # 50% MILESTONE
    # ==========================================

    if (
        previous_percentage < 0.50
        and new_percentage >= 0.50
        and new_percentage < 1.00
    ):
        notification = Notification(
            user_id=user_id,
            message=(
                f"Great progress! Your savings goal "
                f"'{goal.title}' has reached 50%."
            ),
            type="goal_milestone",
            is_read=False,
        )

        db.add(notification)

    # ==========================================
    # 100% COMPLETION
    # ==========================================

    if new_amount >= target_amount:
        goal.current_amount = target_amount
        goal.status = "completed"

        if previous_amount < target_amount:
            notification = Notification(
                user_id=user_id,
                message=(
                    f"Congratulations! You completed "
                    f"your savings goal '{goal.title}'."
                ),
                type="goal_milestone",
                is_read=False,
            )

            db.add(notification)

    else:
        goal.status = "in_progress"

    # ==========================================
    # SAVE EVERYTHING
    # ==========================================

    db.commit()
    db.refresh(goal)

    return goal

