import React, { useRef, useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import BattleCanvas, { BattleCanvasHandle } from '../components/BattleCanvas'
import { BattlePhase } from '../core/battle/types'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Camera, 
  Volume2, 
  Settings,
  ArrowLeft,
  FastForward
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function Battle3DPage() {
  const canvasRef = useRef<BattleCanvasHandle>(null)
  const [cameraAngle, setCameraAngle] = useState<'overview' | 'close' | 'side'>('overview')
  const [isPlaying, setIsPlaying] = useState(false)
  const [battleSpeed, setBattleSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)

  const {
    squads,
    currentBattle,
    battleResult,
    battleLog,
    startBattle,
    executeBattle,
    clearBattle,
    error
  } = useGameStore()

  // Initialize battle when squads are available
  useEffect(() => {
    if (squads.length >= 2 && !currentBattle && !battleResult) {
      // Auto-start battle with first two squads for demo
      startBattle(squads[0], squads[1])
    }
  }, [squads, currentBattle, battleResult, startBattle])

  // Setup 3D scene when battle starts
  useEffect(() => {
    if (currentBattle && canvasRef.current) {
      const battle = currentBattle.getBattleState()
      canvasRef.current.setupBattle(battle.attackingSquad, battle.defendingSquad)
    }
  }, [currentBattle])

  // Handle battle log updates for animations
  useEffect(() => {
    if (battleLog.length > 0 && canvasRef.current) {
      const lastLogEntry = battleLog[battleLog.length - 1]
      
      if (lastLogEntry.type === 'attack' && lastLogEntry.details) {
        const { attackerId, targetId, damage } = lastLogEntry.details
        canvasRef.current.animateAttack(attackerId, targetId, damage)
        
        // Update health bars
        setTimeout(() => {
          if (canvasRef.current && lastLogEntry.details?.targetId) {
            // This would need to get the actual unit's current HP
            // For now, we'll simulate it
            canvasRef.current.updateUnitHealth(lastLogEntry.details.targetId, 50, 100)
          }
        }, 500)
      }
    }
  }, [battleLog])

  // Handle battle completion
  useEffect(() => {
    if (battleResult && canvasRef.current) {
      canvasRef.current.playVictoryAnimation(battleResult.winner)
    }
  }, [battleResult])

  const handleExecuteBattle = () => {
    setIsPlaying(true)
    executeBattle()
    
    // Stop playing animation after battle completes
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }

  const handleCameraChange = (angle: 'overview' | 'close' | 'side') => {
    setCameraAngle(angle)
    canvasRef.current?.setCameraAngle(angle)
  }

  const handleNewBattle = () => {
    clearBattle()
    setIsPlaying(false)
  }

  const getBattlePhaseText = () => {
    if (!currentBattle) return 'No Battle'
    
    const state = currentBattle.getBattleState()
    switch (state.phase) {
      case BattlePhase.SETUP: return 'Battle Setup'
      case BattlePhase.ATTACK: return 'Attack Phase'
      case BattlePhase.COUNTER: return 'Counter Phase'
      case BattlePhase.COMPLETE: return 'Battle Complete'
      default: return 'Unknown Phase'
    }
  }

  if (squads.length < 2) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need More Squads</h2>
          <p className="text-slate-400 mb-6">You need at least 2 squads to start a 3D battle.</p>
          <Link 
            to="/squads" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Squads
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 3D Battle Canvas */}
      <BattleCanvas ref={canvasRef} />

      {/* Top UI Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/battle" 
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to 2D Battle</span>
            </Link>
            
            <div className="text-white">
              <h1 className="text-xl font-bold">3D Battle Arena</h1>
              <p className="text-sm text-slate-400">{getBattlePhaseText()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute top-20 right-4 z-20 bg-slate-800/90 rounded-lg p-3">
        <h3 className="text-white text-sm font-medium mb-2 flex items-center">
          <Camera className="h-4 w-4 mr-2" />
          Camera
        </h3>
        <div className="space-y-2">
          {(['overview', 'close', 'side'] as const).map((angle) => (
            <button
              key={angle}
              onClick={() => handleCameraChange(angle)}
              className={`w-full px-3 py-1 text-sm rounded transition-colors ${
                cameraAngle === angle
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {angle.charAt(0).toUpperCase() + angle.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Battle Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-slate-800/90 rounded-lg p-4 flex items-center space-x-4">
          {!currentBattle && !battleResult && (
            <div className="text-center">
              <p className="text-slate-400 mb-2">Select squads to battle</p>
              <div className="flex space-x-2">
                {squads.slice(0, 2).map((squad, index) => (
                  <div key={squad.id} className="text-sm">
                    <span className={index === 0 ? 'text-blue-400' : 'text-red-400'}>
                      {squad.name}
                    </span>
                    <span className="text-slate-500 ml-2">
                      ({squad.getUnits().length} units)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentBattle && !battleResult && (
            <button
              onClick={handleExecuteBattle}
              disabled={isPlaying}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isPlaying
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" />
                  <span>Battle in Progress...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Execute Battle</span>
                </>
              )}
            </button>
          )}

          {battleResult && (
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-white font-medium">
                  🎉 {battleResult.winner.name} Wins!
                </p>
                <p className="text-sm text-slate-400">
                  Battle completed in {battleResult.totalRounds} rounds
                </p>
              </div>
              
              <button
                onClick={handleNewBattle}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>New Battle</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Battle Log Sidebar */}
      <div className="absolute top-20 left-4 bottom-20 z-20 w-80 bg-slate-800/90 rounded-lg p-4 overflow-hidden">
        <h3 className="text-white font-medium mb-3 flex items-center">
          <Volume2 className="h-4 w-4 mr-2" />
          Battle Log
        </h3>
        
        <div className="h-full overflow-y-auto space-y-2">
          {battleLog.length === 0 ? (
            <p className="text-slate-500 text-sm">Battle log will appear here...</p>
          ) : (
            battleLog.slice(-20).map((entry, index) => (
              <div
                key={index}
                className={`text-sm p-2 rounded ${
                  entry.type === 'attack' ? 'bg-red-900/30 text-red-300' :
                  entry.type === 'info' ? 'bg-blue-900/30 text-blue-300' :
                  'bg-slate-700/50 text-slate-300'
                }`}
              >
                <span className="text-xs text-slate-500">
                  [{entry.timestamp.toLocaleTimeString()}]
                </span>
                <br />
                {entry.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-medium">3D Battle Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Battle Speed
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">Slow</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={battleSpeed}
                    onChange={(e) => setBattleSpeed(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-slate-400 text-sm">Fast</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  Current: {battleSpeed}x speed
                </p>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Graphics Quality
                </label>
                <select className="w-full bg-slate-700 text-white rounded px-3 py-2">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Damage Numbers</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Auto-Execute Battles</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 right-4 z-20 bg-red-900/90 text-red-300 p-4 rounded-lg max-w-sm">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}