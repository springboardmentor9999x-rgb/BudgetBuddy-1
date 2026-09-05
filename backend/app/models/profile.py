from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True,
    )

    full_name = Column(
        String(100),
        nullable=False,
    )

    monthly_income = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    currency = Column(
        String(10),
        default="INR",
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="profile",
    )