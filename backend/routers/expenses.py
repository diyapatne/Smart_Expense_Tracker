from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from datetime import date

from database import get_db

from auth import get_current_user

from models import Expense, User

from schemas import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseOut
)


router = APIRouter(
    tags=["Expenses"]
)


@router.post(
    "/",
    response_model=ExpenseOut
)
def create_expense(

    expense: ExpenseCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    new_expense = Expense(

        merchant_name=expense.merchant_name,

        category=expense.category,

        amount=expense.amount,

        expense_date=expense.expense_date,

        notes=expense.notes,

        description=expense.description,

        user_id=current_user.id
    )

    db.add(new_expense)

    db.commit()

    db.refresh(new_expense)

    return new_expense


@router.delete(
    "/{expense_id}"
)
def delete_expense(

    expense_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    expense = db.query(Expense).filter(

    Expense.id == expense_id,

    Expense.user_id == current_user.id

    ).first()
    if not expense:

        raise HTTPException(

            status_code=404,

            detail="Expense not found"
        )

    
    db.delete(expense)

    db.commit()

    return {

        "message": "Expense deleted"

    }


@router.put(
    "/{expense_id}",
    response_model=ExpenseOut
)
def update_expense(

    expense_id: int,

    updated_data: ExpenseUpdate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    expense = db.query(Expense).filter(

        Expense.id == expense_id,

        Expense.user_id == current_user.id

    ).first()

    if not expense:

        raise HTTPException(

            status_code=404,

            detail="Expense not found"
        )

    update_dict = updated_data.dict(
        exclude_unset=True
    )

    for key, value in update_dict.items():

        setattr(expense, key, value)

    db.commit()

    db.refresh(expense)

    return expense


@router.get(
    "/{expense_id}",
    response_model=ExpenseOut
)
def get_expense(

    expense_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    expense = db.query(Expense).filter(

        Expense.id == expense_id,

        Expense.user_id == current_user.id

    ).first()

    if not expense:

        raise HTTPException(

            status_code=404,

            detail="Expense not found"
        )

    return expense



@router.get(
    "/",
    response_model=list[ExpenseOut]
)
def get_expenses(

    category: str = None,

    start: date = None,

    end: date = None,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    query = db.query(Expense)

    query = query.filter(
        Expense.user_id == current_user.id
    )

    if category:

        query = query.filter(
            Expense.category == category
        )

    if start:

        query = query.filter(
            Expense.expense_date >= start
        )

    if end:

        query = query.filter(
            Expense.expense_date <= end
        )

    return query.all()