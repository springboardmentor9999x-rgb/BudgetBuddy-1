from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    # -----------------------------
    # BASIC USER INFORMATION
    # -----------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    hashed_password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="student"
    )

    is_active = Column(
        Boolean,
        default=True
    )

    # -----------------------------
    # EMAIL VERIFICATION
    # -----------------------------

    is_verified = Column(
        Boolean,
        default=False,
        nullable=False
    )

    verification_code = Column(
        String,
        nullable=True
    )

    verification_code_expires_at = Column(
        DateTime,
        nullable=True
    )

    # -----------------------------
    # TIMESTAMPS
    # -----------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # -----------------------------
    # RELATIONSHIPS
    # -----------------------------

    profile = relationship(
        "Profile",
        back_populates="owner",
        uselist=False
    )

    expenses = relationship(
        "Expense",
        back_populates="owner",
        cascade="all, delete-orphan"
    )