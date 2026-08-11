from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.account import CreateBankAccount, BankAccountOut

from app.crud.account import (
    create_account, 
    get_account_by_id, 
    delete_account,
    get_all_user_accounts,
    get_account_by_user_and_bank_name,
)

router = APIRouter()

@router.post("/add-bank-account", response_model=BankAccountOut, status_code=201)
def create_new_account(
    account_details: CreateBankAccount,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):  
    account_exists = get_account_by_user_and_bank_name(db, current_user.id, account_details.bank_name)
    if account_exists:
        raise HTTPException(status_code=400, detail="Account with this bank name already exists for the user")
    
    account = create_account(db, current_user.id,**account_details.model_dump())
    return account

@router.get("/get-account/{account_id}", response_model=BankAccountOut, status_code=200)
def get_account(account_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    account = get_account_by_id(db, account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return account

@router.delete("/delete-account/{account_id}", status_code=200)
def delete_bank_account(account_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not delete_account(db, account_id, current_user.id):
        raise HTTPException(status_code=404, detail="Account not found")
    
    return {"message": "Account deleted successfully"}

@router.get("/get-all-accounts", response_model=list[BankAccountOut], status_code=200)
def get_all_accounts_for_user(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_all_user_accounts(db, current_user.id)