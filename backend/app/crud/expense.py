from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.schemas.expense import ExpenseCreate
from app.models.expense import Expense
from app.models.account import Account


def find_user_account(db: Session, user_id: int, account_identifier: str) -> Account | None:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the account
        account_identifier (str): the identifier for the account (bank name, account number, or formatted label)

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


def create_expense(db: Session, user_id: int, category: str, amount: float, description: str | None, date: datetime, account: str) -> Expense:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user who owns the expense
        category (str): the category of the expense
        amount (float): the amount of the expense
        description (str | None): the description of the expense
        date (datetime): the date of the expense
        account (str): the identifier for the account associated with the expense

    Returns:
        Expense: the created expense
    """
    expense = Expense(user_id=user_id, category=category, amount=amount, description=description, date=date, account=account)
    db.add(expense)

    # Deduct expense amount from user's matching bank account if present
    acct = find_user_account(db, user_id, account)
    if acct:
        acct.balance = float(acct.balance) - float(amount)

    db.commit()
    db.refresh(expense)
    return expense


def get_expenses_by_user(
    db: Session,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    account: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "date_desc"
) -> list[Expense]:
    """
    Retrieves filtered expense records with pagination and sorting.
    If user_id is None, retrieves cross-user records (Admin mode).
    """
    smt = select(Expense)
    if user_id is not None:
        smt = smt.where(Expense.user_id == user_id)
    if category and category.strip() and category.strip().lower() != "all":
        smt = smt.where(Expense.category == category.strip())
    if account and account.strip() and account.strip().lower() != "all":
        acc_str = account.strip()
        smt = smt.where(or_(Expense.account == acc_str, Expense.account.ilike(f"%{acc_str}%")))
    if start_date is not None:
        smt = smt.where(Expense.date >= start_date)
    if end_date is not None:
        smt = smt.where(Expense.date <= end_date)
    if min_amount is not None:
        smt = smt.where(Expense.amount >= min_amount)
    if max_amount is not None:
        smt = smt.where(Expense.amount <= max_amount)
    if search and search.strip():
        term = f"%{search.strip()}%"
        smt = smt.where(or_(
            Expense.description.ilike(term),
            Expense.category.ilike(term),
            Expense.account.ilike(term)
        ))

    if sort_by == "amount_asc":
        smt = smt.order_by(Expense.amount.asc(), Expense.date.desc())
    elif sort_by == "amount_desc":
        smt = smt.order_by(Expense.amount.desc(), Expense.date.desc())
    elif sort_by == "date_asc":
        smt = smt.order_by(Expense.date.asc(), Expense.id.asc())
    else:
        smt = smt.order_by(Expense.date.desc(), Expense.id.desc())

    smt = smt.offset(skip).limit(limit)
    return list(db.execute(smt).scalars().all())



def get_expense(db: Session, expense_id: int, user_id: int) -> Expense | None:
    """_summary_

    Args:
        db (Session): the database session
        expense_id (int): the ID of the expense to retrieve
        user_id (int): the ID of the user who owns the expense

    Returns:
        Expense | None: the retrieved expense or None if not found
    """
    smt = select(Expense).where(Expense.id == expense_id, Expense.user_id == user_id)
    return db.execute(smt).scalar()


def update_expense(db: Session, expense_id: int, user_id: int, expense_in: ExpenseCreate) -> Expense | None:
    """_summary_

    Args:
        db (Session): the database session
        expense_id (int): the ID of the expense to update
        user_id (int): the ID of the user who owns the expense
        expense_in (ExpenseCreate): the updated expense data

    Returns:
        Expense | None: the updated expense or None if not found
    """
    expense = get_expense(db, expense_id, user_id)
    if not expense:
        return None

    # Reverse old expense amount from old account balance
    if expense.account:
        old_acct = find_user_account(db, user_id, expense.account)
        if old_acct:
            old_acct.balance = float(old_acct.balance) + float(expense.amount)

    for field, value in expense_in.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)

    # Deduct new expense amount from new account balance
    new_acct = find_user_account(db, user_id, expense.account)
    if new_acct:
        new_acct.balance = float(new_acct.balance) - float(expense.amount)

    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense_id: int, user_id: int) -> dict[str, str] | None:
    """_summary_

    Args:
        db (Session): the database session
        expense_id (int): the ID of the expense to delete
        user_id (int): the ID of the user who owns the expense

    Returns:
        dict[str, str] | None: a success message or None if not found
    """
    expense = get_expense(db, expense_id, user_id)
    if not expense:
        return None

    # Refund expense amount back to account balance
    if expense.account:
        acct = find_user_account(db, user_id, expense.account)
        if acct:
            acct.balance = float(acct.balance) + float(expense.amount)

    db.delete(expense)
    db.commit()
    return {
        "success": True,
        "message": f"Expense with id {expense_id} deleted successfully",
    }