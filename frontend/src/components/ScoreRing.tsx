import React from 'react'

interface Props {
  score: number
  verdict?: string
  label?: string
  size?: number
  strokeWidth?: number
}

const VERDICT_COLORS: Record<string, string> = {
  'Strong Match': '#10b981',
  'Ready for Onsite': '#10b981',
  'Partial Match': '#f59e0b',
  'Near Ready (Needs Prep)': '#f59e0b',
  'Near Ready': '#f59e0b',
  'Not Ready': '#ef4444',
  'High Gap': '#ef4444',
}

export function ScoreRing({
  score,
  verdict,
  label = 'Score',
  size = 140,
  strokeWidth = 10,
}: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.max(0, Math.min(100, score))
  const offset = circumference - (clampedScore / 100) * circumference

  let color = '#4f6ef7'
  if (verdict && VERDICT_COLORS[verdict]) {
    color = VERDICT_COLORS[verdict]
  } else if (score >= 80) {
    color = '#10b981'
  } else if (score >= 60) {
    color = '#f59e0b'
  } else {
    color = '#ef4444'
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: size * 0.24,
            fontWeight: 800,
            color,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: size * 0.08,
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: 4,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
