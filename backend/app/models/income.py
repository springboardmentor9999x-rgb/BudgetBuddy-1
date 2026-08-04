from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.database import Base

class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    source = Column(String, nullable=False)
    amount = Column(Float, nullable=False)