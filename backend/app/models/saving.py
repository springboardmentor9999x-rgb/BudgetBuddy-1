from sqlalchemy import (
    Column, Integer, ForeignKey, String,DECIMAL
)
from sqlalchemy.orm import relationship

from app.database import Base


class SavingsGoal(Base):
    """_summary_

    Args:
        id (int): auto-incrementing primary key
        user_id (int): Foreign key referencing the user who owns the savings goal
        goal_name (str): The name of the savings goal
        target_amount (float): The target amount for the savings goal
        current_amount (float): The current amount saved towards the goal
    """
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_name = Column(String(100), nullable=False)
    target_amount = Column(DECIMAL(12, 2), nullable=False)
    current_amount = Column(
        DECIMAL(12, 2),
        nullable=False,
    )

    user = relationship("User", back_populates="savings_goals")