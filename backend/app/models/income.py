from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source = Column(String(100), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    date = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="incomes")