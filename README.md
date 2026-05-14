# Discipleship

A mentor matching app built around dignity: be **known**, before you're matched.

## Repo layout

```
discipleship/
├── frontend/   # React + Vite — the mobile-first onboarding & dashboard
└── backend/    # FastAPI + PostgreSQL + pgvector + sentence-transformers
```

See `frontend/README.md` and `backend/README.md` for setup instructions.

## How matching works (in one paragraph)

A mentee finishes the conversational onboarding. The backend embeds their
free-text description into a 384-dim vector (sentence-transformers) and
classifies it into topic clusters via zero-shot cosine similarity against
pre-defined category anchors. To find mentors, we run a SQL hard-filter
(mentor must be ahead in life stage and faith stage, have capacity, and
offer ≥1 of the mentee's support areas), then score each survivor on six
weighted components — support match, semantic description similarity,
strengths overlap, interests overlap, category overlap, and stage
proximity — returning the top K with a transparent explanation for each.
