"""test

Revision ID: b1e052c50d3a
Revises: 5b2e14cfb7a1
Create Date: 2026-07-12 00:39:13.447409

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'b1e052c50d3a'
down_revision: Union[str, Sequence[str], None] = '5b2e14cfb7a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():

    op.create_foreign_key(
        None,
        'expense_items',
        'receipts',
        ['receipt_id'],
        ['id']
    )

    op.add_column(
        'expenses',
        sa.Column('merchant_name', sa.String(length=255), nullable=True)
    )

    op.add_column(
        'expenses',
        sa.Column('notes', sa.Text(), nullable=True)
    )
def downgrade():

    op.drop_column('expenses', 'notes')

    op.drop_column('expenses', 'merchant_name')

    op.drop_constraint(
        None,
        'expense_items',
        type_='foreignkey'
    )

    