from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Account(Base):
    __tablename__ = "accounts"

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

    bank_name = Column(
        String,
        nullable=False,
    )

    account_holder_name = Column(
        String,
        nullable=False,
    )

    account_number = Column(
        String,
        nullable=False,
    )

    account_type = Column(
        String,
        nullable=False,
    )

    description = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # User who owns this account
    owner = relationship(
        "User",
        back_populates="accounts",
    )

    # Expenses made from this account
    expenses = relationship(
        "Expense",
        back_populates="account",
    )

    # Income received into this account
    income_records = relationship(
        "Income",
        back_populates="account",
    )