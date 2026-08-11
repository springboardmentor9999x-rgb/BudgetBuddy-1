from sqlalchemy.orm import Session

from app.models import user
from app.models.user import User
from app.models.profile import Profile
from app.core.security import hash_password
from app.utils.email_service import send_email
from app.utils.utils import generate_otp

def get_user_by_email(db: Session, email: str)-> User:
    """_summary_

    Args:
        db (Session): the database session
        email (str): the email of the user to retrieve

    Returns:
        User: the user object if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, email: str, password: str, full_name: str, monthly_income: float, currency: str)-> User:
    """_summary_

    Args:
        db (Session): the database session
        email (str): the email of the user to create
        password (str): the password for the new user
        full_name (str): the full name of the new user
        monthly_income (float): the monthly income of the new user
        currency (str): the currency for the new user

    Returns:
        User: the created user object
    """
    user = User(email=email, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    profile = Profile(user_id=user.id, full_name=full_name, monthly_income=monthly_income, currency=currency)
    db.add(profile)

    # otp generation and email sending
    otp = generate_otp()
    user.otp = otp
    db.commit()

    send_email(otp=otp, recipient_email=email)  # Send the OTP email

    return user

def update_user(db: Session, user_id: int, full_name: str = None, monthly_income: float = None, currency: str = None) -> Profile:
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user to update
        full_name (str, optional): the full name of the user to update. Defaults to None.
        monthly_income (float, optional): the monthly income of the user to update. Defaults to None.
        currency (str, optional): the currency of the user to update. Defaults to None.
    """
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if full_name is not None:
        profile.full_name = full_name
    if monthly_income is not None:
        profile.monthly_income = monthly_income
    if currency is not None:
        profile.currency = currency

    db.commit()
    db.refresh(profile)
    return profile

def delete_user(db: Session, user_id: int):
    """_summary_

    Args:
        db (Session): the database session
        user_id (int): the ID of the user to delete
    """
    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if user_to_delete:
        db.delete(user_to_delete)
        db.commit()
        return True
    return False