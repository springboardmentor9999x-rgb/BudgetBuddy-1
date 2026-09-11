from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.utils.utils import get_current_timestamp


class AuditLog(Base):
    """
    System audit trail for monitoring authentication events, role modifications,
    data exports, cross-user administrative reads, and administrative interventions.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String, nullable=True, index=True)
    action = Column(String, nullable=False, index=True)  # e.g., AUTH_LOGIN, EXPORT_REPORT, ROLE_CHANGE, USER_SUSPENDED
    resource_type = Column(String, nullable=True)        # e.g., user, budget, report, system
    resource_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)                # Descriptive metadata or reason
    ip_address = Column(String, nullable=True)
    status = Column(String, default="SUCCESS")           # SUCCESS, FAILED, DENIED
    created_at = Column(DateTime, default=get_current_timestamp, nullable=False, index=True)

    user = relationship("User", back_populates="audit_logs")
