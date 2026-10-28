import React from 'react'
import {
  RadarChart as ReRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import type { SkillsetGap } from '../lib/types'

interface Props {
  data: SkillsetGap[]
  candidateName?: string
  companyName?: string
}

export function RadarChart({ data, candidateName = 'Candidate', companyName = 'Company Bar' }: Props) {
  const chartData = data.map((item) => ({
    skill: item.category_code,
    fullName: item.category_name,
    Candidate: item.candidate_level,
    Required: item.required_level,
  }))

  return (
    <div style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer>
        <ReRadar data={chartData}>
          <PolarGrid stroke="#28324e" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#838da8', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: '#545e7d', fontSize: 10 }}
          />
          <Radar
            name={companyName}
            dataKey="Required"
            stroke="#4f6ef7"
            fill="#4f6ef7"
            fillOpacity={0.25}
            strokeWidth={1.5}
          />
          <Radar
            name={candidateName}
            dataKey="Candidate"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#838da8', paddingTop: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: '#1c2336',
              border: '1px solid #28324e',
              borderRadius: 8,
              fontSize: 12,
              color: '#f0f3ff',
            }}
            formatter={(value: any, name: string) => [`${value} / 10`, name]}
            labelFormatter={(label: string) => {
              const item = data.find((d) => d.category_code === label)
              return item ? `${label} — ${item.category_name}` : label
            }}
          />
        </ReRadar>
      </ResponsiveContainer>
    </div>
  )
}
