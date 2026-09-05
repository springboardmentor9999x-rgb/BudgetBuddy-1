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
    # Use Unicode codepoint so terminal encoding never damages ?
    rupee = chr(8377)
    return f"{rupee}{float(value or 0):,.2f}"


def date_text(value):
    if not value:
        return "-"

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
        return f"{date_text(start_date)} - {date_text(end_date)}"

    if period == "month":
        return f"{date_text(start_date)} - {date_text(end_date)}"

    return f"{date_text(start_date)} - {date_text(end_date)}"


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

def generate_report_pdf_limited(
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

    holder_name = get_account_holder_name(db, user_id)

    transactions = report.get("transactions", [])

    buffer = BytesIO()

    c = canvas.Canvas(
        buffer,
        pagesize=A4,
    )

    page_width, page_height = A4
    margin = 14 * mm
    content_x = margin
    content_width = page_width - (2 * margin)

    # ==========================================
    # HEADER
    # ==========================================

    y = page_height - 20 * mm

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
        "Transaction Report",
        content_x,
        y - 8 * mm,
        size=10,
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

    c.setStrokeColor(
        colors.HexColor("#AAB8CC")
    )
    c.setLineWidth(0.7)

    c.line(
        content_x,
        y - 13 * mm,
        page_width - margin,
        y - 13 * mm,
    )

    # ==========================================
    # REPORT INFORMATION
    # ==========================================

    y -= 25 * mm

    period_title = {
        "day": "Day Transaction Report",
        "week": "Week Transaction Report",
        "month": "Month Transaction Report",
        "custom": "Custom Transaction Report",
    }.get(
        period,
        "Transaction Report",
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
        size=9,
        font=FONT,
        color=DARK,
    )

    # ==========================================
    # TRANSACTIONS
    # ==========================================

    y -= 20 * mm

    draw_section_title(
        c,
        "Transaction Details",
        content_x,
        y,
    )

    y -= 5 * mm

    header_h = 9 * mm
    row_h = 9 * mm

    columns = [
        27 * mm,
        28 * mm,
        35 * mm,
        65 * mm,
        content_width
        - 27 * mm
        - 28 * mm
        - 35 * mm
        - 65 * mm,
    ]

    # Use multiple pages when necessary.
    rows_per_page = 17

    transaction_chunks = [
        transactions[i:i + rows_per_page]
        for i in range(0, len(transactions), rows_per_page)
    ]

    if not transaction_chunks:
        transaction_chunks = [[]]

    total_pages = len(transaction_chunks)

    for page_index, chunk in enumerate(transaction_chunks):

        if page_index > 0:
            c.showPage()

            y = page_height - 20 * mm

            draw_text(
                c,
                "Budget Buddy",
                content_x,
                y,
                size=18,
                font=FONT_BOLD,
                color=NAVY,
            )

            draw_text(
                c,
                "Transaction Report",
                content_x,
                y - 7 * mm,
                size=9,
                font=FONT,
                color=DARK,
            )

            y -= 18 * mm

        table_top = y

        rows = max(len(chunk), 1)

        table_height = header_h + row_h * rows

        c.setFillColor(NAVY)

        c.rect(
            content_x,
            table_top - header_h,
            content_width,
            header_h,
            stroke=0,
            fill=1,
        )

        draw_table_grid(
            c,
            content_x,
            table_top - table_height,
            content_width,
            table_height,
            columns,
            rows + 1,
        )

        headers = [
            "Date",
            "Type",
            "Category",
            "Description",
            "Amount",
        ]

        xx = content_x

        for i, header in enumerate(headers):

            draw_center(
                c,
                header,
                xx + columns[i] / 2,
                table_top - 6 * mm,
                size=7.5,
                font=FONT_BOLD,
                color=WHITE,
            )

            xx += columns[i]

        if chunk:

            for row_index, transaction in enumerate(chunk):

                row_y = (
                    table_top
                    - header_h
                    - row_h * row_index
                    - 6 * mm
                )

                tx_type = str(
                    transaction.get("type", "")
                ).lower()

                tx_date = date_text(
                    transaction.get("date")
                )

                if tx_type == "income":
                    type_text = "Income"
                    category = (
                        transaction.get("source")
                        or transaction.get("category")
                        or "Income"
                    )
                    amount_text = (
                        "+"
                        + money(
                            transaction.get("amount", 0)
                        )
                    )
                    amount_color = EMERALD
                else:
                    type_text = "Expense"
                    category = (
                        transaction.get("category")
                        or "Expense"
                    )
                    amount_text = (
                        "-"
                        + money(
                            transaction.get("amount", 0)
                        )
                    )
                    amount_color = RED

                description = (
                    transaction.get("description")
                    or "-"
                )

                x0 = content_x

                draw_center(
                    c,
                    tx_date,
                    x0 + columns[0] / 2,
                    row_y,
                    size=7,
                    color=DARK,
                )

                draw_center(
                    c,
                    type_text,
                    x0
                    + columns[0]
                    + columns[1] / 2,
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
                        columns[2] - 6 * mm,
                        size=7,
                    ),
                    x0
                    + columns[0]
                    + columns[1]
                    + 3 * mm,
                    row_y,
                    size=7,
                    color=DARK,
                )

                description_x = (
                    x0
                    + columns[0]
                    + columns[1]
                    + columns[2]
                )

                draw_text(
                    c,
                    fit_text(
                        c,
                        description,
                        columns[3] - 6 * mm,
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
                    x0 + content_width - 3 * mm,
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
                table_top - header_h - 6 * mm,
                size=8,
                color=SLATE,
            )

        # ==========================================
        # FOOTER
        # ==========================================

        footer_y = 9 * mm

        c.setStrokeColor(
            colors.HexColor("#AAB8CC")
        )

        c.line(
            content_x,
            footer_y + 5 * mm,
            page_width - margin,
            footer_y + 5 * mm,
        )

        draw_text(
            c,
            "Budget Buddy - Transaction Report",
            content_x,
            footer_y,
            size=7.5,
            font=FONT,
            color=NAVY,
        )

        draw_right(
            c,
            f"Page {page_index + 1} of {total_pages}",
            page_width - margin,
            footer_y,
            size=7.5,
            font=FONT,
            color=NAVY,
        )

    c.save()

    buffer.seek(0)

    return buffer
