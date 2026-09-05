from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud.profile import (
    get_profile_by_user_id,
    update_profile,
)
from app.database import get_db
from app.models.user import User
from app.schemas.profile import ProfileOut, ProfileUpdate


router = APIRouter()


# ============================================================
# GET CURRENT USER PROFILE
# ============================================================

@router.get(
    "/me",
    response_model=ProfileOut,
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_profile_by_user_id(
        db,
        current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    return profile


# ============================================================
# UPDATE CURRENT USER PROFILE
# ============================================================

@router.put(
    "/me",
    response_model=ProfileOut,
)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_profile_by_user_id(
        db,
        current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    updated_profile = update_profile(
        db,
        profile,
        profile_data,
    )

    return updated_profile