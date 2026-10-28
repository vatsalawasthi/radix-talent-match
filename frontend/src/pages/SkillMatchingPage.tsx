import React, { useState, useEffect } from 'react'
import { getSampleJDs, evaluateSkillMatch } from '../lib/api'
import type { CandidateProfile, ExtractedSkillList, SkillMatchingResult, SampleJD } from '../lib/types'
import { ScoreRing } from '../components/ScoreRing'
import { CategoryBadge } from '../components/CategoryBadge'

interface Props {
  activeProfile: CandidateProfile | null
  activeJD: ExtractedSkillList | null
  onSwitchCandidate: (presetId: string) => void
  onNavigateToJDAnalytics?: () => void
}

export function SkillMatchingPage({
  activeProfile,
  activeJD,
  onSwitchCandidate,
  onNavigateToJDAnalytics,
}: Props) {
  const [sampleJDs, setSampleJDs] = useState<SampleJD[]>([])
  const [selectedJDPresetId, setSelectedJDPresetId] = useState<string>('google-swe')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SkillMatchingResult | null>(null)
  const [tab, setTab] = useState<'matched' | 'missing'>('matched')

  useEffect(() => {
    getSampleJDs().then((jds) => {
      setSampleJDs(jds)
    })
  }, [])

  useEffect(() => {
    if (activeProfile) {
      runMatch()
    }
  }, [activeProfile, activeJD, selectedJDPresetId])

  async function runMatch() {
    if (!activeProfile) return
    setLoading(true)
    setError(null)
    try {
      const data = await evaluateSkillMatch({
        candidate: activeProfile,
        jd: activeJD || undefined,
        jdPresetId: activeJD ? undefined : selectedJDPresetId,
      })
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to evaluate skill match.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="badge" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>
              MODULE 05
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ROLE 5: SPECIFIC ROLE FUZZY MATCHING & GAP LIST</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Job-Specific Skill Matching
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 800 }}>
            Compare candidate capabilities directly against a specific job posting.
            Performs fuzzy matching across the 12 RADIX categories, computing matched requirements and prioritized missing skills.
          </p>
        </div>

        {onNavigateToJDAnalytics && (
          <button className="btn-secondary" onClick={onNavigateToJDAnalytics}>
            ← Load New JD in Module 01
          </button>
        )}
      </div>

      {/* Target JD & Candidate Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* JD Selector */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Target Job Posting:
            </span>
            {activeJD && (
              <span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                From Module 01
              </span>
            )}
          </div>

          {activeJD ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--text)' }}>{activeJD.role}</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeJD.company} ({activeJD.skills.length} required skills)</p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setSelectedJDPresetId('google-swe')}
                style={{ fontSize: 11, padding: '4px 8px' }}
              >
                Switch to Presets
              </button>
            </div>
          ) : (
            <select
              value={selectedJDPresetId}
              onChange={(e) => setSelectedJDPresetId(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                color: 'var(--text)',
                outline: 'none',
              }}
            >
              {sampleJDs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.role} ({j.location})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Candidate Selector */}
        <div className="card" style={{ padding: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Selected Candidate:
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: 14, color: 'var(--green)' }}>
                {activeProfile ? activeProfile.name : 'No profile loaded'}
              </strong>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {activeProfile?.education.split(',')[0] || ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-secondary" onClick={() => onSwitchCandidate('ananya-rao')} style={{ fontSize: 11, padding: '3px 6px' }}>
                Ananya
              </button>
              <button className="btn-secondary" onClick={() => onSwitchCandidate('karthik-subramaniam')} style={{ fontSize: 11, padding: '3px 6px' }}>
                Karthik
              </button>
              <button className="btn-secondary" onClick={() => onSwitchCandidate('priya-menon')} style={{ fontSize: 11, padding: '3px 6px' }}>
                Priya
              </button>
              <button className="btn-secondary" onClick={() => onSwitchCandidate('rohan-verma')} style={{ fontSize: 11, padding: '3px 6px' }}>
                Rohan
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Score Banner */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              padding: '24px 28px',
              background: 'linear-gradient(135deg, var(--surface), var(--surface-2))',
            }}
          >
            <ScoreRing score={result.match_score} verdict={result.verdict} label="Match" size={140} />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: 20,
                    background:
                      result.match_score >= 80
                        ? 'var(--green-dim)'
                        : result.match_score >= 60
                        ? 'var(--amber-dim)'
                        : 'var(--red-dim)',
                    color:
                      result.match_score >= 80
                        ? 'var(--green)'
                        : result.match_score >= 60
                        ? 'var(--amber)'
                        : 'var(--red)',
                  }}
                >
                  {result.verdict}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {activeProfile?.name} → {result.role_title} at {result.company}
                </span>
              </div>

              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5, marginBottom: 14 }}>
                {result.summary}
              </p>

              {/* Actionable recommendations */}
              {result.actionable_recommendations.length > 0 && (
                <div
                  style={{
                    background: 'var(--blue-dim)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: 'var(--text)',
                  }}
                >
                  <strong style={{ color: 'var(--blue)' }}>Recommended Next Steps: </strong>
                  {result.actionable_recommendations[0]}
                </div>
              )}
            </div>
          </div>

          {/* Tab Switcher: Matched Skills vs Missing Skills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-secondary"
                onClick={() => setTab('matched')}
                style={{
                  background: tab === 'matched' ? 'var(--blue)' : undefined,
                  color: tab === 'matched' ? '#fff' : undefined,
                }}
              >
                ✓ Matched Skills ({result.matched_skills.length})
              </button>
              <button
                className="btn-secondary"
                onClick={() => setTab('missing')}
                style={{
                  background: tab === 'missing' ? 'var(--red)' : undefined,
                  color: tab === 'missing' ? '#fff' : undefined,
                }}
              >
                ⚠️ Missing Skills & Gaps ({result.missing_skills.length})
              </button>
            </div>
          </div>

          {/* Skills Breakdown */}
          {tab === 'matched' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
              {result.matched_skills.map((m, idx) => (
                <div key={idx} className="card" style={{ background: 'var(--surface-2)', padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {m.skill_name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CategoryBadge code={m.category_code} />
                      <span className="badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                        {m.match_quality} Match
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>JD Required: </span>
                    {m.jd_requirement}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--green)',
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderLeft: '3px solid var(--green)',
                      padding: '6px 10px',
                      borderRadius: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>Candidate Evidence: </strong>
                    {m.candidate_evidence}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
              {result.missing_skills.map((g, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    background: 'var(--surface-2)',
                    padding: 16,
                    border: g.importance === 'Critical' ? '1px solid var(--red)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {g.skill_name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CategoryBadge code={g.category_code} />
                      <span
                        className="badge"
                        style={{
                          background: g.importance === 'Critical' ? 'var(--red-dim)' : 'var(--amber-dim)',
                          color: g.importance === 'Critical' ? 'var(--red)' : 'var(--amber)',
                        }}
                      >
                        {g.importance}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>JD Context: </span>
                    {g.jd_requirement}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--amber)',
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderLeft: '3px solid var(--amber)',
                      padding: '6px 10px',
                      borderRadius: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>How to close: </strong>
                    {g.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Ready to Run Skill Match
          </h3>
          <p style={{ fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
            Select a job description and candidate above to compare skills across the 12 RADIX categories.
          </p>
        </div>
      )}
    </div>
  )
}
