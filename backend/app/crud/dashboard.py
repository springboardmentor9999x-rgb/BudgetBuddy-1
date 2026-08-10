from datetime import datetime, timedelta, timezone
from calendar import month_abbr, month_name
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.income import Income
from app.models.expense import Expense
from app.models.account import Account
from app.schemas.dashboard import (
    DashboardStatsResponse,
    UserStats,
    WeeklyOverview,
    MonthlyOverview,
    MonthlyBreakdownItem,
    CategorySpendingItem,
    RecentTransaction,
)


def calc_pct_change(current: float, previous: float) -> float:
    """Calculate percentage change between current and previous values."""
    if previous == 0:
        if current > 0:
            return 100.0
        elif current == 0:
            return 0.0
        else:
            return -100.0
    return round(((current - previous) / abs(previous)) * 100, 1)


def get_dashboard_stats(db: Session, user_id: int) -> DashboardStatsResponse:
    """
    Computes all dashboard statistics for a given user including:
    - User stats (total balance, current month income, expenses, savings, and MoM changes)
    - Weekly overview (day-by-day income vs expense for the current week)
    - Monthly overview (current month stats & last 6 months breakdown)
    - Category spending breakdown
    - Recent combined transactions
    """
    now = datetime.now(timezone.utc)
    
    # ---------------- 1. Total Balance & All-Time Stats ----------------
    # Sum of account balances
    account_sum_stmt = select(func.sum(Account.balance)).where(Account.user_id == user_id)
    acct_balance_result = db.execute(account_sum_stmt).scalar()
    
    # All time totals
    all_income_stmt = select(func.sum(Income.amount)).where(Income.user_id == user_id)
    all_income = float(db.execute(all_income_stmt).scalar() or 0)
    
    all_expense_stmt = select(func.sum(Expense.amount)).where(Expense.user_id == user_id)
    all_expenses = float(db.execute(all_expense_stmt).scalar() or 0)
    
    if acct_balance_result is not None:
        total_balance = float(acct_balance_result)
    else:
        total_balance = all_income - all_expenses

    # ---------------- 2. Current & Previous Month Stats ----------------
    start_of_current_month = datetime(now.year, now.month, 1)
    if now.month == 12:
        end_of_current_month = datetime(now.year + 1, 1, 1)
    else:
        end_of_current_month = datetime(now.year, now.month + 1, 1)
        
    if now.month == 1:
        start_of_prev_month = datetime(now.year - 1, 12, 1)
    else:
        start_of_prev_month = datetime(now.year, now.month - 1, 1)
    end_of_prev_month = start_of_current_month

    # Current month income & expenses
    cur_income_stmt = select(func.sum(Income.amount)).where(
        Income.user_id == user_id,
        Income.date >= start_of_current_month,
        Income.date < end_of_current_month
    )
    current_month_income = float(db.execute(cur_income_stmt).scalar() or 0)

    cur_expense_stmt = select(func.sum(Expense.amount)).where(
        Expense.user_id == user_id,
        Expense.date >= start_of_current_month,
        Expense.date < end_of_current_month
    )
    current_month_expenses = float(db.execute(cur_expense_stmt).scalar() or 0)
    current_month_savings = current_month_income - current_month_expenses

    # Previous month income & expenses
    prev_income_stmt = select(func.sum(Income.amount)).where(
        Income.user_id == user_id,
        Income.date >= start_of_prev_month,
        Income.date < end_of_prev_month
    )
    prev_month_income = float(db.execute(prev_income_stmt).scalar() or 0)

    prev_expense_stmt = select(func.sum(Expense.amount)).where(
        Expense.user_id == user_id,
        Expense.date >= start_of_prev_month,
        Expense.date < end_of_prev_month
    )
    prev_month_expenses = float(db.execute(prev_expense_stmt).scalar() or 0)
    prev_month_savings = prev_month_income - prev_month_expenses

    # MoM Changes
    income_change = calc_pct_change(current_month_income, prev_month_income)
    expense_change = calc_pct_change(current_month_expenses, prev_month_expenses)
    savings_change = calc_pct_change(current_month_savings, prev_month_savings)

    # Balance change calculation (estimated relative to net change)
    prev_balance = total_balance - (current_month_savings)
    balance_change = calc_pct_change(total_balance, prev_balance)

    user_stats = UserStats(
        balance=total_balance,
        income=current_month_income,
        expenses=current_month_expenses,
        savings=current_month_savings,
        monthly_change=savings_change,
        balance_change=balance_change,
        income_change=income_change,
        expense_change=expense_change,
    )

    # ---------------- 3. Weekly Overview (Current Week Mon-Sun) ----------------
    week_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    start_of_week = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
    
    weekly_income_data = []
    weekly_expense_data = []

    for i in range(7):
        day_start = start_of_week + timedelta(days=i)
        day_end = day_start + timedelta(days=1)

        day_inc_stmt = select(func.sum(Income.amount)).where(
            Income.user_id == user_id,
            Income.date >= day_start,
            Income.date < day_end
        )
        day_exp_stmt = select(func.sum(Expense.amount)).where(
            Expense.user_id == user_id,
            Expense.date >= day_start,
            Expense.date < day_end
        )

        inc_val = float(db.execute(day_inc_stmt).scalar() or 0)
        exp_val = float(db.execute(day_exp_stmt).scalar() or 0)

        weekly_income_data.append(inc_val)
        weekly_expense_data.append(exp_val)

    weekly_overview = WeeklyOverview(
        labels=week_days,
        income_data=weekly_income_data,
        expense_data=weekly_expense_data,
    )

    # ---------------- 4. Monthly Overview & Last 6 Months Breakdown ----------------
    monthly_breakdown = []
    for i in range(5, -1, -1):
        # Calculate target year and month
        target_month_num = now.month - i
        target_year = now.year
        while target_month_num <= 0:
            target_month_num += 12
            target_year -= 1

        m_start = datetime(target_year, target_month_num, 1)
        if target_month_num == 12:
            m_end = datetime(target_year + 1, 1, 1)
        else:
            m_end = datetime(target_year, target_month_num + 1, 1)

        m_inc_stmt = select(func.sum(Income.amount)).where(
            Income.user_id == user_id,
            Income.date >= m_start,
            Income.date < m_end
        )
        m_exp_stmt = select(func.sum(Expense.amount)).where(
            Expense.user_id == user_id,
            Expense.date >= m_start,
            Expense.date < m_end
        )

        m_inc = float(db.execute(m_inc_stmt).scalar() or 0)
        m_exp = float(db.execute(m_exp_stmt).scalar() or 0)
        m_sav = m_inc - m_exp

        monthly_breakdown.append(
            MonthlyBreakdownItem(
                month=month_abbr[target_month_num],
                year=target_year,
                income=m_inc,
                expenses=m_exp,
                savings=m_sav,
            )
        )

    current_month_str = f"{month_name[now.month]} {now.year}"
    monthly_overview = MonthlyOverview(
        current_month=current_month_str,
        monthly_income=current_month_income,
        monthly_expenses=current_month_expenses,
        monthly_savings=current_month_savings,
        monthly_change_pct=savings_change,
        monthly_breakdown=monthly_breakdown,
    )

    # ---------------- 5. Category Spending ----------------
    cat_stmt = select(Expense.category, func.sum(Expense.amount)).where(
        Expense.user_id == user_id
    ).group_by(Expense.category)
    cat_results = db.execute(cat_stmt).all()

    total_cat_expenses = sum([float(r[1] or 0) for r in cat_results])
    category_spending = []

    for cat_name, cat_amt in cat_results:
        amt = float(cat_amt or 0)
        pct = round((amt / total_cat_expenses * 100), 1) if total_cat_expenses > 0 else 0.0
        category_spending.append(
            CategorySpendingItem(
                category=cat_name,
                amount=amt,
                percentage=pct,
            )
        )

    # Sort category spending by amount descending
    category_spending.sort(key=lambda x: x.amount, reverse=True)

    # ---------------- 6. Recent Transactions ----------------
    recent_incomes_stmt = select(Income).where(Income.user_id == user_id).order_by(Income.date.desc()).limit(10)
    recent_expenses_stmt = select(Expense).where(Expense.user_id == user_id).order_by(Expense.date.desc()).limit(10)

    incomes_list = db.execute(recent_incomes_stmt).scalars().all()
    expenses_list = db.execute(recent_expenses_stmt).scalars().all()

    tx_list = []
    for inc in incomes_list:
        tx_list.append(
            RecentTransaction(
                id=inc.id,
                type="income",
                description=inc.source,
                amount=float(inc.amount),
                category="Income",
                date=inc.date,
                account=inc.account or "Cash",
            )
        )

    for exp in expenses_list:
        tx_list.append(
            RecentTransaction(
                id=exp.id,
                type="expense",
                description=exp.description or exp.category,
                amount=-float(exp.amount),
                category=exp.category,
                date=exp.date,
                account=exp.account or "Cash",
            )
        )

    # Sort combined transactions by date descending and limit to top 10
    tx_list.sort(key=lambda t: t.date, reverse=True)
    recent_transactions = tx_list[:10]

    return DashboardStatsResponse(
        user_stats=user_stats,
        weekly_overview=weekly_overview,
        monthly_overview=monthly_overview,
        category_spending=category_spending,
        recent_transactions=recent_transactions,
    )
