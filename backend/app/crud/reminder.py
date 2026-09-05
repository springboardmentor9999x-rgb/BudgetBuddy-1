from datetime import datetime

from sqlalchemy.orm import Session

from app.models.reminder import Reminder
from app.models.notification import Notification

from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
)


# ==========================================
# CREATE REMINDER
# ==========================================

def create_reminder(
    db: Session,
    user_id: int,
    reminder_in: ReminderCreate,
):
    reminder = Reminder(
        user_id=user_id,
        title=reminder_in.title,
        description=reminder_in.description,
        remind_at=reminder_in.remind_at,
        is_completed=False,
        notification_sent=False,
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return reminder


# ==========================================
# GET ALL REMINDERS
# ==========================================

def get_reminders_by_user(
    db: Session,
    user_id: int,
):
    return (
        db.query(Reminder)
        .filter(
            Reminder.user_id == user_id
        )
        .order_by(
            Reminder.remind_at.asc()
        )
        .all()
    )


# ==========================================
# GET ONE REMINDER
# ==========================================

def get_reminder(
    db: Session,
    reminder_id: int,
    user_id: int,
):
    return (
        db.query(Reminder)
        .filter(
            Reminder.id == reminder_id,
            Reminder.user_id == user_id,
        )
        .first()
    )


# ==========================================
# UPDATE REMINDER
# ==========================================

def update_reminder(
    db: Session,
    reminder_id: int,
    user_id: int,
    reminder_in: ReminderUpdate,
):
    reminder = get_reminder(
        db=db,
        reminder_id=reminder_id,
        user_id=user_id,
    )

    if not reminder:
        return None

    update_data = reminder_in.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            reminder,
            field,
            value,
        )

    # If reminder time is changed,
    # allow a new notification to be generated.
    if "remind_at" in update_data:
        reminder.notification_sent = False

    db.commit()
    db.refresh(reminder)

    return reminder


# ==========================================
# COMPLETE REMINDER
# ==========================================

def complete_reminder(
    db: Session,
    reminder_id: int,
    user_id: int,
):
    reminder = get_reminder(
        db=db,
        reminder_id=reminder_id,
        user_id=user_id,
    )

    if not reminder:
        return None

    reminder.is_completed = True

    db.commit()
    db.refresh(reminder)

    return reminder


# ==========================================
# DELETE REMINDER
# ==========================================

def delete_reminder(
    db: Session,
    reminder_id: int,
    user_id: int,
):
    reminder = get_reminder(
        db=db,
        reminder_id=reminder_id,
        user_id=user_id,
    )

    if not reminder:
        return None

    db.delete(reminder)
    db.commit()

    return reminder


# ==========================================
# PROCESS DUE REMINDERS
# ==========================================

def process_due_reminders(
    db: Session,
    user_id: int,
):
    now = datetime.utcnow()

    due_reminders = (
        db.query(Reminder)
        .filter(
            Reminder.user_id == user_id,
            Reminder.remind_at <= now,
            Reminder.is_completed == False,
            Reminder.notification_sent == False,
        )
        .all()
    )

    for reminder in due_reminders:

        message = f"Reminder: {reminder.title}"

        if reminder.description:
            message += f" - {reminder.description}"

        notification = Notification(
            user_id=user_id,
            message=message,
            type="reminder",
            is_read=False,
        )

        db.add(notification)

        reminder.notification_sent = True

    db.commit()

    return due_reminders