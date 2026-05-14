"""Seed the database with synthetic mentors, an admin user, and demo mentees.

Run inside the api container (docker-compose runs it automatically on startup):

    python -m app.scripts.seed

Idempotent — each section checks for its own sentinel before running.
"""
import sys
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import MentorOffering, MentoringRelationship, MentoringRequest, Profile, User
from app.matching.categories import classify_description
from app.matching.embeddings import embed_batch
from app.matching.matcher import score_mentor
from app.matching.stages import faith_level, life_level
from app.security import hash_password

ADMIN_EMAIL = "admin@discipleship.demo"
DEMO_PASSWORD = "demo1234"

# The demo mentor the role switcher logs in as
DEMO_MENTOR_EMAIL = "sarah.mitchell@discipleship.demo"

# Sentinel for the demo-request section
DEMO_MENTEE_EMAIL = "alex.johnson@discipleship.demo"

MENTORS = [
    {
        "name": "Sarah Mitchell",
        "email": "sarah.mitchell@discipleship.demo",
        "life_stage": ["Mid-career", "Marriage & coupledom"],
        "faith_stage": ["I disciple others"],
        "support_areas": ["Career & finances", "Relationships & marriage", "Spiritual growth"],
        "can_support": ["Career & finances", "Relationships & marriage", "Spiritual growth"],
        "strengths": ["Honesty", "Wisdom", "Perspective", "Kindness", "Leadership"],
        "interests": ["Reading", "Coffee", "Travel", "Worship music"],
        "description": (
            "I'm a marketing director who's spent two decades learning what it means "
            "to be faithful at work and faithful at home. I love walking with younger "
            "women who are figuring out their careers without losing themselves. I'm "
            "direct but tender — I'll tell you the truth in love, and I'll listen for "
            "as long as you need."
        ),
    },
    {
        "name": "David Okonkwo",
        "email": "david.okonkwo@discipleship.demo",
        "life_stage": ["Mid-career", "Parenthood"],
        "faith_stage": ["I lead other disciplers"],
        "support_areas": ["Spiritual growth", "Leadership", "Healing & personal life"],
        "can_support": ["Spiritual growth", "Leadership", "Healing & personal life"],
        "strengths": ["Spirituality", "Wisdom", "Humility", "Forgiveness", "Hope", "Perspective"],
        "interests": ["Reading", "Worship music", "Hiking", "Writing"],
        "description": (
            "I pastor a small church and I'm a husband to one and dad to three. I've "
            "walked through ministry burnout, a deconstruction season, and back into "
            "deep joy. If you're feeling distant from God or wondering whether faith "
            "still makes sense, I'd love to sit with you in that."
        ),
    },
    {
        "name": "Rachel Thompson",
        "email": "rachel.thompson@discipleship.demo",
        "life_stage": ["Empty nester", "Retired"],
        "faith_stage": ["I disciple others"],
        "support_areas": ["Healing & personal life", "Spiritual growth"],
        "can_support": ["Healing & personal life", "Spiritual growth", "Relationships & marriage"],
        "strengths": ["Kindness", "Capacity to love", "Hope", "Forgiveness", "Gratitude"],
        "interests": ["Gardening", "Reading", "Tea", "Crafts"],
        "description": (
            "I taught primary school for 35 years and raised three children, two of "
            "whom walked through serious mental health struggles. I know what it's "
            "like to love someone in their darkest place. I'm slow, patient, and not "
            "easily shocked. Mostly I listen."
        ),
    },
    {
        "name": "James Chen",
        "email": "james.chen@discipleship.demo",
        "life_stage": ["Mid-career", "Parenthood"],
        "faith_stage": ["I love to serve"],
        "support_areas": ["Career & finances", "Relationships & marriage"],
        "can_support": ["Career & finances", "Relationships & marriage", "Spiritual growth"],
        "strengths": ["Perseverance", "Self-discipline", "Honesty", "Prudence", "Teamwork"],
        "interests": ["Sports", "Cooking", "Board games", "Fitness"],
        "description": (
            "Engineering manager at a tech company, married 12 years, dad to three "
            "kids under ten. I've made every mistake there is in balancing work and "
            "family — I can help you avoid a few of mine. Practical and a bit nerdy."
        ),
    },
    {
        "name": "Maria Reyes",
        "email": "maria.reyes@discipleship.demo",
        "life_stage": ["Mid-career", "Parenthood"],
        "faith_stage": ["I disciple others"],
        "support_areas": ["Career & finances", "Healing & personal life", "Spiritual growth"],
        "can_support": ["Career & finances", "Healing & personal life", "Spiritual growth"],
        "strengths": ["Bravery", "Wisdom", "Capacity to love", "Hope", "Spirituality", "Perseverance"],
        "interests": ["Reading", "Worship music", "Writing"],
        "description": (
            "I'm a doctor and a mother of two young children. I've worked through "
            "anxiety, postpartum depression, and the relentless guilt of working "
            "motherhood — and found God meeting me there. If you're a woman in a "
            "demanding profession trying to keep your soul intact, I'd love to walk "
            "with you."
        ),
    },
    {
        "name": "Michael Bennett",
        "email": "michael.bennett@discipleship.demo",
        "life_stage": ["Retired", "Empty nester"],
        "faith_stage": ["I lead other disciplers"],
        "support_areas": ["Career & finances", "Leadership", "Service & mission"],
        "can_support": ["Career & finances", "Leadership", "Service & mission"],
        "strengths": ["Leadership", "Wisdom", "Perspective", "Bravery", "Humility", "Honesty"],
        "interests": ["Reading", "Travel", "Photography", "Volunteering"],
        "description": (
            "Forty years in business, the last ten as CEO of a mid-sized company. "
            "Walked away to do mission work in my sixties. I love coaching young "
            "leaders who are wrestling with ambition, integrity, and calling. I will "
            "ask you hard questions."
        ),
    },
    {
        "name": "Anna Lindgren",
        "email": "anna.lindgren@discipleship.demo",
        "life_stage": ["Stepping into vocation", "Starting my career"],
        "faith_stage": ["I love to serve", "I can guide others to faith"],
        "support_areas": ["Spiritual growth", "Service & mission"],
        "can_support": ["Spiritual growth", "Service & mission", "Healing & personal life"],
        "strengths": ["Zest for life", "Spirituality", "Curiosity", "Bravery", "Hope", "Capacity to love"],
        "interests": ["Travel", "Hiking", "Worship music", "Photography"],
        "description": (
            "Missionary working with refugees in Eastern Europe. Single, late twenties. "
            "I've spent years figuring out what it looks like to follow Jesus into "
            "uncomfortable places. If you're young and wondering whether God is calling "
            "you somewhere uncomfortable, let's talk."
        ),
    },
    {
        "name": "Robert Whitfield",
        "email": "robert.whitfield@discipleship.demo",
        "life_stage": ["Mid-career", "Parenthood"],
        "faith_stage": ["I disciple others"],
        "support_areas": ["Career & finances", "Leadership"],
        "can_support": ["Career & finances", "Leadership"],
        "strengths": ["Prudence", "Honesty", "Wisdom", "Self-discipline", "Fairness"],
        "interests": ["Reading", "Sports", "Coffee", "Board games"],
        "description": (
            "Financial advisor, married, two kids in high school. I help people think "
            "honestly about money — debt, generosity, work-life trade-offs — without "
            "the guilt or the prosperity-gospel nonsense. Down-to-earth and practical."
        ),
    },
    {
        "name": "Ruth Goldstein",
        "email": "ruth.goldstein@discipleship.demo",
        "life_stage": ["Empty nester", "Mid-career"],
        "faith_stage": ["I disciple others"],
        "support_areas": ["Career & finances", "Spiritual growth"],
        "can_support": ["Career & finances", "Spiritual growth", "Relationships & marriage"],
        "strengths": ["Creativity", "Perseverance", "Leadership", "Honesty", "Humor", "Wisdom"],
        "interests": ["Art", "Cooking", "Reading", "Gardening", "Travel"],
        "description": (
            "I built a small business from nothing in my thirties and ran it for 20 "
            "years. Now my kids are grown and I'm rediscovering myself. I love "
            "supporting women entrepreneurs and women in seasons of reinvention. "
            "I make terrible jokes."
        ),
    },
    {
        "name": "Peter Adeyemi",
        "email": "peter.adeyemi@discipleship.demo",
        "life_stage": ["Starting my career", "Marriage & coupledom"],
        "faith_stage": ["I disciple others"],
        "support_areas": ["Spiritual growth", "Service & mission", "Relationships & marriage"],
        "can_support": ["Spiritual growth", "Service & mission", "Relationships & marriage"],
        "strengths": ["Spirituality", "Zest for life", "Capacity to love", "Hope", "Humility"],
        "interests": ["Music", "Worship music", "Sports", "Coffee"],
        "description": (
            "Worship pastor, newly married, early thirties. I'm passionate about "
            "everyday discipleship — what it looks like to follow Jesus in the small "
            "stuff. If you're early in faith and want someone who'll meet you weekly "
            "for coffee and prayer, I'm your guy."
        ),
    },
    {
        "name": "Hannah Park",
        "email": "hannah.park@discipleship.demo",
        "life_stage": ["Mid-career", "Parenthood"],
        "faith_stage": ["I love to serve"],
        "support_areas": ["Healing & personal life", "Service & mission"],
        "can_support": ["Healing & personal life", "Service & mission", "Relationships & marriage"],
        "strengths": ["Bravery", "Capacity to love", "Forgiveness", "Hope", "Kindness", "Humility"],
        "interests": ["Reading", "Volunteering", "Coffee", "Crafts"],
        "description": (
            "Social worker, single mom of two. I've been through divorce, single "
            "parenting, and finding my feet again. If you're walking through hard "
            "family stuff and feeling alone in it, I see you. No advice unless asked."
        ),
    },
    {
        "name": "Daniel O'Sullivan",
        "email": "daniel.osullivan@discipleship.demo",
        "life_stage": ["Empty nester", "Mid-career"],
        "faith_stage": ["I disciple others"],
        "support_areas": ["Relationships & marriage", "Healing & personal life"],
        "can_support": ["Relationships & marriage", "Healing & personal life", "Spiritual growth"],
        "strengths": ["Wisdom", "Kindness", "Forgiveness", "Capacity to love", "Honesty", "Perspective"],
        "interests": ["Reading", "Hiking", "Music", "Tea"],
        "description": (
            "Marriage and family counsellor for 25 years. Married 28 years myself, "
            "two grown kids. I'm not a magic-fix kind of mentor — I'll help you do "
            "the slow, real work of becoming someone who can love well. Especially "
            "useful if you're engaged or in the first hard years of marriage."
        ),
    },
]

