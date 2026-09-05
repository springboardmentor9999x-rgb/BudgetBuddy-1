from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ==========================================
# ALLOWED INCOME CATEGORIES
# ==========================================

IncomeCategory = Literal[
    "Salary",
    "Freelance",
    "Business",
    "Other",
]


# ==========================================
# BASE INCOME SCHEMA
# ==========================================

class IncomeBase(BaseModel):
    source: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    amount: float = Field(
        ...,
        gt=0,
    )

    account_id: int | None = Field(
        default=None,
        gt=0,
    )

    # Description is REQUIRED
    description: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )

    # Only predefined categories are allowed
    category: IncomeCategory


# ==========================================
# CREATE INCOME
# ==========================================

class IncomeCreate(IncomeBase):
    pass


# ==========================================
# UPDATE INCOME
# ==========================================

class IncomeUpdate(BaseModel):
    source: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    amount: float | None = Field(
        default=None,
        gt=0,
    )

    account_id: int | None = Field(
        default=None,
        gt=0,
    )

    description: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )

    # If category is supplied during update,
    # it must be one of the predefined categories.
    category: IncomeCategory | None = None


# ==========================================
# INCOME OUTPUT
# ==========================================

class IncomeOut(IncomeBase):
    id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True


# ==========================================
# INCOME SUMMARY
# ==========================================

class IncomeSummary(BaseModel):
    total_income: float