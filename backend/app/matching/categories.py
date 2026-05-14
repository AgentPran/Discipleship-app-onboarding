"""Topic category clusters for mentee free-text descriptions.

Strategy: zero-shot classification using sentence embeddings.

1. Each category has a representative description (semantic anchor).
2. At profile-creation time, we embed the user's description and compare
   it against each category anchor via cosine similarity.
3. The top-N categories above threshold become the user's tags.
4. Mentor and mentee profiles are tagged with the SAME categories, so we
   can match on shared topical focus regardless of exact wording.

This is preferable to a fixed classifier head because:
- We can add/edit categories without retraining.
- It handles long-tail descriptions gracefully.
- It's explainable: we can show the user "you were classified into X
  because your description was most similar to Y description."

When we have ≥500 real descriptions, we can replace this with a fine-tuned
classifier or run K-Means on description embeddings to discover natural
clusters in our actual data.
"""
from functools import lru_cache

import numpy as np

from app.matching.embeddings import embed, embed_batch

CATEGORIES: dict[str, str] = {
    "career_direction": (
        "Discerning vocational calling, career transitions, job uncertainty, "
        "finding purpose in work, navigating professional decisions."
    ),
    "marriage_relationships": (
        "Dating, marriage preparation, marriage struggles, partnership, "
        "friendships, family relationships, conflict resolution."
    ),
    "parenting": (
        "Raising children, new parents, parenting teens, family rhythms, "
        "balancing parenthood with faith and work."
    ),
    "spiritual_dryness": (
        "Feeling distant from God, doubt, deconstruction, dark night of the soul, "
        "loss of spiritual passion, struggling to pray or read scripture."
    ),
    "identity_purpose": (
        "Questions of identity, who am I, what am I for, finding meaning, "
        "self-worth, calling and life direction."
    ),
    "mental_emotional_health": (
        "Anxiety, depression, burnout, grief, loss, emotional wellbeing, "
        "mental health struggles, processing trauma."
    ),
    "money_stewardship": (
        "Personal finances, debt, generosity and giving, financial stress, "
        "balancing work and money with faith and family."
    ),
    "leadership_ministry": (
        "Leading in church, ministry leadership, leading teams at work, "
        "stepping into pastoral roles, leadership challenges."
    ),
    "habits_discipline": (
        "Spiritual disciplines, daily rhythms, prayer life, scripture reading, "
        "developing healthy habits, formation and growth."
    ),
    "service_mission": (
        "Serving others, mission, social justice, community engagement, "
        "outreach, volunteering, kingdom work."
    ),
}


@lru_cache(maxsize=1)
def _category_matrix():
    """Pre-compute category embeddings on first call. (~10 vectors, cheap.)"""
    keys = list(CATEGORIES.keys())
    descs = list(CATEGORIES.values())
    vecs = np.array(embed_batch(descs), dtype=np.float32)
    return keys, vecs


def classify_description(text: str, top_n: int = 3, threshold: float = 0.25) -> list[str]:
    """Return up to top_n category keys whose anchor descriptions are most similar.

    Skips any below the similarity threshold (avoids spurious tags).
    Returns ordered most-similar-first.
    """
    if not text or not text.strip():
        return []

    keys, cat_vecs = _category_matrix()
    text_vec = np.array(embed(text), dtype=np.float32)
    # Already normalized → dot product == cosine sim
    sims = cat_vecs @ text_vec
    top_indices = np.argsort(sims)[::-1][:top_n]
    return [keys[i] for i in top_indices if sims[i] > threshold]
