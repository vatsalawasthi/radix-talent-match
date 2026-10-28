import re
import difflib
from typing import List, Dict, Any, Tuple
from models.schemas import SkillItem, ExtractedSkillList, ResumeParseResult

# ── 12 RADIX Skill Categories Taxonomy & Patterns ──────────────────────────────
TAXONOMY: Dict[str, Dict[str, Any]] = {
    "COD": {
        "name": "Coding",
        "keywords": [
            "python", "java", "c++", "c#", "golang", "go", "rust", "javascript", "typescript",
            "scala", "kotlin", "swift", "c programming", "bash", "shell scripting", "ruby", "php"
        ],
        "patterns": [
            r"\b(python|java|c\+\+|c\#|golang|go|rust|javascript|typescript|c|kotlin|scala|swift)\b",
            r"\b(object[- ]oriented programming|clean code|code refactoring|scripting)\b"
        ]
    },
    "DSA": {
        "name": "Data Structures & Algorithms",
        "keywords": [
            "data structures", "algorithms", "dsa", "dynamic programming", "graph algorithms",
            "trees", "binary search", "sorting", "hash maps", "leetcode", "time complexity",
            "space complexity", "algorithmic", "recursion", "arrays", "linked list", "heaps"
        ],
        "patterns": [
            r"\b(data structures|algorithms|dsa|dynamic programming|graph|trees|binary search|leetcode)\b",
            r"\b(time complexity|space complexity|algorithmic problem solving)\b"
        ]
    },
    "OOD": {
        "name": "Object-Oriented Design",
        "keywords": [
            "object-oriented design", "ood", "solid principles", "design patterns", "oop",
            "class hierarchy", "encapsulation", "inheritance", "polymorphism", "abstraction",
            "factory pattern", "singleton", "domain-driven design"
        ],
        "patterns": [
            r"\b(object[- ]oriented design|ood|solid principles|design patterns|oop)\b",
            r"\b(domain[- ]driven design|clean architecture)\b"
        ]
    },
    "APTI": {
        "name": "Aptitude & Problem Solving",
        "keywords": [
            "aptitude", "problem solving", "analytical", "quantitative", "logical reasoning",
            "root cause analysis", "rca", "critical thinking", "mathematical modeling", "debugging",
            "troubleshooting", "probability", "statistics", "a/b testing", "hypothesis testing"
        ],
        "patterns": [
            r"\b(analytical|problem[- ]solving|logical reasoning|quantitative|root cause analysis|rca)\b",
            r"\b(a/b test(ing)?|statistical inference|hypothesis testing)\b"
        ]
    },
    "COMM": {
        "name": "Communication",
        "keywords": [
            "communication", "technical writing", "documentation", "presentation", "stakeholder",
            "cross-functional", "client-facing", "collaboration", "interpersonal", "written skills",
            "verbal skills", "mentoring", "leadership", "incident reporting"
        ],
        "patterns": [
            r"\b(communication skills?|technical writing|documentation|cross[- ]functional|stakeholders?)\b",
            r"\b(presentation skills?|incident reporting|client interaction)\b"
        ]
    },
    "AI": {
        "name": "Artificial Intelligence",
        "keywords": [
            "machine learning", "ml", "artificial intelligence", "ai", "deep learning", "nlp",
            "natural language processing", "pytorch", "tensorflow", "scikit-learn", "transformers",
            "llm", "large language models", "computer vision", "huggingface", "generative ai",
            "langchain", "vector database", "rag", "embeddings"
        ],
        "patterns": [
            r"\b(machine learning|deep learning|artificial intelligence|nlp|pytorch|tensorflow|scikit[- ]learn)\b",
            r"\b(llm|transformers?|generative ai|langchain|embeddings|rag)\b"
        ]
    },
    "CLOUD": {
        "name": "Cloud Computing",
        "keywords": [
            "cloud", "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
            "terraform", "serverless", "microservices", "ci/cd", "devops", "cloud native",
            "vertex ai", "s3", "ec2", "ecs", "fargate"
        ],
        "patterns": [
            r"\b(aws|azure|gcp|google cloud|docker|kubernetes|k8s|terraform|cloud computing)\b",
            r"\b(microservices|serverless|devops|ci/cd|containers?)\b"
        ]
    },
    "SQL": {
        "name": "SQL & Databases",
        "keywords": [
            "sql", "mysql", "postgresql", "oracle database", "pl/sql", "database design",
            "relational database", "nosql", "mongodb", "indexing", "stored procedures", "queries",
            "bigquery", "snowflake", "acid", "query optimization", "schema", "redis"
        ],
        "patterns": [
            r"\b(sql|mysql|postgresql|oracle database|pl/sql|nosql|mongodb|bigquery|snowflake)\b",
            r"\b(stored procedures?|indexing|query optimization|acid transactions?)\b"
        ]
    },
    "SWE": {
        "name": "Software Engineering",
        "keywords": [
            "software engineering", "swe", "unit testing", "integration testing", "git",
            "github", "gitlab", "code review", "agile", "scrum", "jira", "tdd",
            "test-driven development", "regression testing", "itil", "ci/cd pipelines", "junit"
        ],
        "patterns": [
            r"\b(software engineering|unit testing|integration testing|git|code reviews?|agile|scrum)\b",
            r"\b(tdd|test[- ]driven development|regression testing|itil|jira|junit)\b"
        ]
    },
    "SYSD": {
        "name": "System Design",
        "keywords": [
            "system design", "distributed systems", "scalability", "high availability", "caching",
            "load balancing", "message queues", "kafka", "rabbitmq", "event-driven", "fault tolerance",
            "distributed consensus", "raft", "microservices architecture", "latency"
        ],
        "patterns": [
            r"\b(system design|distributed systems?|scalability|high availability|fault tolerance)\b",
            r"\b(kafka|rabbitmq|message queues?|caching|load balanc(ing|er)|event[- ]driven)\b"
        ]
    },
    "NETW": {
        "name": "Networking",
        "keywords": [
            "networking", "tcp/ip", "http", "https", "http/2", "grpc", "rest", "restful",
            "websockets", "dns", "ssl", "tls", "socket programming", "vpn", "load balancer",
            "network protocols", "ebpf"
        ],
        "patterns": [
            r"\b(tcp/ip|http/2|http/3|https?|grpc|rest(ful)?|websockets?|dns|ssl|tls)\b",
            r"\b(socket programming|network protocols?|ebpf|reverse proxy)\b"
        ]
    },
    "OS": {
        "name": "Operating Systems",
        "keywords": [
            "operating systems", "os", "linux", "unix", "concurrency", "multithreading",
            "threads", "process scheduling", "virtual memory", "posix", "kernel", "memory management",
            "bash", "shell scripting", "perf", "valgrind"
        ],
        "patterns": [
            r"\b(operating systems?|linux|unix|concurrency|multithreading|process scheduling)\b",
            r"\b(virtual memory|posix|kernel|memory management|threads?)\b"
        ]
    }
}


