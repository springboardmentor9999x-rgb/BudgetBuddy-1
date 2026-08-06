from pydantic import BaseModel, EmailStr, ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    monthly_income: float
    currency: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)

class ProfileOut(BaseModel):
    full_name: str
    monthly_income: float
    currency: str

    model_config = ConfigDict(from_attributes=True)

class UserDetails(UserOut):
    profile: ProfileOut

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str

class OTPVerification(BaseModel):
    email: EmailStr
    otp: str
    
class TokenWithUserDetails(Token):
    user: UserDetails
    