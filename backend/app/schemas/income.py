from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime



class IncomeBase(BaseModel):
    amount: float = Field(..., description="Amount of income")
    source: str = Field(..., description="Source of income")
    date: datetime = Field(..., description="Date of income")

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(BaseModel):
    amount: float | None = Field(None, description="Amount of income")
    source: str | None = Field(None, description="Source of income")
    date: datetime | None = Field(None, description="Date of income")

class IncomeResponse(IncomeBase):
    id: int = Field(..., description="ID of the income record")
    user_id: int = Field(..., description="ID of the user associated with the income record")

    model_config = ConfigDict(from_attributes=True)