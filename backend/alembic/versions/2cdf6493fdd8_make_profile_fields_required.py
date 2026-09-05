"""make profile fields required

Revision ID: 2cdf6493fdd8
Revises: 47b8adeeb40e
Create Date: 2026-08-10

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2cdf6493fdd8"
down_revision: Union[str, Sequence[str], None] = "47b8adeeb40e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ---------------------------------------------------------
    # Fix existing NULL profile values before adding NOT NULL
    # ---------------------------------------------------------

    op.execute(
        """
        UPDATE profiles
        SET full_name = 'User'
        WHERE full_name IS NULL
        """
    )

    op.execute(
        """
        UPDATE profiles
        SET monthly_income = 0
        WHERE monthly_income IS NULL
        """
    )

    op.execute(
        """
        UPDATE profiles
        SET currency = 'INR'
        WHERE currency IS NULL
        """
    )

    # ---------------------------------------------------------
    # Make profile fields required
    # ---------------------------------------------------------

    op.alter_column(
        "profiles",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=False,
    )

    op.alter_column(
        "profiles",
        "full_name",
        existing_type=sa.VARCHAR(),
        nullable=False,
    )

    op.alter_column(
        "profiles",
        "monthly_income",
        existing_type=sa.DOUBLE_PRECISION(),
        nullable=False,
    )

    op.alter_column(
        "profiles",
        "currency",
        existing_type=sa.VARCHAR(),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.alter_column(
        "profiles",
        "currency",
        existing_type=sa.VARCHAR(),
        nullable=True,
    )

    op.alter_column(
        "profiles",
        "monthly_income",
        existing_type=sa.DOUBLE_PRECISION(),
        nullable=True,
    )

    op.alter_column(
        "profiles",
        "full_name",
        existing_type=sa.VARCHAR(),
        nullable=True,
    )

    op.alter_column(
        "profiles",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=True,
    )