from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException, status

from app.models.subscription import SubscriptionRequest
from app.models.user import User
from app.models.profile import Profile
from app.core.authorization import normalize_role, UserRole
from app.schemas.subscription import (
    SubscriptionRequestItem,
    SubscriptionStatusResponse,
    SubscriptionListResponse,
)
from app.crud.admin import log_activity


def _to_request_item(req: SubscriptionRequest) -> SubscriptionRequestItem:
    requester_email = req.user.email if req.user else "Unknown"
    requester_name = req.user.profile.full_name if req.user and req.user.profile else None
    reviewer_email = req.reviewer.email if req.reviewer else None

    return SubscriptionRequestItem(
        id=req.id,
        user_id=req.user_id,
        user_email=requester_email,
        user_name=requester_name,
        status=req.status,
        user_note=req.user_note,
        admin_response=req.admin_response,
        reviewed_by=req.reviewed_by,
        reviewer_email=reviewer_email,
        created_at=req.created_at,
        updated_at=req.updated_at,
    )


def create_subscription_request(
    db: Session,
    user: User,
    user_note: Optional[str] = None
) -> SubscriptionRequest:
    """
    Submits a subscription request for the user.
    Ensures that users who already have premium/admin cannot request,
    and prevents duplicate pending requests.
    """
    current_role = normalize_role(user.role)
    if current_role in (UserRole.PREMIUM.value, UserRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active Premium membership or Administrator privileges."
        )

    # Check for existing pending request
    existing_pending = (
        db.query(SubscriptionRequest)
        .filter(
            SubscriptionRequest.user_id == user.id,
            SubscriptionRequest.status == "pending"
        )
        .first()
    )
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a subscription request pending administrator review."
        )

    new_request = SubscriptionRequest(
        user_id=user.id,
        status="pending",
        user_note=user_note.strip() if user_note else None,
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    log_activity(
        db=db,
        action="SUBSCRIPTION_REQUESTED",
        details=f"User {user.email} submitted a Premium subscription request.",
        user_id=user.id,
        user_email=user.email,
        resource_type="subscription",
        status_str="SUCCESS"
    )

    return new_request


def get_user_subscription_status(db: Session, user: User) -> SubscriptionStatusResponse:
    """Returns the user's current role and details of their latest subscription request."""
    latest_req = (
        db.query(SubscriptionRequest)
        .filter(SubscriptionRequest.user_id == user.id)
        .order_by(desc(SubscriptionRequest.created_at))
        .first()
    )

    has_pending = latest_req is not None and latest_req.status == "pending"
    item = _to_request_item(latest_req) if latest_req else None

    return SubscriptionStatusResponse(
        has_pending=has_pending,
        current_role=normalize_role(user.role),
        latest_request=item,
    )


def list_subscription_requests(
    db: Session,
    status_filter: Optional[str] = None,
    page: int = 1,
    page_size: int = 20
) -> SubscriptionListResponse:
    """
    Lists subscription requests for administrator dashboard inspection.
    Includes pending requests counter.
    """
    query = db.query(SubscriptionRequest)

    if status_filter and status_filter.strip().lower() != "all":
        query = query.filter(SubscriptionRequest.status == status_filter.strip().lower())

    total = query.count()
    pending_count = (
        db.query(func.count(SubscriptionRequest.id))
        .filter(SubscriptionRequest.status == "pending")
        .scalar() or 0
    )

    offset = max(0, (page - 1) * page_size)
    records = (
        query.order_by(desc(SubscriptionRequest.created_at))
        .offset(offset)
        .limit(page_size)
        .all()
    )

    request_items = [_to_request_item(r) for r in records]

    return SubscriptionListResponse(
        requests=request_items,
        total=total,
        pending_count=pending_count,
        page=page,
        page_size=page_size,
    )


def review_subscription_request(
    db: Session,
    request_id: int,
    admin_user: User,
    action: str,
    admin_response: Optional[str] = None
) -> Tuple[SubscriptionRequestItem, User]:
    """
    Reviews a pending subscription request (approve or reject).
    When approved, upgrades target user role to 'premium'.
    Returns (updated_request_item, target_user).
    """
    req = db.query(SubscriptionRequest).filter(SubscriptionRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription request #{request_id} not found."
        )

    if req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subscription request #{request_id} has already been {req.status}."
        )

    target_user = db.query(User).filter(User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requester user account no longer exists."
        )

    action_norm = action.strip().lower()
    if action_norm == "approve":
        req.status = "approved"
        req.admin_response = admin_response.strip() if admin_response else "Approved by administrator."
        target_user.role = UserRole.PREMIUM.value
        audit_action = "SUBSCRIPTION_APPROVED"
        audit_detail = f"Admin {admin_user.email} approved Premium subscription for user {target_user.email}."
    elif action_norm == "reject":
        req.status = "rejected"
        req.admin_response = admin_response.strip() if admin_response else "Request rejected by administrator."
        audit_action = "SUBSCRIPTION_REJECTED"
        audit_detail = f"Admin {admin_user.email} rejected Premium subscription for user {target_user.email}. Reason: {req.admin_response}"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid review action '{action}'. Must be 'approve' or 'reject'."
        )

    req.reviewed_by = admin_user.id
    db.commit()
    db.refresh(req)
    db.refresh(target_user)

    log_activity(
        db=db,
        action=audit_action,
        details=audit_detail,
        user_id=target_user.id,
        user_email=target_user.email,
        resource_type="subscription",
        status_str="SUCCESS"
    )

    return _to_request_item(req), target_user
