import axios from 'axios'
import type {
  ExtractedSkillList,
  ResumeParseResult,
  CandidateProfile,
  TalentCheckResult,
  SkillMatchingResult,
  SampleJD,
  SampleCandidate,
  Milestone
} from './types'

// Automatically detect production Vercel/Render API or fallback to localhost
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE,
})

// Database Status
export async function getDBStatus(): Promise<{
  database: string
  connected: boolean
  database_name?: string
  collections?: Record<string, number>
  status: string
  note?: string
}> {
  const res = await api.get('/data/db-status')
  return res.data
}

// Module 01: JD Analytics
export async function getSampleJDs(): Promise<SampleJD[]> {
  const res = await api.get('/jd/samples')
  return res.data
}

export async function analyzeJD(options: {
  file?: File | null
  text?: string
  presetId?: string
  company?: string
  role?: string
}): Promise<ExtractedSkillList> {
  const formData = new FormData()
  if (options.file) formData.append('jd_file', options.file)
  if (options.text) formData.append('jd_text', options.text)
  if (options.presetId) formData.append('preset_id', options.presetId)
  if (options.company) formData.append('company', options.company)
  if (options.role) formData.append('role', options.role)

  const res = await api.post('/jd/analyze', formData)
  return res.data
}

// Module 02: Resume Parsing
export async function getSampleCandidates(): Promise<SampleCandidate[]> {
  const res = await api.get('/resume/samples')
  return res.data
}

export async function parseResume(options: {
  file?: File | null
  text?: string
  presetId?: string
}): Promise<ResumeParseResult> {
  const formData = new FormData()
  if (options.file) formData.append('resume_file', options.file)
  if (options.text) formData.append('resume_text', options.text)
  if (options.presetId) formData.append('preset_id', options.presetId)

  const res = await api.post('/resume/parse', formData)
  return res.data
}

// Module 03: Profile Builder
export async function getCurrentProfile(): Promise<CandidateProfile> {
  const res = await api.get('/profile/current')
  return res.data
}

export async function saveProfile(profile: CandidateProfile): Promise<CandidateProfile> {
  const res = await api.post('/profile/save', profile)
  return res.data
}

export async function loadProfilePreset(presetId: string): Promise<CandidateProfile> {
  const res = await api.post(`/profile/load-preset/${presetId}`)
  return res.data
}

export async function prefillProfileFromResume(parsed: ResumeParseResult): Promise<CandidateProfile> {
  const res = await api.post('/profile/pre-fill', parsed)
  return res.data
}

// Module 04: Talent Check
export async function getCompanyBenchmarks(): Promise<Record<string, any>> {
  const res = await api.get('/talent-check/benchmarks')
  return res.data
}

export async function evaluateTalentCheck(
  company: string,
  profile?: CandidateProfile
): Promise<TalentCheckResult> {
  const res = await api.post('/talent-check/evaluate', {
    company,
    profile: profile || null,
  })
  return res.data
}

// Module 05: Skill Matching
export async function evaluateSkillMatch(options: {
  candidate?: CandidateProfile
  jd?: ExtractedSkillList
  jdPresetId?: string
}): Promise<SkillMatchingResult> {
  const res = await api.post('/match/evaluate', {
    candidate: options.candidate || null,
    jd: options.jd || null,
    jd_preset_id: options.jdPresetId || null,
  })
  return res.data
}

// Data & Milestones
export async function getMilestones(): Promise<{
  milestones: Milestone[]
  summary: Record<string, number>
  total: number
  completion_percentage: number
}> {
  const res = await api.get('/data/milestones')
  return res.data
}

export async function updateMilestoneStatus(
  milestoneId: string,
  status: string
): Promise<any> {
  const res = await api.post(`/data/milestones/${milestoneId}/status`, { status })
  return res.data
}
