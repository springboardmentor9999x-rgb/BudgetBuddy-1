from sqlalchemy import (
    Column, Integer, ForeignKey, String, DECIMAL, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Account(Base):
    """Account model representing a user's financial account.

    Args:
        id (int): auto-incrementing primary key
        user_id (int): Foreign key referencing the user who owns the account
        bank_name (str): The name of the bank where the account is held
        account_number (str): The account number (or last 4 digits)
        balance (float): The current balance of the account
    """
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    bank_name = Column(String(50), nullable=False)
    account_number = Column(String(20), nullable=False)
    balance = Column(DECIMAL(12, 2), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "bank_name", "account_number", name="uq_user_bank_account"),
    )

    user = relationship("User", back_populates="accounts")