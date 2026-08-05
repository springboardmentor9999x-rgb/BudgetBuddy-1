
from pydantic import BaseModel, Field, ConfigDict


class BudgetBase(BaseModel):
    category: str = Field(..., description="Category of the budget")
    monthly_limit: float = Field(..., gt=0, description="Monthly limit for the budget")
    
class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category: str | None = Field(None, description="Category of the budget")
    monthly_limit: float | None = Field(None, gt=0, description="Monthly limit for the budget")

class BudgetOut(BudgetBase):
    id: int = Field(..., description="ID of the budget")
    user_id: int = Field(..., description="ID of the user who owns the budget")
    model_config = ConfigDict(from_attributes=True)