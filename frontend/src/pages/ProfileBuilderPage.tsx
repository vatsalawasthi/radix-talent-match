import React, { useState, useEffect } from 'react'
import { getCurrentProfile, saveProfile, loadProfilePreset } from '../lib/api'
import type { CandidateProfile, SkillItem, CategoryCode } from '../lib/types'
import { CategoryBadge } from '../components/CategoryBadge'

interface Props {
  profile: CandidateProfile | null
  onProfileUpdated: (p: CandidateProfile) => void
  onNavigateToTalentCheck?: () => void
  onNavigateToSkillMatch?: () => void
}

const ALL_CATEGORIES: { code: CategoryCode; name: string }[] = [
  { code: 'COD', name: 'COD - Coding' },
  { code: 'DSA', name: 'DSA - Data Structures & Algorithms' },
  { code: 'OOD', name: 'OOD - Object-Oriented Design' },
  { code: 'APTI', name: 'APTI - Aptitude & Problem Solving' },
  { code: 'COMM', name: 'COMM - Communication' },
  { code: 'AI', name: 'AI - Artificial Intelligence' },
  { code: 'CLOUD', name: 'CLOUD - Cloud Computing' },
  { code: 'SQL', name: 'SQL - SQL & Databases' },
  { code: 'SWE', name: 'SWE - Software Engineering' },
  { code: 'SYSD', name: 'SYSD - System Design' },
  { code: 'NETW', name: 'NETW - Networking' },
  { code: 'OS', name: 'OS - Operating Systems' },
]

