"""add email verification fields

Revision ID: b606d521e2a9
Revises: 2f37e191d25f
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b606d521e2a9"
down_revision: Union[str, Sequence[str], None] = "2f37e191d25f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_verified with a temporary database default.
    # This allows existing users to receive a valid value.
    op.add_column(
        "users",
        sa.Column(
            "is_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "verification_code",
            sa.String(),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "verification_code_expires_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    # Remove the DB-level default after existing rows are populated.
    op.alter_column(
        "users",
        "is_verified",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column(
        "users",
        "verification_code_expires_at",
    )

    op.drop_column(
        "users",
        "verification_code",
    )

    op.drop_column(
        "users",
        "is_verified",
    )