# Demo mentees for populating the admin queue and mentor views
DEMO_MENTEES = [
    {
        "name": "Alex Johnson",
        "email": "alex.johnson@discipleship.demo",
        "life_stage": ["Starting my career"],
        "faith_stage": ["Exploring faith"],
        "support_areas": ["Career & finances", "Spiritual growth"],
        "strengths": ["Curiosity", "Hope", "Zest for life", "Honesty"],
        "interests": ["Reading", "Coffee", "Travel", "Fitness"],
        "description": (
            "I'm 24 and just started my first job in marketing after graduating. "
            "I grew up going to church but drifted away in university — now I'm "
            "finding my way back, slowly. I'd love a mentor who's navigated work "
            "and faith without having it all figured out."
        ),
    },
    {
        "name": "Emma Williams",
        "email": "emma.williams@discipleship.demo",
        "life_stage": ["Marriage & coupledom", "Starting my career"],
        "faith_stage": ["Growing believer"],
        "support_areas": ["Relationships & marriage", "Healing & personal life"],
        "strengths": ["Kindness", "Capacity to love", "Hope", "Forgiveness"],
        "interests": ["Reading", "Crafts", "Tea", "Gardening"],
        "description": (
            "Newly married, 27. My husband and I are figuring out how to build a "
            "life together that honours God and each other. I've also had some hard "
            "family history I'm still working through. I'm looking for someone "
            "patient and warm who can walk with me in all of it."
        ),
    },
    {
        "name": "Chris Davies",
        "email": "chris.davies@discipleship.demo",
        "life_stage": ["Starting my career"],
        "faith_stage": ["Exploring faith"],
        "support_areas": ["Career & finances", "Relationships & marriage"],
        "strengths": ["Perseverance", "Honesty", "Hope"],
        "interests": ["Coffee", "Reading", "Sports"],
        "description": (
            "First year in corporate finance. Grew up in church and still believe "
            "but haven't been plugged in for years. Looking for someone grounded "
            "who can help me think through work, faith, and relationships."
        ),
    },
]


