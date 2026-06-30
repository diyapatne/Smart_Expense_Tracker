from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from typing import List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    profession: str
    monthly_income: float
    monthly_budget: float


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class ExpenseCreate(BaseModel):

    merchant_name: str

    category: str

    amount: float

    expense_date: date

    notes: Optional[str] = None

    description: str | None = None


class ExpenseUpdate(BaseModel):

    merchant_name: Optional[str] = None

    category: Optional[str] = None

    amount: Optional[float] = None

    expense_date: Optional[date] = None

    notes: Optional[str] = None

    description: str | None = None

class ExpenseOut(BaseModel):

    id: int

    merchant_name: str

    category: str

    amount: float

    expense_date: date

    notes: Optional[str]

    user_id: int

    description: str | None
    
    class Config:

        from_attributes = True

class ExpenseListOut(BaseModel):
    items: list[ExpenseOut]
    total: int
    page: int
    limit: int
    pages: int

    # changes day 10

# ============================================================
# Analytics schemas
# ============================================================

class AnalyticsSummary(BaseModel):
    total_spent: float
    this_month: float
    avg_per_day: float
    total_receipts: int


class MonthlyDataPoint(BaseModel):
    month: str          # e.g. "Jan 2026"
    total: float


class CategoryDataPoint(BaseModel):
    category: str
    total: float
    percentage: float


class WeeklyDataPoint(BaseModel):
    day: str             # e.g. "Mon"
    date: str            # e.g. "2026-06-22" (so frontend can sort/format if needed)
    total: float

class InsightItem(BaseModel):
    title: str
    description: str


class InsightResponse(BaseModel):
    insights: List[InsightItem]
    savings_tip: str
    flag: str
    created_at: datetime

    class Config:
        from_attributes = True