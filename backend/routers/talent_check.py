from fastapi import APIRouter, HTTPException, Body
from typing import Optional
from models.schemas import CandidateProfile, TalentCheckResult
from services.talent_check_service import evaluate_talent_check, load_company_benchmarks
from routers.profile import get_current_profile

router = APIRouter(prefix="/api/talent-check", tags=["04 - Talent Check"])

@router.get("/benchmarks")
def get_benchmarks():
    """Return the official 12-skillset company benchmarks for Google, Microsoft, and Oracle."""
    return load_company_benchmarks()


@router.post("/evaluate", response_model=TalentCheckResult)
def run_talent_check(
    company: str = Body(..., embed=True),
    profile: Optional[CandidateProfile] = Body(None)
):
    """
    Module 04: One button evaluation comparing candidate across all 12 RADIX skillsets
    against the company's expected bar.
    """
    target_profile = profile if profile else get_current_profile()
    if not target_profile:
        raise HTTPException(status_code=400, detail="No candidate profile available. Please create or load a profile in Profile Builder.")

    result = evaluate_talent_check(target_profile, company)
    return result
