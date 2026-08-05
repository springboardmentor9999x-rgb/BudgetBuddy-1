from sqlalchemy import (
    Column, Integer, ForeignKey, String,DECIMAL,
)
from sqlalchemy.orm import relationship
from app.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    monthly_limit = Column(DECIMAL(12, 2), nullable=False)

    user = relationship("User", back_populates="budgets")