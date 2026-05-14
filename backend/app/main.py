"""Discipleship API — FastAPI application entry point."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, profiles, matches, requests as requests_api, admin, relationships

log = logging.getLogger("uvicorn.error")
_ready = {"value": False}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load the ML model so the first user request doesn't pay cold-start cost.

    Without this, a request that triggers embedding (profile save) would
    block ~10–15s while sentence-transformers loads. With warmup, uvicorn
    won't accept connections until the model and category anchors are ready.
    """
    log.info("Warming up embedding model (first run downloads ~80MB)…")
    from app.matching.embeddings import get_model
    from app.matching.categories import _category_matrix

    get_model()
    log.info("✓ Embedding model loaded")
    _category_matrix()
    log.info("✓ Category anchors ready")
    _ready["value"] = True
    log.info("🕊  Discipleship API is ready")
    yield


app = FastAPI(
    title="Discipleship API",
    version="0.1.0",
    description="Mentor matching backend — NLP-driven, human-in-the-loop.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(profiles.router, prefix="/v1/profiles", tags=["profiles"])
app.include_router(matches.router, prefix="/v1/matches", tags=["matches"])
app.include_router(requests_api.router, prefix="/v1/requests", tags=["requests"])
app.include_router(admin.router, prefix="/v1/admin", tags=["admin"])
app.include_router(relationships.router, prefix="/v1/relationships", tags=["relationships"])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/ready")
def ready():
    """200 with ready=true once the ML model is loaded and warm."""
    return {"ready": _ready["value"]}
