"""Sentence embedding service.

Model: sentence-transformers/all-MiniLM-L6-v2
  - 384-dimensional vectors
  - ~80MB download, fast CPU inference
  - Good semantic quality on short/medium English text

This runs server-side. For on-device mobile inference (e.g. real-time
topic suggestion as the user types in the description field), pair this
with MediaPipe Text Embedder on the client — it uses Universal Sentence
Encoder Lite, ~25MB, runs in milliseconds on phone hardware.
"""
import threading
from functools import lru_cache

import numpy as np

from app.config import settings

_model = None
_lock = threading.Lock()


def get_model():
    """Lazy-load the model, thread-safe singleton."""
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                # Imported here so the app can boot without the heavy dep loaded.
                from sentence_transformers import SentenceTransformer
                _model = SentenceTransformer(settings.embedding_model)
    return _model


def embed(text: str) -> list[float]:
    """Encode a single string. Returns zero-vector for empty input."""
    if not text or not text.strip():
        return [0.0] * settings.embedding_dim
    vec = get_model().encode(text, normalize_embeddings=True)
    return vec.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Encode a batch of strings — much faster than one-at-a-time."""
    if not texts:
        return []
    vecs = get_model().encode(texts, normalize_embeddings=True, batch_size=16)
    return [v.tolist() for v in vecs]


def cosine_sim(a, b) -> float:
    """Cosine similarity between two vectors (already unit-normalized → just dot)."""
    if a is None or b is None:
        return 0.0
    a, b = np.asarray(a, dtype=np.float32), np.asarray(b, dtype=np.float32)
    if a.size == 0 or b.size == 0:
        return 0.0
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))
