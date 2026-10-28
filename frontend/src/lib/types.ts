export type CategoryCode =
  | 'COD'
  | 'DSA'
  | 'OOD'
  | 'APTI'
  | 'COMM'
  | 'AI'
  | 'CLOUD'
  | 'SQL'
  | 'SWE'
  | 'SYSD'
  | 'NETW'
  | 'OS'
  | 'OTHER'

export interface SkillItem {
  skill_name: string
  category_code: CategoryCode
  evidence: string
  confidence: 'high' | 'medium' | 'low'
}

export interface ExtractedSkillList {
  source_type: 'jd' | 'resume'
  source_file: string
  company: string
  role: string
  skills: SkillItem[]
  category_distribution?: Record<string, number>
}

export interface ResumeParseResult {
  source_file: string
  name: string
  email: string
  education: string
  skills: SkillItem[]
  internships: string[]
  projects: string[]
  certifications: string[]
  preferred_roles: string[]
}

export interface CandidateProfile {
  name: string
  email: string
  education: string
  skills: SkillItem[]
  hackathons: string[]
  internships: string[]
  certifications: string[]
  preferred_roles: string[]
  cv_file?: string
}

export interface SkillsetGap {
  category_code: CategoryCode
  category_name: string
  required_level: number
  candidate_level: number
  gap: boolean
  evidence_count: number
  importance: 'critical' | 'high' | 'medium' | 'low'
  details: string
}

export interface TalentCheckResult {
  company: string
  skillset_gap: SkillsetGap[]
  readiness_score: number
  verdict: string
  summary: string
  strengths: string[]
  action_items: string[]
}

export interface MatchedSkillDetail {
  skill_name: string
  category_code: CategoryCode
  candidate_evidence: string
  jd_requirement: string
  match_quality: 'Direct' | 'Semantic' | 'Partial'
}

export interface MissingSkillDetail {
  skill_name: string
  category_code: CategoryCode
  jd_requirement: string
  importance: 'Critical' | 'Preferred' | 'Nice to have'
  recommendation: string
}

export interface SkillMatchingResult {
  jd_source_file: string
  company: string
  role_title: string
  match_score: number
  verdict: 'Strong Match' | 'Partial Match' | 'Not Ready'
  matched_skills: MatchedSkillDetail[]
  missing_skills: MissingSkillDetail[]
  top_strengths: string[]
  top_gaps: string[]
  summary: string
  actionable_recommendations: string[]
}

export interface SampleJD {
  id: string
  company: string
  role: string
  location: string
  experience_level: string
  file_name: string
  summary: string
  raw_text: string
}

export interface SampleCandidate {
  id: string
  name: string
  email: string
  title: string
  archetype: string
  fit_summary: string
  education: string
  preferred_roles: string[]
  hackathons: string[]
  internships: string[]
  certifications: string[]
  cv_file: string
  raw_resume_text: string
  skills: SkillItem[]
}

export interface Milestone {
  id: string
  role: string
  title: string
  description: string
  status: 'Done' | 'In Progress' | 'Blocked' | 'Not Started'
  owner: string
}
