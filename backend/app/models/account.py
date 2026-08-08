from sqlalchemy import (
    Column, Integer, ForeignKey, String,DECIMAL,
)
from sqlalchemy.orm import relationship
from app.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    bank_name = Column(String(50), nullable=False)
    account_number = Column(String(20), nullable=False, unique=True)
    balance = Column(DECIMAL(12, 2), nullable=False)

    user = relationship("User", back_populates="accounts")