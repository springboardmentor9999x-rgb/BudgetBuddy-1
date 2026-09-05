"""add bank account and transaction fields

Revision ID: 3b75ef71db23
Revises: d0a87bc2bd46
Create Date: 2026-08-06 20:02:40.710944
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3b75ef71db23"
down_revision: Union[str, Sequence[str], None] = "d0a87bc2bd46"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ==========================================
    # EXPENSE FIELDS
    # ==========================================

    op.add_column(
        "expenses",
        sa.Column(
            "bank_account",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "expenses",
        sa.Column(
            "payment_method",
            sa.String(length=50),
            nullable=True,
        ),
    )

    # ==========================================
    # INCOME FIELDS
    # ==========================================

    op.add_column(
        "income",
        sa.Column(
            "bank_account",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "income",
        sa.Column(
            "description",
            sa.String(length=500),
            nullable=True,
        ),
    )

    op.add_column(
        "income",
        sa.Column(
            "date",
            sa.DateTime(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    # ==========================================
    # REMOVE INCOME FIELDS
    # ==========================================

    op.drop_column(
        "income",
        "date",
    )

    op.drop_column(
        "income",
        "description",
    )

    op.drop_column(
        "income",
        "bank_account",
    )

    # ==========================================
    # REMOVE EXPENSE FIELDS
    # ==========================================

    op.drop_column(
        "expenses",
        "payment_method",
    )

    op.drop_column(
        "expenses",
        "bank_account",
    )