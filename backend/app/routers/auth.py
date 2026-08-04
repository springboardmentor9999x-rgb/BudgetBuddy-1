from datetime import datetime, timedelta, timezone
import hashlib

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserOut, Token
from app.crud.user import get_user_by_email, create_user
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User
from app.services.email_service import (
    generate_verification_code,
    send_verification_email,
)


router = APIRouter()


# ==========================================
# REQUEST SCHEMAS
# ==========================================

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def hash_verification_code(code: str) -> str:
    """
    Hash the OTP before storing it in the database.
    """
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def create_and_store_verification_code(
    db: Session,
    user: User
) -> str:
    """
    Generate a 6-digit OTP and store its hash
    with a 10-minute expiration time.
    """

    code = generate_verification_code()

    user.verification_code = hash_verification_code(code)

    user.verification_code_expires_at = (
        datetime.now(timezone.utc).replace(tzinfo=None)
        + timedelta(minutes=10)
    )

    db.commit()
    db.refresh(user)

    return code


# ==========================================
# SIGNUP
# ==========================================

@router.post("/signup", response_model=UserOut)
def signup(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = get_user_by_email(
        db,
        user_in.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create account
    user = create_user(
        db,
        user_in.email,
        user_in.password,
        user_in.full_name
    )

    # Generate verification OTP
    verification_code = (
        create_and_store_verification_code(
            db,
            user
        )
    )

    # Send verification email
    try:
        send_verification_email(
            user.email,
            verification_code
        )

    except Exception as exc:
        # User exists, so don't silently pretend
        # verification was sent.
        raise HTTPException(
            status_code=500,
            detail=(
                "Account created, but verification "
                "email could not be sent. "
                "Please use resend verification."
            )
        ) from exc

    return user


# ==========================================
# VERIFY EMAIL
# ==========================================

@router.post("/verify-email")
def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(
        db,
        request.email
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.is_verified:
        return {
            "message": "Email is already verified"
        }

    if not user.verification_code:
        raise HTTPException(
            status_code=400,
            detail="No verification code found. Please request a new code."
        )

    if not user.verification_code_expires_at:
        raise HTTPException(
            status_code=400,
            detail="Verification code has expired. Please request a new code."
        )

    current_time = datetime.now(
        timezone.utc
    ).replace(tzinfo=None)

    if current_time > user.verification_code_expires_at:
        raise HTTPException(
            status_code=400,
            detail="Verification code has expired. Please request a new code."
        )

    submitted_code_hash = (
        hash_verification_code(
            request.code.strip()
        )
    )

    if submitted_code_hash != user.verification_code:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code"
        )

    # Verification successful
    user.is_verified = True

    # OTP cannot be reused
    user.verification_code = None
    user.verification_code_expires_at = None

    db.commit()
    db.refresh(user)

    return {
        "message": "Email verified successfully"
    }


# ==========================================
# RESEND VERIFICATION CODE
# ==========================================

@router.post("/resend-verification")
def resend_verification(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(
        db,
        request.email
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.is_verified:
        return {
            "message": "Email is already verified"
        }

    verification_code = (
        create_and_store_verification_code(
            db,
            user
        )
    )

    try:
        send_verification_email(
            user.email,
            verification_code
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email"
        ) from exc

    return {
        "message": "Verification code sent successfully"
    }


# ==========================================
# LOGIN
# ==========================================

@router.post(
    "/login",
    response_model=Token
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = get_user_by_email(
        db,
        form_data.username
    )

    if not user or not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # Block login until email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in"
        )

    token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ==========================================
# CURRENT USER
# ==========================================

@router.get("/me")
def read_current_user(
    current_user: User = Depends(
        get_current_user
    )
):
    return {
        "id": current_user.id,
        "full_name": (
            current_user.profile.full_name
            if current_user.profile
            else None
        ),
        "email": current_user.email,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
    }