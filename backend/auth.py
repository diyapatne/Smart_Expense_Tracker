from datetime import datetime, timedelta
import os

from dotenv import load_dotenv

from jose import JWTError, jwt

from passlib.context import CryptContext

from fastapi import Depends, HTTPException, status

from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from database import SessionLocal

from models import User


# Load environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv("ALGORITHM")


# Configure password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# Configure token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# Database dependency
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# Hash password
def hash_password(password: str):

    return pwd_context.hash(password)


# Verify password
def verify_password(
    plain_password: str,
    hashed_password: str
):

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# Create JWT token
def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=1)

    to_encode.update(
        {"exp": expire}
    )

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# Get current logged-in user
def get_current_user(

    token: str = Depends(oauth2_scheme),

    db: Session = Depends(get_db)

):

    credentials_exception = HTTPException(

        status_code=status.HTTP_401_UNAUTHORIZED,

        detail="Could not validate credentials"

    )

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]

        )

        email = payload.get("sub")

        if email is None:

            raise credentials_exception

    except JWTError:

        raise credentials_exception

    user = db.query(User).filter(

        User.email == email

    ).first()

    if user is None:

        raise credentials_exception

    return user