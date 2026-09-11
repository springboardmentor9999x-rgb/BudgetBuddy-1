from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.account import Account

def get_account_by_user_and_bank_name(db: Session, user_id: int, bank_name: str) -> Account:
    """Get account for a user by bank name."""
    stmt = select(Account).where(Account.user_id == user_id, Account.bank_name == bank_name)
    result = db.execute(stmt).scalars().first()
    return result


def get_account_by_user_bank_and_number(db: Session, user_id: int, bank_name: str, account_number: str) -> Account | None:
    """Get account for a user by bank name and account number."""
    stmt = select(Account).where(
        Account.user_id == user_id,
        Account.bank_name == bank_name,
        Account.account_number == account_number,
    )
    result = db.execute(stmt).scalars().first()
    return result


def create_account(db: Session, user_id: int, bank_name: str, account_number: str, balance: float) -> Account:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the account
        bank_name (str): the name of the bank where the account is held
        account_number (str): the account number
        balance (float): the current balance in the account

    Returns:
        Account: the created account
    """
    account = Account(user_id=user_id, bank_name=bank_name, account_number=account_number, balance=balance)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

# def get_account_by_account_number(db: Session, account_number: str) -> Account:
#     """_summary_
#     Args:
#         db (Session): the database session
#         account_number (str): the account number for which to retrieve the account

#     Returns:
#         Account: get's the account for a given account number
#     """
#     stmt = select(Account).where(Account.account_number == account_number)
#     result = db.execute(stmt).scalars().first()
#     return result

def get_account_by_id(db: Session, account_id: int, user_id: int) -> Account:
    """_summary_

    Args:
        db (Session): the database session
        account_id (int): the ID of the account to retrieve
        user_id (int): the ID of the user who owns the account

    Returns:
        Account: get's the account for a given account ID
    """
    stmt = select(Account).where(Account.id == account_id, Account.user_id == user_id)
    result = db.execute(stmt).scalars().first()
    return result

def delete_account(db: Session, account_id: int, user_id: int) -> bool:
    """_summary_

    Args:
        db (Session): the database session
        account_id (int): the ID of the account to delete
        user_id (int): the ID of the user who owns the account
    """
    account = get_account_by_id(db, account_id, user_id)
    if not account:
        return False
        
    db.delete(account)
    db.commit()
    return True

def update_account_balance(db: Session, account_id: int, new_balance: float) -> Account:
    """_summary_

    Args:
        db (Session): the database session
        account_id (int): the ID of the account to update
        new_balance (float): the new balance to set for the account

    Returns:
        Account: the updated account
    """
    account = get_account_by_id(db, account_id)
    if account:
        account.balance = new_balance
        db.commit()
        db.refresh(account)
        
    return account

def update_account(db: Session, account_id: int, bank_name: str = None, account_number: str = None, balance: float = None) -> Account:
    """_summary_

    Args:
        db (Session): the database session
        account_id (int): the ID of the account to update
        bank_name (str, optional): the new bank name to set for the account. Defaults to None.
        account_number (str, optional): the new account number to set for the account. Defaults to None.
        balance (float, optional): the new balance to set for the account. Defaults to None.

    Returns:
        Account: the updated account
    """
    account = get_account_by_id(db, account_id)
    if account:
        if bank_name is not None:
            account.bank_name = bank_name
        if account_number is not None:
            account.account_number = account_number
        if balance is not None:
            account.balance = balance
        
        db.commit()
        db.refresh(account)
        
    return account

def get_all_user_accounts(db: Session, user_id: int) -> list[Account]:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user for whom to retrieve accounts

    Returns:
        list[Account]: get's the list of all accounts
    """
    stmt = select(Account).where(Account.user_id == user_id)
    result = db.execute(stmt).scalars().all()
    return result

def add_amount_to_account(db: Session, account_id: int, amount: float) -> Account:
    """_summary_

    Args:
        db (Session): the database session
        account_id (int): the ID of the account to update
        amount (float): the amount to add to the account balance

    Returns:
        Account: the updated account
    """
    account = get_account_by_id(db, account_id)
    if account:
        account.balance += amount
        db.commit()
        db.refresh(account)
        
    return account

def subtract_amount_from_account(db: Session, account_id: int, amount: float) -> Account:
    """_summary_

    Args:
        db (Session): the database session
        account_id (int): the ID of the account to update
        amount (float): the amount to subtract from the account balance

    Returns:
        Account: the updated account
    """
    stmt = select(Account).where(Account.id == account_id)
    account = db.execute(stmt).scalars().first()
    if account:
        if account.balance < amount:
            raise ValueError("Insufficient balance in the account")
        account.balance -= amount
        db.commit()
        db.refresh(account)
        
    return account