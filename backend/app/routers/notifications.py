from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification

from app.schemas.notification import NotificationOut

from app.crud.notification import (
    get_notifications_by_user,
    get_notification,
    mark_notification_as_read,
)

from app.crud.monthly_report import get_monthly_report


router = APIRouter()


# ==========================================
# GET ALL NOTIFICATIONS
# ==========================================

@router.get(
    "/",
    response_model=list[NotificationOut],
)
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notifications_by_user(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# MARK NOTIFICATION AS READ
# ==========================================

@router.patch(
    "/{notification_id}/read",
    response_model=NotificationOut,
)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = mark_notification_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return notification


# ==========================================
# GENERATE MONTHLY REPORT NOTIFICATION
# ==========================================

@router.post(
    "/generate-monthly-report",
    response_model=NotificationOut,
)
def generate_monthly_report_notification(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ==========================================
    # GET MONTHLY REPORT
    # ==========================================

    report = get_monthly_report(
        db=db,
        user_id=current_user.id,
        year=year,
        month=month,
    )

    # ==========================================
    # CREATE NOTIFICATION MESSAGE
    # ==========================================

    message = (
        f"Monthly Report for {report['month']}: "
        f"Income ₹{report['total_income']:.2f}, "
        f"Expenses ₹{report['total_expense']:.2f}, "
        f"Net Savings ₹{report['net_savings']:.2f}."
    )

    # ==========================================
    # CREATE NOTIFICATION
    # ==========================================

    notification = Notification(
        user_id=current_user.id,
        message=message,
        type="monthly_report",
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification