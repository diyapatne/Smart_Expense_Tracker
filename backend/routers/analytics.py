# backend/routers/analytics.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta
import calendar

from database import get_db
from auth import get_current_user
from models import Expense, Receipt, User
from schemas import AnalyticsSummary, MonthlyDataPoint, CategoryDataPoint, WeeklyDataPoint
from sqlalchemy import func, extract
import calendar as cal_module
router = APIRouter(tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    base_query = db.query(Expense).filter(Expense.user_id == current_user.id)

    # Total spent across all time
    total_spent = base_query.with_entities(func.sum(Expense.amount)).scalar() or 0.0

    # This month's spending — filter by current year + month
    today = date.today()
    this_month_total = (
        base_query
        .filter(extract("year", Expense.expense_date) == today.year)
        .filter(extract("month", Expense.expense_date) == today.month)
        .with_entities(func.sum(Expense.amount))
        .scalar() or 0.0
    )

    # Average per day — based on the earliest expense date to today
    earliest = base_query.with_entities(func.min(Expense.expense_date)).scalar()
    if earliest:
        days_elapsed = max((today - earliest).days, 1)  # avoid divide-by-zero on day 1
        avg_per_day = total_spent / days_elapsed
    else:
        avg_per_day = 0.0

    # Total receipts uploaded (not expenses — receipts table from Day 5/6)
    total_receipts = (
        db.query(Receipt)
        .filter(Receipt.user_id == current_user.id)
        .count()
    )

    return AnalyticsSummary(
        total_spent=round(total_spent, 2),
        this_month=round(this_month_total, 2),
        avg_per_day=round(avg_per_day, 2),
        total_receipts=total_receipts
    )


@router.get("/monthly", response_model=list[MonthlyDataPoint])
# def get_monthly(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     today = date.today()

#     # Build a list of the last 6 (year, month) pairs, oldest first
#     months = []
#     for i in range(5, -1, -1):
#         year = today.year
#         month = today.month - i
#         while month <= 0:
#             month += 12
#             year -= 1
#         months.append((year, month))

#     results = []
#     for year, month in months:
#         total = (
#             db.query(func.sum(Expense.amount))
#             .filter(Expense.user_id == current_user.id)
#             .filter(extract("year", Expense.expense_date) == year)
#             .filter(extract("month", Expense.expense_date) == month)
#             .scalar() or 0.0
#         )
#         month_label = f"{calendar.month_abbr[month]} {year}"
#         results.append(MonthlyDataPoint(month=month_label, total=round(total, 2)))

#     return results
def get_monthly_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = (
        db.query(
            func.year(Expense.expense_date).label("year"),
            func.month(Expense.expense_date).label("month"),
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.user_id == current_user.id)
        .group_by(
            func.year(Expense.expense_date),
            func.month(Expense.expense_date)
        )
        .order_by(
            func.year(Expense.expense_date),
            func.month(Expense.expense_date)
        )
        .all()
    )

    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    data = []

    for row in results:
        data.append({
            "month": f"{month_names[row.month - 1]} {row.year}",
            "total": float(row.total)
        })

    return data[-6:]


@router.get("/by-category", response_model=list[CategoryDataPoint])
# def get_by_category(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     rows = (
#         db.query(Expense.category, func.sum(Expense.amount).label("total"))
#         .filter(Expense.user_id == current_user.id)
#         .group_by(Expense.category)
#         .all()
#     )

#     grand_total = sum(row.total for row in rows) or 1  # avoid divide-by-zero

#     results = []
#     for row in rows:
#         percentage = round((row.total / grand_total) * 100, 1)
#         results.append(
#             CategoryDataPoint(
#                 category=row.category,
#                 total=round(row.total, 2),
#                 percentage=percentage
#             )
#         )

#     # Sort biggest spending category first — makes the chart legend read naturally
#     results.sort(key=lambda x: x.total, reverse=True)
#     return results


def get_category_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get total spending
    total_spent = (
        db.query(func.sum(Expense.amount))
        .filter(Expense.user_id == current_user.id)
        .scalar()
    ) or 0

    # Group expenses by category
    results = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.user_id == current_user.id)
        .group_by(Expense.category)
        .all()
    )

    data = []

    for row in results:
        percentage = 0

        if total_spent > 0:
            percentage = round((row.total / total_spent) * 100, 2)

        data.append({
            "category": row.category,
            "total": float(row.total),
            "percentage": percentage
        })

    return data


@router.get("/weekly", response_model=list[WeeklyDataPoint])
# def get_weekly(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     today = date.today()
#     results = []

