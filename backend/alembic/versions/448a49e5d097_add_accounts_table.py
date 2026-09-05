"""add accounts table

Revision ID: 448a49e5d097
Revises: 3b75ef71db23
Create Date: 2026-08-07 20:59:05.085948
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = "448a49e5d097"
down_revision: Union[str, Sequence[str], None] = "3b75ef71db23"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "accounts",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "bank_name",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "account_holder_name",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "account_number",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "account_type",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "description",
            sa.String(),
            nullable=True
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"]
        ),

        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        op.f("ix_accounts_id"),
        "accounts",
        ["id"],
        unique=False
    )

    op.create_index(
        op.f("ix_accounts_user_id"),
        "accounts",
        ["user_id"],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_accounts_user_id"),
        table_name="accounts"
    )

    op.drop_index(
        op.f("ix_accounts_id"),
        table_name="accounts"
    )

    op.drop_table("accounts")