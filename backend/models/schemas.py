from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# ── The 12 RADIX Skill Categories ─────────────────────────────────────────────
RADIX_CATEGORY_CODES = [
    'COD',   # Coding
    'DSA',   # Data Structures & Algorithms
    'OOD',   # Object-Oriented Design
    'APTI',  # Aptitude
    'COMM',  # Communication
    'AI',    # Artificial Intelligence
    'CLOUD', # Cloud
    'SQL',   # SQL & Databases
    'SWE',   # Software Engineering
    'SYSD',  # System Design
    'NETW',  # Networking
    'OS',    # Operating Systems
    'OTHER', # Other / Domain specific
]

CATEGORY_NAMES = {
    'COD': 'Coding',
    'DSA': 'Data Structures & Algorithms',
    'OOD': 'Object-Oriented Design',
    'APTI': 'Aptitude & Problem Solving',
    'COMM': 'Communication',
    'AI': 'Artificial Intelligence',
    'CLOUD': 'Cloud Computing',
    'SQL': 'SQL & Databases',
    'SWE': 'Software Engineering',
    'SYSD': 'System Design',
    'NETW': 'Networking',
    'OS': 'Operating Systems',
    'OTHER': 'Other Skills',
}

# ── Building Block: Single Skill (Page 9) ──────────────────────────────────────
class SkillItem(BaseModel):
    skill_name: str
    category_code: str = Field(description='One of COD, DSA, OOD, APTI, COMM, AI, CLOUD, SQL, SWE, SYSD, NETW, OS, OTHER')
    evidence: str = Field(description='Short quote or reason from document')
    confidence: str = Field(default='medium', description='high | medium | low')


# ── Extracted Skill List: Role 1 (JD) & Role 2 (Resume) (Page 10) ──────────────
class ExtractedSkillList(BaseModel):
    source_type: str = Field(description='jd | resume')
    source_file: str
    company: Optional[str] = ''
    role: Optional[str] = ''
    skills: List[SkillItem] = []
    category_distribution: Optional[Dict[str, int]] = None


# ── Resume Parse Output (Role 2) ──────────────────────────────────────────────
class ResumeParseResult(BaseModel):
    source_file: str
    name: Optional[str] = ''
    email: Optional[str] = ''
    education: Optional[str] = ''
    skills: List[SkillItem] = []
    internships: List[str] = []
    projects: List[str] = []
    certifications: List[str] = []
    preferred_roles: List[str] = []


# ── Candidate Profile (Role 3) (Page 10) ──────────────────────────────────────
class CandidateProfile(BaseModel):
    name: str = 'Candidate'
    email: str = ''
    education: str = ''
    skills: List[SkillItem] = []
    hackathons: List[str] = []
    internships: List[str] = []
    certifications: List[str] = []
    preferred_roles: List[str] = []
    cv_file: Optional[str] = ''


# ── Talent Check: Role 4 (Page 10) ─────────────────────────────────────────────
class SkillsetGap(BaseModel):
    category_code: str
    category_name: Optional[str] = ''
    required_level: int = Field(ge=1, le=10)
    candidate_level: int = Field(ge=1, le=10)
    gap: bool
    evidence_count: int = 0
    importance: str = 'medium'
    details: str = ''


class TalentCheckResult(BaseModel):
    company: str
    skillset_gap: List[SkillsetGap]
    readiness_score: int = Field(ge=0, le=100)
    verdict: str  # Ready | Near Ready | High Gap
    summary: str
    strengths: List[str] = []
    action_items: List[str] = []


# ── Skill Matching: Role 5 (Page 10) ───────────────────────────────────────────
class MatchedSkillDetail(BaseModel):
    skill_name: str
    category_code: str
    candidate_evidence: str
    jd_requirement: str
    match_quality: str  # Direct | Semantic | Partial


class MissingSkillDetail(BaseModel):
    skill_name: str
    category_code: str
    jd_requirement: str
    importance: str  # Critical | Preferred | Nice to have
    recommendation: str


class SkillMatchingResult(BaseModel):
    jd_source_file: str
    company: Optional[str] = ''
    role_title: Optional[str] = ''
    match_score: int = Field(ge=0, le=100)
    verdict: str  # Strong Match | Partial Match | Not Ready
    matched_skills: List[MatchedSkillDetail] = []
    missing_skills: List[MissingSkillDetail] = []
    top_strengths: List[str] = []
    top_gaps: List[str] = []
    summary: str
    actionable_recommendations: List[str] = []
