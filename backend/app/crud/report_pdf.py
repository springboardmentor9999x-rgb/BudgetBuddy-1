from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm

from app.crud.reports import get_report
from app.models.profile import Profile


# ============================================================
# FONTS
# ============================================================

FONT = "SegoeUI"
FONT_BOLD = "SegoeUI-Bold"

try:
    pdfmetrics.registerFont(
        TTFont(FONT, "C:/Windows/Fonts/segoeui.ttf")
    )
    pdfmetrics.registerFont(
        TTFont(FONT_BOLD, "C:/Windows/Fonts/segoeuib.ttf")
    )
except Exception:
    FONT = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"


# ============================================================
# COLORS
# ============================================================

NAVY = colors.HexColor("#071A2B")
NAVY_2 = colors.HexColor("#0B263D")

EMERALD = colors.HexColor("#059669")
LIGHT_GREEN = colors.HexColor("#ECFDF5")

RED = colors.HexColor("#DC2626")

BLUE = colors.HexColor("#2563EB")

SLATE = colors.HexColor("#64748B")
DARK = colors.HexColor("#17233A")
BORDER = colors.HexColor("#AAB8CC")
LIGHT_BORDER = colors.HexColor("#CBD5E1")
WHITE = colors.white


# ============================================================
# HELPERS
# ============================================================

def money(value):
    # Use Unicode codepoint so terminal encoding never damages ₹
    rupee = chr(8377)
    return f"{rupee}{float(value or 0):,.2f}"


def date_text(value):
    if not value:
        return "—"

    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except Exception:
            return value[:10]

    return value.strftime("%d %b %Y")


def period_label(period, start_date, end_date):
    if period == "day":
        return date_text(start_date)

    if period == "week":
        return f"{date_text(start_date)} – {date_text(end_date)}"

    if period == "month":
        return f"{date_text(start_date)} – {date_text(end_date)}"

    return f"{date_text(start_date)} – {date_text(end_date)}"


def fit_text(c, text, max_width, font=FONT, size=8):
    text = str(text or "")

    c.setFont(font, size)

    if c.stringWidth(text) <= max_width:
        return text

    suffix = "..."
    while text and c.stringWidth(text + suffix) > max_width:
        text = text[:-1]

    return text + suffix


def draw_text(
    c,
    text,
    x,
    y,
    size=8,
    font=FONT,
    color=DARK,
):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, str(text))


def draw_center(
    c,
    text,
    x,
    y,
    size=8,
    font=FONT,
    color=DARK,
):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawCentredString(x, y, str(text))


def draw_right(
    c,
    text,
    x,
    y,
    size=8,
    font=FONT,
    color=DARK,
):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawRightString(x, y, str(text))


def draw_section_title(c, title, x, y):
    draw_text(
        c,
        title,
        x,
        y,
        size=13,
        font=FONT_BOLD,
        color=NAVY,
    )


def draw_table_grid(c, x, y, width, height, columns, rows):
    """
    Draw a complete bordered table.

    y = bottom of table
    """

    c.setStrokeColor(BORDER)
    c.setLineWidth(0.7)

    c.rect(
        x,
        y,
        width,
        height,
        stroke=1,
        fill=0,
    )

    # Vertical lines
    current_x = x

    for col_width in columns[:-1]:
        current_x += col_width

        c.line(
            current_x,
            y,
            current_x,
            y + height,
        )

    # Horizontal lines
    if rows > 1:
        row_height = height / rows

        for i in range(1, rows):
            current_y = y + row_height * i

            c.line(
                x,
                current_y,
                x + width,
                current_y,
            )


def get_account_holder_name(db, user_id):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .first()
    )

    if profile and profile.full_name:
        return profile.full_name

    return "Account Holder"


# ============================================================
# MAIN PDF
# ============================================================

