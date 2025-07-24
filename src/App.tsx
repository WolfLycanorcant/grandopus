import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ResponsiveLayout } from './components/ui/ResponsiveLayout'
import { HomePage } from './pages/HomePage'
import { SquadEditorPage } from './pages/SquadEditorPage'
import { BattlePage } from './pages/BattlePage'
import { Battle3DPage } from './pages/Battle3DPage'
import { OverworldPage } from './pages/OverworldPage'
import { Overworld3DPage } from './pages/Overworld3DPage'
import { UnitsPage } from './pages/UnitsPage'

function App() {
  return (
    <ResponsiveLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/units" element={<UnitsPage />} />
        <Route path="/squads" element={<SquadEditorPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/battle3d" element={<Battle3DPage />} />
        <Route path="/overworld" element={<OverworldPage />} />
        <Route path="/overworld3d" element={<Overworld3DPage />} />
      </Routes>
    </ResponsiveLayout>
  )
}

export default App