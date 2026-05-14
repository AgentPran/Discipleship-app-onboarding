"""Database models. Uses pgvector for description embeddings."""
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.db import Base
from app.config import settings


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("role IN ('mentee', 'mentor', 'admin')", name="role_check"),
    )

    profile = relationship(
        "Profile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    mentor_offering = relationship(
        "MentorOffering", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class Profile(Base):
    """The same profile shape for mentees and mentors — what they bring + what they're in."""
    __tablename__ = "profiles"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    # Stages — list of human-readable tags + computed seniority level (for hard-filter SQL)
    life_stage = Column(ARRAY(String), default=list)
    life_stage_level = Column(Integer, default=0, index=True)
    faith_stage = Column(ARRAY(String), default=list)
    faith_stage_level = Column(Integer, default=0, index=True)

    # Soft-match fields
    support_areas = Column(ARRAY(String), default=list)  # mentee: needs · mentor: gifts
    strengths = Column(ARRAY(String), default=list)
    interests = Column(ARRAY(String), default=list)

    # Free-text + NLP outputs
    description = Column(Text)
    description_embedding = Column(Vector(settings.embedding_dim))
    categories = Column(ARRAY(String), default=list)

    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="profile")


class MentorOffering(Base):
    """Mentor-only metadata: what they can offer and how much capacity they have."""
    __tablename__ = "mentor_offerings"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    can_support = Column(ARRAY(String), default=list)
    capacity = Column(Integer, default=3)
    current_load = Column(Integer, default=0)
    accepting_new = Column(Boolean, default=True)

    user = relationship("User", back_populates="mentor_offering")


class MentoringRequest(Base):
    """A mentee asking a mentor (directly or via admin). Carries the match explanation."""
    __tablename__ = "mentoring_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mentee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    status = Column(String(20), default="pending", index=True)
    initiated_by = Column(String(20))  # mentee | admin
    match_score = Column(Float)
    match_explanation = Column(JSONB)
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','admin_review','shared_with_mentor','accepted','declined','cancelled')",
            name="req_status_check",
        ),
    )


class MentoringRelationship(Base):
    """Active mentor↔mentee pairing, created when a request is accepted."""
    __tablename__ = "mentoring_relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    mentee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    request_id = Column(UUID(as_uuid=True), ForeignKey("mentoring_requests.id"))
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    status = Column(String(20), default="active")

    __table_args__ = (
        UniqueConstraint("mentor_id", "mentee_id", name="uq_rel_pair"),
        CheckConstraint("status IN ('active','paused','completed')", name="rel_status_check"),
    )
