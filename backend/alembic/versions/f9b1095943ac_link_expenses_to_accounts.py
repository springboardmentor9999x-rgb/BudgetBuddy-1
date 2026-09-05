"""link expenses to accounts

Revision ID: f9b1095943ac
Revises: 448a49e5d097
Create Date: 2026-08-07 21:18:48.287253
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic

revision: str = "f9b1095943ac"
down_revision: Union[str, Sequence[str], None] = "448a49e5d097"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # Add account reference to expenses
    op.add_column(
        "expenses",
        sa.Column(
            "account_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # Index for account lookup
    op.create_index(
        op.f("ix_expenses_account_id"),
        "expenses",
        ["account_id"],
        unique=False,
    )

    # Index for user lookup
    op.create_index(
        op.f("ix_expenses_user_id"),
        "expenses",
        ["user_id"],
        unique=False,
    )

    # Expense account -> registered account
    op.create_foreign_key(
        "fk_expenses_account_id_accounts",
        "expenses",
        "accounts",
        ["account_id"],
        ["id"],
    )

    # Remove old text-based bank account field
    op.drop_column(
        "expenses",
        "bank_account",
    )


def downgrade() -> None:

    # Restore old bank account text field
    op.add_column(
        "expenses",
        sa.Column(
            "bank_account",
            sa.String(length=100),
            nullable=True,
        ),
    )

    # Remove account foreign key
    op.drop_constraint(
        "fk_expenses_account_id_accounts",
        "expenses",
        type_="foreignkey",
    )

    op.drop_index(
        op.f("ix_expenses_user_id"),
        table_name="expenses",
    )

    op.drop_index(
        op.f("ix_expenses_account_id"),
        table_name="expenses",
    )

    op.drop_column(
        "expenses",
        "account_id",
    )