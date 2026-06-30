"""Add user budget fields

Revision ID: 5221f94f9292
Revises: a5beebaaf533
Create Date: 2026-06-30 18:29:37.522718

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '5221f94f9292'
down_revision: Union[str, Sequence[str], None] = 'a5beebaaf533'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('profession', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('monthly_income', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('monthly_budget', sa.Float(), nullable=True))

def downgrade() -> None:
    op.drop_column('users', 'monthly_budget')
    op.drop_column('users', 'monthly_income')
    op.drop_column('users', 'profession')