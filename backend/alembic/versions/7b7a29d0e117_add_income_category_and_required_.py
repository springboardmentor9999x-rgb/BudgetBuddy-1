"""add income category and required description

Revision ID: 7b7a29d0e117
Revises: 2cdf6493fdd8
Create Date: 2026-08-10

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7b7a29d0e117"
down_revision: Union[str, Sequence[str], None] = "2cdf6493fdd8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ==========================================================
    # INCOME: ADD CATEGORY
    # ==========================================================

    op.add_column(
        "income",
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=True,
        ),
    )

    # ==========================================================
    # FIX EXISTING NULL DATA BEFORE MAKING FIELDS REQUIRED
    # ==========================================================

    # Existing income records may have NULL dates.
    # Give them the current timestamp.
    op.execute(
        """
        UPDATE income
        SET date = CURRENT_TIMESTAMP
        WHERE date IS NULL
        """
    )

    # Existing income records may have NULL descriptions.
    # Give them a default description.
    op.execute(
        """
        UPDATE income
        SET description = 'No description provided'
        WHERE description IS NULL
        """
    )

    # Existing income records need categories.
    op.execute(
        """
        UPDATE income
        SET category = CASE
            WHEN id = 1 THEN 'Salary'
            WHEN id = 2 THEN 'Freelance'
            WHEN id = 3 THEN 'Business'
            ELSE 'Other'
        END
        WHERE category IS NULL
        """
    )

    # ==========================================================
    # MAKE INCOME FIELDS REQUIRED
    # ==========================================================

    op.alter_column(
        "income",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=False,
    )

    op.alter_column(
        "income",
        "date",
        existing_type=sa.DateTime(),
        nullable=False,
    )

    op.alter_column(
        "income",
        "description",
        existing_type=sa.VARCHAR(length=500),
        nullable=False,
    )

    op.alter_column(
        "income",
        "category",
        existing_type=sa.VARCHAR(length=100),
        nullable=False,
    )

    # ==========================================================
    # PROFILE CONSTRAINT CLEANUP
    # ==========================================================

    # The profile model uses a unique index for user_id.
    # Remove the old unique constraint if it exists.
    try:
        op.drop_constraint(
            "profiles_user_id_key",
            "profiles",
            type_="unique",
        )
    except Exception:
        pass

    # Create a unique index instead.
    op.create_index(
        "ix_profiles_user_id",
        "profiles",
        ["user_id"],
        unique=True,
    )


def downgrade() -> None:
    # ==========================================================
    # PROFILE INDEX
    # ==========================================================

    try:
        op.drop_index(
            "ix_profiles_user_id",
            table_name="profiles",
        )
    except Exception:
        pass

    # Restore unique constraint.
    try:
        op.create_unique_constraint(
            "profiles_user_id_key",
            "profiles",
            ["user_id"],
        )
    except Exception:
        pass

    # ==========================================================
    # INCOME FIELDS
    # ==========================================================

    op.alter_column(
        "income",
        "category",
        existing_type=sa.VARCHAR(length=100),
        nullable=True,
    )

    op.alter_column(
        "income",
        "description",
        existing_type=sa.VARCHAR(length=500),
        nullable=True,
    )

    op.alter_column(
        "income",
        "date",
        existing_type=sa.DateTime(),
        nullable=True,
    )

    op.alter_column(
        "income",
        "user_id",
        existing_type=sa.INTEGER(),
        nullable=True,
    )

    # Remove category column.
    op.drop_column(
        "income",
        "category",
    )