from sqlalchemy import (
    Column, Integer, ForeignKey, String,DECIMAL,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Account(Base):
    """_summary_

    Args:
        id (int): auto-incrementing primary key
        user_id (int): Foreign key referencing the user who owns the account
        bank_name (str): The name of the bank where the account is held
        account_number (str): The account number
        balance (float): The current balance of the account
    """
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    bank_name = Column(String(50), nullable=False)
    account_number = Column(String(20), nullable=False, unique=True)
    balance = Column(DECIMAL(12, 2), nullable=False)

    user = relationship("User", back_populates="accounts")