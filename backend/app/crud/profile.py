from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.schemas.profile import ProfileUpdate


def get_profile_by_user_id(
    db: Session,
    user_id: int,
):
    return (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .first()
    )


def create_profile(
    db: Session,
    user_id: int,
    full_name: str,
    monthly_income: float,
    currency: str,
):
    profile = Profile(
        user_id=user_id,
        full_name=full_name,
        monthly_income=monthly_income,
        currency=currency,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def update_profile(
    db: Session,
    profile: Profile,
    profile_data: ProfileUpdate,
):
    profile.full_name = profile_data.full_name
    profile.monthly_income = profile_data.monthly_income
    profile.currency = profile_data.currency

    db.commit()
    db.refresh(profile)

    return profile