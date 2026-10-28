import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from config import DATA_DIR
from models.schemas import ExtractedSkillList, SkillItem
from services.file_parser import parse_file
from services.nlp_engine import extract_skills_from_text

router = APIRouter(prefix="/api/jd", tags=["01 - JD Analytics"])

def load_sample_jds():
    path = DATA_DIR / "sample_jds.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/samples")
def get_sample_jds():
    """Return all 6 real hackathon job descriptions."""
    return load_sample_jds()


@router.post("/analyze", response_model=ExtractedSkillList)
async def analyze_jd(
    jd_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(""),
    preset_id: Optional[str] = Form(None),
    company: Optional[str] = Form(""),
    role: Optional[str] = Form(""),
):
    """
    Module 01: Extract structured skill list mapped to the 12 RADIX categories.
    Accepts PDF/DOCX file, raw text, or preset ID from the 6 hackathon JDs.
    """
    source_file = "custom_jd.txt"
    resolved_text = ""
    resolved_company = company or "Target Company"
    resolved_role = role or "Target Role"

    # Option A: Preset sample JD
    if preset_id:
        samples = load_sample_jds()
        match = next((s for s in samples if s["id"] == preset_id), None)
        if match:
            resolved_text = match["raw_text"]
            source_file = match["file_name"]
            resolved_company = match["company"]
            resolved_role = match["role"]

    # Option B: Uploaded file
    if not resolved_text and jd_file and jd_file.filename:
        raw_bytes = await jd_file.read()
        source_file = jd_file.filename
        try:
            resolved_text = parse_file(raw_bytes, jd_file.filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Option C: Direct pasted text
    if not resolved_text and jd_text and jd_text.strip():
        resolved_text = jd_text.strip()
        source_file = "pasted_job_description.txt"

    if not resolved_text:
        raise HTTPException(status_code=400, detail="Please upload a JD file, paste JD text, or select a sample JD.")

    # Deduce company/role if not explicitly set
    if not resolved_company or resolved_company == "Target Company":
        for comp in ["Google LLC", "Microsoft Corporation", "Oracle Financial Services Software"]:
            if comp.lower() in resolved_text.lower():
                resolved_company = comp
                break

    if not resolved_role or resolved_role == "Target Role":
        for r_name in ["Software Engineer (SWE)", "Software Engineer", "Data Scientist", "Data Analyst", "Associate Software Engineer", "Application Support Analyst"]:
            if r_name.lower() in resolved_text.lower():
                resolved_role = r_name
                break

    # Extract skills mapped to 12 categories
    skills = extract_skills_from_text(resolved_text, source_type="jd")

    # Category distribution breakdown
    cat_dist: dict[str, int] = {}
    for s in skills:
        cat_dist[s.category_code] = cat_dist.get(s.category_code, 0) + 1

    return ExtractedSkillList(
        source_type="jd",
        source_file=source_file,
        company=resolved_company,
        role=resolved_role,
        skills=skills,
        category_distribution=cat_dist
    )
