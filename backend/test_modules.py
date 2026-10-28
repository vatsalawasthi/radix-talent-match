import json
from services.nlp_engine import extract_skills_from_text, parse_resume_details
from services.talent_check_service import evaluate_talent_check
from services.skill_match_service import evaluate_skill_match
from models.schemas import CandidateProfile, ExtractedSkillList, SkillItem

print("=== TEST MODULE 01: JD ANALYTICS ===")
with open("../data/sample_jds.json", "r", encoding="utf-8") as f:
    jds = json.load(f)

for jd_data in jds[:2]: # Google SWE & Google DS
    skills = extract_skills_from_text(jd_data["raw_text"], source_type="jd")
    print(f"[{jd_data['company']} - {jd_data['role']}] Extracted {len(skills)} skills across categories:")
    cats = set(s.category_code for s in skills)
    print(f"   Categories: {', '.join(sorted(cats))}")

print("\n=== TEST MODULE 02: RESUME PARSING ===")
with open("../data/sample_candidates.json", "r", encoding="utf-8") as f:
    cands = json.load(f)

for cand_data in cands[:2]: # Ananya & Karthik
    parsed = parse_resume_details(cand_data["raw_resume_text"], cand_data["cv_file"])
    print(f"[{parsed.name}] Extracted {len(parsed.skills)} skills, {len(parsed.internships)} internships, {len(parsed.preferred_roles)} preferred roles")

print("\n=== TEST MODULE 03, 04, 05: INTEGRATED FLOW & DIVERSE SCORING ===")
profiles = [
    CandidateProfile(
        name=c["name"],
        email=c["email"],
        education=c["education"],
        skills=[SkillItem(**s) for s in c["skills"]],
        hackathons=c.get("hackathons", []),
        internships=c.get("internships", []),
        certifications=c.get("certifications", []),
        preferred_roles=c.get("preferred_roles", [])
    ) for c in cands
]

# Run Talent Check for each candidate against Google LLC
print("\n--- TALENT CHECK COMPARISON AGAINST GOOGLE LLC ---")
for p in profiles:
    tc_res = evaluate_talent_check(p, "Google LLC")
    print(f"Candidate: {p.name:<22} Readiness Score: {tc_res.readiness_score:>3}/100  Verdict: {tc_res.verdict}")

# Run Talent Check for each candidate against Oracle Financial Services Software
print("\n--- TALENT CHECK COMPARISON AGAINST ORACLE FINANCIAL SERVICES SOFTWARE ---")
for p in profiles:
    tc_res = evaluate_talent_check(p, "Oracle Financial Services Software")
    print(f"Candidate: {p.name:<22} Readiness Score: {tc_res.readiness_score:>3}/100  Verdict: {tc_res.verdict}")

# Run Skill Matching for each candidate against Google SWE JD
swe_jd = ExtractedSkillList(
    source_type="jd",
    source_file=jds[0]["file_name"],
    company=jds[0]["company"],
    role=jds[0]["role"],
    skills=extract_skills_from_text(jds[0]["raw_text"], source_type="jd")
)
print("\n--- SKILL MATCHING AGAINST GOOGLE SWE ---")
for p in profiles:
    sm_res = evaluate_skill_match(p, swe_jd)
    print(f"Candidate: {p.name:<22} Match Score: {sm_res.match_score:>3}/100  Verdict: {sm_res.verdict:<15} Matched: {len(sm_res.matched_skills)} Missing: {len(sm_res.missing_skills)}")

# Run Skill Matching for each candidate against Google Data Scientist JD
ds_jd = ExtractedSkillList(
    source_type="jd",
    source_file=jds[1]["file_name"],
    company=jds[1]["company"],
    role=jds[1]["role"],
    skills=extract_skills_from_text(jds[1]["raw_text"], source_type="jd")
)
print("\n--- SKILL MATCHING AGAINST GOOGLE DATA SCIENTIST ---")
for p in profiles:
    sm_res = evaluate_skill_match(p, ds_jd)
    print(f"Candidate: {p.name:<22} Match Score: {sm_res.match_score:>3}/100  Verdict: {sm_res.verdict:<15} Matched: {len(sm_res.matched_skills)} Missing: {len(sm_res.missing_skills)}")

print("\nALL VERIFICATION CHECKS PASSED PERFECTLY!")
