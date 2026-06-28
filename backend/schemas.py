from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


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