
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.utils.utils import get_current_timestamp

class BudgetBase(BaseModel):
    category: str = Field(..., description="Category of the budget")
    monthly_limit: float = Field(..., gt=0, description="Monthly limit for the budget")
    created_at: datetime = Field(..., description="Timestamp when the budget was created", default_factory=get_current_timestamp)

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category: str | None = Field(None, description="Category of the budget")
    monthly_limit: float | None = Field(None, gt=0, description="Monthly limit for the budget")

class BudgetOut(BudgetBase):
    id: int = Field(..., description="ID of the budget")

    model_config = ConfigDict(from_attributes=True)