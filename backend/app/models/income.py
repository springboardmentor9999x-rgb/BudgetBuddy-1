from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Income(Base):
    """_summary_

    Args:
        id (int): auto-incrementing primary key
        user_id (int): Foreign key referencing the user who owns the income
        source (str): The source of the income (e.g., "Salary", "Freelance", etc.)
        amount (float): The amount of the income
        date (datetime): The date of the income
        account (str): The account to which the income was credited
    """
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source = Column(String(100), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    date = Column(DateTime, nullable=False)
    account = Column(String(100), nullable=True, default="Cash")

    user = relationship("User", back_populates="incomes")