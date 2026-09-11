from datetime import datetime
from typing import Optional, Tuple
from fastapi import APIRouter, Depends, Query, Response, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.report import ReportDataResponse
from app.crud.report import (
    get_user_report_data,
    generate_excel_report,
    generate_pdf_report,
    generate_csv_report,
)
from app.core.authorization import (
    Permission,
    has_permission,
    require_permission,
    normalize_role,
    UserRole,
)
from app.crud.admin import log_activity

router = APIRouter()


def resolve_target_user_id(current_user: User, user_id_param: Optional[str]) -> Tuple[Optional[int], bool]:
    """
    Determines the target user ID for report queries based on caller's role and authorization.
    Returns (target_user_id, is_admin).
    - If caller is Admin:
      - None, '', or 'me' -> target_user_id = current_user.id (defaults to admin's personal reports)
      - 'all' -> target_user_id = None (system-wide data across all users)
      - valid integer string -> target_user_id = int (filtered to specific user)
      - invalid integer string -> target_user_id = current_user.id
    - If caller is Non-Admin (standard / premium):
      - Always target_user_id = current_user.id (strictly enforced)
    """
    is_admin = (
        has_permission(current_user, Permission.VIEW_OTHER_USERS_DATA)
        or normalize_role(current_user.role) == UserRole.ADMIN.value
    )
    if is_admin:
        if user_id_param:
            param_clean = user_id_param.strip().lower()
            if param_clean == "all":
                return None, True
            if param_clean not in ("", "me"):
                try:
                    return int(param_clean), True
                except ValueError:
                    return current_user.id, True
        return current_user.id, True
    return current_user.id, False



@router.get("/data", response_model=ReportDataResponse, status_code=200)
def get_report_data_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    period_type: str = Query("month", description="Period type: month, year, custom, all"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month number 1-12"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year number"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    transaction_type: str = Query("all", description="Transaction type: all, income, expense"),
    category: Optional[str] = Query(None, description="Filter by category or source"),
    account: Optional[str] = Query(None, description="Filter by account"),
    user_id: Optional[str] = Query(None, description="Target user ID or 'all' for system-wide (Admin only)"),
):
    """
    Returns aggregated report statistics, breakdowns, timeline data, and transaction history.
    Admins can view system-wide data or inspect specific users.
    """
    target_user_id, is_admin = resolve_target_user_id(current_user, user_id)
    return get_user_report_data(
        db=db,
        user_id=target_user_id,
        period_type=period_type,
        month=month,
        year=year,
        start_date_str=start_date,
        end_date_str=end_date,
        transaction_type=transaction_type,
        category=category,
        account=account,
        is_admin=is_admin,
    )


@router.get("/export/excel", status_code=200)
def export_excel_report_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    scope: str = Query("summary", description="Scope: 'summary' (Full financial workbook, Premium/Admin only) or 'transactions' (Transactions ledger only)"),
    period_type: str = Query("month", description="Period type: month, year, custom, all"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month number 1-12"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year number"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    transaction_type: str = Query("all", description="Transaction type: all, income, expense"),
    category: Optional[str] = Query(None, description="Filter by category or source"),
    account: Optional[str] = Query(None, description="Filter by account"),
    user_id: Optional[str] = Query(None, description="Target user ID or 'all' for system-wide (Admin only)"),
):
    """
    Generates and downloads an Excel spreadsheet (.xlsx).
    - Scope 'summary': Full 4-sheet multi-tab workbook with KPI analysis and category breakdowns.
      Restricted to Premium and Admin members.
    - Scope 'transactions': Clean transaction ledger table. Available to all users.
    """
    scope_norm = scope.strip().lower()
    is_transactions_only = (scope_norm == "transactions")

    if not is_transactions_only:
        # Full summary export requires EXPORT_FULL permission
        if not has_permission(current_user, Permission.EXPORT_FULL):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Exporting the full financial summary report is reserved for Premium and Admin members. Normal users can export transaction data only. Please subscribe to Premium."
            )

    target_user_id, _ = resolve_target_user_id(current_user, user_id)

    excel_buffer = generate_excel_report(
        db=db,
        user=current_user,
        period_type=period_type,
        month=month,
        year=year,
        start_date_str=start_date,
        end_date_str=end_date,
        transaction_type=transaction_type,
        category=category,
        account=account,
        is_limited=False,
        transactions_only=is_transactions_only,
        target_user_id=target_user_id,
    )

    log_activity(
        db=db,
        action="EXPORT_EXCEL",
        details=f"User exported Excel report for period '{period_type}' (Scope: '{scope_norm}', Target: '{target_user_id or 'all'}').",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="report",
        status_str="SUCCESS"
    )

    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    tier_prefix = "Transactions" if is_transactions_only else "Full_Report"
    filename = f"BudgetBuddy_{tier_prefix}_{period_type}_{now_str}.xlsx"

    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@router.get("/export/pdf", status_code=200)
