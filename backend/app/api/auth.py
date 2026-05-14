"""Authentication: signup + login."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import User, MentorOffering
from app.schemas import TokenOut, UserLogin, UserSignup
from app.security import create_token, hash_password, verify_password

router = APIRouter()


@router.post("/signup", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    existing = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        role=payload.role,
    )
    db.add(user)
    db.flush()  # need user.id

    # Mentors get a default offering record
    if payload.role == "mentor":
        db.add(MentorOffering(user_id=user.id))

    db.commit()
    return TokenOut(
        access_token=create_token(str(user.id)),
        user_id=str(user.id),
        role=user.role,
    )


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenOut(
        access_token=create_token(str(user.id)),
        user_id=str(user.id),
        role=user.role,
    )
