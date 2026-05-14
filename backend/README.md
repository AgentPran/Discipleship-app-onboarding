# Discipleship API

FastAPI backend for mentor matching. Uses sentence-transformers for NLP
and PostgreSQL with pgvector for fast similarity search at scale.

## Quick start

```bash
# 1. Boot the database + API (Docker handles everything)
docker compose up --build

# 2. Open the auto-generated docs
open http://localhost:8000/docs
```

That's it. The `api` container runs `alembic upgrade head` on startup and
auto-reloads on code changes.

## Running without Docker

```bash
# Postgres (with pgvector) running locally on :5432

python -m venv .venv && source .venv/bin/activate
pip install -e .              # uses pyproject.toml
cp .env.example .env

alembic upgrade head
uvicorn app.main:app --reload
```

## The matching algorithm

`app/matching/matcher.py` is the heart.

**Hard filters** (deal-breakers, applied as SQL `WHERE` clauses):
- Mentor's `life_stage_level` ≥ mentee's
- Mentor's `faith_stage_level` ≥ mentee's
- Mentor has capacity (`current_load < capacity`)
- Mentor is accepting new (`accepting_new = true`)
- Mentor offers ≥1 of mentee's support areas (`can_support && support_areas`)

**Soft scoring** (weighted sum 0–1):
| Component             | Weight | Computed as |
|-----------------------|-------:|-------------|
| Support area match    | 0.30   | Jaccard(mentor.can_support, mentee.support_areas) |
| Description semantic  | 0.30   | cosine(mentor.description_embedding, mentee.description_embedding) |
| Strengths overlap     | 0.15   | Jaccard(mentor.strengths, mentee.strengths) |
| Interests overlap     | 0.10   | Jaccard(mentor.interests, mentee.interests) |
| Category overlap      | 0.10   | Jaccard(mentor.categories, mentee.categories) — both NLP-classified |
| Stage proximity       | 0.05   | Reward ideal gap (1–2 stages ahead), penalize too far |

Weights are tunable in `WEIGHTS` at the top of `matcher.py`. Every match
returns a JSON `match_explanation` with all component scores and shared
items, so the UI can show *why* this mentor was suggested.

## NLP pipeline

1. **Embedding** (`app/matching/embeddings.py`)
   - Model: `sentence-transformers/all-MiniLM-L6-v2` (384-dim, ~80MB, CPU-friendly)
   - Each user's free-text description is encoded once on profile save
   - Stored as `pgvector` column for fast similarity search

2. **Zero-shot classification** (`app/matching/categories.py`)
   - 10 predefined topic clusters (career direction, parenting,
     spiritual dryness, mental health, …)
   - Each cluster has a "semantic anchor" description
   - User description is compared against all anchors via cosine
   - Top-3 above similarity threshold become the user's category tags
   - When the corpus grows, we can replace this with clustering (K-Means
     on embeddings) to discover real categories from real data

**Why this rather than MediaPipe on the server**: MediaPipe is excellent
for on-device mobile ML (vision, audio, lightweight text models). For
server-side semantic matching at scale, sentence-transformers gives
better quality and integrates with pgvector natively. We can still
use MediaPipe Text Embedder on the mobile client for real-time hints
(e.g., suggesting categories as the user types).

## API surface

```
POST   /v1/auth/signup
POST   /v1/auth/login

GET    /v1/profiles/me
PUT    /v1/profiles/me                          # mentee or mentor profile
PUT    /v1/profiles/me/mentor-offering          # mentor only

GET    /v1/matches/find?top_k=10                # ranked recommendations
GET    /v1/matches/search?q=name                # search by mentor name

POST   /v1/requests                             # mentee creates request
POST   /v1/requests/{id}/admin-share            # admin → mentor
POST   /v1/requests/{id}/decision               # mentor accepts/declines
GET    /v1/requests/mine
```

Full interactive docs at `http://localhost:8000/docs` once running.

## Project structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app
│   ├── config.py                # env settings
│   ├── db.py                    # SQLAlchemy engine/session
│   ├── models.py                # ORM models (incl. Vector(384) column)
│   ├── schemas.py               # Pydantic request/response shapes
│   ├── security.py              # bcrypt + JWT helpers
│   ├── api/
│   │   ├── deps.py              # auth & DB injection
│   │   ├── auth.py
│   │   ├── profiles.py          # triggers NLP enrichment on save
│   │   ├── matches.py
│   │   └── requests.py
│   └── matching/
│       ├── stages.py            # life/faith stage orderings
│       ├── embeddings.py        # sentence-transformers wrapper
│       ├── categories.py        # zero-shot classification
│       └── matcher.py           # ★ the algorithm ★
├── alembic/                     # migrations
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml
└── .env.example
```
