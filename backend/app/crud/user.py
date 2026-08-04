from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import Profile
from app.core.security import hash_password

# from app.utils.send_email import send_message_dependency
from app.utils.email_service import send_email
from app.utils.utils import generate_otp

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, email: str, password: str, full_name: str, monthly_income: float, currency: str):
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