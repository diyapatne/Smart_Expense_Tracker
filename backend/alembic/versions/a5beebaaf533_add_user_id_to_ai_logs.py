"""add user_id to ai_logs

Revision ID: a5beebaaf533
Revises: 37939cefc15b
Create Date: 2026-06-29 19:24:45.944102

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "a5beebaaf533"
down_revision: Union[str, Sequence[str], None] = "37939cefc15b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add user_id (nullable because existing rows already exist)
    op.add_column(
        "ai_logs",
        sa.Column("user_id", sa.Integer(), nullable=True),
    )

    # Add status column
    op.add_column(
        "ai_logs",
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=True,
            server_default="success",
        ),
    )

    # Make receipt_id nullable
    op.alter_column(
        "ai_logs",
        "receipt_id",
        existing_type=mysql.INTEGER(),
        nullable=True,
    )

    # Add foreign key
    op.create_foreign_key(
        "fk_ai_logs_user_id",
        "ai_logs",
        "users",
        ["user_id"],
        ["id"],
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_ai_logs_user_id",
        "ai_logs",
        type_="foreignkey",
    )

    op.alter_column(
        "ai_logs",
        "receipt_id",
        existing_type=mysql.INTEGER(),
        nullable=False,
    )

    op.drop_column("ai_logs", "status")
    op.drop_column("ai_logs", "user_id")