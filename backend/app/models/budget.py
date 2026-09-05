from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    category = Column(
        String,
        nullable=False,
    )

    limit = Column(
        Float,
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="budgets",
    )