def _get_user(db: Session, email: str):
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def _seed_admin_and_mentors(db: Session) -> None:
    if _get_user(db, ADMIN_EMAIL):
        print("✓ Admin + mentors already seeded — skipping.")
        return

    print("Seeding admin user…")
    db.add(User(
        email=ADMIN_EMAIL,
        password_hash=hash_password(DEMO_PASSWORD),
        name="Pastoral Team",
        role="admin",
    ))

    print(f"Seeding {len(MENTORS)} mentor profiles…")
    print("  Computing embeddings (first run downloads ~80MB — this may take a few minutes)…")
    descriptions = [m["description"] for m in MENTORS]
    embeddings = embed_batch(descriptions)
    print("  ✓ Embeddings ready")

    for i, m in enumerate(MENTORS):
        user = User(
            email=m["email"],
            password_hash=hash_password(DEMO_PASSWORD),
            name=m["name"],
            role="mentor",
        )
        db.add(user)
        db.flush()

        db.add(Profile(
            user_id=user.id,
            life_stage=m["life_stage"],
            life_stage_level=life_level(m["life_stage"]),
            faith_stage=m["faith_stage"],
            faith_stage_level=faith_level(m["faith_stage"]),
            support_areas=m["support_areas"],
            strengths=m["strengths"],
            interests=m["interests"],
            description=m["description"],
            description_embedding=embeddings[i],
            categories=classify_description(m["description"]),
        ))

        db.add(MentorOffering(
            user_id=user.id,
            can_support=m["can_support"],
            capacity=3,
            current_load=0,
            accepting_new=True,
        ))
        print(f"  ✓ {m['name']}")

    db.commit()
    print(f"\n✓ Done. {len(MENTORS)} mentors + 1 admin.")
    print(f"  Demo password for everyone: {DEMO_PASSWORD}")
    print(f"  Admin login: {ADMIN_EMAIL}")


