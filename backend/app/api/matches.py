"""Matches: find recommended mentors, search by name."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.matching.matcher import find_matches
from app.models import User
from app.schemas import MatchesOut

router = APIRouter()


@router.get("/find", response_model=MatchesOut)
def find_mentors(
    top_k: int = 10,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Return ranked mentor matches for the current mentee with full explanation."""
    if current.role != "mentee":
        raise HTTPException(403, "Only mentees can search for mentors")
    if not current.profile:
        raise HTTPException(400, "Complete your profile first")

    matches = find_matches(db, current.id, top_k=top_k)
    return MatchesOut(matches=matches)


@router.get("/search")
def search_by_name(
    q: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Direct mentor lookup by name."""
    if current.role != "mentee":
        raise HTTPException(403, "Mentee only")
    stmt = (
        select(User)
        .where(User.role == "mentor")
        .where(func.lower(User.name).contains(q.lower()))
        .limit(20)
    )
    results = db.execute(stmt).scalars().all()
    return {
        "results": [
            {"id": str(u.id), "name": u.name} for u in results
        ]
    }
