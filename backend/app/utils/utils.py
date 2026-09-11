import random
from datetime import datetime, timezone

def generate_otp(length: int = 6) -> str:
    """Generate a random OTP of specified length."""
    if length <= 0:
        raise ValueError("Length must be a positive integer.")
    return ''.join(random.choices('0123456789', k=length))

def get_current_timestamp():
    """Get the current timestamp in UTC."""
    return datetime.now(timezone.utc)