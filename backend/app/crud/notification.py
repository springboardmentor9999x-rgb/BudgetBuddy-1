from sqlalchemy.orm import Session

from app.models.notification import Notification


# ==========================================
# GET ALL NOTIFICATIONS FOR CURRENT USER
# ==========================================

def get_notifications_by_user(
    db: Session,
    user_id: int,
):
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


# ==========================================
# GET ONE NOTIFICATION
# ==========================================

def get_notification(
    db: Session,
    notification_id: int,
    user_id: int,
):
    return (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        .first()
    )


# ==========================================
# MARK NOTIFICATION AS READ
# ==========================================

def mark_notification_as_read(
    db: Session,
    notification_id: int,
    user_id: int,
):
    notification = get_notification(
        db=db,
        notification_id=notification_id,
        user_id=user_id,
    )

    if not notification:
        return None

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification