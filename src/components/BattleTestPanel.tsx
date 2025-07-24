import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Play, RotateCcw, Eye, Users, Sword } from 'lucide-react'

/**
 * Battle Test Panel - Test the new battle system
 */
export function BattleTestPanel() {
  const {
    squads,
    battleManager,
    currentBattle,
    battleResult,
    battleLog,
    startBattle,
    executeBattle,
    clearBattle,
    error
  } = useGameStore()

  const [selectedAttacker, setSelectedAttacker] = useState<string>('')
  const [selectedDefender, setSelectedDefender] = useState<string>('')
  const [battleInProgress, setBattleInProgress] = useState(false)

  const handleStartBattle = () => {
    const attacker = squads.find(s => s.id === selectedAttacker)
    const defender = squads.find(s => s.id === selectedDefender)

    if (!attacker || !defender) {
      alert('Please select both attacking and defending squads')
      return
    }

    if (attacker.id === defender.id) {
      alert('Cannot battle the same squad against itself')
      return
    }

    startBattle(attacker, defender)
  }

  const handleExecuteBattle = async () => {
    setBattleInProgress(true)
    try {
      await executeBattle()
    } finally {
      setBattleInProgress(false)
    }
  }

  const handleNewBattle = () => {
    clearBattle()
    setSelectedAttacker('')
    setSelectedDefender('')
  }

  const availableSquads = squads.filter(squad => squad.getUnits().length > 0)

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Sword className="h-6 w-6 mr-2" />
          Battle System Test
        </h2>
      </div>

      <div className="card-body space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Squad Selection */}
        {!currentBattle && !battleResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Attacking Squad
              </label>
              <select
                value={selectedAttacker}
                onChange={(e) => setSelectedAttacker(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select attacking squad...</option>
                {availableSquads.map(squad => (
                  <option key={squad.id} value={squad.id}>
                    {squad.name} ({squad.getUnits().length} units)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Defending Squad
              </label>
              <select
                value={selectedDefender}
                onChange={(e) => setSelectedDefender(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select defending squad...</option>
                {availableSquads.map(squad => (
                  <option key={squad.id} value={squad.id}>
                    {squad.name} ({squad.getUnits().length} units)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Battle Controls */}
        <div className="flex justify-center space-x-4">
          {!currentBattle && !battleResult && (
            <button
              onClick={handleStartBattle}
              disabled={!selectedAttacker || !selectedDefender}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Battle
            </button>
          )}

          {currentBattle && !battleResult && (
            <button
              onClick={handleExecuteBattle}
              disabled={battleInProgress}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              {battleInProgress ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Executing Battle...
                </>
              ) : (
                <>
                  <Sword className="h-4 w-4 mr-2" />
                  Execute Battle
                </>
              )}
            </button>
          )}

          {battleResult && (
            <button
              onClick={handleNewBattle}
              className="btn-outline flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Battle
            </button>
          )}
        </div>

        {/* Battle Status */}
        {currentBattle && (
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Battle in Progress
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-blue-400 font-medium">{currentBattle.attackingSquad.name}</div>
                <div className="text-slate-400">Attacking</div>
                <div className="text-white text-lg">
                  {currentBattle.attackingSquad.getUnits().filter(u => u.currentHp > 0).length} / {currentBattle.attackingSquad.getUnits().length}
                </div>
                <div className="text-xs text-slate-500">Units Alive</div>
              </div>
              
              <div className="text-center">
                <div className="text-red-400 font-medium">{currentBattle.defendingSquad.name}</div>
                <div className="text-slate-400">Defending</div>
                <div className="text-white text-lg">
                  {currentBattle.defendingSquad.getUnits().filter(u => u.currentHp > 0).length} / {currentBattle.defendingSquad.getUnits().length}
                </div>
                <div className="text-xs text-slate-500">Units Alive</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-slate-300">Turn {currentBattle.currentTurn}</div>
              <div className="text-xs text-slate-500">
                Phase: {currentBattle.currentPhase}
              </div>
            </div>
          </div>
        )}

        {/* Battle Result */}
        {battleResult && (
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              🎉 Battle Complete!
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-green-400 font-bold text-lg">Winner</div>
                <div className="text-white">{battleResult.winner.name}</div>
                <div className="text-sm text-slate-400">
                  {battleResult.winner.getUnits().filter(u => u.currentHp > 0).length} survivors
                </div>
              </div>
              
              <div>
                <div className="text-red-400 font-bold text-lg">Defeated</div>
                <div className="text-white">{battleResult.loser.name}</div>
                <div className="text-sm text-slate-400">
                  {battleResult.casualties.attacking.length + battleResult.casualties.defending.length} casualties
                </div>
              </div>
              
              <div>
                <div className="text-blue-400 font-bold text-lg">Duration</div>
                <div className="text-white">{battleResult.turnsElapsed} turns</div>
                <div className="text-sm text-slate-400">
                  {battleResult.experienceGained} XP gained
                </div>
              </div>
            </div>

            {/* Casualties */}
            {(battleResult.casualties.attacking.length > 0 || battleResult.casualties.defending.length > 0) && (
              <div className="mt-4 pt-4 border-t border-slate-600">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Casualties</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-blue-400 mb-1">Attacking Losses</div>
                    {battleResult.casualties.attacking.length === 0 ? (
                      <div className="text-slate-500">None</div>
                    ) : (
                      battleResult.casualties.attacking.map(unit => (
                        <div key={unit.id} className="text-slate-300">
                          {unit.name} (Lv.{unit.experience.currentLevel})
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div>
                    <div className="text-red-400 mb-1">Defending Losses</div>
                    {battleResult.casualties.defending.length === 0 ? (
                      <div className="text-slate-500">None</div>
                    ) : (
                      battleResult.casualties.defending.map(unit => (
                        <div key={unit.id} className="text-slate-300">
                          {unit.name} (Lv.{unit.experience.currentLevel})
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Battle Log */}
        {battleResult && battleResult.battleLog.length > 0 && (
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Battle Log
            </h3>
            
            <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
              {battleResult.battleLog.slice(-10).map((entry, index) => (
                <div key={index} className="text-slate-300 font-mono">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {availableSquads.length < 2 && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="text-yellow-400 font-medium mb-2">Need More Squads</h4>
            <p className="text-yellow-300 text-sm">
              You need at least 2 squads with units to test battles. 
              Create more squads in the Squad Editor or use the preset squads.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}