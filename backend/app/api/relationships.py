"""Active mentoring relationships."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import MentoringRelationship, User

router = APIRouter()


@router.get("/mine")
def my_relationships(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Active relationships where the current user is mentor or mentee."""
    stmt = select(MentoringRelationship).where(
        (
            (MentoringRelationship.mentor_id == current.id)
            | (MentoringRelationship.mentee_id == current.id)
        ),
        MentoringRelationship.status == "active",
    )
    rels = db.execute(stmt).scalars().all()

    result = []
    for rel in rels:
        other_id = rel.mentee_id if current.role == "mentor" else rel.mentor_id
        other = db.get(User, other_id)
        p = other.profile if other else None
        result.append({
            "relationship_id": str(rel.id),
            "started_at": rel.started_at.isoformat() if rel.started_at else None,
            "user_id": str(other.id) if other else None,
            "name": other.name if other else "Unknown",
            "life_stage": p.life_stage if p else [],
            "faith_stage": p.faith_stage if p else [],
            "support_areas": p.support_areas if p else [],
            "strengths": p.strengths if p else [],
            "description": p.description if p else None,
        })
    return {"relationships": result}
