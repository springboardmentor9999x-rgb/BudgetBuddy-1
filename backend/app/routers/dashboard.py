from typing import Optional
from fastapi import APIRouter, Depends, Query
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
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter stats by month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter stats by year (e.g. 2026)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve aggregated dashboard stats for the authenticated user, optionally filtered by month and year.
    """
    return get_dashboard_stats(db, current_user.id, month=month, year=year)

