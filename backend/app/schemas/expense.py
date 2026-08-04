from datetime import datetime

from pydantic import BaseModel, Field


class ExpenseBase(BaseModel):
    category: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    amount: float = Field(
        ...,
        gt=0
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    amount: float | None = Field(
        default=None,
        gt=0
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )


class ExpenseOut(ExpenseBase):
    id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True