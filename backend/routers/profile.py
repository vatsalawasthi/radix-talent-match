import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Body
from typing import Optional
from config import DATA_DIR
from models.schemas import CandidateProfile, SkillItem, ResumeParseResult

router = APIRouter(prefix="/api/profile", tags=["03 - Profile Builder"])

ACTIVE_PROFILE_FILE = DATA_DIR / "active_profile.json"

def _get_default_profile() -> CandidateProfile:
    # Default to Rohan Verma (or Ananya Rao)
    path = DATA_DIR / "sample_candidates.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            candidates = json.load(f)
            cand = candidates[0] # Ananya Rao
            return CandidateProfile(
                name=cand["name"],
                email=cand["email"],
                education=cand["education"],
                skills=[SkillItem(**s) for s in cand["skills"]],
                hackathons=cand.get("hackathons", []),
                internships=cand.get("internships", []),
                certifications=cand.get("certifications", []),
                preferred_roles=cand.get("preferred_roles", []),
                cv_file=cand.get("cv_file", "")
            )
    return CandidateProfile(name="Candidate", email="candidate@example.com")


@router.get("/current", response_model=CandidateProfile)
def get_current_profile():
    """Retrieve the currently active candidate profile."""
    if ACTIVE_PROFILE_FILE.exists():
        try:
            with open(ACTIVE_PROFILE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return CandidateProfile(**data)
        except Exception:
            pass
    return _get_default_profile()


@router.post("/save", response_model=CandidateProfile)
def save_profile(profile: CandidateProfile):
    """
    Module 03: Save candidate profile in the shared JSON schema.
    Persists locally and allows Module 04 and 05 to consume it.
    """
    with open(ACTIVE_PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profile.model_dump(), f, indent=2)
    return profile


@router.post("/load-preset/{preset_id}", response_model=CandidateProfile)
def load_preset(preset_id: str):
    """Load one of the 4 benchmark candidates into the active profile slot."""
    path = DATA_DIR / "sample_candidates.json"
    with open(path, "r", encoding="utf-8") as f:
        candidates = json.load(f)
    match = next((c for c in candidates if c["id"] == preset_id), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Candidate preset {preset_id} not found.")

    profile = CandidateProfile(
        name=match["name"],
        email=match["email"],
        education=match["education"],
        skills=[SkillItem(**s) for s in match["skills"]],
        hackathons=match.get("hackathons", []),
        internships=match.get("internships", []),
        certifications=match.get("certifications", []),
        preferred_roles=match.get("preferred_roles", []),
        cv_file=match.get("cv_file", "")
    )
    # Save as active
    save_profile(profile)
    return profile


@router.post("/pre-fill", response_model=CandidateProfile)
def prefill_from_resume(parsed: ResumeParseResult):
    """Pre-fill candidate profile from Resume Parsing output."""
    profile = CandidateProfile(
        name=parsed.name or "Candidate",
        email=parsed.email or "candidate@example.com",
        education=parsed.education or "",
        skills=parsed.skills,
        hackathons=parsed.projects,
        internships=parsed.internships,
        certifications=parsed.certifications,
        preferred_roles=parsed.preferred_roles,
        cv_file=parsed.source_file
    )
    save_profile(profile)
    return profile
