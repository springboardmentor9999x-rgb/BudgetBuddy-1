from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, EmailStr


class AdminUserListItem(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_verified: bool
    is_active: bool
    created_at: datetime
    full_name: Optional[str] = None
    monthly_income: Optional[float] = 0.0
    currency: Optional[str] = "INR"
    account_count: int = 0
    budget_count: int = 0
    goal_count: int = 0
    transaction_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class AdminUserListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    users: List[AdminUserListItem]


class UpdateUserRoleRequest(BaseModel):
    role: str  # "user", "premium", "admin"


class UpdateUserStatusRequest(BaseModel):
    is_active: bool


class UpgradeTierRequest(BaseModel):
    tier: str  # "premium", "user"


class CrossUserDataResponse(BaseModel):
    user_id: int
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    full_name: Optional[str] = None
    monthly_income: float = 0.0
    currency: str = "INR"
    created_at: datetime
    accounts: List[Dict[str, Any]] = []
    budgets: List[Dict[str, Any]] = []
    saving_goals: List[Dict[str, Any]] = []
    recent_expenses: List[Dict[str, Any]] = []
    recent_incomes: List[Dict[str, Any]] = []
    total_balance: float = 0.0
    total_income_logged: float = 0.0
    total_expense_logged: float = 0.0


class SystemAnalyticsResponse(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    verified_users: int
    users_by_role: Dict[str, int]
    total_platform_income: float
    total_platform_expenses: float
    total_platform_liquidity: float
    total_budgets_created: int
    total_goals_created: int
    total_transactions_count: int
    monthly_signups: List[Dict[str, Any]]


class AuditLogItem(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    total: int
    logs: List[AuditLogItem]
