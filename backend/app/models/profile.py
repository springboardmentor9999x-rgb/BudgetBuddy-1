from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Profile(Base):
    """_summary_

    Args:
        id (int): auto-incrementing primary key
        user_id (int): Foreign key referencing the user who owns the profile
        full_name (str): The full name of the user
        monthly_income (float): The monthly income of the user
        currency (str): The currency in which the monthly income is denominated
    """
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id",ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String)
    monthly_income = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    
    owner = relationship("User", back_populates="profile")