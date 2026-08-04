from sqlalchemy import (
    Column, Integer, ForeignKey, String,DECIMAL
)
from sqlalchemy.orm import relationship

from app.database import Base


class SavingsGoal(Base):
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