def generate_report_pdf(
    db,
    user_id: int,
    period: str,
    start_date=None,
    end_date=None,
):

    report = get_report(
        db=db,
        user_id=user_id,
        period=period,
        start_date=start_date,
        end_date=end_date,
    )

    holder_name = get_account_holder_name(
        db,
        user_id,
    )

    summary = report.get("summary", {})
    categories = report.get(
        "expense_categories",
        [],
    )
    transactions = report.get(
        "transactions",
        [],
    )
    verification = report.get(
        "verification",
        {},
    )

    total_income = float(
        summary.get("total_income", 0) or 0
    )

    total_expenses = float(
        summary.get("total_expenses", 0) or 0
    )

    net_balance = float(
        summary.get("net_balance", 0) or 0
    )

    savings = float(
        summary.get("savings", net_balance) or 0
    )

    income_count = int(
        verification.get("income_count", 0)
    )

    expense_count = int(
        verification.get("expense_count", 0)
    )

    transaction_count = int(
        verification.get("transaction_count", 0)
    )


    # ========================================================
    # DOCUMENT
    # ========================================================

    buffer = BytesIO()

    c = canvas.Canvas(
        buffer,
        pagesize=A4,
    )

    page_width, page_height = A4

    margin = 14 * mm

    content_x = margin
    content_width = page_width - (2 * margin)


    # ========================================================
    # OUTER BORDER
    # ========================================================

    c.setStrokeColor(
        colors.HexColor("#7F8EA3")
    )

    c.setLineWidth(0.8)

    c.rect(
        5 * mm,
        5 * mm,
        page_width - 10 * mm,
        page_height - 10 * mm,
        stroke=1,
        fill=0,
    )


    # ========================================================
    # HEADER
    # ========================================================

    y = page_height - 19 * mm

    draw_text(
        c,
        "Budget Buddy",
        content_x,
        y,
        size=22,
        font=FONT_BOLD,
        color=NAVY,
    )

    draw_text(
        c,
        "Personal Finance Management System",
        content_x,
        y - 7 * mm,
        size=9.5,
        font=FONT,
        color=DARK,
    )

    draw_right(
        c,
        f"Account Holder: {holder_name}",
        page_width - margin,
        y - 2 * mm,
        size=9,
        font=FONT,
        color=NAVY,
    )

    # Header divider
    c.setStrokeColor(
        colors.HexColor("#AAB8CC")
    )
    c.setLineWidth(0.7)

    c.line(
        content_x,
        y - 12 * mm,
        page_width - margin,
        y - 12 * mm,
    )


    # ========================================================
    # REPORT TITLE
    # ========================================================

    y -= 23 * mm

    period_title = {
        "day": "Day Financial Report",
        "week": "Week Financial Report",
        "month": "Month Financial Report",
        "custom": "Custom Financial Report",
    }.get(
        period,
        "Financial Report",
    )

    draw_text(
        c,
        period_title,
        content_x,
        y,
        size=16,
        font=FONT_BOLD,
        color=NAVY,
    )

    draw_text(
        c,
        period_label(
            period,
            report.get("start_date"),
            report.get("end_date"),
        ),
        content_x,
        y - 7 * mm,
        size=9.5,
        font=FONT,
        color=DARK,
    )


    # ========================================================
    # FINANCIAL SUMMARY
    # ========================================================

    y -= 19 * mm

    draw_section_title(
        c,
        "Financial Summary",
        content_x,
        y,
    )

    y -= 5 * mm

    summary_top = y
    summary_height = 21 * mm

    col_width = content_width / 4

    # Outer summary table
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.8)

    c.roundRect(
        content_x,
        summary_top - summary_height,
        content_width,
        summary_height,
        1.5 * mm,
        stroke=1,
        fill=0,
    )

    # Vertical lines
    for i in range(1, 4):
        xx = content_x + col_width * i

        c.line(
            xx,
            summary_top - summary_height,
            xx,
            summary_top,
        )

    # Horizontal divider
    divider_y = summary_top - 9 * mm

    c.line(
        content_x,
        divider_y,
        content_x + content_width,
        divider_y,
    )

    labels = [
        "Total Income",
        "Total Expenses",
        "Net Balance",
        "Savings",
    ]

    amounts = [
        total_income,
        total_expenses,
        net_balance,
        savings,
    ]

    amount_colors = [
        EMERALD,
        RED,
        EMERALD if net_balance >= 0 else RED,
        EMERALD if savings >= 0 else RED,
    ]

    for i in range(4):

        center_x = (
            content_x
            + col_width * i
            + col_width / 2
        )

        draw_center(
            c,
            labels[i],
            center_x,
            summary_top - 6 * mm,
            size=8.5,
            font=FONT_BOLD,
            color=NAVY,
        )

        draw_center(
            c,
            money(amounts[i]),
            center_x,
            summary_top - 16 * mm,
            size=11,
            font=FONT_BOLD,
            color=amount_colors[i],
        )


    # ========================================================
    # EXPENSE CATEGORY BREAKDOWN
    # ========================================================

    y = summary_top - summary_height - 10 * mm

    draw_section_title(
        c,
        "Expense Category Breakdown",
        content_x,
        y,
    )

    y -= 4 * mm

    category_header_h = 9 * mm
    category_row_h = 9 * mm

    visible_categories = categories[:6]

    category_rows = max(
        len(visible_categories),
        1,
    )

    category_height = (
        category_header_h
        + category_row_h * category_rows
    )

    category_top = y

    # Header background
    c.setFillColor(NAVY)
    c.rect(
        content_x,
        category_top - category_header_h,
        content_width,
        category_header_h,
        stroke=0,
        fill=1,
    )

    # Grid
    draw_table_grid(
        c,
        content_x,
        category_top - category_height,
        content_width,
        category_height,
        [
            content_width * 0.34,
            content_width * 0.33,
            content_width * 0.33,
        ],
        category_rows + 1,
    )

    category_columns = [
        content_width * 0.34,
        content_width * 0.33,
        content_width * 0.33,
    ]

    headers = [
        "Category",
        "Transactions",
        "Total Amount",
    ]

    xx = content_x

    for i, header in enumerate(headers):

        draw_center(
            c,
            header,
            xx + category_columns[i] / 2,
            category_top - 6 * mm,
            size=8,
            font=FONT_BOLD,
            color=WHITE,
        )

        xx += category_columns[i]

    if visible_categories:

        for row_index, category in enumerate(
            visible_categories
        ):

            row_y = (
                category_top
                - category_header_h
                - category_row_h * row_index
                - 6 * mm
            )

            category_name = category.get(
                "category",
                "Other",
            )

            count = category.get(
                "transaction_count",
                0,
            )

            amount = category.get(
                "total_amount",
                0,
            )

            draw_text(
                c,
                fit_text(
                    c,
                    category_name,
                    category_columns[0] - 8 * mm,
                    size=8,
                ),
                content_x + 4 * mm,
                row_y,
                size=8,
                color=DARK,
            )

            draw_center(
                c,
                str(count),
                content_x
                + category_columns[0]
                + category_columns[1] / 2,
                row_y,
                size=8,
                color=DARK,
            )

            draw_right(
                c,
                money(amount),
                content_x
                + category_columns[0]
                + category_columns[1]
                + category_columns[2]
                - 4 * mm,
                row_y,
                size=8,
                color=DARK,
            )

    else:

        draw_text(
            c,
            "No expense categories recorded.",
            content_x + 4 * mm,
            category_top - category_header_h - 6 * mm,
            size=8,
            color=SLATE,
        )


    # ========================================================
    # TRANSACTION DETAILS
    # ========================================================

    y = (
        category_top
        - category_height
        - 10 * mm
    )

    draw_section_title(
        c,
        "Transaction Details",
        content_x,
        y,
    )

    y -= 4 * mm

    transaction_header_h = 9 * mm
    transaction_row_h = 8.5 * mm

    # Keep the report compact like the reference.
    visible_transactions = transactions[:7]

    transaction_rows = max(
        len(visible_transactions),
        1,
    )

    transaction_height = (
        transaction_header_h
        + transaction_row_h * transaction_rows
    )

    transaction_top = y

    transaction_columns = [
        25 * mm,
        27 * mm,
        31 * mm,
        63 * mm,
        content_width
        - 25 * mm
        - 27 * mm
        - 31 * mm
        - 63 * mm,
    ]

    c.setFillColor(NAVY)

    c.rect(
        content_x,
        transaction_top - transaction_header_h,
        content_width,
        transaction_header_h,
        stroke=0,
        fill=1,
    )

    draw_table_grid(
        c,
        content_x,
        transaction_top - transaction_height,
        content_width,
        transaction_height,
        transaction_columns,
        transaction_rows + 1,
    )

    transaction_headers = [
        "Date",
        "Type",
        "Category",
        "Description",
        "Amount",
    ]

    xx = content_x

    for i, header in enumerate(
        transaction_headers
    ):

        draw_center(
            c,
            header,
            xx + transaction_columns[i] / 2,
            transaction_top - 6 * mm,
            size=7.5,
            font=FONT_BOLD,
            color=WHITE,
        )

        xx += transaction_columns[i]


    if visible_transactions:

        for row_index, transaction in enumerate(
            visible_transactions
        ):

            row_y = (
                transaction_top
                - transaction_header_h
                - transaction_row_h * row_index
                - 5.8 * mm
            )

            tx_type = str(
                transaction.get(
                    "type",
                    "",
                )
            ).lower()

            tx_date = date_text(
                transaction.get("date")
            )

            if tx_type == "income":

                type_text = "Income"

                category = transaction.get(
                    "source"
                ) or transaction.get(
                    "category"
                ) or "Income"

                amount_text = (
                    "+"
                    + money(
                        transaction.get(
                            "amount",
                            0,
                        )
                    )
                )

                amount_color = EMERALD

            else:

                type_text = "Expense"

                category = transaction.get(
                    "category"
                ) or "Expense"

                amount_text = (
                    "-"
                    + money(
                        transaction.get(
                            "amount",
                            0,
                        )
                    )
                )

                amount_color = RED

            description = (
                transaction.get(
                    "description"
                )
                or "—"
            )

            x0 = content_x

            draw_center(
                c,
                tx_date,
                x0 + transaction_columns[0] / 2,
                row_y,
                size=7,
                color=DARK,
            )

            draw_center(
                c,
                type_text,
                x0
                + transaction_columns[0]
                + transaction_columns[1] / 2,
                row_y,
                size=7,
                font=FONT_BOLD,
                color=(
                    EMERALD
                    if tx_type == "income"
                    else RED
                ),
            )

            draw_text(
                c,
                fit_text(
                    c,
                    category,
                    transaction_columns[2] - 6 * mm,
                    size=7,
                ),
                x0
                + transaction_columns[0]
                + transaction_columns[1]
                + 3 * mm,
                row_y,
                size=7,
                color=DARK,
            )

            description_x = (
                x0
                + transaction_columns[0]
                + transaction_columns[1]
                + transaction_columns[2]
            )

            draw_text(
                c,
                fit_text(
                    c,
                    description,
                    transaction_columns[3] - 6 * mm,
                    size=7,
                ),
                description_x + 3 * mm,
                row_y,
                size=7,
                color=DARK,
            )

            draw_right(
                c,
                amount_text,
                x0
                + content_width
                - 3 * mm,
                row_y,
                size=7,
                font=FONT_BOLD,
                color=amount_color,
            )

    else:

        draw_center(
            c,
            "No transactions recorded.",
            content_x + content_width / 2,
            transaction_top
            - transaction_header_h
            - 5.8 * mm,
            size=8,
            color=SLATE,
        )


    # ========================================================
    # REPORT VERIFICATION
    # ========================================================

    y = (
        transaction_top
        - transaction_height
        - 10 * mm
    )

    draw_section_title(
        c,
        "Report Verification",
        content_x,
        y,
    )

    y -= 4 * mm

    verification_header_h = 8 * mm
    verification_value_h = 12 * mm

    verification_height = (
        verification_header_h
        + verification_value_h
    )

    verification_top = y

    verification_columns = [
        content_width / 3,
        content_width / 3,
        content_width / 3,
    ]

    # Light green header
    c.setFillColor(LIGHT_GREEN)

    c.rect(
        content_x,
        verification_top
        - verification_header_h,
        content_width,
        verification_header_h,
        stroke=0,
        fill=1,
    )

    draw_table_grid(
        c,
        content_x,
        verification_top
        - verification_height,
        content_width,
        verification_height,
        verification_columns,
        2,
    )

    verification_headers = [
        "Income Transactions",
        "Expense Transactions",
        "Total Transactions",
    ]

    verification_values = [
        income_count,
        expense_count,
        transaction_count,
    ]

    xx = content_x

    for i in range(3):

        draw_center(
            c,
            verification_headers[i],
            xx + verification_columns[i] / 2,
            verification_top - 5.5 * mm,
            size=7.8,
            font=FONT_BOLD,
            color=NAVY,
        )

        draw_center(
            c,
            str(verification_values[i]),
            xx + verification_columns[i] / 2,
            verification_top
            - verification_header_h
            - 8 * mm,
            size=13,
            font=FONT_BOLD,
            color=EMERALD,
        )

        xx += verification_columns[i]


    # ========================================================
    # GENERATED INFORMATION
    # ========================================================

    generated_y = (
        verification_top
        - verification_height
        - 9 * mm
    )

    generated_at = datetime.now().strftime(
        "%d %b %Y, %I:%M %p"
    )

    draw_text(
        c,
        (
            "Generated by Budget Buddy on "
            f"{generated_at}. "
            "This report is based on recorded "
            "income and expense transactions."
        ),
        content_x,
        generated_y,
        size=7.5,
        font=FONT,
        color=DARK,
    )


    # ========================================================
    # FOOTER
    # ========================================================

    footer_y = 9 * mm

    c.setStrokeColor(
        colors.HexColor("#AAB8CC")
    )
    c.setLineWidth(0.7)

    c.line(
        content_x,
        footer_y + 5 * mm,
        page_width - margin,
        footer_y + 5 * mm,
    )

    draw_text(
        c,
        "Budget Buddy • Financial Report",
        content_x,
        footer_y,
        size=7.5,
        font=FONT,
        color=NAVY,
    )

    draw_right(
        c,
        "Page 1",
        page_width - margin,
        footer_y,
        size=7.5,
        font=FONT,
        color=NAVY,
    )


    # ========================================================
    # SAVE
    # ========================================================

    c.showPage()
    c.save()

    buffer.seek(0)

    return buffer
