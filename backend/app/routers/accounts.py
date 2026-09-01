from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.account import CreateBankAccount, BankAccountOut

from app.crud.account import (
    create_account, 
    get_account_by_id, 
    delete_account,
    get_all_user_accounts,
    get_account_by_user_and_bank_name,
    subtract_amount_from_account,
)
from app.core.authorization import (
    Permission,
    require_permission,
    check_resource_ownership,
)
from app.services.notification_service import check_account_overdraft_notifications

router = APIRouter()

class DeductAmountRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to deduct from the account balance")


@router.post("/add-bank-account", response_model=BankAccountOut, status_code=201)
def create_new_account(
    account_details: CreateBankAccount,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.ACCOUNT_WRITE_OWN))
):  
    account_exists = get_account_by_user_and_bank_name(db, current_user.id, account_details.bank_name)
    if account_exists:
        raise HTTPException(status_code=400, detail="Account with this bank name already exists for the user")
    
    account = create_account(db, current_user.id, **account_details.model_dump())
    return account


@router.get("/get-account/{account_id}", response_model=BankAccountOut, status_code=200)
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.ACCOUNT_READ_OWN))
):
    account = get_account_by_id(db, account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    check_resource_ownership(account.user_id, current_user, allow_admin_read_only=True)
    return account


@router.delete("/delete-account/{account_id}", status_code=200)
def delete_bank_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.ACCOUNT_WRITE_OWN))
):
    account = get_account_by_id(db, account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    check_resource_ownership(account.user_id, current_user, is_write_operation=True)

    if not delete_account(db, account_id, current_user.id):
        raise HTTPException(status_code=404, detail="Account not found")
    
    return {"message": "Account deleted successfully"}


@router.get("/get-all-accounts", response_model=list[BankAccountOut], status_code=200)
def get_all_accounts_for_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.ACCOUNT_READ_OWN))
):
    return get_all_user_accounts(db, current_user.id)


@router.patch("/deduct/{account_id}", response_model=BankAccountOut, status_code=200)
async def deduct_from_account(
    account_id: int,
    body: DeductAmountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission(Permission.ACCOUNT_WRITE_OWN))
):
    """Deduct an amount from an account balance (used when a saving goal is completed)."""
    account = get_account_by_id(db, account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    check_resource_ownership(account.user_id, current_user, is_write_operation=True)

    if float(account.balance) < body.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance in the account")
    try:
        updated = subtract_amount_from_account(db, account_id, body.amount)
        try:
            await check_account_overdraft_notifications(db, current_user.id, account_id)
        except Exception as e:
            print(f"Notification error on deduct_from_account: {e}")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))