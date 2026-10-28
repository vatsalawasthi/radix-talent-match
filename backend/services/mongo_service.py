import os
import json
import logging
from typing import Optional, Dict, Any, List
from config import DATA_DIR

logger = logging.getLogger("mongo_service")

try:
    import pymongo
    HAS_PYMONGO = True
except ImportError:
    HAS_PYMONGO = False

_client = None
_db = None
_connected = False

def init_mongo() -> bool:
    """Initialize MongoDB connection from MONGODB_URI or default."""
    global _client, _db, _connected
    if not HAS_PYMONGO:
        logger.warning("pymongo is not installed. Using local storage.")
        return False

    uri = os.getenv("MONGODB_URI", "")
    db_name = os.getenv("MONGODB_DB_NAME", "radix_talent_match")

    if not uri:
        # Check if local mongod is available
        uri = "mongodb://localhost:27017"

    try:
        _client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=2500)
        _client.admin.command("ping")
        _db = _client[db_name]
        _connected = True
        logger.info(f"Connected to MongoDB at {uri.split('@')[-1] if '@' in uri else 'localhost'} - DB: {db_name}")
        seed_data_if_empty()
        return True
    except Exception as e:
        logger.info(f"MongoDB not reachable ({e}). Falling back to file store.")
        _connected = False
        _client = None
        _db = None
        return False


def is_connected() -> bool:
    return _connected


def get_db():
    return _db


def seed_data_if_empty():
    """Populate MongoDB with the 6 real hackathon JDs and 4 candidate profiles if empty."""
    if not _connected or _db is None:
        return

    # Seed JDs
    if _db.jds.count_documents({}) == 0:
        jd_file = DATA_DIR / "sample_jds.json"
        if jd_file.exists():
            with open(jd_file, "r", encoding="utf-8") as f:
                jds = json.load(f)
                _db.jds.insert_many(jds)
                logger.info(f"Seeded {len(jds)} real JDs into MongoDB.")

    # Seed Candidates
    if _db.candidates.count_documents({}) == 0:
        cand_file = DATA_DIR / "sample_candidates.json"
        if cand_file.exists():
            with open(cand_file, "r", encoding="utf-8") as f:
                cands = json.load(f)
                _db.candidates.insert_many(cands)
                logger.info(f"Seeded {len(cands)} real candidate profiles into MongoDB.")

    # Seed Milestones
    if _db.milestones.count_documents({}) == 0:
        m_file = DATA_DIR / "milestones.json"
        if m_file.exists():
            with open(m_file, "r", encoding="utf-8") as f:
                milestones = json.load(f)
                _db.milestones.insert_many(milestones)
                logger.info("Seeded milestones into MongoDB.")


def save_candidate_profile(profile_dict: Dict[str, Any]) -> str:
    """Save candidate profile to MongoDB (or local fallback)."""
    if _connected and _db is not None:
        name = profile_dict.get("name", "Unknown")
        _db.candidates.update_one(
            {"name": name},
            {"$set": profile_dict},
            upsert=True
        )
        return name
    return ""


def get_all_candidates_mongo() -> List[Dict[str, Any]]:
    """Retrieve all candidates from MongoDB if connected."""
    if _connected and _db is not None:
        docs = list(_db.candidates.find({}, {"_id": 0}))
        if docs:
            return docs
    # Fallback to JSON file
    cand_file = DATA_DIR / "sample_candidates.json"
    if cand_file.exists():
        with open(cand_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def get_all_jds_mongo() -> List[Dict[str, Any]]:
    """Retrieve all JDs from MongoDB if connected."""
    if _connected and _db is not None:
        docs = list(_db.jds.find({}, {"_id": 0}))
        if docs:
            return docs
    # Fallback to JSON file
    jd_file = DATA_DIR / "sample_jds.json"
    if jd_file.exists():
        with open(jd_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_talent_check_record(record: Dict[str, Any]):
    if _connected and _db is not None:
        _db.talent_checks.insert_one(record)


def save_skill_match_record(record: Dict[str, Any]):
    if _connected and _db is not None:
        _db.skill_matches.insert_one(record)
