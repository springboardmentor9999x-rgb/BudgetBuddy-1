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


class Expense(Base):
    __tablename__ = "expenses"

    # ==========================================
    # PRIMARY KEY
    # ==========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================
    # USER OWNERSHIP
    # ==========================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ==========================================
    # BANK ACCOUNT
    # ==========================================

    account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=True,
        index=True,
    )

    # ==========================================
    # EXPENSE CATEGORY
    # ==========================================

    category = Column(
        String(100),
        nullable=False,
    )

    # ==========================================
    # AMOUNT
    # ==========================================

    amount = Column(
        Float,
        nullable=False,
    )

    # ==========================================
    # PAYMENT METHOD
    # ==========================================

    payment_method = Column(
        String(50),
        nullable=True,
    )

    # ==========================================
    # DESCRIPTION
    # REQUIRED
    # ==========================================

    description = Column(
        String(500),
        nullable=False,
    )

    # ==========================================
    # DATE
    # ==========================================

    date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # ==========================================
    # USER RELATIONSHIP
    # ==========================================

    owner = relationship(
        "User",
        back_populates="expenses",
    )

    # ==========================================
    # ACCOUNT RELATIONSHIP
    # ==========================================

    account = relationship(
        "Account",
        back_populates="expenses",
    )