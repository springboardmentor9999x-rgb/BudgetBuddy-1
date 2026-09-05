from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

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
    # NOTIFICATION MESSAGE
    # ==========================================

    message = Column(
        String(500),
        nullable=False,
    )

    # ==========================================
    # NOTIFICATION TYPE
    # ==========================================

    type = Column(
        String(50),
        nullable=False,
    )

    # ==========================================
    # READ STATUS
    # ==========================================

    is_read = Column(
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
        back_populates="notifications",
    )