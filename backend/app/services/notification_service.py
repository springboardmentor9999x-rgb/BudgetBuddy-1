import calendar
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.ws_manager import ws_manager
from app.models.budget import Budget
from app.models.expense import Expense
from app.models.income import Income
from app.models.saving import SavingsGoal
from app.models.account import Account


MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]


async def notify_user(user_id: int, notification: dict):
    """Formats and dispatches a notification payload over WebSocket to user."""
    payload = {
        "type": notification.get("type", "info"),
        "title": notification.get("title", ""),
        "message": notification.get("message", ""),
        "timestamp": notification.get("timestamp") or datetime.now(timezone.utc).isoformat(),
        "dedupKey": notification.get("dedupKey"),
        "showToast": notification.get("showToast", False),
    }
    await ws_manager.send_personal_message(payload, user_id)


def _get_current_month_range():
    now = datetime.now(timezone.utc)
    year = now.year
    month = now.month
    _, last_day = calendar.monthrange(year, month)
    start_dt = datetime(year, month, 1, 0, 0, 0, tzinfo=timezone.utc)
    end_dt = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)
    return year, month, start_dt, end_dt


async def check_budget_notifications(db: Session, user_id: int, target_category: str = None):
    """Evaluates user budgets against current month expenses and sends overspend/warning alerts."""
    year, month, start_dt, end_dt = _get_current_month_range()
    month_name = MONTH_NAMES[month]

    # Query budgets
    query = select(Budget).where(Budget.user_id == user_id)
    if target_category:
        query = query.where(func.lower(Budget.category) == func.lower(target_category.strip()))
    budgets = db.execute(query).scalars().all()

    for budget in budgets:
        limit = float(budget.monthly_limit or 0)
        if limit <= 0:
            continue

        # Sum expenses for this category in current month
        exp_stmt = select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.user_id == user_id,
            func.lower(Expense.category) == func.lower(budget.category.strip()),
            Expense.date >= start_dt,
            Expense.date <= end_dt,
        )
        total_spent = float(db.execute(exp_stmt).scalar() or 0)
        pct = (total_spent / limit) * 100

        if total_spent > limit:
            await notify_user(user_id, {
                "type": "overspend",
                "title": f"⚠️ Budget Exceeded: {budget.category}",
                "message": f"You've spent ₹{total_spent:,.2f} of your ₹{limit:,.2f} limit for {month_name} {year}.",
                "dedupKey": f"budget:{budget.category.lower()}:{year}-{month}:exceeded",
                "showToast": True,
            })
        elif pct >= 80:
            remaining = limit - total_spent
            await notify_user(user_id, {
                "type": "overspend",
                "title": f"⚡ Budget Warning: {budget.category}",
                "message": f'"{budget.category}" is at {pct:.0f}% of monthly limit. ₹{remaining:,.2f} remaining for {month_name}.',
                "dedupKey": f"budget:{budget.category.lower()}:{year}-{month}:warning",
                "showToast": False,
            })


async def check_savings_goal_notifications(db: Session, user_id: int, goal_id: int = None):
    """Evaluates savings goals milestones (75%, 90%, 100%) and sends alerts."""
    query = select(SavingsGoal).where(SavingsGoal.user_id == user_id)
    if goal_id is not None:
        query = query.where(SavingsGoal.id == goal_id)
    goals = db.execute(query).scalars().all()

    for goal in goals:
        target = float(goal.target_amount or 0)
        current = float(goal.current_amount or 0)
        if target <= 0:
            continue

        pct = (current / target) * 100

        if pct >= 100:
            await notify_user(user_id, {
                "type": "goal_complete",
                "title": f"🏆 Goal Achieved: {goal.goal_name}",
                "message": f'"{goal.goal_name}" is fully funded (₹{current:,.2f} / ₹{target:,.2f})! Amazing job!',
                "dedupKey": f"goal:{goal.id}:completed",
                "showToast": True,
            })
        elif pct >= 90:
            remaining = target - current
            await notify_user(user_id, {
                "type": "goal_near",
                "title": f"🔥 Almost There (90%): {goal.goal_name}",
                "message": f'"{goal.goal_name}" has reached {pct:.0f}% (₹{current:,.2f} / ₹{target:,.2f}) — only ₹{remaining:,.2f} left!',
                "dedupKey": f"goal:{goal.id}:near_90",
                "showToast": True,
            })
        elif pct >= 75:
            remaining = target - current
            await notify_user(user_id, {
                "type": "goal_near",
                "title": f"📈 Milestone Progress: {goal.goal_name}",
                "message": f'"{goal.goal_name}" is {pct:.0f}% funded — ₹{remaining:,.2f} to target.',
                "dedupKey": f"goal:{goal.id}:near_75",
                "showToast": False,
            })


async def check_account_overdraft_notifications(db: Session, user_id: int, account_id: int = None):
    """Evaluates if any account has negative balance and sends overdraft alerts."""
    query = select(Account).where(Account.user_id == user_id)
    if account_id is not None:
        query = query.where(Account.id == account_id)
    accounts = db.execute(query).scalars().all()

    for acc in accounts:
        balance = float(acc.balance or 0)
        if balance < 0:
            await notify_user(user_id, {
                "type": "overspend",
                "title": f"⚠️ Overdraft Alert: {acc.bank_name}",
                "message": f"Account ({acc.account_number}) is in deficit with a balance of ₹{balance:,.2f}.",
                "dedupKey": f"account:{acc.id}:negative",
                "showToast": True,
            })


async def check_monthly_deficit_notifications(db: Session, user_id: int):
    """Evaluates if current month expenses exceed incomes and sends monthly deficit alert."""
    year, month, start_dt, end_dt = _get_current_month_range()

    inc_stmt = select(func.coalesce(func.sum(Income.amount), 0)).where(
        Income.user_id == user_id,
        Income.date >= start_dt,
        Income.date <= end_dt,
    )
    month_income = float(db.execute(inc_stmt).scalar() or 0)

    exp_stmt = select(func.coalesce(func.sum(Expense.amount), 0)).where(
        Expense.user_id == user_id,
        Expense.date >= start_dt,
        Expense.date <= end_dt,
    )
    month_expense = float(db.execute(exp_stmt).scalar() or 0)

    if month_income > 0 and month_expense > month_income:
        diff = month_expense - month_income
        await notify_user(user_id, {
            "type": "overspend",
            "title": "⚠️ Monthly Spending Deficit",
            "message": f"Current month expenses (₹{month_expense:,.2f}) exceed income (₹{month_income:,.2f}) by ₹{diff:,.2f}.",
            "dedupKey": f"deficit:{year}-{month}",
            "showToast": True,
        })


async def evaluate_initial_user_notifications(db: Session, user_id: int):
    """Runs all notification checks upon initial WebSocket connection."""
    await check_budget_notifications(db, user_id)
    await check_savings_goal_notifications(db, user_id)
    await check_account_overdraft_notifications(db, user_id)
    await check_monthly_deficit_notifications(db, user_id)
