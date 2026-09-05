from pydantic import BaseModel, Field


class BudgetBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    limit: float = Field(..., gt=0)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    limit: float | None = Field(
        default=None,
        gt=0,
    )


class BudgetOut(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
