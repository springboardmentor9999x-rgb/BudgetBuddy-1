from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Income(Base):
    __tablename__ = "income"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # Registered bank account receiving the income
    account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=True,
        index=True,
    )

    # Income source/category
    source = Column(
        String(100),
        nullable=False,
    )

    # Fixed category for dashboard analytics
    category = Column(
        String(50),
        nullable=False,
    )

    amount = Column(
        Float,
        nullable=False,
    )

    # Description is required
    description = Column(
        String(500),
        nullable=False,
    )

    date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # User who owns this income
    owner = relationship(
        "User",
        back_populates="incomes",
    )

    # Bank account receiving this income
    account = relationship(
        "Account",
        back_populates="income_records",
    )