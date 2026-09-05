"""add savings goals table

Revision ID: c3015b312153
Revises: fcdaf02fb96e
Create Date: 2026-08-15 21:44:52.361268

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3015b312153"
down_revision: Union[str, Sequence[str], None] = "fcdaf02fb96e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "savings_goals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("target_amount", sa.Float(), nullable=False),
        sa.Column("current_amount", sa.Float(), nullable=False),
        sa.Column("target_date", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_savings_goals_id"),
        "savings_goals",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_savings_goals_user_id"),
        "savings_goals",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_savings_goals_user_id"),
        table_name="savings_goals",
    )

    op.drop_index(
        op.f("ix_savings_goals_id"),
        table_name="savings_goals",
    )

    op.drop_table("savings_goals")