from datetime import datetime, timedelta, timezone
from calendar import month_abbr, month_name
from typing import Optional
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


def get_dashboard_stats(
    db: Session,
    user_id: int,
    month: Optional[int] = None,
    year: Optional[int] = None
) -> DashboardStatsResponse:
    """
    Computes dashboard statistics for a given user filtered by optional month and year.
    If month is provided (1-12) and year is provided, filters for that specific month.
    If only year is provided, filters for that entire year (showing 12-month breakdown).
    If neither is provided, defaults to current month with historical context.
    """
    now = datetime.now(timezone.utc)
    target_year = year if year is not None and year > 0 else now.year
    target_month = month if month is not None and 1 <= month <= 12 else None
    
    # ---------------- 1. Total Balance & All-Time Stats ----------------
    account_sum_stmt = select(func.sum(Account.balance)).where(Account.user_id == user_id)
    acct_balance_result = db.execute(account_sum_stmt).scalar()
    
    all_income_stmt = select(func.sum(Income.amount)).where(Income.user_id == user_id)
    all_income = float(db.execute(all_income_stmt).scalar() or 0)
    
    all_expense_stmt = select(func.sum(Expense.amount)).where(Expense.user_id == user_id)
    all_expenses = float(db.execute(all_expense_stmt).scalar() or 0)
    
    if acct_balance_result is not None:
        total_balance = float(acct_balance_result)
    else:
        total_balance = all_income - all_expenses

    # ---------------- 2. Period Filtering Setup ----------------
    if target_month is not None:
        # Single Month Mode
        start_date = datetime(target_year, target_month, 1)
        if target_month == 12:
            end_date = datetime(target_year + 1, 1, 1)
        else:
            end_date = datetime(target_year, target_month + 1, 1)
            
        # Comparison Previous Month
        if target_month == 1:
            prev_start = datetime(target_year - 1, 12, 1)
        else:
            prev_start = datetime(target_year, target_month - 1, 1)
        prev_end = start_date
        period_label = f"{month_name[target_month]} {target_year}"
    elif year is not None:
        # Full Year Mode
        start_date = datetime(target_year, 1, 1)
        end_date = datetime(target_year + 1, 1, 1)
        prev_start = datetime(target_year - 1, 1, 1)
        prev_end = datetime(target_year, 1, 1)
        period_label = f"Year {target_year}"
    else:
        # Default: Current Month
        start_date = datetime(now.year, now.month, 1)
        if now.month == 12:
            end_date = datetime(now.year + 1, 1, 1)
        else:
            end_date = datetime(now.year, now.month + 1, 1)
            
        if now.month == 1:
            prev_start = datetime(now.year - 1, 12, 1)
        else:
            prev_start = datetime(now.year, now.month - 1, 1)
        prev_end = start_date
        period_label = f"{month_name[now.month]} {now.year}"

    # Period income & expenses
    cur_income_stmt = select(func.sum(Income.amount)).where(
        Income.user_id == user_id,
        Income.date >= start_date,
        Income.date < end_date
    )
    period_income = float(db.execute(cur_income_stmt).scalar() or 0)

    cur_expense_stmt = select(func.sum(Expense.amount)).where(
        Expense.user_id == user_id,
        Expense.date >= start_date,
        Expense.date < end_date
    )
    period_expenses = float(db.execute(cur_expense_stmt).scalar() or 0)
    period_savings = period_income - period_expenses

    # Previous period income & expenses for comparison
    prev_income_stmt = select(func.sum(Income.amount)).where(
        Income.user_id == user_id,
        Income.date >= prev_start,
        Income.date < prev_end
    )
    prev_period_income = float(db.execute(prev_income_stmt).scalar() or 0)

    prev_expense_stmt = select(func.sum(Expense.amount)).where(
        Expense.user_id == user_id,
        Expense.date >= prev_start,
        Expense.date < prev_end
    )
    prev_period_expenses = float(db.execute(prev_expense_stmt).scalar() or 0)
    prev_period_savings = prev_period_income - prev_period_expenses

    # Changes
    income_change = calc_pct_change(period_income, prev_period_income)
    expense_change = calc_pct_change(period_expenses, prev_period_expenses)
    savings_change = calc_pct_change(period_savings, prev_period_savings)

    prev_balance = total_balance - period_savings
    balance_change = calc_pct_change(total_balance, prev_balance)

    user_stats = UserStats(
        balance=total_balance,
        income=period_income,
        expenses=period_expenses,
        savings=period_savings,
        monthly_change=savings_change,
        balance_change=balance_change,
        income_change=income_change,
        expense_change=expense_change,
    )

    # ---------------- 3. Overview Bar Chart Data ----------------
    if target_month is None and year is not None:
        # 12 Months Breakdown for the Year
        chart_labels = [month_abbr[m] for m in range(1, 13)]
        chart_income_data = []
        chart_expense_data = []

        for m in range(1, 13):
            m_start = datetime(target_year, m, 1)
            m_end = datetime(target_year + 1, 1, 1) if m == 12 else datetime(target_year, m + 1, 1)
            
            inc_stmt = select(func.sum(Income.amount)).where(
                Income.user_id == user_id,
                Income.date >= m_start,
                Income.date < m_end
            )
            exp_stmt = select(func.sum(Expense.amount)).where(
                Expense.user_id == user_id,
                Expense.date >= m_start,
                Expense.date < m_end
            )
            chart_income_data.append(float(db.execute(inc_stmt).scalar() or 0))
            chart_expense_data.append(float(db.execute(exp_stmt).scalar() or 0))
    else:
        # Weekly Overview for the Target Period (or Current Week)
        ref_date = start_date if target_month is not None else now
        chart_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        start_of_week = datetime(ref_date.year, ref_date.month, ref_date.day) - timedelta(days=ref_date.weekday())
        
        chart_income_data = []
        chart_expense_data = []

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
            chart_income_data.append(float(db.execute(day_inc_stmt).scalar() or 0))
            chart_expense_data.append(float(db.execute(day_exp_stmt).scalar() or 0))

    weekly_overview = WeeklyOverview(
        labels=chart_labels,
        income_data=chart_income_data,
        expense_data=chart_expense_data,
    )

    # ---------------- 4. Monthly History Breakdown ----------------
    monthly_breakdown = []
    base_m = target_month if target_month is not None else now.month
    base_y = target_year

    for i in range(5, -1, -1):
        m_num = base_m - i
        y_num = base_y
        while m_num <= 0:
            m_num += 12
            y_num -= 1

        m_start = datetime(y_num, m_num, 1)
        m_end = datetime(y_num + 1, 1, 1) if m_num == 12 else datetime(y_num, m_num + 1, 1)

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
                month=month_abbr[m_num],
                year=y_num,
                income=m_inc,
                expenses=m_exp,
                savings=m_sav,
            )
        )

    monthly_overview = MonthlyOverview(
        current_month=period_label,
        monthly_income=period_income,
        monthly_expenses=period_expenses,
        monthly_savings=period_savings,
        monthly_change_pct=savings_change,
        monthly_breakdown=monthly_breakdown,
    )

    # ---------------- 5. Category Spending (Filtered for period) ----------------
    cat_stmt = select(Expense.category, func.sum(Expense.amount)).where(
        Expense.user_id == user_id,
        Expense.date >= start_date,
        Expense.date < end_date
    ).group_by(Expense.category)
    cat_results = db.execute(cat_stmt).all()

    # Fallback to all-time categories if no expenses exist in the period yet
    if not cat_results and (month is None and year is None):
        all_cat_stmt = select(Expense.category, func.sum(Expense.amount)).where(
            Expense.user_id == user_id
        ).group_by(Expense.category)
        cat_results = db.execute(all_cat_stmt).all()

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

    category_spending.sort(key=lambda x: x.amount, reverse=True)

    # ---------------- 6. Recent Transactions ----------------
    # Filter recent transactions for the selected period
    recent_incomes_stmt = select(Income).where(
        Income.user_id == user_id,
        Income.date >= start_date,
        Income.date < end_date
    ).order_by(Income.date.desc()).limit(15)

    recent_expenses_stmt = select(Expense).where(
        Expense.user_id == user_id,
        Expense.date >= start_date,
        Expense.date < end_date
    ).order_by(Expense.date.desc()).limit(15)

    incomes_list = db.execute(recent_incomes_stmt).scalars().all()
    expenses_list = db.execute(recent_expenses_stmt).scalars().all()

    # Fallback to global recent if none found in period
    if not incomes_list and not expenses_list:
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

    tx_list.sort(key=lambda t: t.date, reverse=True)
    recent_transactions = tx_list[:12]

    return DashboardStatsResponse(
        user_stats=user_stats,
        weekly_overview=weekly_overview,
        monthly_overview=monthly_overview,
        category_spending=category_spending,
        recent_transactions=recent_transactions,
    )

