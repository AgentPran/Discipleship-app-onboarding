"""initial schema with pgvector

Revision ID: 001_initial
Revises:
Create Date: 2026-05-13
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("role IN ('mentee', 'mentor', 'admin')", name="role_check"),
    )
    op.create_index("ix_users_role", "users", ["role"])

    op.create_table(
        "profiles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("life_stage", postgresql.ARRAY(sa.String), server_default="{}"),
        sa.Column("life_stage_level", sa.Integer, server_default="0"),
        sa.Column("faith_stage", postgresql.ARRAY(sa.String), server_default="{}"),
        sa.Column("faith_stage_level", sa.Integer, server_default="0"),
        sa.Column("support_areas", postgresql.ARRAY(sa.String), server_default="{}"),
        sa.Column("strengths", postgresql.ARRAY(sa.String), server_default="{}"),
        sa.Column("interests", postgresql.ARRAY(sa.String), server_default="{}"),
        sa.Column("description", sa.Text),
        sa.Column("description_embedding", Vector(384)),
        sa.Column("categories", postgresql.ARRAY(sa.String), server_default="{}"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_profiles_life_level",  "profiles", ["life_stage_level"])
    op.create_index("ix_profiles_faith_level", "profiles", ["faith_stage_level"])
    # Vector index for fast cosine similarity search at scale
    op.execute(
        "CREATE INDEX idx_profiles_embedding ON profiles "
        "USING ivfflat (description_embedding vector_cosine_ops) WITH (lists=100)"
    )

    op.create_table(
        "mentor_offerings",
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("can_support", postgresql.ARRAY(sa.String), server_default="{}"),
        sa.Column("capacity", sa.Integer, server_default="3"),
        sa.Column("current_load", sa.Integer, server_default="0"),
        sa.Column("accepting_new", sa.Boolean, server_default="true"),
    )

    op.create_table(
        "mentoring_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("mentee_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("mentor_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("initiated_by", sa.String(20)),
        sa.Column("match_score", sa.Float),
        sa.Column("match_explanation", postgresql.JSONB),
        sa.Column("message", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint(
            "status IN ('pending','admin_review','shared_with_mentor','accepted','declined','cancelled')",
            name="req_status_check",
        ),
    )
    op.create_index("ix_req_mentee",  "mentoring_requests", ["mentee_id"])
    op.create_index("ix_req_mentor",  "mentoring_requests", ["mentor_id"])
    op.create_index("ix_req_status",  "mentoring_requests", ["status"])

    op.create_table(
        "mentoring_relationships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("mentor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("mentee_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("request_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("mentoring_requests.id")),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("status", sa.String(20), server_default="active"),
        sa.UniqueConstraint("mentor_id", "mentee_id", name="uq_rel_pair"),
        sa.CheckConstraint("status IN ('active','paused','completed')", name="rel_status_check"),
    )


def downgrade() -> None:
    op.drop_table("mentoring_relationships")
    op.drop_table("mentoring_requests")
    op.drop_table("mentor_offerings")
    op.execute("DROP INDEX IF EXISTS idx_profiles_embedding")
    op.drop_table("profiles")
    op.drop_table("users")
