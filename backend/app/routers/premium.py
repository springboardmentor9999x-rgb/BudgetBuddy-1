from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter()


@router.post("/request")
def request_premium(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "premium":
        raise HTTPException(status_code=400, detail="You are already a Premium User.")

    if current_user.role == "admin":
        raise HTTPException(status_code=400, detail="Admins do not need Premium access.")

    if current_user.premium_request_status == "pending":
        raise HTTPException(status_code=400, detail="Your Premium request is already pending.")

    current_user.premium_request_status = "pending"

    notification = Notification(
        user_id=current_user.id,
        message="Your Premium Access request has been sent to an administrator.",
        type="premium_request",
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Premium Access request submitted successfully.",
        "status": current_user.premium_request_status,
    }
