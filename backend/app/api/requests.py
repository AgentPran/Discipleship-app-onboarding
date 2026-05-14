"""Mentoring requests — implements the use case flows:

- Mentee creates a request (direct or via admin)
- Admin shares with mentor (after review)
- Mentor accepts/declines
- Accepted → creates a MentoringRelationship
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.matching.matcher import score_mentor
from app.models import MentoringRelationship, MentoringRequest, User
from app.schemas import RequestCreate, RequestDecision, RequestOut

router = APIRouter()


@router.post("/", response_model=RequestOut)
def create_request(
    payload: RequestCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if current.role != "mentee":
        raise HTTPException(403, "Only mentees create requests")

    mentor = db.get(User, payload.mentor_id)
    if not mentor or mentor.role != "mentor":
        raise HTTPException(404, "Mentor not found")

    if not mentor.mentor_offering or not mentor.mentor_offering.accepting_new:
        raise HTTPException(400, "Mentor isn't accepting new mentees")

    # Pre-compute match explanation so admins/mentors see *why* this was sent.
    explanation = score_mentor(mentor, current)

    req = MentoringRequest(
        mentee_id=current.id,
        mentor_id=mentor.id,
        status="admin_review" if payload.via_admin else "pending",
        initiated_by="mentee",
        match_score=explanation["score"],
        match_explanation=explanation,
        message=payload.message,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.post("/{request_id}/admin-share")
def admin_share_with_mentor(
    request_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Admin moves a request from admin_review → shared_with_mentor."""
    if current.role != "admin":
        raise HTTPException(403, "Admin only")
    req = db.get(MentoringRequest, request_id)
    if not req:
        raise HTTPException(404, "Request not found")
    if req.status != "admin_review":
        raise HTTPException(400, f"Cannot share — status is {req.status}")
    req.status = "shared_with_mentor"
    db.commit()
    return {"status": req.status}


@router.post("/admin-assign")
def admin_assign(
    payload: RequestCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Admin assigns a mentor directly to a mentee. Skips admin_review."""
    if current.role != "admin":
        raise HTTPException(403, "Admin only")
    mentee = db.get(User, payload.mentor_id)  # NOTE: reuse schema's mentor_id as target mentee
    # In practice we'd add a separate AdminAssign schema. Keeping minimal here.
    raise HTTPException(501, "Implement with a dedicated AdminAssign schema (mentor_id + mentee_id)")


@router.post("/{request_id}/decision")
def mentor_decision(
    request_id: str,
    decision: RequestDecision,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Mentor accepts or declines a request."""
    req = db.get(MentoringRequest, request_id)
    if not req:
        raise HTTPException(404, "Request not found")
    if req.mentor_id != current.id:
        raise HTTPException(403, "Not your request to decide")
    if req.status not in {"pending", "shared_with_mentor"}:
        raise HTTPException(400, f"Cannot decide — status is {req.status}")

    if decision.action == "accept":
        req.status = "accepted"
        rel = MentoringRelationship(
            mentor_id=req.mentor_id,
            mentee_id=req.mentee_id,
            request_id=req.id,
        )
        db.add(rel)
        if current.mentor_offering:
            current.mentor_offering.current_load += 1
    else:
        req.status = "declined"

    db.commit()
    return {"status": req.status}


@router.get("/mine")
def my_requests(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """List requests where I'm the mentor or the mentee."""
    stmt = select(MentoringRequest).where(
        (MentoringRequest.mentee_id == current.id)
        | (MentoringRequest.mentor_id == current.id)
    ).order_by(MentoringRequest.created_at.desc())
    rows = db.execute(stmt).scalars().all()
    return {
        "requests": [
            {
                "id": str(r.id),
                "mentor_id": str(r.mentor_id),
                "mentee_id": str(r.mentee_id),
                "status": r.status,
                "match_score": r.match_score,
                "match_explanation": r.match_explanation,
                "message": r.message,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]
    }
