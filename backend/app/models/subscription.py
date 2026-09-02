from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.utils.utils import get_current_timestamp


class SubscriptionRequest(Base):
    """
    Subscription request model tracking user requests to upgrade to the Premium tier,
    including administrator review status, timestamps, and feedback notes.
    """
    __tablename__ = "subscription_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, default="pending", nullable=False, index=True)  # pending, approved, rejected
    user_note = Column(Text, nullable=True)
    admin_response = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=get_current_timestamp, nullable=False)
    updated_at = Column(DateTime, default=get_current_timestamp, onupdate=get_current_timestamp, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="subscription_requests")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
