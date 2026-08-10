from fastapi import (
    APIRouter, Depends, 
    HTTPException, 
    Response, Cookie
)
# from fastapi.security import OAuth2PasswordRequestForm
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
from app.schemas.auth import LoginRequest

router = APIRouter()

@router.post("/signup", response_model=UserOut, status_code=201)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = create_user(db, user_in.email, user_in.password, user_in.full_name, user_in.monthly_income, user_in.currency)
    return user

# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session =Depends(get_db), response: Response = None):
@router.post("/login", response_model=TokenWithUserDetails, status_code=200)
def login(form_data: LoginRequest, db: Session =Depends(get_db), response: Response = None):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password) or not user.is_verified:
        raise HTTPException(status_code=401, detail="Invalid credentials or user not verified")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role}, expires_delta_in_seconds=60*60*24)  # 1 day
    refresh_token = create_refresh_token(data={"sub": user.email, "role": user.role})
    
    # access and refresh tokens are set in cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="strict", max_age=60*60*24)  # 1 day
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="strict",max_age=60*60*24*7)  # 7 days

    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/logout", status_code=200)
def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
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
    return {"message": "OTP verified successfully"}

@router.get("/refresh-token",response_model=Token, status_code=200)
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
    
@router.get("/me", response_model=UserDetails, status_code=200)
def get_current_user_details(current_user: UserDetails = Depends(get_current_user)):
    return current_user