"""link income to accounts

Revision ID: 47b8adeeb40e
Revises: f9b1095943ac
Create Date: 2026-08-07 21:34:07.961576

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = "47b8adeeb40e"

down_revision: Union[str, Sequence[str], None] = "f9b1095943ac"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add registered bank account reference
    op.add_column(
        "income",
        sa.Column(
            "account_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Index account_id
    op.create_index(
        op.f("ix_income_account_id"),
        "income",
        ["account_id"],
        unique=False,
    )

    # Index user_id
    op.create_index(
        op.f("ix_income_user_id"),
        "income",
        ["user_id"],
        unique=False,
    )

    # Link income.account_id -> accounts.id
    op.create_foreign_key(
        "fk_income_account_id_accounts",
        "income",
        "accounts",
        ["account_id"],
        ["id"],
    )

    # Remove old text-based bank account field
    op.drop_column(
        "income",
        "bank_account",
    )


def downgrade() -> None:
    # Restore old bank_account field
    op.add_column(
        "income",
        sa.Column(
            "bank_account",
            sa.String(length=100),
            nullable=True,
        ),
    )

    # Remove foreign key
    op.drop_constraint(
        "fk_income_account_id_accounts",
        "income",
        type_="foreignkey",
    )

    # Remove indexes
    op.drop_index(
        op.f("ix_income_user_id"),
        table_name="income",
    )

    op.drop_index(
        op.f("ix_income_account_id"),
        table_name="income",
    )

    # Remove account_id
    op.drop_column(
        "income",
        "account_id",
    )