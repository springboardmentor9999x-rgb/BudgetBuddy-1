from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.schemas.analytics import (
    AnalyticsSummary,
    MonthlyAnalytics,
    CategoryAnalytics,
    AnalyticsOverview,
)

from app.crud.analytics import (
    get_analytics_summary,
    get_monthly_analytics,
    get_category_analytics,
    get_analytics_overview,
)


router = APIRouter()


# ==========================================
# FINANCIAL SUMMARY
# ==========================================

@router.get(
    "/summary",
    response_model=AnalyticsSummary,
)
def analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_analytics_summary(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# MONTHLY ANALYTICS
# ==========================================

@router.get(
    "/monthly",
    response_model=list[MonthlyAnalytics],
)
def analytics_monthly(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_monthly_analytics(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# CATEGORY ANALYTICS
# ==========================================

@router.get(
    "/categories",
    response_model=list[CategoryAnalytics],
)
def analytics_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_category_analytics(
        db=db,
        user_id=current_user.id,
    )


# ==========================================
# COMPLETE ANALYTICS OVERVIEW
# ==========================================

@router.get(
    "/overview",
    response_model=AnalyticsOverview,
)
def analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_analytics_overview(
        db=db,
        user_id=current_user.id,
    )