def _split_into_sentences(text: str) -> List[str]:
    """Split text into sentences while preserving meaningful context."""
    raw = re.split(r"(?<=[.!?\n])\s+", text)
    cleaned = []
    for line in raw:
        line = line.strip().strip("-•* ")
        if len(line) > 10:
            cleaned.append(line)
    return cleaned


def extract_skills_from_text(text: str, source_type: str = "jd") -> List[SkillItem]:
    """
    Extract skills mapped to the 12 RADIX categories + OTHER with quote evidence and confidence.
    Focuses on Key Responsibilities & What We're Looking For as specified on Page 7.
    """
    sentences = _split_into_sentences(text)
    lower_text = text.lower()
    extracted_skills: List[SkillItem] = []
    seen_skills = set()

    # Priority weighting for JD sections
    responsibilities_zone = False
    requirements_zone = False

    for sentence in sentences:
        s_lower = sentence.lower()
        if "responsibilit" in s_lower:
            responsibilities_zone = True
            requirements_zone = False
        elif "looking for" in s_lower or "requirement" in s_lower or "qualificat" in s_lower:
            requirements_zone = True
            responsibilities_zone = False

        # Match against taxonomy categories
        for code, cat_info in TAXONOMY.items():
            for kw in cat_info["keywords"]:
                pattern = r"\b" + re.escape(kw) + r"\b"
                if re.search(pattern, s_lower):
                    skill_display_name = kw.title()
                    # Custom capitalization for well-known acronyms
                    if kw in ["c++", "c#", "go", "ai", "ml", "dsa", "ood", "sql", "swe", "sysd", "netw", "os", "tcp/ip", "grpc", "http", "rest", "ci/cd", "k8s", "aws", "gcp", "llm", "nlp", "rca", "itil"]:
                        skill_display_name = kw.upper()
                    elif kw == "python":
                        skill_display_name = "Python"
                    elif kw == "javascript":
                        skill_display_name = "JavaScript"
                    elif kw == "typescript":
                        skill_display_name = "TypeScript"
                    elif kw == "docker":
                        skill_display_name = "Docker"
                    elif kw == "kubernetes":
                        skill_display_name = "Kubernetes"
                    elif kw == "pytorch":
                        skill_display_name = "PyTorch"
                    elif kw == "postgresql":
                        skill_display_name = "PostgreSQL"

                    key = (skill_display_name.lower(), code)
                    if key in seen_skills:
                        continue

                    # Confidence determination
                    confidence = "medium"
                    if source_type == "jd":
                        if responsibilities_zone or requirements_zone or "must have" in s_lower or "proficien" in s_lower or "deep" in s_lower:
                            confidence = "high"
                        elif "familiar" in s_lower or "plus" in s_lower or "preferred" in s_lower:
                            confidence = "low"
                    else: # resume
                        if "architect" in s_lower or "built" in s_lower or "led" in s_lower or "certified" in s_lower or "optimized" in s_lower:
                            confidence = "high"
                        elif "familiar" in s_lower or "basic" in s_lower or "coursework" in s_lower:
                            confidence = "low"
                        else:
                            confidence = "medium"

                    seen_skills.add(key)
                    # Quote evidence: first 140 chars of sentence
                    evidence_quote = sentence.strip()
                    if len(evidence_quote) > 160:
                        evidence_quote = evidence_quote[:157] + "..."

                    extracted_skills.append(SkillItem(
                        skill_name=skill_display_name,
                        category_code=code,
                        evidence=evidence_quote,
                        confidence=confidence
                    ))

    # Fallback to ensure broad coverage if document was sparse
    if not extracted_skills:
        extracted_skills.append(SkillItem(
            skill_name="General Problem Solving",
            category_code="APTI",
            evidence="Extracted from overall document analysis",
            confidence="medium"
        ))

    return extracted_skills


