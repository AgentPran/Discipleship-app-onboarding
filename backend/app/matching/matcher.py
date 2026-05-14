"""Mentor matching service.

Pipeline:
1. SQL hard-filter to candidate set (life-stage level, faith-stage level,
   capacity, accepting_new, ≥1 support area overlap)
2. Score each candidate on six weighted components
3. Return top-K with full explanation JSON for transparency
"""
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import array
from sqlalchemy.orm import Session

from app.models import MentorOffering, Profile, User
from app.matching.embeddings import cosine_sim

# Tunable weights — sum to 1.0
WEIGHTS = {
    "support_match":    0.30,  # explicit need ↔ explicit gift
    "description_sim":  0.30,  # semantic closeness of free-text
    "strengths_overlap":0.15,  # character compatibility
    "interests_overlap":0.10,  # connection potential
    "category_overlap": 0.10,  # NLP-classified topical alignment
    "stage_proximity":  0.05,  # "right" level of ahead-ness
}


def jaccard(a, b) -> float:
    sa, sb = set(a or []), set(b or [])
    if not sa and not sb:
        return 0.0
    union = sa | sb
    return len(sa & sb) / len(union) if union else 0.0


def stage_proximity(mentor_level: int, mentee_level: int, ideal_gap: int = 1) -> float:
    """Reward small forward gap (1–2 stages). Penalize zero or huge gaps.

    A mentor 1 stage ahead = perfect (1.0).
    A peer mentor (same stage) = decent (0.7).
    Mentor 3+ stages ahead = diminishing returns.
    Mentor behind = 0 (already filtered out by hard-filter).
    """
    gap = mentor_level - mentee_level
    if gap < 0:
        return 0.0
    if gap == 0:
        return 0.7
    if gap == ideal_gap:
        return 1.0
    if gap == ideal_gap + 1:
        return 0.85
    return max(0.0, 1.0 - 0.15 * (gap - ideal_gap))


def score_mentor(mentor: User, mentee: User) -> dict[str, Any]:
    """Score a single mentor against a mentee. Returns explanation dict."""
    mp = mentor.profile
    me = mentee.profile
    mo = mentor.mentor_offering

    mentor_can_support = (mo.can_support if mo else []) or []
    mentee_needs       = me.support_areas or []

    components = {
        "support_match":     jaccard(mentor_can_support, mentee_needs),
        "description_sim":   cosine_sim(mp.description_embedding, me.description_embedding),
        "strengths_overlap": jaccard(mp.strengths, me.strengths),
        "interests_overlap": jaccard(mp.interests, me.interests),
        "category_overlap":  jaccard(mp.categories, me.categories),
        "stage_proximity":   stage_proximity(mp.life_stage_level, me.life_stage_level),
    }
    score = sum(WEIGHTS[k] * v for k, v in components.items())

    return {
        "score": round(score, 4),
        "components": {k: round(v, 4) for k, v in components.items()},
        "shared_strengths":  sorted(set(mp.strengths or []) & set(me.strengths or [])),
        "shared_interests":  sorted(set(mp.interests or []) & set(me.interests or [])),
        "shared_categories": sorted(set(mp.categories or []) & set(me.categories or [])),
        "shared_support":    sorted(set(mentor_can_support) & set(mentee_needs)),
    }


def find_matches(db: Session, mentee_id: UUID, top_k: int = 10) -> list[dict[str, Any]]:
    """Find best mentors for a mentee."""
    mentee = db.get(User, mentee_id)
    if not mentee or not mentee.profile:
        return []

    me = mentee.profile

    # ---- Hard filters ----
    conditions = [
        User.role == "mentor",
        MentorOffering.accepting_new.is_(True),
        MentorOffering.current_load < MentorOffering.capacity,
        Profile.life_stage_level >= me.life_stage_level,
        Profile.faith_stage_level >= me.faith_stage_level,
    ]
    # Only apply the support-area overlap filter when the mentee has named
    # at least one need. Without this guard, skipping the support question
    # would produce an `&& {""}` SQL clause that matches zero mentors.
    if me.support_areas:
        conditions.append(
            MentorOffering.can_support.op("&&")(array(me.support_areas))
        )

    stmt = (
        select(User)
        .join(Profile, Profile.user_id == User.id)
        .join(MentorOffering, MentorOffering.user_id == User.id)
        .where(*conditions)
    )
    candidates = db.execute(stmt).scalars().all()

    # ---- Score & rank ----
    scored = []
    for mentor in candidates:
        explanation = score_mentor(mentor, mentee)
        if explanation["score"] <= 0:
            continue
        scored.append({
            "mentor_id": str(mentor.id),
            "name": mentor.name,
            **explanation,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]
