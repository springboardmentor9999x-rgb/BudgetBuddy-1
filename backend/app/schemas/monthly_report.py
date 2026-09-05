from pydantic import BaseModel


class MonthlyReportOut(BaseModel):
    month: str

    total_income: float
    total_expense: float
    net_savings: float

    expense_count: int
    income_count: int

    highest_expense_category: str | None = None
    highest_expense_amount: float = 0.0