def export_pdf_report_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    period_type: str = Query("month", description="Period type: month, year, custom, all"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month number 1-12"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year number"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    transaction_type: str = Query("all", description="Transaction type: all, income, expense"),
    category: Optional[str] = Query(None, description="Filter by category or source"),
    account: Optional[str] = Query(None, description="Filter by account"),
    user_id: Optional[str] = Query(None, description="Target user ID or 'all' for system-wide (Admin only)"),
):
    """
    Generates and downloads a comprehensive professional PDF financial report.
    Restricted to Premium and Admin members. Normal users can export transactions via CSV or Excel.
    """
    if not has_permission(current_user, Permission.EXPORT_FULL):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: Exporting the full financial summary report is reserved for Premium and Admin members. Normal users can export transaction data only. Please subscribe to Premium."
        )

    target_user_id, _ = resolve_target_user_id(current_user, user_id)

    pdf_buffer = generate_pdf_report(
        db=db,
        user=current_user,
        period_type=period_type,
        month=month,
        year=year,
        start_date_str=start_date,
        end_date_str=end_date,
        transaction_type=transaction_type,
        category=category,
        account=account,
        is_limited=False,
        target_user_id=target_user_id,
    )

    log_activity(
        db=db,
        action="EXPORT_PDF",
        details=f"User exported full PDF report for period '{period_type}' (Target: '{target_user_id or 'all'}').",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="report",
        status_str="SUCCESS"
    )

    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"BudgetBuddy_Full_Report_{period_type}_{now_str}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@router.get("/export/csv", status_code=200)
def export_csv_report_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    period_type: str = Query("month", description="Period type: month, year, custom, all"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month number 1-12"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year number"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    transaction_type: str = Query("all", description="Transaction type: all, income, expense"),
    category: Optional[str] = Query(None, description="Filter by category or source"),
    account: Optional[str] = Query(None, description="Filter by account"),
    user_id: Optional[str] = Query(None, description="Target user ID or 'all' for system-wide (Admin only)"),
):
    """
    Generates and downloads a CSV export of user transactions.
    """
    target_user_id, _ = resolve_target_user_id(current_user, user_id)

    csv_buffer = generate_csv_report(
        db=db,
        user_id=target_user_id,
        period_type=period_type,
        month=month,
        year=year,
        start_date_str=start_date,
        end_date_str=end_date,
        transaction_type=transaction_type,
        category=category,
        account=account,
        requesting_user=current_user,
    )

    log_activity(
        db=db,
        action="EXPORT_CSV",
        details=f"User exported CSV transactions for period '{period_type}' (Target: '{target_user_id or 'all'}').",
        user_id=current_user.id,
        user_email=current_user.email,
        resource_type="report",
        status_str="SUCCESS"
    )

    now_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"BudgetBuddy_Transactions_{period_type}_{now_str}.csv"

    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
