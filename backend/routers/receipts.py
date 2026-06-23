from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Receipt
from auth import get_current_user

from services.ai_service import analyze_receipt

from models import AILog

from datetime import datetime

router = APIRouter(
    prefix="/receipts",
    tags=["Receipts"]
)

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

ALLOWED_TYPES = [

    "image/jpeg",

    "image/jpg",

    "image/png"

]

MAX_SIZE = 10 * 1024 * 1024

import uuid

from services.s3_service import upload_to_s3


@router.post("/upload")
async def upload_receipt(

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    # Validate image type

    if file.content_type not in ALLOWED_TYPES:

        raise HTTPException(

            status_code=400,

            detail="Only JPG, JPEG and PNG allowed"

        )

    contents = await file.read()

    # Validate size

    if len(contents) > MAX_SIZE:

        raise HTTPException(

            status_code=400,

            detail="Maximum size is 10MB"

        )

    # Create unique filename

    filename = (

        f"{uuid.uuid4()}_{file.filename}"

    )

    # Upload to AWS

    image_url = upload_to_s3(

        contents,

        filename

    )

    # Create database row

    receipt = Receipt(

        user_id=current_user.id,

        image_url=image_url,

        status="pending"

    )

    db.add(receipt)

    db.commit()

    db.refresh(receipt)

    return {

        "message": "Receipt uploaded successfully",

        "receipt_id": receipt.id,

        "image_url": image_url

    }

@router.get("")
def get_receipts(

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    receipts = (

        db.query(Receipt)

        .filter(

            Receipt.user_id == current_user.id

        )

        .all()

    )

    return receipts

@router.get("/{receipt_id}")
def get_receipt(

    receipt_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    receipt = (

        db.query(Receipt)

        .filter(

            Receipt.id == receipt_id,

            Receipt.user_id == current_user.id

        )

        .first()

    )

    if not receipt:

        raise HTTPException(

            status_code=404,

            detail="Receipt not found"

        )

    return receipt

@router.post("/{receipt_id}/analyze")
def analyze_receipt_endpoint(

    receipt_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    receipt = (

        db.query(Receipt)

        .filter(

            Receipt.id == receipt_id,

            Receipt.user_id == current_user.id

        )

        .first()

    )

    if not receipt:

        raise HTTPException(

            status_code=404,

            detail="Receipt not found"

        )

    try:

        data, raw_response = analyze_receipt(

            receipt.image_url

        )

        receipt.merchant_name = data.get(

            "merchant_name"

        )

        receipt.date = data.get(

            "date"

        )

        receipt.total_amount = data.get(

            "total_amount"

        )

        receipt.category = data.get(

            "category"

        )

        receipt.status = "processed"

        ai_log = AILog(

            receipt_id=receipt.id,

            prompt="Receipt extraction",

            response=raw_response,

            created_at=datetime.utcnow()

        )

        db.add(ai_log)

        db.commit()

        db.refresh(receipt)

        return {

            "message": "Receipt analyzed",

            "data": data

        }

    except Exception as e:

        receipt.status = "failed"

        db.commit()

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )