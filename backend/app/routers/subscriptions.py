from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.core.authorization import require_role, UserRole
from app.services.notification_service import notify_user
from app.schemas.subscription import (
    SubscriptionRequestCreate,
    SubscriptionActionRequest,
    SubscriptionRequestItem,
    SubscriptionStatusResponse,
    SubscriptionListResponse,
)
from app.crud.subscription import (
    create_subscription_request,
    get_user_subscription_status,
    list_subscription_requests,
    review_subscription_request,
)

router = APIRouter()


@router.post("/request", response_model=SubscriptionStatusResponse, status_code=status.HTTP_201_CREATED)
async def request_subscription_endpoint(
    payload: SubscriptionRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a subscription upgrade request for the authenticated basic user.
    Dispatches a real-time notification to all system administrators.
    """
    create_subscription_request(
        db=db,
        user=current_user,
        user_note=payload.user_note
    )

    # Notify all active administrators over WebSocket
    admin_ids = [u.id for u in db.query(User.id).filter(User.role == UserRole.ADMIN.value).all()]
    for admin_id in admin_ids:
        try:
            await notify_user(admin_id, {
                "type": "subscription",
                "title": "👑 New Subscription Request",
                "message": f"{current_user.email} has requested to upgrade to Premium.",
                "dedupKey": f"sub_req:{current_user.id}",
                "showToast": True,
            })
        except Exception as e:
            print(f"Error notifying admin {admin_id}: {e}")

    return get_user_subscription_status(db=db, user=current_user)


@router.get("/my-status", response_model=SubscriptionStatusResponse, status_code=status.HTTP_200_OK)
def get_my_subscription_status_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the authenticated user's current subscription status and latest request details."""
    return get_user_subscription_status(db=db, user=current_user)


@router.get("/admin/requests", response_model=SubscriptionListResponse, status_code=status.HTTP_200_OK)
def list_admin_subscription_requests_endpoint(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: pending, approved, rejected"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Administrator endpoint to view and filter subscription requests across all users.
    """
    return list_subscription_requests(
        db=db,
        status_filter=status_filter,
        page=page,
        page_size=page_size
    )


@router.post("/admin/requests/{request_id}/approve", response_model=SubscriptionRequestItem, status_code=status.HTTP_200_OK)
async def approve_subscription_request_endpoint(
    request_id: int,
    payload: Optional[SubscriptionActionRequest] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Administrator endpoint to approve a pending subscription request.
    Upgrades user role to 'premium' and sends a congratulations notification.
    """
    response_note = payload.admin_response if payload else None
    item, target_user = review_subscription_request(
        db=db,
        request_id=request_id,
        admin_user=admin_user,
        action="approve",
        admin_response=response_note
    )

    # Real-time WebSocket notification to target user
    try:
        await notify_user(target_user.id, {
            "type": "goal_complete",
            "title": "🎉 Premium Subscription Approved!",
            "message": "Congratulations! Your subscription request has been approved. You now have full access to unlimited budgets, savings goals, and summary exports.",
            "dedupKey": f"sub_approved:{request_id}",
            "showToast": True,
        })
    except Exception as e:
        print(f"Error notifying user {target_user.id}: {e}")

    return item


@router.post("/admin/requests/{request_id}/reject", response_model=SubscriptionRequestItem, status_code=status.HTTP_200_OK)
async def reject_subscription_request_endpoint(
    request_id: int,
    payload: Optional[SubscriptionActionRequest] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """
    Administrator endpoint to reject a pending subscription request.
    Sends feedback notification to the target user.
    """
    response_note = payload.admin_response if payload else None
    item, target_user = review_subscription_request(
        db=db,
        request_id=request_id,
        admin_user=admin_user,
        action="reject",
        admin_response=response_note
    )

    # Real-time WebSocket notification to target user
    try:
        await notify_user(target_user.id, {
            "type": "overspend",
            "title": "Subscription Request Update",
            "message": f"Your subscription request was not approved: {item.admin_response}",
            "dedupKey": f"sub_rejected:{request_id}",
            "showToast": True,
        })
    except Exception as e:
        print(f"Error notifying user {target_user.id}: {e}")

    return item
