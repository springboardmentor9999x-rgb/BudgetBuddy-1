from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional


class UserStats(BaseModel):
    balance: float = Field(..., description="Total available balance across accounts or net total")
    income: float = Field(..., description="Total income for current month")
    expenses: float = Field(..., description="Total expenses for current month")
    savings: float = Field(..., description="Total savings for current month")
    monthly_change: float = Field(..., description="Percentage change in savings compared to last month")
    balance_change: float = Field(..., description="Percentage change in total balance vs last month")
    income_change: float = Field(..., description="Percentage change in income vs last month")
    expense_change: float = Field(..., description="Percentage change in expenses vs last month")


class WeeklyOverview(BaseModel):
    labels: List[str] = Field(..., description="Days of the week labels, e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']")
    income_data: List[float] = Field(..., description="Income values for each day of current week")
    expense_data: List[float] = Field(..., description="Expense values for each day of current week")


class CategorySpendingItem(BaseModel):
    category: str = Field(..., description="Category name")
    amount: float = Field(..., description="Total expense amount in this category")
    percentage: float = Field(..., description="Percentage of total spending")


class MonthlyBreakdownItem(BaseModel):
    month: str = Field(..., description="Month abbreviation e.g. Jan, Feb, Mar")
    year: int = Field(..., description="Year e.g. 2026")
    income: float = Field(..., description="Total income for the month")
    expenses: float = Field(..., description="Total expenses for the month")
    savings: float = Field(..., description="Net savings for the month")


class MonthlyOverview(BaseModel):
    current_month: str = Field(..., description="Current month label e.g. August 2026")
    monthly_income: float = Field(..., description="Current month total income")
    monthly_expenses: float = Field(..., description="Current month total expenses")
    monthly_savings: float = Field(..., description="Current month total savings")
    monthly_change_pct: float = Field(..., description="Month-over-month savings percentage change")
    monthly_breakdown: List[MonthlyBreakdownItem] = Field(default_factory=list, description="Historical monthly breakdown for recent months")


class RecentTransaction(BaseModel):
    id: int = Field(..., description="Transaction ID")
    type: str = Field(..., description="Transaction type: 'income' or 'expense'")
    description: str = Field(..., description="Description or source of transaction")
    amount: float = Field(..., description="Transaction amount (positive for income, negative for expense)")
    category: str = Field(..., description="Category of transaction")
    date: datetime = Field(..., description="Date and time of transaction")
    account: str = Field(default="Cash", description="Associated account name")


class DashboardStatsResponse(BaseModel):
    user_stats: UserStats
    weekly_overview: WeeklyOverview
    monthly_overview: MonthlyOverview
    category_spending: List[CategorySpendingItem]
    recent_transactions: List[RecentTransaction]

    model_config = ConfigDict(from_attributes=True)
