
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class ExpenseBase(BaseModel):
    category: str = Field(..., max_length=50, description="The category of the expense, maximum length of 50 characters")
    amount: float = Field(..., gt=0, description="The amount of the expense, must be greater than 0")
    description: str | None = Field(None, description="An optional description of the expense")
    date: datetime = Field(..., description="The date and time of the expense in ISO 8601 format")

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseOut(ExpenseBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
