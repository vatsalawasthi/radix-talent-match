import React from 'react'
import type { CategoryCode } from '../lib/types'

const CATEGORY_STYLES: Record<string, { label: string; bg: string; color: string; border: string }> = {
  COD:   { label: 'Coding', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  DSA:   { label: 'Data Structures & Algo', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
  OOD:   { label: 'Object-Oriented Design', bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
  APTI:  { label: 'Aptitude & Problem Solving', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  COMM:  { label: 'Communication', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
  AI:    { label: 'Artificial Intelligence', bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
  CLOUD: { label: 'Cloud Computing', bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
  SQL:   { label: 'SQL & Databases', bg: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', border: 'rgba(20, 184, 166, 0.3)' },
  SWE:   { label: 'Software Engineering', bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' },
  SYSD:  { label: 'System Design', bg: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' },
  NETW:  { label: 'Networking', bg: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
  OS:    { label: 'Operating Systems', bg: 'rgba(217, 70, 239, 0.15)', color: '#e879f9', border: 'rgba(217, 70, 239, 0.3)' },
  OTHER: { label: 'Other', bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' },
}

interface Props {
  code: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function CategoryBadge({ code, showLabel = true, size = 'sm' }: Props) {
  const style = CATEGORY_STYLES[code] || CATEGORY_STYLES.OTHER
  const padding = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize = size === 'sm' ? 11 : 12

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: 6,
        padding,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
      title={`${code}: ${style.label}`}
    >
      <span style={{ opacity: 0.9 }}>{code}</span>
      {showLabel && (
        <span style={{ opacity: 0.75, fontWeight: 500, fontSize: fontSize - 1 }}>
          • {style.label.split(' ')[0]}
        </span>
      )}
    </span>
  )
}
