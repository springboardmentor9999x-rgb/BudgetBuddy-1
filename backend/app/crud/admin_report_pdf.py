from io import BytesIO
from datetime import datetime, timedelta

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(
    TTFont("Arial", "C:/Windows/Fonts/arial.ttf")
)

pdfmetrics.registerFont(
    TTFont("Arial-Bold", "C:/Windows/Fonts/arialbd.ttf")
)
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.expense import Expense
from app.models.income import Income
from app.models.budget import Budget
from app.models.savings_goal import SavingsGoal


NAVY = colors.HexColor("#071a2b")
EMERALD = colors.HexColor("#10b981")
RED = colors.HexColor("#ef4444")
SLATE = colors.HexColor("#64748b")
LIGHT = colors.HexColor("#f8fafc")
BORDER = colors.HexColor("#cbd5e1")
LIGHT_GREEN = colors.HexColor("#ecfdf5")


def money(value):
    return f"₹{float(value or 0):,.2f}"


def get_system_report_data(db: Session):
    # ==========================================
    # USERS
    # ==========================================

    total_users = db.query(func.count(User.id)).scalar() or 0

    normal_users = (
        db.query(func.count(User.id))
        .filter(User.role == "normal")
        .scalar()
        or 0
    )

    premium_users = (
        db.query(func.count(User.id))
        .filter(User.role == "premium")
        .scalar()
        or 0
    )

    admin_users = (
        db.query(func.count(User.id))
        .filter(User.role == "admin")
        .scalar()
        or 0
    )

    student_users = (
        db.query(func.count(User.id))
        .filter(User.role == "student")
        .scalar()
        or 0
    )

    active_users = (
        db.query(func.count(User.id))
        .filter(User.is_active.is_(True))
        .scalar()
        or 0
    )

    inactive_users = max(total_users - active_users, 0)

    verified_users = (
        db.query(func.count(User.id))
        .filter(User.is_verified.is_(True))
        .scalar()
        or 0
    )

    unverified_users = max(total_users - verified_users, 0)

    # ==========================================
    # FINANCIAL TOTALS
    # ==========================================

    total_income = (
        db.query(func.coalesce(func.sum(Income.amount), 0))
        .scalar()
        or 0
    )

    total_expenses = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .scalar()
        or 0
    )

    total_budgets = (
        db.query(func.count(Budget.id))
        .scalar()
        or 0
    )

    total_savings_goals = (
        db.query(func.count(SavingsGoal.id))
        .scalar()
        or 0
    )

    savings_target = (
        db.query(
            func.coalesce(
                func.sum(SavingsGoal.target_amount),
                0,
            )
        )
        .scalar()
        or 0
    )

    savings_current = (
        db.query(
            func.coalesce(
                func.sum(SavingsGoal.current_amount),
                0,
            )
        )
        .scalar()
        or 0
    )

    total_income = float(total_income)
    total_expenses = float(total_expenses)
    savings_target = float(savings_target)
    savings_current = float(savings_current)

    net_balance = total_income - total_expenses

    # ==========================================
    # LAST 6 MONTHS
    # ==========================================

    now = datetime.utcnow()

    month_starts = []

    year = now.year
    month = now.month

    for offset in range(5, -1, -1):
        current_month = month - offset
        current_year = year

        while current_month <= 0:
            current_month += 12
            current_year -= 1

        month_starts.append(
            datetime(
                current_year,
                current_month,
                1,
            )
        )

    monthly_financial = []
    monthly_users = []

    for index, start in enumerate(month_starts):
        if index < len(month_starts) - 1:
            end = month_starts[index + 1]
        else:
            if start.month == 12:
                end = datetime(start.year + 1, 1, 1)
            else:
                end = datetime(
                    start.year,
                    start.month + 1,
                    1,
                )

        income_total = (
            db.query(
                func.coalesce(
                    func.sum(Income.amount),
                    0,
                )
            )
            .filter(
                Income.date >= start,
                Income.date < end,
            )
            .scalar()
            or 0
        )

        expense_total = (
            db.query(
                func.coalesce(
                    func.sum(Expense.amount),
                    0,
                )
            )
            .filter(
                Expense.date >= start,
                Expense.date < end,
            )
            .scalar()
            or 0
        )

        registered = (
            db.query(func.count(User.id))
            .filter(
                User.created_at >= start,
                User.created_at < end,
            )
            .scalar()
            or 0
        )

        monthly_financial.append(
            [
                start.strftime("%b %Y"),
                money(income_total),
                money(expense_total),
                money(
                    float(income_total)
                    - float(expense_total)
                ),
            ]
        )

        monthly_users.append(
            [
                start.strftime("%b %Y"),
                registered,
            ]
        )

    # ==========================================
    # EXPENSE CATEGORIES
    # ==========================================

    expense_category_rows = (
        db.query(
            Expense.category,
            func.sum(Expense.amount),
            func.count(Expense.id),
        )
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    expense_categories = []

    for category, amount, count in expense_category_rows:
        expense_categories.append(
            [
                category or "Other",
                count or 0,
                money(amount),
            ]
        )

    # ==========================================
    # INCOME CATEGORIES
    # ==========================================

    income_category_rows = (
        db.query(
            Income.category,
            func.sum(Income.amount),
            func.count(Income.id),
        )
        .group_by(Income.category)
        .order_by(func.sum(Income.amount).desc())
        .all()
    )

    income_categories = []

    for category, amount, count in income_category_rows:
        income_categories.append(
            [
                category or "Other",
                count or 0,
                money(amount),
            ]
        )

    # ==========================================
    # SAVINGS STATUS
    # ==========================================

    savings_status_rows = (
        db.query(
            SavingsGoal.status,
            func.count(SavingsGoal.id),
        )
        .group_by(SavingsGoal.status)
        .all()
    )

    savings_status = [
        [
            status_name or "Unknown",
            count or 0,
        ]
        for status_name, count in savings_status_rows
    ]

    return {
        "users": {
            "total": total_users,
            "normal": normal_users,
            "premium": premium_users,
            "admin": admin_users,
            "student": student_users,
            "active": active_users,
            "inactive": inactive_users,
            "verified": verified_users,
            "unverified": unverified_users,
        },
        "financial": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_balance": net_balance,
            "total_budgets": total_budgets,
            "total_savings_goals": total_savings_goals,
            "savings_target": savings_target,
            "savings_current": savings_current,
        },
        "monthly_financial": monthly_financial,
        "monthly_users": monthly_users,
        "expense_categories": expense_categories,
        "income_categories": income_categories,
        "savings_status": savings_status,
    }


