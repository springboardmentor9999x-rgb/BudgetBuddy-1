from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    username: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification OTP")
    new_password: str = Field(..., min_length=6, description="New password")


class ChangePasswordRequest(BaseModel):
    current_password: str | None = None
    otp: str | None = None
    new_password: str = Field(..., min_length=6, description="New password")