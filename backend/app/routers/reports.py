from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.core.roles import require_premium_or_admin, require_normal_or_premium
from app.models.user import User

from app.schemas.reports import ReportOut
from app.crud.reports import get_report
from app.crud.report_pdf import generate_report_pdf
from app.crud.report_pdf_limited import generate_report_pdf_limited
from app.crud.report_excel import generate_report_excel
from app.crud.report_excel_limited import generate_report_excel_limited


router = APIRouter()


# ==========================================
# GET FINANCIAL REPORT
# ==========================================

@router.get(
    "/",
    response_model=ReportOut,
)
def financial_report(
    period: str = Query(
        default="month",
        pattern="^(day|week|month|custom)$",
    ),
    start_date: datetime | None = Query(
        default=None,
    ),
    end_date: datetime | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_report(
            db=db,
            user_id=current_user.id,
            period=period,
            start_date=start_date,
            end_date=end_date,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


# ==========================================
# DOWNLOAD FINANCIAL REPORT PDF
# ==========================================

@router.get(
    "/pdf",
)
def download_report_pdf(
    period: str = Query(
        default="month",
        pattern="^(day|week|month|custom)$",
    ),
    start_date: datetime | None = Query(
        default=None,
    ),
    end_date: datetime | None = Query(
        default=None,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_premium_or_admin),
):
    try:
        if current_user.role in {"premium", "admin"}:
            pdf_buffer = generate_report_pdf(
                db=db,
                user_id=current_user.id,
                period=period,
                start_date=start_date,
                end_date=end_date,
            )
        else:
            pdf_buffer = generate_report_pdf_limited(
                db=db,
                user_id=current_user.id,
                period=period,
                start_date=start_date,
                end_date=end_date,
            )

        filename = (
            f"budget_buddy_{period}_report.pdf"
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"'
                )
            },
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )
# ==========================================
# DOWNLOAD FINANCIAL REPORT EXCEL
# ==========================================

@router.get(
    "/excel",
)
def download_report_excel(
    period: str = Query(
        default="month",
        pattern="^(day|week|month|custom)$",
    ),
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_premium_or_admin),
):
    try:
        if current_user.role in {"premium", "admin"}:
            excel_buffer = generate_report_excel(
                db=db,
                user_id=current_user.id,
                period=period,
                start_date=start_date,
                end_date=end_date,
            )
        else:
            excel_buffer = generate_report_excel_limited(
                db=db,
                user_id=current_user.id,
                period=period,
                start_date=start_date,
                end_date=end_date,
            )

        filename = f"budget_buddy_{period}_report.xlsx"

        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition":
                    f'attachment; filename="{filename}"'
            },
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )







