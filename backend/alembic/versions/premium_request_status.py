"""add premium request status

Revision ID: premium_request_status
Revises: 150878b7dd8f
Create Date: 2026-09-02
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "premium_request_status"
down_revision: Union[str, Sequence[str], None] = "150878b7dd8f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "premium_request_status",
            sa.String(length=20),
            nullable=False,
            server_default="none",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "premium_request_status")
