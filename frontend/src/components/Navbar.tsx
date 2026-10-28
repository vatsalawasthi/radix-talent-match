import React, { useState, useEffect } from 'react'
import type { CandidateProfile } from '../lib/types'
import { getDBStatus } from '../lib/api'

interface Props {
  activeTab: string
  setActiveTab: (tab: string) => void
  activeCandidate: CandidateProfile | null
  onSwitchCandidate: (presetId: string) => void
  onOpenMilestones: () => void
}

const TABS = [
  { id: 'flow', label: '⚡ Integrated Flow', badge: '5-Step Pipeline' },
  { id: '01', label: '01 JD Analytics', badge: 'Role 1' },
  { id: '02', label: '02 Resume Parsing', badge: 'Role 2' },
  { id: '03', label: '03 Profile Builder', badge: 'Role 3' },
  { id: '04', label: '04 Talent Check', badge: 'Role 4' },
  { id: '05', label: '05 Skill Matching', badge: 'Role 5' },
]

export function Navbar({
  activeTab,
  setActiveTab,
  activeCandidate,
  onSwitchCandidate,
  onOpenMilestones,
}: Props) {
  const [dbInfo, setDbInfo] = useState<{ database: string; connected: boolean }>({
    database: 'MongoDB Ready',
    connected: false,
  })

  useEffect(() => {
    getDBStatus()
      .then((res) => {
        setDbInfo({
          database: res.database.includes('MongoDB') ? 'MongoDB' : res.database,
          connected: res.connected,
        })
      })
      .catch(() => {})
  }, [])

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(20, 25, 38, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          gap: 16,
        }}
      >
        {/* Brand */}
        <div
          onClick={() => setActiveTab('flow')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4f6ef7, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 4px 12px rgba(79, 110, 247, 0.3)',
            }}
          >
            R
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: '#fff' }}>
                RADIX
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                Talent Match
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
              12-SKILLSET FRAMEWORK
            </div>
          </div>
        </div>

        {/* Modules Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--surface-2)',
            padding: 4,
            borderRadius: 10,
            border: '1px solid var(--border)',
            overflowX: 'auto',
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const isFlow = tab.id === 'flow'
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  background: isActive
                    ? isFlow
                      ? 'linear-gradient(135deg, #4f6ef7, #8b5cf6)'
                      : 'var(--surface-3)'
                    : 'transparent',
                  border: isActive && !isFlow ? '1px solid var(--border)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Right Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* DB Indicator badge */}
          <span
            className="badge"
            style={{
              background: dbInfo.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: dbInfo.connected ? '#34d399' : '#60a5fa',
              border: `1px solid ${dbInfo.connected ? '#10b98144' : '#3b82f644'}`,
            }}
            title="Database Layer: MongoDB with Local Fallback Store"
          >
            🍃 {dbInfo.connected ? 'MongoDB Live' : 'MongoDB Ready'}
          </span>

          {/* Candidate Switcher Dropdown */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '4px 10px',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>CANDIDATE:</span>
            <select
              value={activeCandidate?.name ? '' : 'ananya-rao'}
              onChange={(e) => onSwitchCandidate(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--green)',
                fontSize: 12,
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>
                {activeCandidate ? activeCandidate.name : 'Select Candidate'}
              </option>
              <option value="ananya-rao">Ananya Rao (Systems SWE)</option>
              <option value="karthik-subramaniam">Karthik Subramaniam (Data/AI)</option>
              <option value="priya-menon">Priya Menon (Support/OFSS)</option>
              <option value="rohan-verma">Rohan Verma (All-Rounder)</option>
            </select>
          </div>

          {/* Scrum Master Milestones Button */}
          <button
            onClick={onOpenMilestones}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title="Open Scrum Master Milestone Tracker"
          >
            <span>📋</span>
            <span>Milestones</span>
          </button>
        </div>
      </div>
    </header>
  )
}
