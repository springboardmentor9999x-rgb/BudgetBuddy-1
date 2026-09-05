"""merge premium request migration

Revision ID: 2efd79e0f5f5
Revises: 33369f69a99f, premium_request_status
Create Date: 2026-09-02 01:41:19.712660

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2efd79e0f5f5'
down_revision: Union[str, Sequence[str], None] = ('33369f69a99f', 'premium_request_status')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