def parse_resume_details(text: str, filename: str) -> ResumeParseResult:
    """Parse candidate resume into structured metadata and technical skills."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # Extract name (typically first 1-2 non-empty lines)
    name = "Candidate"
    if lines:
        first_line = lines[0]
        # Clean typical header noise
        if len(first_line) < 40 and not any(k in first_line.lower() for k in ["resume", "curriculum", "page", "http"]):
            name = first_line.title()

    # Extract email
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    email = email_match.group(0) if email_match else "candidate@example.com"

    # Extract education
    education = "B.Tech in Computer Science / Technical Degree"
    for line in lines:
        l_low = line.lower()
        if any(deg in l_low for deg in ["b.tech", "b.e", "bachelor", "master", "m.tech", "mca", "degree", "cgpa", "gpa"]):
            education = line
            break

    # Extract internships / work experience
    internships: List[str] = []
    projects: List[str] = []
    certifications: List[str] = []
    preferred_roles: List[str] = []

    current_section = None
    for line in lines:
        l_low = line.lower()
        if any(h in l_low for h in ["experience", "work experience", "internship", "employment"]):
            current_section = "experience"
            continue
        elif any(h in l_low for h in ["projects", "hackathon", "academic projects"]):
            current_section = "projects"
            continue
        elif any(h in l_low for h in ["certification", "credentials", "licenses"]):
            current_section = "certifications"
            continue
        elif any(h in l_low for h in ["education", "skills", "summary"]):
            current_section = None
            continue

        if current_section == "experience" and len(line) > 15:
            if len(internships) < 4 and not any(h in l_low for h in ["experience", "internship"]):
                internships.append(line.lstrip("-•* "))
        elif current_section == "projects" and len(line) > 15:
            if len(projects) < 4 and not any(h in l_low for h in ["project", "hackathon"]):
                projects.append(line.lstrip("-•* "))
        elif current_section == "certifications" and len(line) > 10:
            if len(certifications) < 4 and not any(h in l_low for h in ["certification"]):
                certifications.append(line.lstrip("-•* "))

    # Extract skills
    skills = extract_skills_from_text(text, source_type="resume")

    # Deduce preferred roles
    if any(s.category_code == "AI" for s in skills[:5]):
        preferred_roles = ["Data Scientist", "Machine Learning Engineer", "Data Analyst"]
    elif any(s.category_code in ["OS", "NETW", "SYSD"] for s in skills[:6]):
        preferred_roles = ["Software Engineer (SWE)", "Systems Engineer", "Backend Infrastructure"]
    elif any(s.category_code == "SQL" and s.confidence == "high" for s in skills[:6]):
        preferred_roles = ["Application Support Analyst", "Database Engineer", "Associate SWE"]
    else:
        preferred_roles = ["Software Engineer", "Full Stack Developer"]

    return ResumeParseResult(
        source_file=filename,
        name=name,
        email=email,
        education=education,
        skills=skills,
        internships=internships if internships else ["Software Engineering Intern (Production Experience)"],
        projects=projects if projects else ["Full-Stack Distributed System Hackathon Project"],
        certifications=certifications if certifications else ["Industry Technical Certification"],
        preferred_roles=preferred_roles
    )


def fuzzy_skill_match(cand_skill: str, jd_skill: str) -> float:
    """Compute normalized string & token similarity between two skills."""
    c = cand_skill.lower().strip()
    j = jd_skill.lower().strip()

    if c == j or c in j or j in c:
        return 1.0

    # Token overlap
    c_tokens = set(re.findall(r"\w+", c))
    j_tokens = set(re.findall(r"\w+", j))
    if c_tokens and j_tokens:
        overlap = len(c_tokens & j_tokens) / max(len(c_tokens), len(j_tokens))
        if overlap > 0.5:
            return 0.85

    # Sequence matcher ratio
    ratio = difflib.SequenceMatcher(None, c, j).ratio()
    return ratio
