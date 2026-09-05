from pydantic import BaseModel


# ==========================================
# FINANCIAL SUMMARY
# ==========================================

class AnalyticsSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float


# ==========================================
# MONTHLY ANALYTICS
# ==========================================

class MonthlyAnalytics(BaseModel):
    year: int
    month: int
    income: float
    expenses: float
    net_savings: float


# ==========================================
# CATEGORY ANALYTICS
# ==========================================

class CategoryAnalytics(BaseModel):
    category: str
    total_amount: float


# ==========================================
# ANALYTICS RESPONSE
# ==========================================

class AnalyticsOverview(BaseModel):
    summary: AnalyticsSummary
    monthly: list[MonthlyAnalytics]
    categories: list[CategoryAnalytics]