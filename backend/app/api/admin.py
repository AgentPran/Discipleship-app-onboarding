"""Admin-only endpoints: review queue, user lists, metrics, actions."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import MentoringRelationship, MentoringRequest, User

router = APIRouter()


def _require_admin(current: User) -> None:
    if current.role != "admin":
        raise HTTPException(403, "Admin only")


def _user_summary(user: User) -> dict:
    p = user.profile
    offering = user.mentor_offering
    base = {
        "user_id": str(user.id),
        "name": user.name,
        "role": user.role,
        "life_stage": p.life_stage if p else [],
        "faith_stage": p.faith_stage if p else [],
        "support_areas": p.support_areas if p else [],
        "strengths": p.strengths if p else [],
        "interests": p.interests if p else [],
        "description": p.description if p else None,
        "categories": p.categories if p else [],
    }
    if offering:
        base.update({
            "capacity": offering.capacity,
            "current_load": offering.current_load,
            "accepting_new": offering.accepting_new,
        })
    return base


@router.get("/queue")
def admin_queue(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """All admin_review requests, oldest-first, with full mentee/mentor profiles."""
    _require_admin(current)
    stmt = (
        select(MentoringRequest)
        .where(MentoringRequest.status == "admin_review")
        .order_by(MentoringRequest.created_at.asc())
    )
    rows = db.execute(stmt).scalars().all()

    result = []
    for req in rows:
        mentee = db.get(User, req.mentee_id)
        mentor = db.get(User, req.mentor_id)
        result.append({
            "id": str(req.id),
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None,
            "match_score": req.match_score,
            "match_explanation": req.match_explanation,
            "message": req.message,
            "mentee": _user_summary(mentee) if mentee else None,
            "mentor": _user_summary(mentor) if mentor else None,
        })
    return {"queue": result}


@router.get("/users")
def list_users(
    role: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """All users of a given role with profile data."""
    _require_admin(current)
    if role not in {"mentee", "mentor"}:
        raise HTTPException(400, "role must be mentee or mentor")

    stmt = select(User).where(User.role == role).order_by(User.name)
    users = db.execute(stmt).scalars().all()

    result = []
    for u in users:
        summary = _user_summary(u)
        if u.role == "mentee":
            req_stmt = (
                select(MentoringRequest)
                .where(MentoringRequest.mentee_id == u.id)
                .order_by(MentoringRequest.created_at.desc())
                .limit(1)
            )
            latest = db.execute(req_stmt).scalar_one_or_none()
            summary["latest_request_status"] = latest.status if latest else None

            rel_stmt = select(MentoringRelationship).where(
                MentoringRelationship.mentee_id == u.id,
                MentoringRelationship.status == "active",
            )
            summary["in_relationship"] = db.execute(rel_stmt).scalar_one_or_none() is not None

        result.append(summary)
    return {"users": result}


@router.patch("/mentors/{mentor_id}/accepting")
def toggle_accepting(
    mentor_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Toggle a mentor's accepting_new flag."""
    _require_admin(current)
    mentor = db.get(User, mentor_id)
    if not mentor or mentor.role != "mentor":
        raise HTTPException(404, "Mentor not found")
    offering = mentor.mentor_offering
    if not offering:
        raise HTTPException(404, "Mentor has no offering record")
    offering.accepting_new = not offering.accepting_new
    db.commit()
    return {"mentor_id": mentor_id, "accepting_new": offering.accepting_new}


@router.post("/requests/{request_id}/cancel")
def cancel_request(
    request_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Admin cancels (declines) a request."""
    _require_admin(current)
    req = db.get(MentoringRequest, request_id)
    if not req:
        raise HTTPException(404, "Request not found")
    if req.status in {"accepted", "cancelled"}:
        raise HTTPException(400, f"Cannot cancel — status is {req.status}")
    req.status = "cancelled"
    db.commit()
    return {"status": req.status}


@router.get("/reports")
def reports(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Summary metrics for the pastoral team dashboard."""
    _require_admin(current)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_mentees = db.execute(
        select(func.count(User.id)).where(User.role == "mentee")
    ).scalar()
    total_mentors = db.execute(
        select(func.count(User.id)).where(User.role == "mentor")
    ).scalar()
    pairings_this_month = db.execute(
        select(func.count(MentoringRelationship.id)).where(
            MentoringRelationship.started_at >= month_start,
            MentoringRelationship.status == "active",
        )
    ).scalar()
    pending_in_queue = db.execute(
        select(func.count(MentoringRequest.id)).where(
            MentoringRequest.status == "admin_review"
        )
    ).scalar()
    total_active_pairs = db.execute(
        select(func.count(MentoringRelationship.id)).where(
            MentoringRelationship.status == "active"
        )
    ).scalar()
    total_accepted = db.execute(
        select(func.count(MentoringRequest.id)).where(
            MentoringRequest.status == "accepted"
        )
    ).scalar()
    total_declined = db.execute(
        select(func.count(MentoringRequest.id)).where(
            MentoringRequest.status == "declined"
        )
    ).scalar()

    decline_rate = (
        round(total_declined / (total_accepted + total_declined) * 100, 1)
        if (total_accepted + total_declined) > 0
        else 0.0
    )

    return {
        "total_mentees": total_mentees,
        "total_mentors": total_mentors,
        "pairings_this_month": pairings_this_month,
        "pending_in_queue": pending_in_queue,
        "total_active_pairs": total_active_pairs,
        "decline_rate": decline_rate,
    }
