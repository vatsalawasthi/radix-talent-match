import React, { useState, useEffect } from 'react'
import { getMilestones, updateMilestoneStatus } from '../lib/api'
import type { Milestone } from '../lib/types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  Done: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', label: 'Done' },
  'In Progress': { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', label: 'In Progress' },
  Blocked: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', label: 'Blocked' },
  'Not Started': { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', label: 'Not Started' },
}

export function MilestoneModal({ isOpen, onClose }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  async function loadData() {
    setLoading(true)
    try {
      const res = await getMilestones()
      setMilestones(res.milestones)
      setSummary(res.summary)
    } catch (e) {
      console.error('Failed to load milestones', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateMilestoneStatus(id, newStatus)
      setMilestones((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus as any } : m))
      )
      loadData()
    } catch (e) {
      console.error('Failed to update status', e)
    }
  }

  if (!isOpen) return null

  const doneCount = summary['Done'] || 0
  const total = milestones.length || 1
  const percent = Math.round((doneCount / total) * 100)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          maxWidth: 720,
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Scrum Master Milestone Tracker
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'var(--blue-dim)',
                  color: 'var(--blue)',
                  padding: '2px 8px',
                  borderRadius: 12,
                }}
              >
                RADIX 2026
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Definition of Done tracking across all 5 roles and Scrum Master integration milestones.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: 22,
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress Bar Header */}
        <div style={{ padding: '16px 24px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
            <span>Hackathon Progress</span>
            <span style={{ color: 'var(--green)' }}>{doneCount} of {total} Milestones Complete ({percent}%)</span>
          </div>
          <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4f6ef7, #10b981)',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Milestones List */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {milestones.map((m) => {
            const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG['Not Started']
            return (
              <div
                key={m.id}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>{m.role}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>• Owner: {m.owner}</span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {m.title}
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {m.description}
                  </p>
                </div>

                <div>
                  <select
                    value={m.status}
                    onChange={(e) => handleStatusChange(m.id, e.target.value)}
                    style={{
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.color}44`,
                      borderRadius: 8,
                      padding: '5px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Done">✓ Done</option>
                    <option value="In Progress">⏳ In Progress</option>
                    <option value="Blocked">⚠️ Blocked</option>
                    <option value="Not Started">⚪ Not Started</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button className="btn-secondary" onClick={onClose}>
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  )
}
