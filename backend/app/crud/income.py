from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.income import Income
from app.models.account import Account


def find_user_account(db: Session, user_id: int, account_identifier: str) -> Account | None:
    """
    Finds a user bank account matching the bank name, account number, or formatted label string.
    """
    if not account_identifier:
        return None
    stmt = select(Account).where(Account.user_id == user_id)
    accounts = db.execute(stmt).scalars().all()
    for acct in accounts:
        formatted = f"{acct.bank_name} ({acct.account_number})"
        if account_identifier in (acct.bank_name, acct.account_number, formatted):
            return acct
    return None


def create_income(db: Session, user_id: int, amount: float, source: str, date: datetime, account: str) -> Income:
    income_data = Income(user_id=user_id, amount=amount, source=source, date=date, account=account)
    db.add(income_data)

    # Add income amount to matching user account balance
    acct = find_user_account(db, user_id, account)
    if acct:
        acct.balance = float(acct.balance) + float(amount)

    db.commit()
    db.refresh(income_data)
    return income_data


def get_incomes_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> list[Income]:
    smt = select(Income).where(Income.user_id == user_id).offset(skip).limit(limit)
    return db.execute(smt).scalars().all()


def get_income(db: Session, income_id: int, user_id: int) -> Income | None:
    smt = select(Income).where(Income.id == income_id, Income.user_id == user_id)
    return db.execute(smt).scalar_one_or_none()


def update_income(db: Session, user_id: int, income_id: int, amount: float = None, source: str = None, date: datetime = None, account: str = None) -> Income | None:
    income = get_income(db, income_id, user_id)
    if not income:
        return None

    # Reverse old income amount from old account balance
    if income.account and income.amount is not None:
        old_acct = find_user_account(db, user_id, income.account)
        if old_acct:
            old_acct.balance = float(old_acct.balance) - float(income.amount)

    if amount is not None:
        income.amount = amount
    if source is not None:
        income.source = source
    if date is not None:
        income.date = date
    if account is not None:
        income.account = account

    # Add new income amount to new account balance
    if income.account:
        new_acct = find_user_account(db, user_id, income.account)
        if new_acct:
            new_acct.balance = float(new_acct.balance) + float(income.amount)

    db.commit()
    db.refresh(income)
    return income


def delete_income(db: Session, user_id: int, income_id: int) -> dict[str, str] | None:
    income = get_income(db, income_id, user_id)
    if not income:
        return None

    # Deduct income amount back from account balance
    if income.account:
        acct = find_user_account(db, user_id, income.account)
        if acct:
            acct.balance = float(acct.balance) - float(income.amount)

    db.delete(income)
    db.commit()
    return {
        "success": True,
        "message": f"Income with ID {income_id} has been deleted."
    }