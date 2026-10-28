from typing import List, Dict, Any, Tuple
from models.schemas import (
    CandidateProfile, ExtractedSkillList, SkillMatchingResult,
    MatchedSkillDetail, MissingSkillDetail, CATEGORY_NAMES
)
from services.nlp_engine import fuzzy_skill_match

def evaluate_skill_match(candidate: CandidateProfile, jd: ExtractedSkillList) -> SkillMatchingResult:
    """
    Compare candidate against one specific JD posting.
    Identifies matched skills with candidate evidence and JD requirements,
    and missing skills with actionable gap guidance.
    """
    cand_skills = candidate.skills
    jd_skills = jd.skills

    matched_skills: List[MatchedSkillDetail] = []
    missing_skills: List[MissingSkillDetail] = []
    matched_jd_indices = set()

    # Candidate text pool for deep evidence check
    cand_full_text = " ".join([
        s.skill_name + " " + s.evidence for s in cand_skills
    ] + candidate.internships + candidate.hackathons + candidate.certifications).lower()

    # Step 1: Compare each JD skill against candidate skills
    for idx, j_skill in enumerate(jd_skills):
        best_match = None
        best_score = 0.0

        for c_skill in cand_skills:
            # 1. Direct name / token similarity
            sim = fuzzy_skill_match(c_skill.skill_name, j_skill.skill_name)
            # 2. Same category bonus
            if c_skill.category_code == j_skill.category_code:
                sim = max(sim, 0.70) if c_skill.confidence == "high" else max(sim, 0.50)

            if sim > best_score:
                best_score = sim
                best_match = c_skill

        # Also check if JD skill keyword appears directly in candidate resume text
        if best_score < 0.60 and j_skill.skill_name.lower() in cand_full_text:
            best_score = 0.75
            matched_evidence = f"Referenced in experience / projects: '{j_skill.skill_name}'"
        elif best_match:
            matched_evidence = best_match.evidence
        else:
            matched_evidence = ""

        # Classification threshold
        if best_score >= 0.65:
            matched_jd_indices.add(idx)
            quality = "Direct" if best_score >= 0.85 else ("Semantic" if best_score >= 0.70 else "Partial")
            matched_skills.append(MatchedSkillDetail(
                skill_name=j_skill.skill_name,
                category_code=j_skill.category_code,
                candidate_evidence=matched_evidence or (best_match.skill_name if best_match else j_skill.skill_name),
                jd_requirement=j_skill.evidence or f"Required for {jd.role}",
                match_quality=quality
            ))
        else:
            importance = "Critical" if j_skill.confidence == "high" else "Preferred"
            cat_name = CATEGORY_NAMES.get(j_skill.category_code, j_skill.category_code)
            recom = f"Build a project or complete hands-on practice demonstrating {j_skill.skill_name} in {cat_name}."
            missing_skills.append(MissingSkillDetail(
                skill_name=j_skill.skill_name,
                category_code=j_skill.category_code,
                jd_requirement=j_skill.evidence or f"Required by {jd.company}",
                importance=importance,
                recommendation=recom
            ))

    # Compute overall match score (0-100)
    total_jd = len(jd_skills)
    if total_jd == 0:
        match_score = 75
    else:
        critical_count = sum(1 for s in jd_skills if s.confidence == "high")
        matched_critical = sum(1 for m in matched_skills if any(j.skill_name == m.skill_name and j.confidence == "high" for j in jd_skills))

        crit_ratio = (matched_critical / max(1, critical_count))
        overall_ratio = (len(matched_skills) / total_jd)

        # Weighted: 60% critical requirements + 40% overall qualifications
        raw_score = (0.60 * crit_ratio + 0.40 * overall_ratio) * 100.0
        match_score = int(round(raw_score))
        match_score = max(15, min(98, match_score))

    if match_score >= 80:
        verdict = "Strong Match"
        summary = f"{candidate.name} is a high-confidence fit for {jd.role} at {jd.company}, matching {len(matched_skills)} key requirements."
    elif match_score >= 60:
        verdict = "Partial Match"
        summary = f"{candidate.name} meets core requirements for {jd.role} at {jd.company}, with {len(missing_skills)} specific skill gaps to address."
    else:
        verdict = "Not Ready"
        summary = f"{candidate.name} has substantial skill divergence for {jd.role} at {jd.company}. Substantial preparation needed."

    top_strengths = [m.skill_name for m in matched_skills[:5]]
    top_gaps = [g.skill_name for g in missing_skills[:4]]

    actionable_recommendations = [
        f"Address critical missing skill: {g.skill_name} ({g.recommendation})" for g in missing_skills if g.importance == "Critical"
    ][:3]
    if not actionable_recommendations and missing_skills:
        actionable_recommendations = [missing_skills[0].recommendation]

    return SkillMatchingResult(
        jd_source_file=jd.source_file,
        company=jd.company,
        role_title=jd.role,
        match_score=match_score,
        verdict=verdict,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        top_strengths=top_strengths,
        top_gaps=top_gaps,
        summary=summary,
        actionable_recommendations=actionable_recommendations
    )
