from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse
from app.crud.dashboard import get_dashboard_stats

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsResponse, status_code=200)
@router.get("", response_model=DashboardStatsResponse, status_code=200)
def get_user_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve aggregated dashboard stats for the authenticated user, including:
    - User stats (total balance, income, expenses, savings, and percentage changes)
    - Weekly overview (day-by-day weekly breakdown)
    - Monthly features (current month stats & monthly history breakdown)
    - Category spending breakdown
    - Recent transactions list
    """
    return get_dashboard_stats(db, current_user.id)
