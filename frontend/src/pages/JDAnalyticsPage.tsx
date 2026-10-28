import React, { useState, useEffect } from 'react'
import { getSampleJDs, analyzeJD } from '../lib/api'
import type { ExtractedSkillList, SampleJD } from '../lib/types'
import { UploadZone } from '../components/UploadZone'
import { CategoryBadge } from '../components/CategoryBadge'

interface Props {
  onSendToMatch?: (jd: ExtractedSkillList) => void
}

export function JDAnalyticsPage({ onSendToMatch }: Props) {
  const [sampleJDs, setSampleJDs] = useState<SampleJD[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ExtractedSkillList | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('ALL')

  useEffect(() => {
    getSampleJDs().then((jds) => {
      setSampleJDs(jds)
      if (jds.length > 0) {
        // Pre-select first sample for instant demo
        handlePresetSelect(jds[0].id, jds)
      }
    })
  }, [])

  function handlePresetSelect(id: string, jdsList: SampleJD[] = sampleJDs) {
    setSelectedPresetId(id)
    const match = jdsList.find((j) => j.id === id)
    if (match) {
      setCompany(match.company)
      setRole(match.role)
      setPastedText(match.raw_text)
      setSelectedFile(null)
    }
  }

  async function handleAnalyze(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeJD({
        file: selectedFile,
        text: pastedText,
        presetId: selectedPresetId || undefined,
        company,
        role,
      })
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to analyze JD. Ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const presets = sampleJDs.map((j) => ({
    id: j.id,
    title: `${j.company} - ${j.role}`,
    subtitle: j.location,
  }))

  const displayedSkills = result?.skills.filter(
    (s) => filterCategory === 'ALL' || s.category_code === filterCategory
  ) || []

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
            MODULE 01
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ROLE 1: LLM & NLP EXTRACTION</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Job Description Analytics
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 800 }}>
          Extract structured skills across the 12 RADIX categories from job descriptions.
          Analyzes key responsibilities and qualifications to yield exact quotes and confidence ratings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Input Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <UploadZone
            label="Input Job Description"
            description="Upload JD file or pick one of the 6 hackathon real JDs"
            presets={presets}
            onFileSelect={(f) => { setSelectedFile(f); setSelectedPresetId('') }}
            onTextChange={(t) => { setPastedText(t); setSelectedPresetId('') }}
            onPresetSelect={(id) => handlePresetSelect(id)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google LLC"
                style={{
                  width: '100%',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Role Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                style={{
                  width: '100%',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={() => handleAnalyze()}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}
          >
            {loading ? '⟳ Analyzing across 12 skillsets...' : '⚡ Extract Structured Skills'}
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Header card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {result.company}
                    </span>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
                      {result.role}
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Source: {result.source_file} • {result.skills.length} skills identified
                    </p>
                  </div>

                  {onSendToMatch && (
                    <button
                      className="btn-primary"
                      onClick={() => onSendToMatch(result)}
                      style={{ fontSize: 13, padding: '8px 14px' }}
                    >
                      Use in Skill Matching →
                    </button>
                  )}
                </div>

                {/* Category distribution filters */}
                {result.category_distribution && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setFilterCategory('ALL')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: filterCategory === 'ALL' ? 'var(--blue)' : 'var(--surface-2)',
                        color: filterCategory === 'ALL' ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      All ({result.skills.length})
                    </button>
                    {Object.entries(result.category_distribution).map(([cat, count]) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          background: filterCategory === cat ? 'var(--blue)' : 'var(--surface-2)',
                          color: filterCategory === cat ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {cat} ({count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {displayedSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 8,
                      background: 'var(--surface-2)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                        {skill.skill_name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CategoryBadge code={skill.category_code} />
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background:
                              skill.confidence === 'high'
                                ? 'var(--green-dim)'
                                : skill.confidence === 'medium'
                                ? 'var(--amber-dim)'
                                : 'var(--surface-3)',
                            color:
                              skill.confidence === 'high'
                                ? 'var(--green)'
                                : skill.confidence === 'medium'
                                ? 'var(--amber)'
                                : 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {skill.confidence}
                        </span>
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        background: 'var(--surface)',
                        padding: '6px 10px',
                        borderRadius: 6,
                        borderLeft: '3px solid var(--border)',
                        lineHeight: 1.4,
                      }}
                    >
                      "{skill.evidence}"
                    </p>
                  </div>
                ))}
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
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Ready to Analyze Job Description
              </h3>
              <p style={{ fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
                Select one of the 6 real hackathon job postings or upload your own to extract requirements across the 12 RADIX categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
