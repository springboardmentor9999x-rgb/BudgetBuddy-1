from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional


class ReportSummaryMetrics(BaseModel):
    total_income: float = Field(..., description="Total income for the selected period")
    total_expenses: float = Field(..., description="Total expenses for the selected period")
    net_savings: float = Field(..., description="Net savings (income - expenses)")
    savings_rate: float = Field(..., description="Percentage of income saved (0-100%)")
    total_transactions_count: int = Field(..., description="Total number of income and expense transactions")
    income_count: int = Field(..., description="Total number of income transactions")
    expense_count: int = Field(..., description="Total number of expense transactions")
    avg_income_transaction: float = Field(..., description="Average amount per income transaction")
    avg_expense_transaction: float = Field(..., description="Average amount per expense transaction")
    max_income: float = Field(..., description="Highest single income amount")
    max_expense: float = Field(..., description="Highest single expense amount")
    period_label: str = Field(..., description="Human-readable label of the selected period")
    start_date: Optional[str] = Field(None, description="Start date string (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date string (YYYY-MM-DD)")


class ReportCategoryBreakdown(BaseModel):
    category: str = Field(..., description="Expense category name")
    amount: float = Field(..., description="Total amount spent in this category")
    percentage: float = Field(..., description="Percentage of total expenses")
    count: int = Field(..., description="Number of expense transactions in this category")


class ReportSourceBreakdown(BaseModel):
    source: str = Field(..., description="Income source name")
    amount: float = Field(..., description="Total amount received from this source")
    percentage: float = Field(..., description="Percentage of total income")
    count: int = Field(..., description="Number of income transactions from this source")


class ReportAccountBreakdown(BaseModel):
    account: str = Field(..., description="Account name or identifier")
    income_amount: float = Field(..., description="Total income deposited into this account")
    expense_amount: float = Field(..., description="Total expenses spent from this account")
    net_amount: float = Field(..., description="Net cashflow for this account")
    transaction_count: int = Field(..., description="Total transactions associated with this account")


class ReportTimelineItem(BaseModel):
    label: str = Field(..., description="Timeline label e.g., '2026-08-01' or 'Aug 2026'")
    date_key: str = Field(..., description="Sorting key e.g. '2026-08-01'")
    income: float = Field(..., description="Income amount for this time bucket")
    expenses: float = Field(..., description="Expenses amount for this time bucket")
    net: float = Field(..., description="Net savings for this time bucket")


class ReportUserOption(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str


class ReportTransactionItem(BaseModel):
    id: int = Field(..., description="Transaction ID")
    type: str = Field(..., description="'income' or 'expense'")
    date: datetime = Field(..., description="Transaction timestamp")
    category_or_source: str = Field(..., description="Category (for expense) or Source (for income)")
    description: Optional[str] = Field(None, description="Transaction description or note")
    account: str = Field(default="Cash", description="Associated account identifier")
    amount: float = Field(..., description="Amount (positive value)")
    user_id: Optional[int] = Field(None, description="Owner user ID")
    user_email: Optional[str] = Field(None, description="Owner user email")


class ReportDataResponse(BaseModel):
    summary: ReportSummaryMetrics
    category_breakdown: List[ReportCategoryBreakdown]
    source_breakdown: List[ReportSourceBreakdown]
    account_breakdown: List[ReportAccountBreakdown]
    timeline_breakdown: List[ReportTimelineItem]
    transactions: List[ReportTransactionItem]
    available_years: List[int]
    available_categories: List[str]
    available_accounts: List[str]
    available_users: Optional[List[ReportUserOption]] = None
    selected_user_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
