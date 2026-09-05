from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# BASE EXPENSE SCHEMA
# ==========================================

class ExpenseBase(BaseModel):
    # Expense category is REQUIRED
    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    # Amount is REQUIRED and must be greater than 0
    amount: float = Field(
        ...,
        gt=0,
    )

    # Bank account is optional
    account_id: int | None = Field(
        default=None,
        gt=0,
    )

    # Payment method is optional
    payment_method: str | None = Field(
        default=None,
        max_length=50,
    )

    # Description is REQUIRED
    description: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )


# ==========================================
# CREATE EXPENSE
# ==========================================

class ExpenseCreate(ExpenseBase):
    pass


# ==========================================
# UPDATE EXPENSE
# ==========================================

class ExpenseUpdate(BaseModel):
    # Category can be updated
    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    # Amount can be updated
    amount: float | None = Field(
        default=None,
        gt=0,
    )

    # Account can be changed or removed
    account_id: int | None = Field(
        default=None,
        gt=0,
    )

    # Payment method can be updated
    payment_method: str | None = Field(
        default=None,
        max_length=50,
    )

    # Description is optional ONLY during partial update
    description: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )


# ==========================================
# EXPENSE OUTPUT
# ==========================================

class ExpenseOut(ExpenseBase):
    id: int
    user_id: int
    date: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================
# EXPENSE SUMMARY
# ==========================================

class ExpenseSummary(BaseModel):
    total_expense: float