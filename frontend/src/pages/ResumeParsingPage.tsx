import React, { useState, useEffect } from 'react'
import { getSampleCandidates, parseResume, prefillProfileFromResume } from '../lib/api'
import type { ResumeParseResult, SampleCandidate, CandidateProfile } from '../lib/types'
import { UploadZone } from '../components/UploadZone'
import { CategoryBadge } from '../components/CategoryBadge'

interface Props {
  onPreFillProfile?: (profile: CandidateProfile) => void
}

export function ResumeParsingPage({ onPreFillProfile }: Props) {
  const [candidates, setCandidates] = useState<SampleCandidate[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResumeParseResult | null>(null)
  const [prefilled, setPrefilled] = useState(false)

  useEffect(() => {
    getSampleCandidates().then((cands) => {
      setCandidates(cands)
      if (cands.length > 0) {
        handlePresetSelect(cands[0].id, cands)
      }
    })
  }, [])

  function handlePresetSelect(id: string, candsList: SampleCandidate[] = candidates) {
    setSelectedPresetId(id)
    const match = candsList.find((c) => c.id === id)
    if (match) {
      setPastedText(match.raw_resume_text)
      setSelectedFile(null)
      setPrefilled(false)
    }
  }

  async function handleParse() {
    setLoading(true)
    setError(null)
    setPrefilled(false)
    try {
      const data = await parseResume({
        file: selectedFile,
        text: pastedText,
        presetId: selectedPresetId || undefined,
      })
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to parse resume.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePrefill() {
    if (!result) return
    try {
      const savedProfile = await prefillProfileFromResume(result)
      setPrefilled(true)
      if (onPreFillProfile) {
        onPreFillProfile(savedProfile)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const presets = candidates.map((c) => ({
    id: c.id,
    title: c.name,
    subtitle: c.archetype,
  }))

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span className="badge" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>
            MODULE 02
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ROLE 2: RESUME PARSING & SIGNAL EXTRACTION</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Candidate Resume Parsing
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 800 }}>
          Ingest unstructured resumes and extract technical evidence across the 12 RADIX categories,
          reliable candidate metadata, education, and internship history.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Left Input */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <UploadZone
            label="Upload Candidate Resume"
            description="Upload PDF/DOCX or pick one of the 4 benchmark candidates"
            presets={presets}
            onFileSelect={(f) => { setSelectedFile(f); setSelectedPresetId('') }}
            onTextChange={(t) => { setPastedText(t); setSelectedPresetId('') }}
            onPresetSelect={(id) => handlePresetSelect(id)}
          />

          {error && (
            <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleParse}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}
          >
            {loading ? '⟳ Parsing Resume Signal...' : '⚡ Parse Candidate Resume'}
          </button>
        </div>

        {/* Right Output */}
        <div>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Profile Overview Card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
                      {result.name}
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {result.email} • {result.education}
                    </p>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={handlePrefill}
                    style={{
                      background: prefilled ? 'var(--green)' : 'linear-gradient(135deg, #4f6ef7, #8b5cf6)',
                      fontSize: 13,
                      padding: '8px 14px',
                    }}
                  >
                    {prefilled ? '✓ Profile Pre-filled!' : '→ Send to Profile Builder (Mod 03)'}
                  </button>
                </div>

                {/* Preferred roles */}
                {result.preferred_roles.length > 0 && (
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>Detected Roles:</span>
                    {result.preferred_roles.map((r, i) => (
                      <span key={i} className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Internships & Projects summary */}
              {(result.internships.length > 0 || result.projects.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="card" style={{ padding: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 8 }}>
                      💼 Experience & Internships
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {result.internships.map((exp, i) => (
                        <li key={i} style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          • {exp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card" style={{ padding: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)', marginBottom: 8 }}>
                      🏆 Projects & Hackathons
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {result.projects.map((proj, i) => (
                        <li key={i} style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          • {proj}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Extracted Skills List */}
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                  Extracted Technical Skills ({result.skills.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                  {result.skills.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          {s.skill_name}
                        </span>
                        <CategoryBadge code={s.category_code} />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.3 }}>
                        "{s.evidence}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Ready to Parse Candidate Resume
              </h3>
              <p style={{ fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
                Select one of the 4 benchmark candidates or upload an arbitrary resume to extract skills into the shared JSON contract.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