def generate_report_pdf(db: Session):
    data = get_system_report_data(db)

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=14 * mm,
        leftMargin=14 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title="Budget Buddy - Overall System Report",
        author="Budget Buddy",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontName="Arial-Bold",
        fontSize=22,
        leading=26,
        textColor=NAVY,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontName="Arial",
        fontSize=9,
        leading=12,
        textColor=SLATE,
        spaceAfter=12,
    )

    section_style = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        fontName="Arial-Bold",
        fontSize=13,
        leading=16,
        textColor=NAVY,
        spaceBefore=10,
        spaceAfter=6,
    )

    small_style = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontName="Arial",
        fontSize=8,
        leading=10,
        textColor=SLATE,
    )

    story = []

    # ==========================================
    # HEADER
    # ==========================================

    story.append(
        Paragraph(
            "Budget Buddy",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "Personal Finance Management System",
            subtitle_style,
        )
    )

    story.append(
        Paragraph(
            "<b>OVERALL SYSTEM REPORT</b>",
            section_style,
        )
    )

    story.append(
        Paragraph(
            "Admin-only system-wide financial and user report",
            small_style,
        )
    )

    story.append(
        Spacer(1, 5 * mm)
    )

    # ==========================================
    # USER STATISTICS
    # ==========================================

    story.append(
        Paragraph(
            "User Statistics",
            section_style,
        )
    )

    users = data["users"]

    user_table = Table(
        [
            [
                "Metric",
                "Count",
                "Metric",
                "Count",
            ],
            [
                "Total Users",
                users["total"],
                "Active Users",
                users["active"],
            ],
            [
                "Normal Users",
                users["normal"],
                "Inactive Users",
                users["inactive"],
            ],
            [
                "Premium Users",
                users["premium"],
                "Verified Users",
                users["verified"],
            ],
            [
                "Admin Users",
                users["admin"],
                "Unverified Users",
                users["unverified"],
            ],
            [
                "Legacy Student Users",
                users["student"],
                "",
                "",
            ],
        ],
        colWidths=[
            43 * mm,
            20 * mm,
            43 * mm,
            20 * mm,
        ],
    )

    user_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    NAVY,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Arial-Bold",
                ),
                (
                    "FONTNAME",
                    (0, 1),
                    (-1, -1),
                    "Arial",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER,
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, -1),
                    LIGHT,
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "CENTER",
                ),
                (
                    "ALIGN",
                    (3, 1),
                    (3, -1),
                    "CENTER",
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(user_table)

    # ==========================================
    # FINANCIAL SUMMARY
    # ==========================================

    story.append(
        Paragraph(
            "Financial Summary",
            section_style,
        )
    )

    financial = data["financial"]

    financial_table = Table(
        [
            [
                "Metric",
                "Overall Amount",
            ],
            [
                "Total Income",
                money(financial["total_income"]),
            ],
            [
                "Total Expenses",
                money(financial["total_expenses"]),
            ],
            [
                "Net Balance",
                money(financial["net_balance"]),
            ],
            [
                "Total Budgets",
                financial["total_budgets"],
            ],
            [
                "Total Savings Goals",
                financial["total_savings_goals"],
            ],
            [
                "Savings Target",
                money(financial["savings_target"]),
            ],
            [
                "Current Savings",
                money(financial["savings_current"]),
            ],
        ],
        colWidths=[
            85 * mm,
            60 * mm,
        ],
    )

    financial_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    NAVY,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Arial-Bold",
                ),
                (
                    "FONTNAME",
                    (0, 1),
                    (-1, -1),
                    "Arial",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER,
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, -1),
                    LIGHT,
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "RIGHT",
                ),
                (
                    "TEXTCOLOR",
                    (1, 1),
                    (1, 1),
                    EMERALD,
                ),
                (
                    "TEXTCOLOR",
                    (1, 2),
                    (1, 2),
                    RED,
                ),
                (
                    "TEXTCOLOR",
                    (1, 3),
                    (1, 3),
                    EMERALD
                    if financial["net_balance"] >= 0
                    else RED,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(financial_table)

    # ==========================================
    # MONTHLY FINANCIAL ACTIVITY
    # ==========================================

    story.append(
        Paragraph(
            "Monthly Financial Activity",
            section_style,
        )
    )

    monthly_table = Table(
        [
            [
                "Month",
                "Income",
                "Expenses",
                "Net",
            ]
        ]
        + data["monthly_financial"],
        colWidths=[
            40 * mm,
            38 * mm,
            38 * mm,
            38 * mm,
        ],
    )

    monthly_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    NAVY,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Arial-Bold",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER,
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (-1, -1),
                    "RIGHT",
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, -1),
                    LIGHT,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(monthly_table)

    # ==========================================
    # USER REGISTRATION ACTIVITY
    # ==========================================

    story.append(
        Paragraph(
            "User Registration Activity",
            section_style,
        )
    )

    registration_table = Table(
        [
            [
                "Month",
                "New Registrations",
            ]
        ]
        + data["monthly_users"],
        colWidths=[
            70 * mm,
            70 * mm,
        ],
    )

    registration_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    NAVY,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Arial-Bold",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER,
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "CENTER",
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, -1),
                    LIGHT,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(registration_table)

    # ==========================================
    # CATEGORIES
    # ==========================================

    story.append(
        PageBreak()
    )

    story.append(
        Paragraph(
            "Expense Categories",
            section_style,
        )
    )

    expense_rows = data["expense_categories"]

    if expense_rows:
        expense_table = Table(
            [
                [
                    "Category",
                    "Transactions",
                    "Total Amount",
                ]
            ]
            + expense_rows,
            colWidths=[
                65 * mm,
                35 * mm,
                50 * mm,
            ],
        )
    else:
        expense_table = Table(
            [
                [
                    "No expense category data available."
                ]
            ],
            colWidths=[150 * mm],
        )

    expense_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    NAVY,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Arial-Bold",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER,
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, -1),
                    LIGHT,
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (-1, -1),
                    "RIGHT",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(expense_table)

    story.append(
        Paragraph(
            "Income Categories",
            section_style,
        )
    )

    income_rows = data["income_categories"]

    if income_rows:
        income_table = Table(
            [
                [
                    "Category",
                    "Transactions",
                    "Total Amount",
                ]
            ]
            + income_rows,
            colWidths=[
                65 * mm,
                35 * mm,
                50 * mm,
            ],
        )
    else:
        income_table = Table(
            [
                [
                    "No income category data available."
                ]
            ],
            colWidths=[150 * mm],
        )

    income_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    NAVY,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Arial-Bold",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER,
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, -1),
                    LIGHT,
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (-1, -1),
                    "RIGHT",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(income_table)

    # ==========================================
    # SAVINGS STATUS
    # ==========================================

    story.append(
        Paragraph(
            "Savings Goal Status",
            section_style,
        )
    )

    savings_rows = data["savings_status"]

    if savings_rows:
        savings_table = Table(
            [
                [
                    "Status",
                    "Number of Goals",
                ]
            ]
            + savings_rows,
            colWidths=[
                80 * mm,
                70 * mm,
            ],
        )
    else:
        savings_table = Table(
            [
                [
                    "No savings goal data available."
                ]
            ],
            colWidths=[150 * mm],
        )

    savings_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    LIGHT_GREEN,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    NAVY,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Arial-Bold",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    BORDER,
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, -1),
                    LIGHT,
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "CENTER",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    story.append(savings_table)

    # ==========================================
    # FOOTER
    # ==========================================

    story.append(
        Spacer(1, 8 * mm)
    )

    generated_at = datetime.now().strftime(
        "%d %b %Y, %I:%M %p"
    )

    story.append(
        Paragraph(
            f"Generated by Budget Buddy on {generated_at}. "
            "This report contains system-wide information and "
            "is intended for authorized administrators only.",
            small_style,
        )
    )

    def add_page_number(canvas, doc):
        canvas.saveState()

        width, height = A4

        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.5)

        canvas.line(
            14 * mm,
            10 * mm,
            width - 14 * mm,
            10 * mm,
        )

        canvas.setFont(
            "Arial",
            7,
        )

        canvas.setFillColor(SLATE)

        canvas.drawString(
            14 * mm,
            6 * mm,
            "Budget Buddy • Overall System Report",
        )

        canvas.drawRightString(
            width - 14 * mm,
            6 * mm,
            f"Page {doc.page}",
        )

        canvas.restoreState()

    doc.build(
        story,
        onFirstPage=add_page_number,
        onLaterPages=add_page_number,
    )

    buffer.seek(0)

    return buffer


