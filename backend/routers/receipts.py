from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException
)

from sqlalchemy.orm import Session

from database import SessionLocal

from models import (
    Receipt,
    AILog,
    ExpenseItem
)

from auth import get_current_user

from services.s3_service import upload_to_s3

from services.ai_service import analyze_receipt

from datetime import datetime

import uuid


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


# ================= UPLOAD =================

@router.post("/upload")

async def upload_receipt(

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    if file.content_type not in ALLOWED_TYPES:

        raise HTTPException(

            status_code=400,

            detail="Only JPG, JPEG and PNG allowed"

        )

    contents = await file.read()

    if len(contents) > MAX_SIZE:

        raise HTTPException(

            status_code=400,

            detail="Maximum size is 10MB"

        )

    filename = (

        f"{uuid.uuid4()}_{file.filename}"

    )

    image_url = upload_to_s3(

        contents,

        filename

    )

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


# ================= GET ALL =================

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


# ================= GET ONE =================

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


# ================= ANALYZE =================

@router.post("/{receipt_id}/analyze")

def analyze_receipt_route(

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

        extracted = analyze_receipt(

            receipt.image_url

        )

        raw_prompt = extracted.pop(

            "_raw_prompt",

            ""

        )

        raw_response = extracted.pop(

            "_raw_response",

            ""

        )

        tokens_used = extracted.pop(

            "_tokens_used",

            None

        )

        receipt.merchant_name = extracted.get(

            "merchant_name"

        )

        receipt.total_amount = extracted.get(

            "total_amount"

        )

        receipt.category = extracted.get(

            "category"

        )

        receipt.status = "processed"

        try:

            receipt.receipt_date = datetime.strptime(

                extracted.get("date"),

                "%Y-%m-%d"

            ).date()

        except:

            receipt.receipt_date = None

        for item in extracted.get(

            "items",

            []

        ):

            db_item = ExpenseItem(

                receipt_id=receipt.id,

                item_name=item.get(

                    "name",

                    "Unknown"

                ),

                price=item.get(

                    "price",

                    0

                ),

                quantity=1

            )

            db.add(db_item)

        ai_log = AILog(

            receipt_id=receipt.id,

            prompt=raw_prompt,

            response=raw_response,

            tokens_used=tokens_used

        )

        db.add(ai_log)

        db.commit()

        db.refresh(receipt)

        return {

            "receipt_id": receipt.id,

            "status": receipt.status,

            "merchant_name": receipt.merchant_name,

            "date": str(

                receipt.receipt_date

            )

            if receipt.receipt_date

            else None,

            "total_amount": receipt.total_amount,

            "category": receipt.category,

            "items": extracted.get(

                "items",

                []

            )

        }

    except Exception as e:

        receipt.status = "failed"

        db.commit()

        raise HTTPException(

            status_code=422,

            detail=f"AI processing failed: {str(e)}"

        )