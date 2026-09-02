import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi import HTTPException

from app.models.user import User
from app.models.subscription import SubscriptionRequest
from app.core.authorization import (
    UserRole,
    Permission,
    has_permission,
    check_tier_limit,
)
from app.crud.subscription import (
    create_subscription_request,
    get_user_subscription_status,
    review_subscription_request,
)


def test_create_subscription_request_success():
    db = MagicMock()
    user = User(id=10, email="normal@test.com", role="user")
    
    # Mock no existing pending request
    db.query.return_value.filter.return_value.first.return_value = None

    req = create_subscription_request(db, user, user_note="Please upgrade me!")
    assert req.user_id == 10
    assert req.status == "pending"
    assert req.user_note == "Please upgrade me!"
    assert db.add.called
    assert db.commit.called


def test_create_subscription_request_already_premium():
    db = MagicMock()
    premium_user = User(id=11, email="prem@test.com", role="premium")

    with pytest.raises(HTTPException) as exc:
        create_subscription_request(db, premium_user)
    assert exc.value.status_code == 400
    assert "active Premium membership" in exc.value.detail


def test_create_subscription_request_duplicate_pending():
    db = MagicMock()
    user = User(id=12, email="user@test.com", role="user")
    existing_req = SubscriptionRequest(id=1, user_id=12, status="pending")

    db.query.return_value.filter.return_value.first.return_value = existing_req

    with pytest.raises(HTTPException) as exc:
        create_subscription_request(db, user)
    assert exc.value.status_code == 400
    assert "pending administrator review" in exc.value.detail


def test_admin_approve_subscription_request():
    db = MagicMock()
    admin_user = User(id=1, email="admin@test.com", role="admin")
    target_user = User(id=20, email="requester@test.com", role="user")
    pending_req = SubscriptionRequest(id=5, user_id=20, status="pending", user=target_user)

    def query_filter_side_effect(model):
        m = MagicMock()
        if model == SubscriptionRequest:
            m.filter.return_value.first.return_value = pending_req
        elif model == User:
            m.filter.return_value.first.return_value = target_user
        return m

    db.query.side_effect = query_filter_side_effect

    item, updated_user = review_subscription_request(
        db=db,
        request_id=5,
        admin_user=admin_user,
        action="approve",
        admin_response="Welcome to Premium!"
    )

    assert pending_req.status == "approved"
    assert target_user.role == "premium"
    assert pending_req.reviewed_by == 1
    assert pending_req.admin_response == "Welcome to Premium!"
    assert item.status == "approved"


def test_admin_reject_subscription_request():
    db = MagicMock()
    admin_user = User(id=1, email="admin@test.com", role="admin")
    target_user = User(id=21, email="requester2@test.com", role="user")
    pending_req = SubscriptionRequest(id=6, user_id=21, status="pending", user=target_user)

    def query_filter_side_effect(model):
        m = MagicMock()
        if model == SubscriptionRequest:
            m.filter.return_value.first.return_value = pending_req
        elif model == User:
            m.filter.return_value.first.return_value = target_user
        return m

    db.query.side_effect = query_filter_side_effect

    item, updated_user = review_subscription_request(
        db=db,
        request_id=6,
        admin_user=admin_user,
        action="reject",
        admin_response="Information incomplete."
    )

    assert pending_req.status == "rejected"
    assert target_user.role == "user"  # remains user
    assert pending_req.reviewed_by == 1
    assert item.status == "rejected"


def test_export_permissions():
    normal_user = User(id=30, email="normal@test.com", role="user")
    prem_user = User(id=31, email="prem@test.com", role="premium")
    admin_user = User(id=32, email="admin@test.com", role="admin")

    # Normal user does NOT have EXPORT_FULL
    assert has_permission(normal_user, Permission.EXPORT_FULL) is False
    assert has_permission(normal_user, Permission.EXPORT_LIMITED) is True

    # Premium and Admin DO have EXPORT_FULL
    assert has_permission(prem_user, Permission.EXPORT_FULL) is True
    assert has_permission(admin_user, Permission.EXPORT_FULL) is True


def test_tier_limits_enforcement():
    normal_user = User(id=40, email="user@test.com", role="user")
    prem_user = User(id=41, email="prem@test.com", role="premium")

    # Basic user: 5 budgets allowed, 6th raises 403
    check_tier_limit(normal_user, "budget", current_count=4)
    with pytest.raises(HTTPException) as exc:
        check_tier_limit(normal_user, "budget", current_count=5)
    assert exc.value.status_code == 403
    assert "5 budgets" in exc.value.detail

    # Basic user: 2 savings goals allowed, 3rd raises 403
    check_tier_limit(normal_user, "saving_goal", current_count=1)
    with pytest.raises(HTTPException) as exc:
        check_tier_limit(normal_user, "saving_goal", current_count=2)
    assert exc.value.status_code == 403
    assert "2 savings goals" in exc.value.detail

    # Premium user: unlimited
    check_tier_limit(prem_user, "budget", current_count=100)
    check_tier_limit(prem_user, "saving_goal", current_count=100)
