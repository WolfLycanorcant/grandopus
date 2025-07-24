import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Faction } from '../core/overworld/types'
import { AIPersonality, AIDifficulty } from '../core/ai/types'
import { 
  Brain, 
  Play, 
  RotateCcw, 
  Settings, 
  Target,
  Shield,
  Coins,
  Activity,
  Eye,
  Zap
} from 'lucide-react'

export function AITestPanel() {
  const { overworldManager } = useGameStore()
  const [selectedFaction, setSelectedFaction] = useState<Faction>(Faction.ENEMY)
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality>(AIPersonality.AGGRESSIVE)
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>(AIDifficulty.NORMAL)

  const handleInitializeAI = () => {
    if (overworldManager?.aiIntegration) {
      overworldManager.aiIntegration.getAIManager().initializeFaction(
        selectedFaction,
        selectedPersonality,
        selectedDifficulty
      )
      console.log(`Initialized AI ${selectedFaction} with ${selectedPersonality} personality at ${selectedDifficulty} difficulty`)
    }
  }

  const handleForceAITurn = () => {
    if (overworldManager?.aiIntegration) {
      overworldManager.aiIntegration.forceAIAction(selectedFaction)
      console.log(`Forced AI turn for ${selectedFaction}`)
    }
  }

  const handleResetAI = () => {
    if (overworldManager?.aiIntegration) {
      overworldManager.aiIntegration.reset()
      console.log('AI system reset')
    }
  }

  const handlePlayerAction = (actionType: string) => {
    if (overworldManager?.aiIntegration) {
      overworldManager.aiIntegration.handlePlayerAction(actionType, { q: 5, r: 5 }, { test: true })
      console.log(`Triggered AI event: ${actionType}`)
    }
  }

  const getPersonalityIcon = (personality: AIPersonality) => {
    switch (personality) {
      case AIPersonality.AGGRESSIVE: return <Target className="w-4 h-4" />
      case AIPersonality.DEFENSIVE: return <Shield className="w-4 h-4" />
      case AIPersonality.ECONOMIC: return <Coins className="w-4 h-4" />
      case AIPersonality.BALANCED: return <Activity className="w-4 h-4" />
      case AIPersonality.OPPORTUNISTIC: return <Eye className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-white font-medium">
        <Brain className="w-5 h-5 text-purple-400" />
        AI Testing Panel
      </div>

      {/* AI Configuration */}
      <div className="space-y-3">
        <div>
          <label className="block text-slate-300 text-sm mb-1">Faction</label>
          <select
            value={selectedFaction}
            onChange={(e) => setSelectedFaction(e.target.value as Faction)}
            className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
          >
            <option value={Faction.ENEMY}>Enemy</option>
            <option value={Faction.ALLIED}>Allied</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1">Personality</label>
          <select
            value={selectedPersonality}
            onChange={(e) => setSelectedPersonality(e.target.value as AIPersonality)}
            className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
          >
            {Object.values(AIPersonality).map(personality => (
              <option key={personality} value={personality}>
                {personality.charAt(0).toUpperCase() + personality.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 text-sm mb-1">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as AIDifficulty)}
            className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
          >
            {Object.values(AIDifficulty).map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Actions */}
      <div className="space-y-2">
        <button
          onClick={handleInitializeAI}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Initialize AI Faction
        </button>

        <button
          onClick={handleForceAITurn}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Force AI Turn
        </button>

        <button
          onClick={handleResetAI}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset AI System
        </button>
      </div>

      {/* Test Events */}
      <div className="space-y-2">
        <div className="text-slate-300 text-sm font-medium">Test AI Events:</div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePlayerAction('army_moved')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Army Spotted
          </button>
          
          <button
            onClick={() => handlePlayerAction('territory_captured')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Territory Lost
          </button>
          
          <button
            onClick={() => handlePlayerAction('building_constructed')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Building Built
          </button>
          
          <button
            onClick={() => handlePlayerAction('resource_shortage')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Resource Low
          </button>
        </div>
      </div>

      {/* Personality Guide */}
      <div className="space-y-2">
        <div className="text-slate-300 text-sm font-medium">Personality Guide:</div>
        <div className="space-y-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Target className="w-3 h-3 text-red-400" />
            <span>Aggressive: Prioritizes attacks and expansion</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>Defensive: Focuses on fortification</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-3 h-3 text-yellow-400" />
            <span>Economic: Emphasizes resource generation</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-purple-400" />
            <span>Balanced: Mixed strategy approach</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3 text-orange-400" />
            <span>Opportunistic: Exploits weaknesses</span>
          </div>
        </div>
      </div>
    </div>
  )
}