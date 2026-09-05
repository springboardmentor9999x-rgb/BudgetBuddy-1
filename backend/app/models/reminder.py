from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database import Base


class Reminder(Base):
    __tablename__ = "reminders"

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
    # REMINDER TITLE
    # ==========================================

    title = Column(
        String(150),
        nullable=False,
    )

    # ==========================================
    # REMINDER DESCRIPTION
    # ==========================================

    description = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # REMINDER DATE & TIME
    # ==========================================

    remind_at = Column(
        DateTime,
        nullable=False,
        index=True,
    )

    # ==========================================
    # COMPLETION STATUS
    # ==========================================

    is_completed = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    # ==========================================
    # NOTIFICATION STATUS
    # ==========================================

    notification_sent = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    # ==========================================
    # CREATED AT
    # ==========================================

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    # ==========================================
    # USER RELATIONSHIP
    # ==========================================

    owner = relationship(
        "User",
        back_populates="reminders",
    )
