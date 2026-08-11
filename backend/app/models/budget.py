from sqlalchemy import (
    Column, DateTime, Integer, ForeignKey, String,DECIMAL,
)
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils.utils import get_current_timestamp

class Budget(Base):
    """_summary_

    Args:
        id (int): auto-incrementing primary key
        user_id (int): Foreign key referencing the user who owns the budget
        category (str): The category of the budget (e.g., "Food", "Entertainment", etc.)
        monthly_limit (float): The monthly limit for the budget
        created_at (datetime): Timestamp when the budget was created(defaults to the current timestamp)
    """
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    monthly_limit = Column(DECIMAL(12, 2), nullable=False)
    
    created_at = Column(DateTime, nullable=False, default=get_current_timestamp)

    user = relationship("User", back_populates="budgets")