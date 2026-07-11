from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    ForeignKey,
    DateTime,
    Text,
    JSON
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

    profession = Column(String(100))
    monthly_income = Column(Float)
    monthly_budget = Column(Float)
    # 
    # Relationships
    receipts = relationship("Receipt", back_populates="owner")

    expenses = relationship("Expense", back_populates="owner")
    ai_logs = relationship("AILog", back_populates="user")
    insights = relationship(
    "Insight",
    back_populates="user",
    cascade="all, delete-orphan",
    )


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

    merchant_name = Column(String(255))

    notes = Column(Text, nullable=True)

    category = Column(String(100), nullable=False)

    description = Column(String(500), nullable=True)

    expense_date = Column(Date, nullable=False)

    created_at = Column(DateTime(), server_default=func.now())

    # Relationships
    # user = relationship("User")

    owner = relationship("User", back_populates="expenses")

    receipt = relationship("Receipt", back_populates="expenses")


class AILog(Base):
    __tablename__ = "ai_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Which user made the AI request
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Receipt ID is optional because insights don't have a receipt
    receipt_id = Column(Integer, ForeignKey("receipts.id"), nullable=True)

    prompt = Column(Text, nullable=False)

    response = Column(Text, nullable=False)

    tokens_used = Column(Integer, nullable=True)

    status = Column(String(50), default="success")

    created_at = Column(DateTime(), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="ai_logs")
    receipt = relationship("Receipt", back_populates="ai_logs")

from datetime import datetime


class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    insights_json = Column(
        JSON,
        nullable=False,
    )

    savings_tip = Column(
        Text,
        nullable=False,
    )

    flag = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="insights",
    )