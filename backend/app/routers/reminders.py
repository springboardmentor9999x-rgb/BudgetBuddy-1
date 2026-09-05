from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
    ReminderOut,
)

from app.crud.reminder import (
    create_reminder,
    get_reminders_by_user,
    get_reminder,
    update_reminder,
    complete_reminder,
    delete_reminder,
    process_due_reminders,
)


router = APIRouter()


# ==========================================
# CREATE REMINDER
# ==========================================

@router.post(
    "/",
    response_model=ReminderOut,
)
def add_reminder(
    reminder_in: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_reminder(
        db=db,
        user_id=current_user.id,
        reminder_in=reminder_in,
    )


# ==========================================
# GET ALL REMINDERS
# ==========================================

@router.get(
    "/",
    response_model=list[ReminderOut],
)
def list_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_reminders_by_user(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# PROCESS DUE REMINDERS
# ==========================================

@router.post(
    "/process-due",
    response_model=list[ReminderOut],
)
def process_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return process_due_reminders(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# GET ONE REMINDER
# ==========================================

@router.get(
    "/{reminder_id}",
    response_model=ReminderOut,
)
def read_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = get_reminder(
        db=db,
        reminder_id=reminder_id,
        user_id=current_user.id,
    )

    if not reminder:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found",
        )

    return reminder


# ==========================================
# UPDATE REMINDER
# ==========================================

@router.put(
    "/{reminder_id}",
    response_model=ReminderOut,
)
def edit_reminder(
    reminder_id: int,
    reminder_in: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = update_reminder(
        db=db,
        reminder_id=reminder_id,
        user_id=current_user.id,
        reminder_in=reminder_in,
    )

    if not reminder:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found",
        )

    return reminder


# ==========================================
# COMPLETE REMINDER
# ==========================================

@router.patch(
    "/{reminder_id}/complete",
    response_model=ReminderOut,
)
def mark_reminder_complete(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = complete_reminder(
        db=db,
        reminder_id=reminder_id,
        user_id=current_user.id,
    )

    if not reminder:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found",
        )

    return reminder


# ==========================================
# DELETE REMINDER
# ==========================================

@router.delete(
    "/{reminder_id}",
)
def remove_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reminder = delete_reminder(
        db=db,
        reminder_id=reminder_id,
        user_id=current_user.id,
    )

    if not reminder:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found",
        )

    return {
        "message": "Reminder deleted successfully"
    }
