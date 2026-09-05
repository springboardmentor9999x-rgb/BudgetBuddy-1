from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.roles import require_premium
from app.models.user import User

from app.schemas.monthly_report import MonthlyReportOut
from app.crud.monthly_report import get_monthly_report


router = APIRouter()


# ==========================================
# GET MONTHLY FINANCIAL REPORT
# ==========================================

@router.get(
    "/",
    response_model=MonthlyReportOut,
)
def monthly_report(
    year: int = Query(
        ...,
        ge=2000,
        le=2100,
    ),
    month: int = Query(
        ...,
        ge=1,
        le=12,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_premium),
):
    return get_monthly_report(
        db=db,
        user_id=current_user.id,
        year=year,
        month=month,
    )

