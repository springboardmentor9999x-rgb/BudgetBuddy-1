from fastapi import (
    APIRouter, Depends, 
    HTTPException, 
    Response, Cookie,
    status
)
from jose import jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import TokenWithUserDetails, UserCreate, UserDetails, UserOut, Token
from app.crud.user import get_user_by_email, create_user
from app.core.security import (
    verify_password, 
    create_access_token, 
    create_refresh_token,
    verify_refresh_token
)
from app.schemas.user import OTPVerification
from app.core.deps import get_current_user
from app.schemas.auth import LoginRequest, PasswordResetRequest, PasswordResetConfirm
from app.core.authorization import normalize_role
from app.crud.admin import log_activity
from app.crud.user import (
    get_user_by_email,
    create_user,
    generate_and_send_password_reset_otp,
    reset_user_password,
    resend_verification_otp,
)

router = APIRouter()


@router.post("/signup", response_model=UserOut, status_code=201)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = create_user(db, user_in.email, user_in.password, user_in.full_name, user_in.monthly_income, user_in.currency)
    log_activity(
        db=db,
        action="AUTH_SIGNUP",
        details=f"New user registered: {user.email}",
        user_id=user.id,
        user_email=user.email,
        resource_type="auth",
        status_str="SUCCESS"
    )
    return user


@router.post("/login", response_model=TokenWithUserDetails, status_code=200)
def login(form_data: LoginRequest, db: Session = Depends(get_db), response: Response = None):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        log_activity(
            db=db,
            action="AUTH_LOGIN_FAILED",
            details=f"Failed login attempt for username: {form_data.username}",
            user_email=form_data.username,
            resource_type="auth",
            status_str="FAILED"
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=401, detail="Email not verified. Please verify your OTP.")

    if not user.is_active:
        log_activity(
            db=db,
            action="AUTH_LOGIN_BLOCKED",
            details=f"Suspended user attempted login: {user.email}",
            user_id=user.id,
            user_email=user.email,
            resource_type="auth",
            status_str="DENIED"
        )
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account has been suspended. Please contact administrator.")

    role_val = normalize_role(user.role)
    access_token = create_access_token(data={"sub": user.email, "role": role_val}, expires_delta_in_seconds=60*60*24)  # 1 day
    refresh_token = create_refresh_token(data={"sub": user.email, "role": role_val})
    
    # access and refresh tokens are set in cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="strict", max_age=60*60*24)  # 1 day
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="strict", max_age=60*60*24*7)  # 7 days

    log_activity(
        db=db,
        action="AUTH_LOGIN",
        details=f"User logged in successfully: {user.email} (Role: {role_val})",
        user_id=user.id,
        user_email=user.email,
        resource_type="auth",
        status_str="SUCCESS"
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.get("/logout", status_code=200)
def logout(response: Response, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    if current_user:
        log_activity(
            db=db,
            action="AUTH_LOGOUT",
            details=f"User logged out: {current_user.email}",
            user_id=current_user.id,
            user_email=current_user.email,
            resource_type="auth",
            status_str="SUCCESS"
        )
    return {"message": "Logged out successfully"}


@router.post("/verify-otp", status_code=200)
def verify_otp(otp_verification: OTPVerification, db: Session = Depends(get_db)):
    user = get_user_by_email(db, otp_verification.email)
    if not user or not user.otp:
        raise HTTPException(status_code=400, detail="User not found")
    if user.otp != otp_verification.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")
    
    user.is_verified = True
    user.otp = None  # Clear the OTP after successful verification
    db.commit()

    log_activity(
        db=db,
        action="AUTH_OTP_VERIFIED",
        details=f"Email verified for {user.email}",
        user_id=user.id,
        user_email=user.email,
        resource_type="auth",
        status_str="SUCCESS"
    )
    return {"message": "OTP verified successfully"}


@router.post("/resend-otp", status_code=200)
def resend_otp(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    """Resend a new verification OTP to the unverified user's email."""
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found with this email")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account is already verified. Please sign in.")
    
    success = resend_verification_otp(db, payload.email)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to resend verification code")
    
    return {"message": "Verification code resent successfully"}


@router.post("/request-password-reset", status_code=200)
def request_password_reset(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request a password reset OTP sent to the user's email."""
    user = get_user_by_email(db, payload.email)
    if not user:
        # Prevent email enumeration or give friendly message
        raise HTTPException(status_code=404, detail="User with this email was not found")
    
    generate_and_send_password_reset_otp(db, payload.email)
    return {"message": "Password reset OTP has been sent to your email"}


@router.post("/reset-password", status_code=200)
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password using email, OTP and new password."""
    reset_user_password(db, payload.email, payload.otp, payload.new_password)
    return {"message": "Password has been reset successfully"}


@router.get("/refresh-token", response_model=Token, status_code=200)
def refresh_token(refresh_token: str = Cookie(None), response: Response = None):
    if not refresh_token:
        raise HTTPException(status_code=404, detail="Refresh token missing")
    
    try:
        payload = verify_refresh_token(refresh_token)
        access_token = create_access_token(data={"sub": payload["sub"], "role": payload["role"]}, expires_delta_in_seconds=60*60*24)  # 1 day
        response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="strict", max_age=60*60*24)  # 1 day
        return {"access_token": access_token, "token_type": "bearer"}
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")