def _seed_demo_mentees_and_requests(db: Session) -> None:
    """Seed demo mentees with requests in various statuses for the role-switcher demo."""
    if _get_user(db, DEMO_MENTEE_EMAIL):
        print("✓ Demo mentees already seeded — skipping.")
        return

    sarah = _get_user(db, DEMO_MENTOR_EMAIL)
    rachel = _get_user(db, "rachel.thompson@discipleship.demo")
    daniel = _get_user(db, "daniel.osullivan@discipleship.demo")

    if not sarah:
        print("! Mentors not seeded yet — skipping demo mentees.")
        return

    print("Seeding demo mentees…")
    descriptions = [m["description"] for m in DEMO_MENTEES]
    embeddings = embed_batch(descriptions)
    print("  ✓ Mentee embeddings ready")

    mentee_users = []
    for i, m in enumerate(DEMO_MENTEES):
        user = User(
            email=m["email"],
            password_hash=hash_password(DEMO_PASSWORD),
            name=m["name"],
            role="mentee",
        )
        db.add(user)
        db.flush()

        db.add(Profile(
            user_id=user.id,
            life_stage=m["life_stage"],
            life_stage_level=life_level(m["life_stage"]),
            faith_stage=m["faith_stage"],
            faith_stage_level=faith_level(m["faith_stage"]),
            support_areas=m["support_areas"],
            strengths=m["strengths"],
            interests=m["interests"],
            description=m["description"],
            description_embedding=embeddings[i],
            categories=classify_description(m["description"]),
        ))
        mentee_users.append(user)
        print(f"  ✓ {m['name']}")

    alex, emma, chris = mentee_users

    # Refresh so SQLAlchemy can lazy-load profiles for score_mentor
    db.flush()
    for u in [alex, emma, chris, sarah, rachel, daniel]:
        db.refresh(u)

    # Admin queue: Alex → Sarah (admin_review)
    exp = score_mentor(sarah, alex)
    db.add(MentoringRequest(
        mentee_id=alex.id,
        mentor_id=sarah.id,
        status="admin_review",
        initiated_by="mentee",
        match_score=exp["score"],
        match_explanation=exp,
        message="I've been really inspired by what I've heard about Sarah's work in marketing. I'd love to learn from her.",
    ))

    # Admin queue: Alex → Rachel (admin_review)
    if rachel:
        exp2 = score_mentor(rachel, alex)
        db.add(MentoringRequest(
            mentee_id=alex.id,
            mentor_id=rachel.id,
            status="admin_review",
            initiated_by="mentee",
            match_score=exp2["score"],
            match_explanation=exp2,
            message=None,
        ))

    # Admin queue: Emma → Daniel (admin_review)
    if daniel:
        exp3 = score_mentor(daniel, emma)
        db.add(MentoringRequest(
            mentee_id=emma.id,
            mentor_id=daniel.id,
            status="admin_review",
            initiated_by="mentee",
            match_score=exp3["score"],
            match_explanation=exp3,
            message="We're newly married and I think Daniel's background in marriage counselling would be so helpful.",
        ))

    # Mentor requests view: Emma → Sarah (shared_with_mentor — waiting for Sarah's decision)
    exp4 = score_mentor(sarah, emma)
    db.add(MentoringRequest(
        mentee_id=emma.id,
        mentor_id=sarah.id,
        status="shared_with_mentor",
        initiated_by="mentee",
        match_score=exp4["score"],
        match_explanation=exp4,
        message="I'd love someone who understands navigating faith and marriage at the same time.",
    ))

    # Mentor mentees view: Chris → Sarah (accepted + active relationship)
    exp5 = score_mentor(sarah, chris)
    req = MentoringRequest(
        mentee_id=chris.id,
        mentor_id=sarah.id,
        status="accepted",
        initiated_by="mentee",
        match_score=exp5["score"],
        match_explanation=exp5,
        message=None,
    )
    db.add(req)
    db.flush()

    db.add(MentoringRelationship(
        mentor_id=sarah.id,
        mentee_id=chris.id,
        request_id=req.id,
        status="active",
    ))

    # Increment Sarah's current_load
    sarah.mentor_offering.current_load = 1

    db.commit()
    print("\n✓ Demo mentees + requests seeded.")
    print(f"  Demo mentor login: {DEMO_MENTOR_EMAIL} / {DEMO_PASSWORD}")
    print(f"  Admin login:       {ADMIN_EMAIL} / {DEMO_PASSWORD}")


def seed() -> None:
    db: Session = SessionLocal()
    try:
        _seed_admin_and_mentors(db)
        _seed_demo_mentees_and_requests(db)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    sys.exit(0)
