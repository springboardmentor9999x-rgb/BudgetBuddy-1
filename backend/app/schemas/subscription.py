from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class SubscriptionRequestCreate(BaseModel):
    user_note: Optional[str] = Field(None, max_length=500, description="Optional message or reason from the user")


class SubscriptionActionRequest(BaseModel):
    admin_response: Optional[str] = Field(None, max_length=500, description="Optional feedback or rejection reason from the admin")


class SubscriptionRequestItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_email: str
    user_name: Optional[str] = None
    status: str
    user_note: Optional[str] = None
    admin_response: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewer_email: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class SubscriptionStatusResponse(BaseModel):
    has_pending: bool
    current_role: str
    latest_request: Optional[SubscriptionRequestItem] = None


class SubscriptionListResponse(BaseModel):
    requests: List[SubscriptionRequestItem]
    total: int
    pending_count: int
    page: int
    page_size: int
