from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, index=True, nullable=False)

    hashed_password = Column(String(255), nullable=False)

    full_name = Column(String(100), nullable=False)

    created_at = Column(DateTime(), server_default=func.now())

    # Relationships
    receipts = relationship("Receipt", back_populates="owner")

    expenses = relationship("Expense", back_populates="owner")


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_url = Column(String(500), nullable=False)

    merchant_name = Column(String(255), nullable=True)

    receipt_date = Column(Date, nullable=True)

    total_amount = Column(Float, nullable=True)

    category = Column(String(100), nullable=True)

    status = Column(String(50), default="pending")

    created_at = Column(DateTime(), server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="receipts")

    expense_items = relationship(
        "ExpenseItem",
        back_populates="receipt",
        cascade="all, delete-orphan"
    )

    expenses = relationship(
        "Expense",
        back_populates="receipt",
        cascade="all, delete-orphan"
    )

    ai_logs = relationship(
        "AILog",
        back_populates="receipt",
        cascade="all, delete-orphan"
    )


class ExpenseItem(Base):
    __tablename__ = "expense_items"

    id = Column(Integer, primary_key=True, index=True)

    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=False)

    item_name = Column(String(255), nullable=False)

    price = Column(Float, nullable=False)

    quantity = Column(Integer, default=1)

    # Relationships
    receipt = relationship("Receipt", back_populates="expense_items")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=True)

    amount = Column(Float, nullable=False)

    category = Column(String(100), nullable=False)

    description = Column(String(500), nullable=True)

    expense_date = Column(Date, nullable=False)

    created_at = Column(DateTime(), server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="expenses")

    receipt = relationship("Receipt", back_populates="expenses")


class AILog(Base):
    __tablename__ = "ai_logs"

    id = Column(Integer, primary_key=True, index=True)

    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=False)

    prompt = Column(Text, nullable=False)

    response = Column(Text, nullable=False)

    tokens_used = Column(Integer, nullable=True)

    created_at = Column(DateTime(), server_default=func.now())

    # Relationships
    receipt = relationship("Receipt", back_populates="ai_logs")