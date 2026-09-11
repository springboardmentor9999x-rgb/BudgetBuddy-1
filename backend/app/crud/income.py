from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.models.income import Income
from app.models.account import Account


def find_user_account(db: Session, user_id: int, account_identifier: str) -> Account | None:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user for whom to find the account
        account_identifier (str): the identifier for the account to find

    Returns:
        Account | None: the found account or None if not found
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
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user for whom to create the income
        amount (float): the amount of the income
        source (str): the source of the income
        date (datetime): the date of the income
        account (str): the identifier for the account associated with the income

    Returns:
        Income: the created income record
    """
    income_data = Income(user_id=user_id, amount=amount, source=source, date=date, account=account)
    db.add(income_data)

    # Add income amount to matching user account balance
    acct = find_user_account(db, user_id, account)
    if acct:
        acct.balance = float(acct.balance) + float(amount)

    db.commit()
    db.refresh(income_data)
    return income_data


def get_incomes_by_user(
    db: Session,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    source: Optional[str] = None,
    account: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "date_desc"
) -> list[Income]:
    """
    Retrieves filtered income records with pagination and sorting.
    If user_id is None, retrieves cross-user records (Admin mode).
    """
    smt = select(Income)
    if user_id is not None:
        smt = smt.where(Income.user_id == user_id)
    if source and source.strip() and source.strip().lower() != "all":
        smt = smt.where(Income.source == source.strip())
    if account and account.strip() and account.strip().lower() != "all":
        acc_str = account.strip()
        smt = smt.where(or_(Income.account == acc_str, Income.account.ilike(f"%{acc_str}%")))
    if start_date is not None:
        smt = smt.where(Income.date >= start_date)
    if end_date is not None:
        smt = smt.where(Income.date <= end_date)
    if min_amount is not None:
        smt = smt.where(Income.amount >= min_amount)
    if max_amount is not None:
        smt = smt.where(Income.amount <= max_amount)
    if search and search.strip():
        term = f"%{search.strip()}%"
        smt = smt.where(or_(Income.source.ilike(term), Income.account.ilike(term)))

    if sort_by == "amount_asc":
        smt = smt.order_by(Income.amount.asc(), Income.date.desc())
    elif sort_by == "amount_desc":
        smt = smt.order_by(Income.amount.desc(), Income.date.desc())
    elif sort_by == "date_asc":
        smt = smt.order_by(Income.date.asc(), Income.id.asc())
    else:
        smt = smt.order_by(Income.date.desc(), Income.id.desc())

    smt = smt.offset(skip).limit(limit)
    return list(db.execute(smt).scalars().all())



def get_income(db: Session, income_id: int, user_id: int) -> Income | None:
    """_summary_

    Args:
        db (Session): the database session
        income_id (int): the ID of the income to retrieve
        user_id (int): the ID of the user who owns the income

    Returns:
        Income | None: the retrieved income or None if not found
    """
    smt = select(Income).where(Income.id == income_id, Income.user_id == user_id)
    return db.execute(smt).scalar_one_or_none()


def update_income(db: Session, user_id: int, income_id: int, amount: float = None, source: str = None, date: datetime = None, account: str = None) -> Income | None:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the income
        income_id (int): the ID of the income to update
        amount (float, optional): the updated amount of the income. Defaults to None.
        source (str, optional): the updated source of the income. Defaults to None.
        date (datetime, optional): the updated date of the income. Defaults to None.
        account (str, optional): the updated account associated with the income. Defaults to None.

    Returns:
        Income | None: the updated income or None if not found
    """
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
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the income
        income_id (int): the ID of the income to delete
        
    Returns:
        dict[str, str] | None: a success message or None if not found
    """
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
        "message": f"Income with ID {income_id} has been deleted."
    }