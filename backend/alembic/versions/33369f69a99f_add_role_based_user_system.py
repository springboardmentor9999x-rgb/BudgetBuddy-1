"""add role based user system

Revision ID: 33369f69a99f
Revises: 150878b7dd8f
Create Date: 2026-08-30

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "33369f69a99f"
down_revision: Union[str, Sequence[str], None] = "150878b7dd8f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Convert all existing legacy users to Normal Users.
    op.execute(
        "UPDATE users SET role = 'normal' WHERE role = 'student' OR role IS NULL"
    )

    # Make the role mandatory at the database level.
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Restore the previous legacy role value.
    op.execute(
        "UPDATE users SET role = 'student' WHERE role = 'normal'"
    )

    # Restore the previous nullable state.
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(),
        nullable=True,
    )
