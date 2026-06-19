from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from schemas import (
    UserCreate,
    UserLogin,
    UserOut,
    Token
)

router = APIRouter()
# ... rest stays the same


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(

        email=user.email,

        full_name=user.full_name,

        hashed_password=hash_password(
            user.password
        )
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message": "User created successfully"
    }


@router.post(
    "/login",
    response_model=Token
)
def login(

    user: UserLogin,

    db: Session = Depends(get_db)

):

    db_user = db.query(User).filter(

        User.email == user.email

    ).first()

    if not db_user:

        raise HTTPException(

            status_code=401,

            detail="Invalid credentials"

        )

    if not verify_password(

        user.password,

        db_user.hashed_password

    ):

        raise HTTPException(

            status_code=401,

            detail="Invalid credentials"

        )

    token = create_access_token(

        {"sub": db_user.email}

    )

    return {

        "access_token": token,

        "token_type": "bearer"

    }


@router.get(
    "/me",
    response_model=UserOut
)
def me(

    current_user=Depends(

        get_current_user

    )

):

    return current_user
