from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db

from models import (
    User,
    Insight,
    AILog
)

from schemas import InsightResponse

from services.insights_service import (
    generate_user_insights
)

router = APIRouter(
    prefix="/insights",
    tags=["Insights"]
)


@router.post(
    "/generate",
    response_model=InsightResponse
)
def generate_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    result = generate_user_insights(
        db,
        current_user.id
    )

    # Handle zero expenses
    if len(result["insights"]) == 0:

        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )

    # Delete previous cache
    (
        # db.query(Insight)
        # .filter(
        #     Insight.user_id == current_user.id
        # )
        # .delete()
    )

    # Save new cache
    insight = Insight(

        user_id=current_user.id,

        insights_json=result["insights"],

        savings_tip=result["savings_tip"],

        flag=result["flag"],

        created_at=datetime.utcnow()

    )

    db.add(insight)

    # Save AI log
    ai_log = AILog(

        user_id=current_user.id,

        prompt=result["_raw_prompt"],

        response=result["_raw_response"],

        tokens_used=result["_tokens_used"],

        status="success"

    )

    db.add(ai_log)

    db.commit()

    db.refresh(insight)

    return {

        "insights": insight.insights_json,

        "savings_tip": insight.savings_tip,

        "flag": insight.flag,

        "created_at": insight.created_at

    }


@router.get(
    "",
    response_model=InsightResponse
)
def get_cached_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    insight = (

        db.query(Insight)

        .filter(
            Insight.user_id == current_user.id
        )

        .order_by(
            Insight.created_at.desc()
        )

        .first()

    )

    if not insight:

        raise HTTPException(
            status_code=404,
            detail="No cached insights found. Generate insights first."
        )

    return {

        "insights": insight.insights_json,

        "savings_tip": insight.savings_tip,

        "flag": insight.flag,

        "created_at": insight.created_at

    }