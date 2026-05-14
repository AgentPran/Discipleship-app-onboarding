"""Pydantic schemas for request/response shapes."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=100)
    role: str = Field(pattern="^(mentee|mentor)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str


# ---------- Profiles ----------
class ProfileUpsert(BaseModel):
    life_stage: list[str] = []
    faith_stage: list[str] = []
    support_areas: list[str] = []
    strengths: list[str] = []
    interests: list[str] = []
    description: Optional[str] = None


class ProfileOut(BaseModel):
    user_id: UUID
    name: str
    role: str
    life_stage: list[str]
    life_stage_level: int
    faith_stage: list[str]
    faith_stage_level: int
    support_areas: list[str]
    strengths: list[str]
    interests: list[str]
    description: Optional[str]
    categories: list[str]

    model_config = {"from_attributes": True}


class MentorOfferingUpsert(BaseModel):
    can_support: list[str] = []
    capacity: int = 3
    accepting_new: bool = True


# ---------- Matches ----------
class MatchScore(BaseModel):
    mentor_id: str
    name: str
    score: float
    components: dict[str, float]
    shared_strengths: list[str]
    shared_interests: list[str]
    shared_categories: list[str]


class MatchesOut(BaseModel):
    matches: list[MatchScore]


# ---------- Requests ----------
class RequestCreate(BaseModel):
    mentor_id: UUID
    message: Optional[str] = None
    via_admin: bool = False


class RequestOut(BaseModel):
    id: UUID
    mentor_id: UUID
    mentee_id: UUID
    status: str
    match_score: Optional[float] = None
    message: Optional[str] = None

    model_config = {"from_attributes": True}


class RequestDecision(BaseModel):
    action: str = Field(pattern="^(accept|decline)$")
