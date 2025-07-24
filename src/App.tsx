import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { SquadEditorPage } from './pages/SquadEditorPage'
import { BattlePage } from './pages/BattlePage'
import { UnitsPage } from './pages/UnitsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/squads" element={<SquadEditorPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/units" element={<UnitsPage />} />
      </Routes>
    </Layout>
  )
}

export default App