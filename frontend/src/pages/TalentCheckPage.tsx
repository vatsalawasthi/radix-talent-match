import React, { useState, useEffect } from 'react'
import { evaluateTalentCheck, getCompanyBenchmarks } from '../lib/api'
import type { CandidateProfile, TalentCheckResult, SkillsetGap } from '../lib/types'
import { ScoreRing } from '../components/ScoreRing'
import { RadarChart } from '../components/RadarChart'
import { CategoryBadge } from '../components/CategoryBadge'

interface Props {
  activeProfile: CandidateProfile | null
  onSwitchCandidate: (presetId: string) => void
  onNavigateToSkillMatch?: () => void
}

const COMPANIES = [
  { id: 'Google LLC', name: 'Google LLC', tag: 'High Algorithmic & Systems Bar' },
  { id: 'Microsoft Corporation', name: 'Microsoft Corporation', tag: 'Enterprise Cloud & SWE Scale' },
  { id: 'Oracle Financial Services Software', name: 'Oracle Financial Services Software', tag: 'Core Banking, SQL & Enterprise Java' },
]

export function TalentCheckPage({
  activeProfile,
  onSwitchCandidate,
  onNavigateToSkillMatch,
}: Props) {
  const [selectedCompany, setSelectedCompany] = useState<string>('Google LLC')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TalentCheckResult | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'radar'>('grid')

  useEffect(() => {
    if (activeProfile) {
      runCheck(selectedCompany)
    }
  }, [activeProfile, selectedCompany])

  async function runCheck(companyName: string) {
    if (!activeProfile) return
    setLoading(true)
    setError(null)
    try {
      const data = await evaluateTalentCheck(companyName, activeProfile)
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to run talent check.')
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
            <span className="badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
              MODULE 04
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ROLE 4: COMPANY BAR COMPARISON & GAP ANALYSIS</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Talent Check — Company Benchmark
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 800 }}>
            Compare a candidate across all 12 RADIX skillsets against real company hiring thresholds.
            Identifies exact gaps and computes an overall readiness score.
          </p>
        </div>

        {onNavigateToSkillMatch && (
          <button className="btn-primary" onClick={onNavigateToSkillMatch}>
            Compare Against Specific JD (Mod 05) →
          </button>
        )}
      </div>

      {/* Company Selector Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {COMPANIES.map((c) => {
          const isSelected = selectedCompany === c.id
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCompany(c.id)}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--blue)' : 'var(--border)',
                background: isSelected ? 'var(--surface-2)' : 'var(--surface)',
                boxShadow: isSelected ? '0 0 0 1px var(--blue)' : undefined,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? '#fff' : 'var(--text)' }}>
                  {c.name}
                </span>
                {isSelected && (
                  <span className="badge" style={{ background: 'var(--blue)', color: '#fff' }}>
                    Active Bar
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.tag}</p>
            </div>
          )
        })}
      </div>

      {/* Candidate Profile Quick Switcher */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>👤</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                {activeProfile ? activeProfile.name : 'No profile loaded'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ({activeProfile?.skills.length || 0} skills documented)
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {activeProfile?.education || 'Set candidate in Profile Builder'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>Test Different Candidates:</span>
          <button className="btn-secondary" onClick={() => onSwitchCandidate('ananya-rao')} style={{ fontSize: 11, padding: '4px 8px' }}>
            Ananya (SWE)
          </button>
          <button className="btn-secondary" onClick={() => onSwitchCandidate('karthik-subramaniam')} style={{ fontSize: 11, padding: '4px 8px' }}>
            Karthik (Data)
          </button>
          <button className="btn-secondary" onClick={() => onSwitchCandidate('priya-menon')} style={{ fontSize: 11, padding: '4px 8px' }}>
            Priya (OFSS)
          </button>
          <button className="btn-secondary" onClick={() => onSwitchCandidate('rohan-verma')} style={{ fontSize: 11, padding: '4px 8px' }}>
            Rohan (All)
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Result Banner */}
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
            <ScoreRing score={result.readiness_score} verdict={result.verdict} label="Readiness" size={140} />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: 20,
                    background:
                      result.readiness_score >= 85
                        ? 'var(--green-dim)'
                        : result.readiness_score >= 70
                        ? 'var(--amber-dim)'
                        : 'var(--red-dim)',
                    color:
                      result.readiness_score >= 85
                        ? 'var(--green)'
                        : result.readiness_score >= 70
                        ? 'var(--amber)'
                        : 'var(--red)',
                  }}
                >
                  {result.verdict}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Target Company: <strong style={{ color: 'var(--text)' }}>{result.company}</strong>
                </span>
              </div>

              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5, marginBottom: 14 }}>
                {result.summary}
              </p>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {result.strengths.length > 0 && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase' }}>
                      Top Strengths:
                    </span>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {result.strengths.map((s, i) => (
                        <span key={i} className="badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.action_items.length > 0 && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase' }}>
                      Action Items / Priority Gaps:
                    </span>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {result.action_items.map((a, i) => (
                        <span key={i} className="badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--blue)' : undefined,
                color: viewMode === 'grid' ? '#fff' : undefined,
              }}
            >
              📊 12-Skillset Breakdown
            </button>
            <button
              className="btn-secondary"
              onClick={() => setViewMode('radar')}
              style={{
                background: viewMode === 'radar' ? 'var(--blue)' : undefined,
                color: viewMode === 'radar' ? '#fff' : undefined,
              }}
            >
              🕸️ Radar Chart View
            </button>
          </div>

          {viewMode === 'radar' ? (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                12-Skillset Radar: Candidate vs {result.company} Bar
              </h3>
              <RadarChart data={result.skillset_gap} candidateName={activeProfile?.name || 'Candidate'} companyName={result.company} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {result.skillset_gap.map((sg) => {
                const candPct = (sg.candidate_level / 10) * 100
                const reqPct = (sg.required_level / 10) * 100
                const isGap = sg.gap

                return (
                  <div
                    key={sg.category_code}
                    className="card"
                    style={{
                      padding: 16,
                      background: 'var(--surface-2)',
                      border: isGap && sg.importance === 'critical' ? '1px solid var(--red)' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CategoryBadge code={sg.category_code} />
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: isGap ? 'var(--red-dim)' : 'var(--green-dim)',
                          color: isGap ? 'var(--red)' : 'var(--green)',
                        }}
                      >
                        {isGap ? 'Gap Detected' : 'Meets Bar'}
                      </span>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Candidate Level</span>
                        <strong style={{ color: isGap ? 'var(--amber)' : 'var(--green)' }}>{sg.candidate_level} / 10</strong>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${candPct}%`,
                            height: '100%',
                            background: isGap ? 'var(--amber)' : 'var(--green)',
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: 'var(--text-dim)' }}>Company Required</span>
                        <span style={{ color: 'var(--text-dim)' }}>{sg.required_level} / 10</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${reqPct}%`, height: '100%', background: 'var(--blue)', borderRadius: 3 }} />
                      </div>
                    </div>

                    <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {sg.details}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Ready to Run Talent Check
          </h3>
          <p style={{ fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
            Select a company bar above to instantly score the active candidate against the 12-skillset competency framework.
          </p>
        </div>
      )}
    </div>
  )
}
