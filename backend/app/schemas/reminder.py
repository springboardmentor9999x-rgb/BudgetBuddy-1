from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ==========================================
# CREATE REMINDER
# ==========================================

class ReminderCreate(BaseModel):
    title: str
    description: str | None = None
    remind_at: datetime


# ==========================================
# UPDATE REMINDER
# ==========================================

class ReminderUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    remind_at: datetime | None = None
    is_completed: bool | None = None


# ==========================================
# REMINDER OUTPUT
# ==========================================

class ReminderOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    remind_at: datetime
    is_completed: bool
    notification_sent: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
