import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from config import DATA_DIR
from models.schemas import ResumeParseResult, SkillItem
from services.file_parser import parse_file
from services.nlp_engine import parse_resume_details

router = APIRouter(prefix="/api/resume", tags=["02 - Resume Parsing"])

def load_sample_candidates():
    path = DATA_DIR / "sample_candidates.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/samples")
def get_sample_candidates():
    """Return the 4 deliberately different sample candidates."""
    return load_sample_candidates()


@router.post("/parse", response_model=ResumeParseResult)
async def parse_resume(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(""),
    preset_id: Optional[str] = Form(None),
):
    """
    Module 02: Parse candidate resume into 12 RADIX skills, education, and experience.
    """
    source_file = "custom_resume.txt"
    resolved_text = ""

    # Option A: Preset sample candidate
    if preset_id:
        candidates = load_sample_candidates()
        cand = next((c for c in candidates if c["id"] == preset_id), None)
        if cand:
            return ResumeParseResult(
                source_file=cand["cv_file"],
                name=cand["name"],
                email=cand["email"],
                education=cand["education"],
                skills=[SkillItem(**s) for s in cand["skills"]],
                internships=cand.get("internships", []),
                projects=cand.get("hackathons", []),
                certifications=cand.get("certifications", []),
                preferred_roles=cand.get("preferred_roles", [])
            )

    # Option B: Uploaded file
    if not resolved_text and resume_file and resume_file.filename:
        raw_bytes = await resume_file.read()
        source_file = resume_file.filename
        try:
            resolved_text = parse_file(raw_bytes, resume_file.filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse resume file: {str(e)}")

    # Option C: Direct pasted text
    if not resolved_text and resume_text and resume_text.strip():
        resolved_text = resume_text.strip()
        source_file = "pasted_resume.txt"

    if not resolved_text:
        raise HTTPException(status_code=400, detail="Please upload a resume file, paste resume text, or select a sample candidate.")

    # Parse details
    result = parse_resume_details(resolved_text, source_file)
    return result
