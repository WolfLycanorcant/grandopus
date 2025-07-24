import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ResponsiveLayout } from './components/ui/ResponsiveLayout'
import { SettingsProvider, useSettings } from './contexts/SettingsContext'
import { HomePage } from './pages/HomePage'
import { SquadEditorPage } from './pages/SquadEditorPage'
import { BattlePage } from './pages/BattlePage'
import { Battle3DPage } from './pages/Battle3DPage'
import { OverworldPage } from './pages/OverworldPage'
import { Overworld3DPage } from './pages/Overworld3DPage'
import { UnitsPage } from './pages/UnitsPage'
import { CampaignPage } from './pages/CampaignPage'
import { RecruitmentPage } from './pages/RecruitmentPage'
import { StorePage } from './pages/StorePage'

function AppRoutes() {
  const { settingsState } = useSettings()

  return (
    <ResponsiveLayout>
      <Routes>
        {/* Conditionally render home route based on settings */}
        {settingsState.settings.showHomeTab && (
          <Route path="/" element={<HomePage />} />
        )}
        
        {/* Default route when home is hidden - redirect to recruitment */}
        {!settingsState.settings.showHomeTab && (
          <Route path="/" element={<RecruitmentPage />} />
        )}
        
        <Route path="/units" element={<UnitsPage />} />
        <Route path="/squads" element={<SquadEditorPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/battle3d" element={<Battle3DPage />} />
        <Route path="/overworld" element={<OverworldPage />} />
        <Route path="/overworld3d" element={<Overworld3DPage />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/store" element={<StorePage />} />
        
        {/* Hidden home route accessible via direct URL when developer mode is unlocked */}
        {settingsState.settings.showHomeTab && (
          <Route path="/home" element={<HomePage />} />
        )}
      </Routes>
    </ResponsiveLayout>
  )
}

function App() {
  return (
    <SettingsProvider>
      <AppRoutes />
    </SettingsProvider>
  )
}

export default App