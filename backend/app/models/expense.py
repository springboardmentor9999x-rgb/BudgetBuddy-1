from sqlalchemy import (
    Column, Integer, ForeignKey, String,DECIMAL,Text,DateTime
)
from sqlalchemy.orm import relationship

from app.database import Base


class Expense(Base):
    """_summary_

    Args:
        id (int): auto-incrementing primary key
        user_id (int): Foreign key referencing the user who owns the expense
        category (str): The category of the expense (e.g., "Food", "Entertainment", etc.)
        amount (float): The amount of the expense
        description (str): A description of the expense
        date (datetime): The date of the expense
        account (str): The account from which the expense was made
    """
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False)
    account = Column(String(1000), nullable=False, default="Cash")

    user = relationship("User", back_populates="expenses")