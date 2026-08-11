from pydantic import BaseModel, Field, ConfigDict
from datetime import date

class SavingGoalBase(BaseModel):
    goal_name: str = Field(..., max_length=100, description="The name of the savings goal")
    target_amount: float = Field(..., gt=0, description="The target amount for the savings goal")
    current_amount: float = Field(..., ge=0, description="The current amount saved towards the goal")
    target_date: date = Field(..., description="The target date for achieving the savings goal")

class SavingGoalCreate(SavingGoalBase):
    pass

class SavingGoalResponse(SavingGoalBase):
    id: int
        
    model_config = ConfigDict(from_attributes=True)
    

class SavingGoalUpdate(BaseModel):
    goal_name: str | None = Field(None, max_length=100, description="The name of the savings goal")
    target_amount: float | None = Field(None, gt=0, description="The target amount for the savings goal")
    current_amount: float | None = Field(None, ge=0, description="The current amount saved towards the goal")
    target_date: date | None = Field(None, description="The target date for achieving the savings goal")