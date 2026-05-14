"""Life stage and faith stage seniority orderings.

The numeric levels are used in PostgreSQL hard-filters so we only score
candidate mentors who are at or beyond the mentee's stage.

Stages are not strictly linear (parenthood and mid-career are simultaneous
for many people) so we group them. Take the MAX level across all tags the
user picked — what matters is the farthest they've travelled.
"""
from typing import Iterable

LIFE_LEVEL: dict[str, int] = {
    "Studying or graduating": 1,
    "Starting my career":     2,
    "Figuring things out":    2,
    "Marriage & coupledom":   3,
    "Parenthood":             4,
    "Mid-career":             4,
    "Stepping into vocation": 4,
    "Getting settled":        5,
    "Empty nester":           6,
    "Retired":                7,
}

FAITH_LEVEL: dict[str, int] = {
    "Exploring faith":            1,
    "New believer":               2,
    "Growing believer":           3,
    "I love to serve":            4,
    "I disciple others":          5,
    "I can guide others to faith":5,
    "I lead other disciplers":    6,
}


def life_level(tags: Iterable[str]) -> int:
    tags = list(tags or [])
    if not tags:
        return 0
    return max((LIFE_LEVEL.get(t, 0) for t in tags), default=0)


def faith_level(tags: Iterable[str]) -> int:
    tags = list(tags or [])
    if not tags:
        return 0
    return max((FAITH_LEVEL.get(t, 0) for t in tags), default=0)
