import json
from pathlib import Path
from typing import Dict, Any, List
from config import DATA_DIR
from models.schemas import CandidateProfile, TalentCheckResult, SkillsetGap, RADIX_CATEGORY_CODES, CATEGORY_NAMES

def load_company_benchmarks() -> Dict[str, Any]:
    path = DATA_DIR / "talent_check_company_skillsets.json"
    if not path.exists():
        raise FileNotFoundError(f"Benchmark file not found at {path}")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("companies", {})


def evaluate_talent_check(profile: CandidateProfile, company_name: str) -> TalentCheckResult:
    benchmarks = load_company_benchmarks()
    company_data = benchmarks.get(company_name)
    if not company_data:
        company_name = list(benchmarks.keys())[0]
        company_data = benchmarks[company_name]

    expected_skillsets = company_data.get("skillsets", {})

    skillset_gaps: List[SkillsetGap] = []
    total_weighted_score = 0.0
    total_weights = 0.0
    strengths: List[str] = []
    action_items: List[str] = []

    profile_text = " ".join(
        [s.skill_name + " " + s.evidence for s in profile.skills] +
        profile.internships + profile.hackathons + profile.certifications + profile.preferred_roles
    ).lower()

    keywords_by_cat = {
        "COD": ["code", "developer", "c++", "java", "python", "go", "full stack", "programming", "software"],
        "DSA": ["leetcode", "algorithm", "competitive", "problem solving", "dynamic programming", "graph", "tree"],
        "OOD": ["architecture", "design pattern", "solid", "clean code", "object-oriented", "oop", "modular"],
        "APTI": ["analytical", "rca", "quant", "testing", "hypothesis", "problem-solving", "logic", "debugging"],
        "COMM": ["lead", "present", "documented", "client", "mentor", "collaboration", "written", "verbal"],
        "AI": ["machine learning", "ml", "pytorch", "deep learning", "nlp", "ai", "transformers", "xgboost"],
        "CLOUD": ["aws", "gcp", "azure", "docker", "kubernetes", "cloud", "serverless", "microservices"],
        "SQL": ["database", "sql", "postgres", "oracle", "stored procedure", "pl/sql", "queries", "indexing"],
        "SWE": ["testing", "ci/cd", "git", "scrum", "itil", "production", "unit test", "code review", "jira"],
        "SYSD": ["microservices", "distributed", "kafka", "redis", "scalability", "consensus", "caching", "raft"],
        "NETW": ["tcp", "networking", "rest", "grpc", "socket", "http", "ssl", "dns", "ebpf"],
        "OS": ["linux", "kernel", "concurrency", "threads", "unix", "perf", "posix", "shell", "virtual memory"]
    }

    for cat_code in RADIX_CATEGORY_CODES:
        if cat_code == "OTHER":
            continue

        cat_benchmark = expected_skillsets.get(cat_code, {
            "name": CATEGORY_NAMES.get(cat_code, cat_code),
            "required_level": 7,
            "importance": "medium",
            "description": ""
        })

        req_level = cat_benchmark["required_level"]
        importance = cat_benchmark.get("importance", "medium")
        weight = 3.0 if importance == "critical" else (2.0 if importance == "high" else 1.0)

        cat_skills = [s for s in profile.skills if s.category_code == cat_code]
        evidence_count = len(cat_skills)

        # Baseline evaluation
        if cat_skills:
            # Has verified skills in this category
            max_conf = "low"
            if any(s.confidence == "high" for s in cat_skills):
                max_conf = "high"
            elif any(s.confidence == "medium" for s in cat_skills):
                max_conf = "medium"

            if max_conf == "high":
                level = 7.0 + min(1.5, (len(cat_skills) - 1) * 0.5)
            elif max_conf == "medium":
                level = 5.5 + min(1.5, (len(cat_skills) - 1) * 0.5)
            else:
                level = 4.0
        else:
            level = 2.5

        # Domain experience bonus from profile text
        cat_kw = keywords_by_cat.get(cat_code, [])
        bonus_hits = sum(1 for kw in cat_kw if kw in profile_text)
        if bonus_hits >= 3:
            level += 1.5
        elif bonus_hits >= 1:
            level += 0.8

        cand_level = max(1, min(10, int(round(level))))
        has_gap = cand_level < req_level
        cat_name = CATEGORY_NAMES.get(cat_code, cat_code)

        if has_gap:
            diff = req_level - cand_level
            details = f"Below {company_name}'s bar by {diff} pt{'s' if diff > 1 else ''}. Recommended level: {req_level}/10."
            if importance in ["critical", "high"]:
                action_items.append(f"Level up {cat_name} ({cand_level} → {req_level}/10 target)")
        else:
            diff = cand_level - req_level
            details = f"Clears {company_name}'s standard bar ({cand_level}/10 vs {req_level}/10 required)."
            if cand_level >= 8:
                strengths.append(f"{cat_name} ({cand_level}/10)")

        skillset_gaps.append(SkillsetGap(
            category_code=cat_code,
            category_name=cat_name,
            required_level=req_level,
            candidate_level=cand_level,
            gap=has_gap,
            evidence_count=evidence_count,
            importance=importance,
            details=details
        ))

        ratio = min(1.0, cand_level / req_level)
        total_weighted_score += (ratio * 100.0) * weight
        total_weights += weight

    readiness_score = int(round(total_weighted_score / total_weights)) if total_weights > 0 else 50
    readiness_score = max(20, min(98, readiness_score))

    if readiness_score >= 85:
        verdict = "Ready for Onsite"
        summary = f"{profile.name} strongly clears {company_name}'s technical benchmarks across core criteria."
    elif readiness_score >= 70:
        verdict = "Near Ready (Needs Prep)"
        summary = f"{profile.name} has a competitive profile with targeted skill gaps to bridge before interview loops."
    else:
        verdict = "High Gap"
        summary = f"{profile.name} currently sits below {company_name}'s expected bar for critical skillsets."

    return TalentCheckResult(
        company=company_name,
        skillset_gap=skillset_gaps,
        readiness_score=readiness_score,
        verdict=verdict,
        summary=summary,
        strengths=strengths[:4],
        action_items=action_items[:4]
    )
