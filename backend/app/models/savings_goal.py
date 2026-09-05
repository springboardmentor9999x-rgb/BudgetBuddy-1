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


class SavingsGoal(Base):
    __tablename__ = "savings_goals"

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
    # GOAL TITLE
    # ==========================================

    title = Column(
        String(200),
        nullable=False,
    )

    # ==========================================
    # TARGET AMOUNT
    # ==========================================

    target_amount = Column(
        Float,
        nullable=False,
    )

    # ==========================================
    # CURRENT SAVINGS
    # ==========================================

    current_amount = Column(
        Float,
        nullable=False,
        default=0.0,
    )

    # ==========================================
    # TARGET DATE
    # ==========================================

    target_date = Column(
        DateTime,
        nullable=True,
    )

    # ==========================================
    # STATUS
    # ==========================================

    status = Column(
        String(30),
        nullable=False,
        default="in_progress",
    )

    # ==========================================
    # CREATED AT
    # ==========================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # ==========================================
    # USER RELATIONSHIP
    # ==========================================

    owner = relationship(
        "User",
        back_populates="savings_goals",
    )