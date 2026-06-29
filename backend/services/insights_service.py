from collections import defaultdict
from datetime import date
from sqlalchemy.orm import Session

from models import Expense
from services.ai_service import generate_financial_insights


def calculate_summary(db: Session, user_id: int):
    """
    Calculates the spending summary for the current month.
    """

    today = date.today()

    expenses = (
        db.query(Expense)
        .filter(
            Expense.user_id == user_id,
            Expense.expense_date >= today.replace(day=1)
        )
        .all()
    )

    if not expenses:
        return None

    total_spending = sum(exp.amount for exp in expenses)

    category_totals = defaultdict(float)
    monthly_totals = defaultdict(float)

    for expense in expenses:
        # Category totals
        category_totals[expense.category] += expense.amount

        # Monthly totals
        month = expense.expense_date.strftime("%B %Y")
        monthly_totals[month] += expense.amount

    top_categories = sorted(
        category_totals.items(),
        key=lambda x: x[1],
        reverse=True
    )[:3]

    largest_expense = max(
        expenses,
        key=lambda x: x.amount
    )
    

    return {
    "total_spending": total_spending,
    "top_categories": top_categories,
    "largest_expense": largest_expense,
    "monthly_totals": dict(monthly_totals),
}


def build_prompt(summary):
    """
    Converts analytics into a prompt for the AI model.
    """

    category_text = "\n".join(
        [
            f"- {category}: ₹{amount:.2f}"
            for category, amount in summary["top_categories"]
        ]
    )
    monthly_text = "\n".join(
        [
            f"- {month}: ₹{amount:.2f}"
            for month, amount in summary["monthly_totals"].items()
        ]
    )

    prompt = f"""
You are a personal finance advisor.

The user spent ₹{summary['total_spending']:.2f} this month.

Top spending categories:

{category_text}
Monthly Totals:

{monthly_text}
Largest expense:

{summary['largest_expense'].merchant_name}
₹{summary['largest_expense'].amount:.2f}

Generate exactly:

- 3 financial insights
- 1 savings tip
- 1 unusual spending flag

Return ONLY valid JSON.

Expected format:

{{
    "insights": [
        {{
            "title": "",
            "description": ""
        }},
        {{
            "title": "",
            "description": ""
        }},
        {{
            "title": "",
            "description": ""
        }}
    ],
    "savings_tip": "",
    "flag": ""
}}
"""

    return prompt


def generate_user_insights(db: Session, user_id: int):
    """
    Complete pipeline.

    Database
        ↓
    Analytics
        ↓
    Prompt
        ↓
    NVIDIA
        ↓
    Parsed JSON
    """

    summary = calculate_summary(db, user_id)

    if summary is None:
        return {
            "message": "No expenses found for this month.",
            "insights": [],
            "savings_tip": "Start tracking your expenses to receive AI insights.",
            "flag": "",
        }

    prompt = build_prompt(summary)

    result = generate_financial_insights(prompt)

    return result