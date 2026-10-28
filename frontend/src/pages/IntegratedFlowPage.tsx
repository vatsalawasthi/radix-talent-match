import React, { useState, useEffect } from 'react'
import {
  getSampleJDs,
  getSampleCandidates,
  analyzeJD,
  parseResume,
  saveProfile,
  evaluateTalentCheck,
  evaluateSkillMatch,
} from '../lib/api'
import type {
  SampleJD,
  SampleCandidate,
  ExtractedSkillList,
  ResumeParseResult,
  CandidateProfile,
  TalentCheckResult,
  SkillMatchingResult,
} from '../lib/types'
import { ScoreRing } from '../components/ScoreRing'
import { RadarChart } from '../components/RadarChart'
import { CategoryBadge } from '../components/CategoryBadge'

const STEPS = [
  { num: 1, title: 'Pick a JD', desc: 'Module 01: JD Analytics' },
  { num: 2, title: 'Parse Resume', desc: 'Module 02: Resume Parsing' },
  { num: 3, title: 'Build Profile', desc: 'Module 03: Profile Builder' },
  { num: 4, title: 'Talent Check', desc: 'Module 04: Company Bar' },
  { num: 5, title: 'Skill Match', desc: 'Module 05: Role Matching' },
]

export function IntegratedFlowPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [sampleJDs, setSampleJDs] = useState<SampleJD[]>([])
  const [sampleCandidates, setSampleCandidates] = useState<SampleCandidate[]>([])

  // Selections
  const [selectedJdId, setSelectedJdId] = useState('google-swe')
  const [selectedCandId, setSelectedCandId] = useState('ananya-rao')
  const [selectedCompany, setSelectedCompany] = useState('Google LLC')

  // Step Data
  const [extractedJD, setExtractedJD] = useState<ExtractedSkillList | null>(null)
  const [parsedResume, setParsedResume] = useState<ResumeParseResult | null>(null)
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null)
  const [talentCheckResult, setTalentCheckResult] = useState<TalentCheckResult | null>(null)
  const [skillMatchResult, setSkillMatchResult] = useState<SkillMatchingResult | null>(null)

  const [loading, setLoading] = useState(false)
  const [autoRunning, setAutoRunning] = useState(false)

  useEffect(() => {
    Promise.all([getSampleJDs(), getSampleCandidates()]).then(([jds, cands]) => {
      setSampleJDs(jds)
      setSampleCandidates(cands)
    })
  }, [])

  // Step 1: Analyze JD
  async function runStep1() {
    setLoading(true)
    try {
      const match = sampleJDs.find((j) => j.id === selectedJdId)
      const res = await analyzeJD({
        presetId: selectedJdId,
        company: match?.company,
        role: match?.role,
      })
      setExtractedJD(res)
      if (match) setSelectedCompany(match.company)
      setCurrentStep(2)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Parse Resume
  async function runStep2() {
    setLoading(true)
    try {
      const res = await parseResume({ presetId: selectedCandId })
      setParsedResume(res)
      // Automatically construct candidate profile for Step 3
      const profile: CandidateProfile = {
        name: res.name,
        email: res.email,
        education: res.education,
        skills: res.skills,
        internships: res.internships,
        hackathons: res.projects,
        certifications: res.certifications,
        preferred_roles: res.preferred_roles,
        cv_file: res.source_file,
      }
      setCandidateProfile(profile)
      await saveProfile(profile)
      setCurrentStep(3)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Confirm Profile
  async function runStep3() {
    if (!candidateProfile) return
    setLoading(true)
    try {
      await saveProfile(candidateProfile)
      setCurrentStep(4)
      await runStep4(candidateProfile)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Run Talent Check
  async function runStep4(profile = candidateProfile) {
    if (!profile) return
    setLoading(true)
    try {
      const res = await evaluateTalentCheck(selectedCompany, profile)
      setTalentCheckResult(res)
      setCurrentStep(4)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Run Skill Match
  async function runStep5() {
    if (!candidateProfile) return
    setLoading(true)
    try {
      const res = await evaluateSkillMatch({
        candidate: candidateProfile,
        jd: extractedJD || undefined,
        jdPresetId: extractedJD ? undefined : selectedJdId,
      })
      setSkillMatchResult(res)
      setCurrentStep(5)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // 1-Click Complete Pipeline Auto-Runner
  async function runFullPipeline() {
    setAutoRunning(true)
    setLoading(true)
    try {
      // Step 1
      const matchJD = sampleJDs.find((j) => j.id === selectedJdId)
      const jdRes = await analyzeJD({
        presetId: selectedJdId,
        company: matchJD?.company,
        role: matchJD?.role,
      })
      setExtractedJD(jdRes)
      if (matchJD) setSelectedCompany(matchJD.company)

      // Step 2
      const resumeRes = await parseResume({ presetId: selectedCandId })
      setParsedResume(resumeRes)

      // Step 3
      const profile: CandidateProfile = {
        name: resumeRes.name,
        email: resumeRes.email,
        education: resumeRes.education,
        skills: resumeRes.skills,
        internships: resumeRes.internships,
        hackathons: resumeRes.projects,
        certifications: resumeRes.certifications,
        preferred_roles: resumeRes.preferred_roles,
        cv_file: resumeRes.source_file,
      }
      setCandidateProfile(profile)
      await saveProfile(profile)

      // Step 4
      const tcRes = await evaluateTalentCheck(matchJD ? matchJD.company : selectedCompany, profile)
      setTalentCheckResult(tcRes)

      // Step 5
      const smRes = await evaluateSkillMatch({
        candidate: profile,
        jd: jdRes,
      })
      setSkillMatchResult(smRes)
      setCurrentStep(5)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setAutoRunning(false)
    }
  }

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 24px' }}>
      {/* Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(79, 110, 247, 0.12), rgba(139, 92, 246, 0.12))',
          border: '1px solid var(--border)',
          borderRadius: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              className="badge"
              style={{
                background: 'linear-gradient(135deg, #4f6ef7, #8b5cf6)',
                color: '#fff',
                fontSize: 12,
                padding: '4px 10px',
              }}
            >
              HACKATHON GRAND FINALE FLOW
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Page 12: Integrated 5-Role Pipeline
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            End-to-End Candidate Readiness Journey
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Pick a JD › Parse a resume › Build profile › Run Talent Check › Run Skill Matching
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={runFullPipeline}
          disabled={loading}
          style={{
            padding: '12px 22px',
            fontSize: 14,
            boxShadow: '0 4px 20px rgba(79, 110, 247, 0.4)',
          }}
        >
          {autoRunning ? '⟳ Running All 5 Modules...' : '🚀 1-Click End-to-End Run'}
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}
      >
        {STEPS.map((s) => {
          const isActive = currentStep === s.num
          const isDone = currentStep > s.num
          return (
            <div
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              style={{
                cursor: 'pointer',
                background: isActive ? 'var(--surface-3)' : 'var(--surface)',
                border: `1.5px solid ${isActive ? 'var(--blue)' : isDone ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '14px 16px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    background: isDone ? 'var(--green)' : isActive ? 'var(--blue)' : 'var(--surface-2)',
                    color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {isDone ? '✓' : s.num}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : 'var(--text)' }}>
                  {s.title}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Step Workspace Content */}
      <div className="card" style={{ minHeight: 460, padding: 28 }}>
        {/* STEP 1: Pick a JD */}
        {currentStep === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>STEP 1 OF 5</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Select or Upload Target Job Description</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Role 1 extracts requirements mapped onto the 12 RADIX categories.</p>
              </div>
              <button className="btn-primary" onClick={runStep1} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze JD & Continue →'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {sampleJDs.map((j) => (
                <div
                  key={j.id}
                  onClick={() => setSelectedJdId(j.id)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    background: selectedJdId === j.id ? 'var(--surface-2)' : 'var(--surface)',
                    borderColor: selectedJdId === j.id ? 'var(--blue)' : 'var(--border)',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>{j.company}</span>
                  <h4 style={{ fontSize: 15, fontWeight: 700, margin: '4px 0 6px 0' }}>{j.role}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{j.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Parse a Resume */}
        {currentStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="badge" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>STEP 2 OF 5</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Select Candidate to Parse</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Role 2 ingests the resume and pulls technical skills and experience signal.</p>
              </div>
              <button className="btn-primary" onClick={runStep2} disabled={loading}>
                {loading ? 'Parsing...' : 'Parse Resume & Continue →'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {sampleCandidates.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandId(c.id)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    background: selectedCandId === c.id ? 'var(--surface-2)' : 'var(--surface)',
                    borderColor: selectedCandId === c.id ? 'var(--purple)' : 'var(--border)',
                  }}
                >
                  <span className="badge" style={{ background: 'var(--purple-dim)', color: 'var(--purple)', marginBottom: 8 }}>
                    {c.archetype.split(',')[0]}
                  </span>
                  <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{c.name}</h4>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>{c.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3 }}>{c.fit_summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Review / Build Profile */}
        {currentStep === 3 && candidateProfile && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>STEP 3 OF 5</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Review Candidate Profile (Shared Contract)</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Role 3 locks the candidate profile schema into local persistence.</p>
              </div>
              <button className="btn-primary" onClick={runStep3} disabled={loading}>
                Lock Profile & Run Talent Check →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
              <div className="card" style={{ background: 'var(--surface-2)' }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                  {candidateProfile.name}
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{candidateProfile.email}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{candidateProfile.education}</p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)' }}>EXPERIENCE:</span>
                  <ul style={{ listStyle: 'none', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {candidateProfile.internships.map((exp, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'var(--text-muted)' }}>• {exp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>
                  Categorized Skills ({candidateProfile.skills.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                  {candidateProfile.skills.map((s, i) => (
                    <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{s.skill_name}</span>
                        <CategoryBadge code={s.category_code} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Talent Check */}
        {currentStep === 4 && talentCheckResult && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>STEP 4 OF 5</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Talent Check: Company Benchmark</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Role 4 compares across all 12 RADIX categories against {talentCheckResult.company}.</p>
              </div>
              <button className="btn-primary" onClick={runStep5} disabled={loading}>
                Proceed to Specific Job Match →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <ScoreRing score={talentCheckResult.readiness_score} verdict={talentCheckResult.verdict} label="Readiness" size={160} />
                <span className="badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)', fontSize: 13, padding: '4px 12px' }}>
                  {talentCheckResult.verdict}
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {talentCheckResult.summary}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                  12-Category Radar vs {talentCheckResult.company}
                </h4>
                <RadarChart data={talentCheckResult.skillset_gap} candidateName={candidateProfile?.name} companyName={talentCheckResult.company} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Skill Match Result */}
        {currentStep === 5 && skillMatchResult && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>STEP 5 OF 5: COMPLETE</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Role-Specific Skill Match Report</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Role 5 calculates candidate alignment with {extractedJD?.role || selectedJdId}.</p>
              </div>
              <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
                ↺ Start New Flow
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <ScoreRing score={skillMatchResult.match_score} verdict={skillMatchResult.verdict} label="Match" size={160} />
                <span className="badge" style={{ background: 'var(--green-dim)', color: 'var(--green)', fontSize: 13, padding: '4px 12px' }}>
                  {skillMatchResult.verdict}
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {skillMatchResult.summary}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="card" style={{ background: 'var(--surface-2)', padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
                    ✓ Matched Requirements ({skillMatchResult.matched_skills.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {skillMatchResult.matched_skills.slice(0, 10).map((m, i) => (
                      <span key={i} className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text)' }}>
                        {m.skill_name}
                      </span>
                    ))}
                    {skillMatchResult.matched_skills.length > 10 && (
                      <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>
                        +{skillMatchResult.matched_skills.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="card" style={{ background: 'var(--surface-2)', padding: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', marginBottom: 8 }}>
                    ⚠️ Priority Gaps & Action Items ({skillMatchResult.missing_skills.length})
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {skillMatchResult.missing_skills.slice(0, 4).map((g, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        • <strong style={{ color: 'var(--text)' }}>{g.skill_name}:</strong> {g.recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