export function ProfileBuilderPage({
  profile,
  onProfileUpdated,
  onNavigateToTalentCheck,
  onNavigateToSkillMatch,
}: Props) {
  const [formData, setFormData] = useState<CandidateProfile>({
    name: '',
    email: '',
    education: '',
    skills: [],
    hackathons: [],
    internships: [],
    certifications: [],
    preferred_roles: [],
    cv_file: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // New item inputs
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCat, setNewSkillCat] = useState<CategoryCode>('COD')
  const [newSkillEvidence, setNewSkillEvidence] = useState('')
  const [newSkillConf, setNewSkillConf] = useState<'high' | 'medium' | 'low'>('high')

  const [newHackathon, setNewHackathon] = useState('')
  const [newInternship, setNewInternship] = useState('')
  const [newCert, setNewCert] = useState('')
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    if (profile) {
      setFormData(profile)
    } else {
      getCurrentProfile().then((p) => {
        setFormData(p)
        onProfileUpdated(p)
      })
    }
  }, [profile])

  async function handleSave() {
    setSaving(true)
    setSaveSuccess(false)
    try {
      const updated = await saveProfile(formData)
      setFormData(updated)
      onProfileUpdated(updated)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save profile', err)
    } finally {
      setSaving(false)
    }
  }

  function handleAddSkill() {
    if (!newSkillName.trim()) return
    const newSkill: SkillItem = {
      skill_name: newSkillName.trim(),
      category_code: newSkillCat,
      evidence: newSkillEvidence.trim() || 'Verified in candidate profile',
      confidence: newSkillConf,
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }))
    setNewSkillName('')
    setNewSkillEvidence('')
  }

  function handleRemoveSkill(index: number) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  function exportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2))
    const dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute('href', dataStr)
    dlAnchorElem.setAttribute('download', `${formData.name.toLowerCase().replace(/\s+/g, '_')}_profile.json`)
    dlAnchorElem.click()
  }

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
              MODULE 03
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ROLE 3: PROFILE BUILDER & JSON PERSISTENCE</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Candidate Profile Builder
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 800 }}>
            Curate and enrich candidate technical credentials. Stores verified data in the shared RADIX JSON schema
            consumed by Talent Check (Module 04) and Skill Matching (Module 05).
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={exportJSON}>
            📥 Export JSON
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saveSuccess ? 'var(--green)' : undefined,
            }}
          >
            {saving ? 'Saving...' : saveSuccess ? '✓ Profile Saved!' : '💾 Save Profile'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Left: Basic Info & Experiences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basic Details Card */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
              Basic Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Education & Degree
                </label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Source CV / File Reference
                </label>
                <input
                  type="text"
                  value={formData.cv_file || ''}
                  onChange={(e) => setFormData({ ...formData, cv_file: e.target.value })}
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Internships & Experience */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              💼 Internships & Experience ({formData.internships.length})
            </h3>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Add company, role, or impact..."
                value={newInternship}
                onChange={(e) => setNewInternship(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newInternship.trim()) {
                    setFormData({ ...formData, internships: [...formData.internships, newInternship.trim()] })
                    setNewInternship('')
                  }
                }}
                style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none' }}
              />
              <button
                className="btn-secondary"
                onClick={() => {
                  if (newInternship.trim()) {
                    setFormData({ ...formData, internships: [...formData.internships, newInternship.trim()] })
                    setNewInternship('')
                  }
                }}
                style={{ padding: '6px 12px' }}
              >
                +
              </button>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {formData.internships.map((item, idx) => (
                <li key={idx} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '6px 10px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>• {item}</span>
                  <button onClick={() => setFormData({ ...formData, internships: formData.internships.filter((_, i) => i !== idx) })} style={{ background: 'transparent', color: 'var(--red)', fontSize: 14 }}>✕</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Hackathons & Certifications */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              🏆 Hackathons & Certifications
            </h3>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Add hackathon or certificate..."
                value={newHackathon}
                onChange={(e) => setNewHackathon(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newHackathon.trim()) {
                    setFormData({ ...formData, hackathons: [...formData.hackathons, newHackathon.trim()] })
                    setNewHackathon('')
                  }
                }}
                style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none' }}
              />
              <button
                className="btn-secondary"
                onClick={() => {
                  if (newHackathon.trim()) {
                    setFormData({ ...formData, hackathons: [...formData.hackathons, newHackathon.trim()] })
                    setNewHackathon('')
                  }
                }}
                style={{ padding: '6px 12px' }}
              >
                +
              </button>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {formData.hackathons.map((item, idx) => (
                <li key={idx} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '6px 10px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>• {item}</span>
                  <button onClick={() => setFormData({ ...formData, hackathons: formData.hackathons.filter((_, i) => i !== idx) })} style={{ background: 'transparent', color: 'var(--red)', fontSize: 14 }}>✕</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Skills Inventory (12 RADIX Categories) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Add Skill Form */}
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              + Add Technical Skill to Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Caching, PyTorch, C++"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>RADIX Category</label>
                <select
                  value={newSkillCat}
                  onChange={(e) => setNewSkillCat(e.target.value as CategoryCode)}
                  style={{ width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none', color: 'var(--text)' }}
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Confidence</label>
                <select
                  value={newSkillConf}
                  onChange={(e) => setNewSkillConf(e.target.value as any)}
                  style={{ width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none', color: 'var(--text)' }}
                >
                  <option value="high">High (Production/Built)</option>
                  <option value="medium">Medium (Hands-on)</option>
                  <option value="low">Low (Familiar/Coursework)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="Evidence quote or project reference..."
                value={newSkillEvidence}
                onChange={(e) => setNewSkillEvidence(e.target.value)}
                style={{ flex: 1, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none' }}
              />
              <button className="btn-primary" onClick={handleAddSkill} style={{ padding: '6px 16px', fontSize: 12 }}>
                Add Skill
              </button>
            </div>
          </div>

          {/* Current Skills Grid */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  Skills Inventory ({formData.skills.length})
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  All skills tagged with official 12 RADIX codes and evidence
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {onNavigateToTalentCheck && (
                  <button className="btn-secondary" onClick={onNavigateToTalentCheck} style={{ fontSize: 12 }}>
                    Run Talent Check →
                  </button>
                )}
                {onNavigateToSkillMatch && (
                  <button className="btn-primary" onClick={onNavigateToSkillMatch} style={{ fontSize: 12 }}>
                    Run Skill Match →
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {formData.skills.map((skill, index) => (
                <div
                  key={index}
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
                      {skill.skill_name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CategoryBadge code={skill.category_code} />
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        style={{ background: 'transparent', color: 'var(--red)', fontSize: 14 }}
                        title="Remove skill"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.3 }}>
                    "{skill.evidence}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
