from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from models import Expense, User

from datetime import date
from io import BytesIO, StringIO

import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font

from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

import csv


router = APIRouter(
    prefix="/export",
    tags=["Export"]
)


def get_filtered_expenses(
    db: Session,
    current_user: User,
    start: date | None = None,
    end: date | None = None,
    category: str | None = None,
):
    """
    Returns expenses after applying the same filters
    used by the Expenses page.
    """

    query = db.query(Expense).filter(
        Expense.user_id == current_user.id
    )

    if start:
        query = query.filter(
            Expense.expense_date >= start
        )

    if end:
        query = query.filter(
            Expense.expense_date <= end
        )

    if category:
        query = query.filter(
            Expense.category == category
        )

    return query.order_by(
        Expense.expense_date.desc()
    ).all()


@router.get("/csv")
def export_csv(
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expenses = get_filtered_expenses(
        db=db,
        current_user=current_user,
        start=start,
        end=end,
        category=category,
    )

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Date",
        "Merchant",
        "Category",
        "Amount",
        "Notes",
    ])

    for expense in expenses:
        writer.writerow([
            expense.expense_date,
            expense.merchant_name,
            expense.category,
            expense.amount,
            expense.notes,
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="expenses.csv"'
        },
    )


@router.get("/excel")
def export_excel(
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expenses = get_filtered_expenses(
        db=db,
        current_user=current_user,
        start=start,
        end=end,
        category=category,
    )

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Expenses"

    headers = [
        "Date",
        "Merchant",
        "Category",
        "Amount",
        "Notes",
    ]

    worksheet.append(headers)

    # Make header row bold
    for cell in worksheet[1]:
        cell.font = Font(bold=True)

    total_amount = 0

    for expense in expenses:
        worksheet.append([
            expense.expense_date,
            expense.merchant_name,
            expense.category,
            expense.amount,
            expense.notes,
        ])

        total_amount += expense.amount

    # Empty row
    worksheet.append([])

    # Summary
    worksheet.append(["Total Expenses", len(expenses)])
    worksheet.append(["Total Amount", total_amount])

    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="expenses.xlsx"'
        },
    )

@router.get("/pdf")
def export_pdf(
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expenses = get_filtered_expenses(
        db=db,
        current_user=current_user,
        start=start,
        end=end,
        category=category,
    )

    buffer = BytesIO()

    document = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    elements = []

    # Title
    elements.append(
        Paragraph(
            "<b>Smart Receipt & Expense Tracker</b>",
            styles["Title"],
        )
    )

    elements.append(Spacer(1, 0.25 * inch))

    # User information
    elements.append(
        Paragraph(
            f"<b>User:</b> {current_user.full_name}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Email:</b> {current_user.email}",
            styles["Normal"],
        )
    )

    elements.append(Spacer(1, 0.25 * inch))

    table_data = [
        [
            "Date",
            "Merchant",
            "Category",
            "Amount",
            "Notes",
        ]
    ]

    total_amount = 0

    for expense in expenses:
        table_data.append([
            str(expense.expense_date),
            expense.merchant_name,
            expense.category,
            f"₹ {expense.amount}",
            expense.notes or "",
        ])

        total_amount += expense.amount

    table = Table(table_data)

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),

            ("GRID", (0, 0), (-1, -1), 1, colors.black),

            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),

            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),

            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        ])
    )

    elements.append(table)

    elements.append(Spacer(1, 0.30 * inch))

    elements.append(
        Paragraph(
            f"<b>Total Expenses:</b> {len(expenses)}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"<b>Total Amount:</b> ₹ {total_amount}",
            styles["Normal"],
        )
    )

    document.build(elements)

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="expenses.pdf"'
        },
    )