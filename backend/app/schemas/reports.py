from datetime import datetime

from pydantic import BaseModel


# ==========================================
# REPORT SUMMARY
# ==========================================

class ReportSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    savings: float


# ==========================================
# EXPENSE CATEGORY
# ==========================================

class ReportCategory(BaseModel):
    category: str
    total_amount: float
    transaction_count: int


# ==========================================
# TRANSACTION
# ==========================================

class ReportTransaction(BaseModel):
    id: int
    type: str
    date: datetime
    category: str | None = None
    source: str | None = None
    amount: float
    payment_method: str | None = None
    description: str
    account_id: int | None = None


# ==========================================
# VERIFICATION
# ==========================================

class ReportVerification(BaseModel):
    income_count: int
    expense_count: int
    transaction_count: int


# ==========================================
# COMPLETE REPORT
# ==========================================

class ReportOut(BaseModel):
    period: str
    start_date: datetime
    end_date: datetime

    summary: ReportSummary

    expense_categories: list[ReportCategory]

    transactions: list[ReportTransaction]

    verification: ReportVerification
