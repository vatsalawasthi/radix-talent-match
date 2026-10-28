import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { MilestoneModal } from './components/MilestoneModal'
import { IntegratedFlowPage } from './pages/IntegratedFlowPage'
import { JDAnalyticsPage } from './pages/JDAnalyticsPage'
import { ResumeParsingPage } from './pages/ResumeParsingPage'
import { ProfileBuilderPage } from './pages/ProfileBuilderPage'
import { TalentCheckPage } from './pages/TalentCheckPage'
import { SkillMatchingPage } from './pages/SkillMatchingPage'
import { getCurrentProfile, loadProfilePreset } from './lib/api'
import type { CandidateProfile, ExtractedSkillList } from './lib/types'

export function App() {
  const [activeTab, setActiveTab] = useState<string>('flow')
  const [activeCandidate, setActiveCandidate] = useState<CandidateProfile | null>(null)
  const [activeJD, setActiveJD] = useState<ExtractedSkillList | null>(null)
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false)

  useEffect(() => {
    getCurrentProfile()
      .then((p) => setActiveCandidate(p))
      .catch((err) => console.error('Failed to load profile', err))
  }, [])

  async function handleSwitchCandidate(presetId: string) {
    try {
      const updated = await loadProfilePreset(presetId)
      setActiveCandidate(updated)
    } catch (e) {
      console.error('Failed to load candidate preset', e)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCandidate={activeCandidate}
        onSwitchCandidate={handleSwitchCandidate}
        onOpenMilestones={() => setIsMilestonesOpen(true)}
      />

      <main style={{ flex: 1, paddingBottom: 48 }}>
        {activeTab === 'flow' && <IntegratedFlowPage />}

        {activeTab === '01' && (
          <JDAnalyticsPage
            onSendToMatch={(jd) => {
              setActiveJD(jd)
              setActiveTab('05')
            }}
          />
        )}

        {activeTab === '02' && (
          <ResumeParsingPage
            onPreFillProfile={(p) => {
              setActiveCandidate(p)
              setActiveTab('03')
            }}
          />
        )}

        {activeTab === '03' && (
          <ProfileBuilderPage
            profile={activeCandidate}
            onProfileUpdated={setActiveCandidate}
            onNavigateToTalentCheck={() => setActiveTab('04')}
            onNavigateToSkillMatch={() => setActiveTab('05')}
          />
        )}

        {activeTab === '04' && (
          <TalentCheckPage
            activeProfile={activeCandidate}
            onSwitchCandidate={handleSwitchCandidate}
            onNavigateToSkillMatch={() => setActiveTab('05')}
          />
        )}

        {activeTab === '05' && (
          <SkillMatchingPage
            activeProfile={activeCandidate}
            activeJD={activeJD}
            onSwitchCandidate={handleSwitchCandidate}
            onNavigateToJDAnalytics={() => setActiveTab('01')}
          />
        )}
      </main>

      {/* Scrum Master Milestone Modal */}
      <MilestoneModal
        isOpen={isMilestonesOpen}
        onClose={() => setIsMilestonesOpen(false)}
      />
    </div>
  )
}

export default App
