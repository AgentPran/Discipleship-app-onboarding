"""Profile upsert (mentee & mentor) — computes NLP fields on save."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.matching.categories import classify_description
from app.matching.embeddings import embed
from app.matching.stages import faith_level, life_level
from app.models import MentorOffering, Profile, User
from app.schemas import MentorOfferingUpsert, ProfileOut, ProfileUpsert

router = APIRouter()


@router.get("/me", response_model=ProfileOut)
def read_my_profile(current: User = Depends(get_current_user)):
    p = current.profile
    if not p:
        # Return empty shape
        return ProfileOut(
            user_id=current.id, name=current.name, role=current.role,
            life_stage=[], life_stage_level=0, faith_stage=[], faith_stage_level=0,
            support_areas=[], strengths=[], interests=[], description=None, categories=[],
        )
    return ProfileOut(
        user_id=current.id, name=current.name, role=current.role,
        life_stage=p.life_stage or [], life_stage_level=p.life_stage_level or 0,
        faith_stage=p.faith_stage or [], faith_stage_level=p.faith_stage_level or 0,
        support_areas=p.support_areas or [], strengths=p.strengths or [],
        interests=p.interests or [], description=p.description, categories=p.categories or [],
    )


@router.put("/me", response_model=ProfileOut)
def upsert_my_profile(
    payload: ProfileUpsert,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Upsert profile. Triggers NLP enrichment if description changed."""
    profile = current.profile
    if profile is None:
        profile = Profile(user_id=current.id)
        db.add(profile)

    desc_changed = profile.description != payload.description

    profile.life_stage        = payload.life_stage
    profile.life_stage_level  = life_level(payload.life_stage)
    profile.faith_stage       = payload.faith_stage
    profile.faith_stage_level = faith_level(payload.faith_stage)
    profile.support_areas     = payload.support_areas
    profile.strengths         = payload.strengths
    profile.interests         = payload.interests
    profile.description       = payload.description

    if desc_changed and payload.description:
        # NLP enrichment — expensive, only rerun when text changed
        profile.description_embedding = embed(payload.description)
        profile.categories = classify_description(payload.description)
    elif not payload.description:
        profile.description_embedding = None
        profile.categories = []

    db.commit()
    db.refresh(profile)
    return ProfileOut(
        user_id=current.id, name=current.name, role=current.role,
        life_stage=profile.life_stage or [], life_stage_level=profile.life_stage_level or 0,
        faith_stage=profile.faith_stage or [], faith_stage_level=profile.faith_stage_level or 0,
        support_areas=profile.support_areas or [], strengths=profile.strengths or [],
        interests=profile.interests or [], description=profile.description,
        categories=profile.categories or [],
    )


@router.put("/me/mentor-offering")
def upsert_mentor_offering(
    payload: MentorOfferingUpsert,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Mentor-only: what they can offer + how many mentees they'll take."""
    if current.role != "mentor":
        from fastapi import HTTPException
        raise HTTPException(403, "Mentor only")

    offering = current.mentor_offering
    if offering is None:
        offering = MentorOffering(user_id=current.id)
        db.add(offering)

    offering.can_support   = payload.can_support
    offering.capacity      = payload.capacity
    offering.accepting_new = payload.accepting_new
    db.commit()
    return {"ok": True}
