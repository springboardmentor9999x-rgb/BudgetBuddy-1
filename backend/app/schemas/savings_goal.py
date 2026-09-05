from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# BASE SAVINGS GOAL
# ==========================================

class SavingsGoalBase(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    target_amount: float = Field(
        ...,
        gt=0,
    )

    target_date: datetime | None = None


# ==========================================
# CREATE SAVINGS GOAL
# ==========================================

class SavingsGoalCreate(SavingsGoalBase):
    pass


# ==========================================
# UPDATE SAVINGS GOAL
# ==========================================

class SavingsGoalUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    target_amount: float | None = Field(
        default=None,
        gt=0,
    )

    target_date: datetime | None = None


# ==========================================
# SAVINGS GOAL OUTPUT
# ==========================================

class SavingsGoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    current_amount: float
    target_date: datetime | None = None
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================
# CONTRIBUTION
# ==========================================

class SavingsGoalContribution(BaseModel):
    amount: float = Field(
        ...,
        gt=0,
    )

    account_id: int = Field(
        ...,
        gt=0,
    )
