import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Form
from typing import Optional
from config import DATA_DIR
from models.schemas import CandidateProfile, ExtractedSkillList, SkillMatchingResult, SkillItem
from services.file_parser import parse_file
from services.nlp_engine import extract_skills_from_text, parse_resume_details
from services.skill_match_service import evaluate_skill_match
from routers.profile import get_current_profile
from routers.jd import load_sample_jds

router = APIRouter(prefix="/api/match", tags=["05 - Skill Matching"])

class MatchEvaluationPayload:
    pass

@router.post("/evaluate", response_model=SkillMatchingResult)
def run_skill_match(
    payload: dict = Body(...)
):
    """
    Module 05: Match candidate profile against extracted JD skill list.
    Supports either pre-extracted JD list or preset JD ID.
    """
    candidate_data = payload.get("candidate")
    jd_data = payload.get("jd")
    jd_preset_id = payload.get("jd_preset_id")

    # Resolve candidate profile
    if candidate_data:
        candidate = CandidateProfile(**candidate_data)
    else:
        candidate = get_current_profile()

    # Resolve JD
    if jd_data:
        jd = ExtractedSkillList(**jd_data)
    elif jd_preset_id:
        samples = load_sample_jds()
        sample = next((s for s in samples if s["id"] == jd_preset_id), None)
        if not sample:
            raise HTTPException(status_code=404, detail="Selected JD preset not found.")
        skills = extract_skills_from_text(sample["raw_text"], source_type="jd")
        jd = ExtractedSkillList(
            source_type="jd",
            source_file=sample["file_name"],
            company=sample["company"],
            role=sample["role"],
            skills=skills
        )
    else:
        # Fallback to first sample JD (Google SWE)
        samples = load_sample_jds()
        sample = samples[0]
        skills = extract_skills_from_text(sample["raw_text"], source_type="jd")
        jd = ExtractedSkillList(
            source_type="jd",
            source_file=sample["file_name"],
            company=sample["company"],
            role=sample["role"],
            skills=skills
        )

    result = evaluate_skill_match(candidate, jd)
    return result


@router.post("/analyze", response_model=dict)
async def analyze_match_direct(
    jd_file: Optional[UploadFile] = File(None),
    resume_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(""),
    candidate_text: Optional[str] = Form(""),
    jd_preset_id: Optional[str] = Form(None),
    candidate_preset_id: Optional[str] = Form(None)
):
    """
    Direct combined endpoint for quick drag-and-drop file matching.
    """
    samples = load_sample_jds()

    # Resolve JD text
    resolved_jd_text = jd_text
    jd_filename = "custom_jd.txt"
    company_name = "Target Company"
    role_name = "Target Role"

    if jd_preset_id:
        match_jd = next((s for s in samples if s["id"] == jd_preset_id), None)
        if match_jd:
            resolved_jd_text = match_jd["raw_text"]
            jd_filename = match_jd["file_name"]
            company_name = match_jd["company"]
            role_name = match_jd["role"]

    if not resolved_jd_text and jd_file and jd_file.filename:
        raw = await jd_file.read()
        jd_filename = jd_file.filename
        resolved_jd_text = parse_file(raw, jd_file.filename)

    # Resolve Candidate text
    resolved_cand_text = candidate_text
    cand_filename = "custom_resume.txt"

    if candidate_preset_id:
        path = DATA_DIR / "sample_candidates.json"
        with open(path, "r", encoding="utf-8") as f:
            candidates = json.load(f)
        match_c = next((c for c in candidates if c["id"] == candidate_preset_id), None)
        if match_c:
            resolved_cand_text = match_c.get("raw_resume_text", "")
            cand_filename = match_c["cv_file"]

    if not resolved_cand_text and resume_file and resume_file.filename:
        raw = await resume_file.read()
        cand_filename = resume_file.filename
        resolved_cand_text = parse_file(raw, resume_file.filename)

    if not resolved_jd_text or not resolved_cand_text:
        raise HTTPException(status_code=400, detail="Both Job Description and Candidate Resume are required.")

    # Parse candidate
    parsed_cand = parse_resume_details(resolved_cand_text, cand_filename)
    candidate_profile = CandidateProfile(
        name=parsed_cand.name,
        email=parsed_cand.email,
        education=parsed_cand.education,
        skills=parsed_cand.skills,
        internships=parsed_cand.internships,
        hackathons=parsed_cand.projects,
        certifications=parsed_cand.certifications,
        preferred_roles=parsed_cand.preferred_roles,
        cv_file=cand_filename
    )

    # Extract JD skills
    jd_skills = extract_skills_from_text(resolved_jd_text, source_type="jd")
    jd_obj = ExtractedSkillList(
        source_type="jd",
        source_file=jd_filename,
        company=company_name,
        role=role_name,
        skills=jd_skills
    )

    result = evaluate_skill_match(candidate_profile, jd_obj)
    return {
        "candidate": candidate_profile.model_dump(),
        "jd": jd_obj.model_dump(),
        "result": result.model_dump()
    }
