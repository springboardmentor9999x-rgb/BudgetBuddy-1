from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt

from app.configs.settings import Settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta_in_seconds: int = None)-> str:
    """_summary_

    Args:
        data (dict): data to encode in the JWT token (e.g., id, email, role)
        expires_delta_in_seconds (int, optional): The time duration in seconds for which the token will be valid. Defaults to None.

    Returns:
        _str_: The encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (timedelta(seconds=expires_delta_in_seconds) if expires_delta_in_seconds is not None else timedelta(minutes=Settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, Settings.SECRET_KEY, algorithm=Settings.ALGORITHM)

def create_refresh_token(data: dict, expires_delta: timedelta = None) -> str:
    """_summary_

    Args:
        data (dict): data to encode in the JWT token (e.g., id, email, role)
        expires_delta (timedelta, optional): The time duration for which the token will be valid. Defaults to None.

    Returns:
        _str_: The encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=Settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, Settings.REFRESH_TOKEN_SECRET_KEY, algorithm=Settings.ALGORITHM)

def verify_refresh_token(token: str) -> dict:
    """_summary_

    Args:
        token (str): The JWT token to verify.

    Returns:
        dict: The decoded data from the JWT token.

    Raises:
        jwt.JWTError: If the token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, Settings.REFRESH_TOKEN_SECRET_KEY, algorithms=[Settings.ALGORITHM])
        return payload
    except jwt.JWTError as e:
        raise e