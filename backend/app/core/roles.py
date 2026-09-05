from fastapi import Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.user import User


ROLE_NORMAL = "normal"
ROLE_PREMIUM = "premium"
ROLE_ADMIN = "admin"

VALID_ROLES = {
    ROLE_NORMAL,
    ROLE_PREMIUM,
    ROLE_ADMIN,
}


def require_role(*allowed_roles):
    def role_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )

        return current_user

    return role_dependency


def require_normal_or_premium(
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {
        ROLE_NORMAL,
        ROLE_PREMIUM,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Normal or Premium User access required.",
        )

    return current_user


def require_premium(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != ROLE_PREMIUM:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium User access required.",
        )

    return current_user



def require_premium_or_admin(
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {
        ROLE_PREMIUM,
        ROLE_ADMIN,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium User or Admin access required.",
        )

    return current_user

def require_admin(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user

