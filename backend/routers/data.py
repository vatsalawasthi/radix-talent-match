import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Body
from config import DATA_DIR
from models.schemas import RADIX_CATEGORY_CODES, CATEGORY_NAMES
from services.mongo_service import is_connected, get_db

router = APIRouter(prefix="/api/data", tags=["Data & Milestones"])

MILESTONES_FILE = DATA_DIR / "milestones.json"

@router.get("/db-status")
def get_db_status():
    """Report active database status (MongoDB vs Local JSON Store)."""
    connected = is_connected()
    db = get_db()
    if connected and db is not None:
        return {
            "database": "MongoDB",
            "connected": True,
            "database_name": db.name,
            "collections": {
                "candidates": db.candidates.count_documents({}),
                "jds": db.jds.count_documents({}),
                "milestones": db.milestones.count_documents({}),
                "talent_checks": db.talent_checks.count_documents({}),
                "skill_matches": db.skill_matches.count_documents({}),
            },
            "status": "online"
        }
    return {
        "database": "Local JSON Store (MongoDB Fallback)",
        "connected": False,
        "note": "Set MONGODB_URI to connect to MongoDB Atlas / Render MongoDB.",
        "status": "ready"
    }


@router.get("/milestones")
def get_milestones():
    """Return hackathon milestone checklist and status summary."""
    if not MILESTONES_FILE.exists():
        return {"milestones": [], "summary": {}}
    with open(MILESTONES_FILE, "r", encoding="utf-8") as f:
        milestones = json.load(f)

    counts = {"Done": 0, "In Progress": 0, "Not Started": 0, "Blocked": 0}
    for m in milestones:
        st = m.get("status", "Not Started")
        counts[st] = counts.get(st, 0) + 1

    return {
        "milestones": milestones,
        "summary": counts,
        "total": len(milestones),
        "completion_percentage": int(round((counts["Done"] / max(1, len(milestones))) * 100))
    }


@router.post("/milestones/{milestone_id}/status")
def update_milestone_status(milestone_id: str, status: str = Body(..., embed=True)):
    """Update status of a milestone (Scrum Master tracker)."""
    if not MILESTONES_FILE.exists():
        raise HTTPException(status_code=404, detail="Milestones file not found.")
    with open(MILESTONES_FILE, "r", encoding="utf-8") as f:
        milestones = json.load(f)

    updated = False
    for m in milestones:
        if m["id"] == milestone_id:
            m["status"] = status
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Milestone ID not found.")

    with open(MILESTONES_FILE, "w", encoding="utf-8") as f:
        json.dump(milestones, f, indent=2)

    return {"status": "ok", "milestone_id": milestone_id, "new_status": status}


@router.get("/categories")
def get_categories():
    """Return the official 12 RADIX categories."""
    return [
        {"code": code, "name": CATEGORY_NAMES.get(code, code)}
        for code in RADIX_CATEGORY_CODES if code != "OTHER"
    ]
