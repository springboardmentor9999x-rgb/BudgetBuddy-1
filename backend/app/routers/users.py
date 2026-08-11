from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.user import UserDetails, UpdateUserProfile
from app.crud.user import update_user, delete_user



router = APIRouter()


@router.get("/me", response_model=UserDetails, status_code=200)
def get_current_user_details(current_user: UserDetails = Depends(get_current_user)):
    return current_user

@router.put("/update-profile", response_model=UserDetails, status_code=200)
def update_profile(
    profile_data: UpdateUserProfile,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Update the user's profile in the database
    update_user(db=db,user_id=current_user.id,**profile_data.model_dump(exclude_unset=True))

    return current_user

@router.delete("/delete-account", status_code=204)
def delete_account(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    response: Response = None
):
    # Delete the user's account from the database
    if not delete_user(db=db, user_id=current_user.id):
        raise HTTPException(status_code=404, detail="User not found")
    
    # Clear the authentication cookies
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    
    return {"detail": "Account deleted successfully."}