from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.database import Base
from app.utils.utils import get_current_timestamp

class User(Base):
    """_summary_

    Args:
        id (int): auto-incrementing primary key
        email (str): The email address of the user
        hashed_password (str): The hashed password of the user
        role (str): The role of the user (e.g., "student", "premium", "admin")
        is_verified (bool): Whether the user's email is verified
        is_active (bool): Whether the user's account is active
        otp (str): One-time password for email verification or password reset
        created_at (datetime): The timestamp when the user was created
    """
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # student, premium, admin
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    otp = Column(String(6), nullable=True, default=None)
    created_at = Column(DateTime, default=get_current_timestamp, nullable=False)
    
    profile = relationship("Profile", back_populates="owner", uselist=False, cascade="all, delete-orphan", passive_deletes=True)
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    accounts = relationship("Account", back_populates="user",cascade="all, delete-orphan", passive_deletes=True)
    savings_goals = relationship("SavingsGoal", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)