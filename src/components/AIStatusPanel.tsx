import React, { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Faction } from '../core/overworld/types'
import { 
  Brain, 
  Target, 
  Shield, 
  Coins, 
  Users, 
  Map, 
  AlertTriangle,
  Eye,
  Zap,
  TrendingUp,
  Activity,
  Info
} from 'lucide-react'

interface AIStatusPanelProps {
  faction: Faction
  onForceAction?: () => void
}

export function AIStatusPanel({ faction, onForceAction }: AIStatusPanelProps) {
  const { overworldManager } = useGameStore()
  const [aiStatus, setAiStatus] = useState<{
    personality: string
    difficulty: string
    threatLevel: number
    territoryCount: number
    armyCount: number
    lastAction: string
  } | null>(null)
  
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (overworldManager?.aiIntegration) {
      const status = overworldManager.aiIntegration.getAIStatus(faction)
      setAiStatus(status)
    }
  }, [overworldManager, faction])

  if (!aiStatus) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-center">
          AI faction not initialized
        </div>
      </div>
    )
  }

  const getThreatLevelColor = (level: number) => {
    if (level < 30) return 'text-green-400'
    if (level < 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPersonalityIcon = (personality: string) => {
    switch (personality.toLowerCase()) {
      case 'aggressive': return <Target className="w-4 h-4 text-red-400" />
      case 'defensive': return <Shield className="w-4 h-4 text-blue-400" />
      case 'economic': return <Coins className="w-4 h-4 text-yellow-400" />
      case 'balanced': return <Activity className="w-4 h-4 text-purple-400" />
      case 'opportunistic': return <Eye className="w-4 h-4 text-orange-400" />
      default: return <Brain className="w-4 h-4 text-gray-400" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400'
      case 'normal': return 'text-blue-400'
      case 'hard': return 'text-orange-400'
      case 'expert': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium">AI {faction.toUpperCase()}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Basic Status */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getPersonalityIcon(aiStatus.personality)}
            <span className="text-slate-300">Personality:</span>
          </div>
          <div className="text-white capitalize ml-6">
            {aiStatus.personality}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Difficulty:</span>
          </div>
          <div className={`capitalize ml-6 ${getDifficultyColor(aiStatus.difficulty)}`}>
            {aiStatus.difficulty}
          </div>
        </div>
      </div>

      {/* Threat Level */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-slate-300 text-sm">Threat Level:</span>
          </div>
          <span className={`text-sm font-medium ${getThreatLevelColor(aiStatus.threatLevel)}`}>
            {aiStatus.threatLevel}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              aiStatus.threatLevel < 30 ? 'bg-green-400' :
              aiStatus.threatLevel < 60 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.min(100, aiStatus.threatLevel)}%` }}
          />
        </div>
      </div>

      {/* Assets Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">Territory:</span>
          </div>
          <span className="text-white">{aiStatus.territoryCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Armies:</span>
          </div>
          <span className="text-white">{aiStatus.armyCount}</span>
        </div>
      </div>

      {/* Last Action */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-slate-300 text-sm">Last Action:</span>
        </div>
        <div className="text-white text-sm bg-slate-700 rounded p-2">
          {aiStatus.lastAction}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-slate-600">
          <div className="text-sm space-y-2">
            <h4 className="text-white font-medium">AI Behavior Analysis</h4>
            
            <div className="space-y-1 text-slate-300">
              <div>• Personality drives strategic priorities</div>
              <div>• Difficulty affects planning depth and reaction speed</div>
              <div>• Threat level influences defensive vs offensive actions</div>
              <div>• Territory and army counts determine expansion capability</div>
            </div>
          </div>

          <div className="text-sm space-y-2">
            <h4 className="text-white font-medium">Strategic Tendencies</h4>
            
            <div className="space-y-1 text-slate-300">
              {aiStatus.personality === 'aggressive' && (
                <>
                  <div>• Prioritizes military expansion</div>
                  <div>• Attacks with lower advantage thresholds</div>
                  <div>• Takes higher risks for territorial gains</div>
                </>
              )}
              
              {aiStatus.personality === 'defensive' && (
                <>
                  <div>• Focuses on fortification and protection</div>
                  <div>• Builds defensive structures first</div>
                  <div>• Requires significant advantage to attack</div>
                </>
              )}
              
              {aiStatus.personality === 'economic' && (
                <>
                  <div>• Emphasizes resource generation</div>
                  <div>• Builds economic structures first</div>
                  <div>• Avoids costly military conflicts</div>
                </>
              )}
              
              {aiStatus.personality === 'balanced' && (
                <>
                  <div>• Mixed military and economic strategy</div>
                  <div>• Adapts to current situation</div>
                  <div>• Moderate risk tolerance</div>
                </>
              )}
              
              {aiStatus.personality === 'opportunistic' && (
                <>
                  <div>• Exploits weaknesses quickly</div>
                  <div>• Changes strategy based on opportunities</div>
                  <div>• Fast reaction to threats and openings</div>
                </>
              )}
            </div>
          </div>

          {/* Force Action Button (for testing) */}
          {onForceAction && (
            <button
              onClick={onForceAction}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Force AI Action
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * AI Overview Panel - Shows all AI factions
 */
export function AIOverviewPanel() {
  const { overworldManager } = useGameStore()
  const [aiFactions, setAiFactions] = useState<Faction[]>([])

  useEffect(() => {
    // Detect active AI factions
    if (overworldManager) {
      const state = overworldManager.getState()
      const activeFactions = new Set<Faction>()
      
      state.tiles.forEach(tile => {
        if (tile.controlledBy !== Faction.NEUTRAL && tile.controlledBy !== Faction.PLAYER) {
          activeFactions.add(tile.controlledBy)
        }
        if (tile.army && tile.army.faction !== Faction.PLAYER) {
          activeFactions.add(tile.army.faction)
        }
      })
      
      setAiFactions(Array.from(activeFactions))
    }
  }, [overworldManager])

  const handleForceAIAction = (faction: Faction) => {
    if (overworldManager?.aiIntegration) {
      overworldManager.aiIntegration.forceAIAction(faction)
    }
  }

  if (aiFactions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Brain className="w-5 h-5" />
          <span>No AI factions active</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white font-medium">
        <Brain className="w-5 h-5 text-purple-400" />
        AI Factions
      </div>
      
      {aiFactions.map(faction => (
        <AIStatusPanel
          key={faction}
          faction={faction}
          onForceAction={() => handleForceAIAction(faction)}
        />
      ))}
    </div>
  )
}