#     for i in range(6, -1, -1):  # last 7 days, oldest first
#         target_date = today - timedelta(days=i)
#         total = (
#             db.query(func.sum(Expense.amount))
#             .filter(Expense.user_id == current_user.id)
#             .filter(Expense.expense_date == target_date)
#             .scalar() or 0.0
#         )
#         results.append(
#             WeeklyDataPoint(
#                 day=target_date.strftime("%a"),     # "Mon", "Tue", etc.
#                 date=target_date.isoformat(),
#                 total=round(total, 2)
#             )
#         )

#     return results
@router.get("/weekly")
def get_weekly_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    start_date = today - timedelta(days=6)

    results = (
        db.query(
            Expense.expense_date,
            func.sum(Expense.amount).label("total")
        )
        .filter(
            Expense.user_id == current_user.id,
            Expense.expense_date >= start_date
        )
        .group_by(Expense.expense_date)
        .order_by(Expense.expense_date)
        .all()
    )

    spending_map = {
        row.expense_date: float(row.total)
        for row in results
    }

    data = []

    for i in range(7):
        current_date = start_date + timedelta(days=i)

        data.append({
            "day": current_date.strftime("%a"),
            "total": spending_map.get(current_date, 0)
        })

    return data


@router.get("/recent")
def get_recent_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .order_by(Expense.expense_date.desc(), Expense.id.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "date": expense.expense_date,
            "merchant": expense.merchant_name,
            "category": expense.category,
            "amount": float(expense.amount)
        }
        for expense in expenses
    ]




# ... your existing routes stay exactly as-is, add this new one below them ...

@router.get("/calendar")
def get_calendar_data(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns every day in the given month with that day's total spending,
    plus the user's avg_per_day (reused from the summary logic) so the
    frontend can color-code each day.
    """
    # Get all expenses in this specific month for this user
    rows = (
        db.query(Expense.expense_date, func.sum(Expense.amount).label("total"))
        .filter(Expense.user_id == current_user.id)
        .filter(extract("year", Expense.expense_date) == year)
        .filter(extract("month", Expense.expense_date) == month)
        .group_by(Expense.expense_date)
        .all()
    )

    # Build a lookup: {date_string: total}
    daily_totals = {row.expense_date.isoformat(): round(row.total, 2) for row in rows}

    # Calculate this user's overall average per day (same logic as /summary)
    all_expenses_query = db.query(Expense).filter(Expense.user_id == current_user.id)
    total_spent = all_expenses_query.with_entities(func.sum(Expense.amount)).scalar() or 0.0
    earliest = all_expenses_query.with_entities(func.min(Expense.expense_date)).scalar()

    if earliest:
        from datetime import date as date_cls
        days_elapsed = max((date_cls.today() - earliest).days, 1)
        avg_per_day = total_spent / days_elapsed
    else:
        avg_per_day = 0.0

    # Build the full list of days in this month (including days with 0 spending)
    days_in_month = cal_module.monthrange(year, month)[1]
    calendar_days = []

    for day_num in range(1, days_in_month + 1):
        day_str = f"{year:04d}-{month:02d}-{day_num:02d}"
        day_total = daily_totals.get(day_str, 0.0)

        # Color logic
         # Fixed threshold color logic — matches the reference design exactly
        if day_total == 0:
            color = "purple"      # No spending
        elif 1 <= day_total <= 500:
            color = "green"       # Low spending
        elif 501 <= day_total <= 1500:
            color = "orange"      # Medium spending
        else:  # day_total >= 1501
            color = "red"         # High spending

        calendar_days.append({
            "date": day_str,
            "day": day_num,
            "total": day_total,
            "color": color
        })

    return {
        "year": year,
        "month": month,
        "avg_per_day": round(avg_per_day, 2),
        "days": calendar_days
    }


@router.get("/day/{day_date}")
def get_day_expenses(
    day_date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns every individual expense for one specific date.
    Used when the user clicks on a calendar day.
    """
    from datetime import date as date_cls
    try:
        parsed_date = date_cls.fromisoformat(day_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .filter(Expense.expense_date == parsed_date)
        .order_by(Expense.created_at.desc())
        .all()
    )

    total = sum(exp.amount for exp in expenses)

    return {
        "date": day_date,
        "total": round(total, 2),
        "expenses": [
            {
                "id": exp.id,
                "merchant_name": exp.merchant_name,
                "category": exp.category,
                "amount": exp.amount,
                "notes": exp.notes
            }
            for exp in expenses
        ]
    }
