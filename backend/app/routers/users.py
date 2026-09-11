from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserDetails, UpdateUserProfile
from app.schemas.auth import ChangePasswordRequest
from app.schemas.admin import UpgradeTierRequest
from app.core.authorization import normalize_role, UserRole
from app.crud.admin import log_activity
from app.crud.user import (
    update_user,
    delete_user,
    generate_and_send_password_reset_otp,
    change_user_password,
)


router = APIRouter()


@router.get("/me", response_model=UserDetails, status_code=200)
def get_current_user_details(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/update-profile", response_model=UserDetails, status_code=200)
def update_profile(
    profile_data: UpdateUserProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update the user's profile in the database
    update_user(db=db, user_id=current_user.id, **profile_data.model_dump(exclude_unset=True))
    return current_user


@router.post("/upgrade-tier", response_model=UserDetails, status_code=200)
def upgrade_user_tier(
    payload: UpgradeTierRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Switches role tier. Regular users must use the /subscriptions/request workflow
    which requires administrator review and approval.
    """
    if normalize_role(current_user.role) != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Direct tier upgrades are disabled. Please submit a subscription request for administrator approval."
        )

    target_role = normalize_role(payload.tier)
    if target_role not in (UserRole.USER.value, UserRole.PREMIUM.value, UserRole.ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier '{payload.tier}'. Must be 'user', 'premium', or 'admin'."
        )

    old_role = current_user.role
    current_user.role = target_role
    db.commit()
    db.refresh(current_user)

    log_activity(
        db=db,
        action="USER_TIER_UPGRADED",
        details=f"Admin {current_user.email} switched own tier from '{old_role}' to '{target_role}'.",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="subscription",
        status_str="SUCCESS"
    )

    return current_user


@router.post("/request-reset-otp", status_code=200)
def request_user_reset_otp(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a password reset OTP to the currently logged in user's email."""
    generate_and_send_password_reset_otp(db, current_user.email)
    return {"message": f"Verification code sent to {current_user.email}"}


@router.post("/change-password", status_code=200)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change the logged in user's password using either current password or email OTP."""
    change_user_password(
        db=db,
        user_id=current_user.id,
        new_password=payload.new_password,
        current_password=payload.current_password,
        otp=payload.otp,
    )
    return {"message": "Password changed successfully"}


@router.delete("/delete-account", status_code=200)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    response: Response = None
):
    # Delete the user's account from the database
    if not delete_user(db=db, user_id=current_user.id):
        raise HTTPException(status_code=404, detail="User not found")
    
    # Clear the authentication cookies
    if response:
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token")
    
    return {"detail": "Account deleted successfully."}