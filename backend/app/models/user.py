from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.database import Base

def get_uuid():
    return str(uuid.uuid4())

def get_utc_time_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # student, premium, admin
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    otp = Column(String(6), nullable=True, default=None)
    created_at = Column(DateTime, default=get_utc_time_now)
    
    profile = relationship("Profile", back_populates="owner", uselist=False)