from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AccountBase(BaseModel):
    bank_name: str
    account_holder_name: str
    account_number: str
    account_type: str
    description: Optional[str] = None


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_holder_name: Optional[str] = None
    account_number: Optional[str] = None
    account_type: Optional[str] = None
    description: Optional[str] = None


class AccountResponse(AccountBase):
    id: int
    user_id: int
    created_at: datetime
    available_balance: float = 0.0

    model_config = ConfigDict(from_attributes=True)