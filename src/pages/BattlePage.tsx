import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { BattleSetup } from '../components/BattleSetup'
import { BattleExecution } from '../components/BattleExecution'
import { BattleResults } from '../components/BattleResults'
import { Swords, Play, RotateCcw } from 'lucide-react'

export function BattlePage() {
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
  
  const [battlePhase, setBattlePhase] = useState<'setup' | 'execution' | 'results'>('setup')
  
  // Determine current phase based on battle state
  React.useEffect(() => {
    if (battleResult) {
      setBattlePhase('results')
    } else if (currentBattle) {
      setBattlePhase('execution')
    } else {
      setBattlePhase('setup')
    }
  }, [currentBattle, battleResult])
  
  const handleStartBattle = (attackingSquadId: string, defendingSquadId: string) => {
    const attackingSquad = squads.find(s => s.id === attackingSquadId)
    const defendingSquad = squads.find(s => s.id === defendingSquadId)
    
    if (!attackingSquad || !defendingSquad) {
      console.error('Invalid squad selection')
      return
    }
    
    startBattle(attackingSquad, defendingSquad)
  }
  
  const handleExecuteBattle = () => {
    executeBattle()
  }
  
  const handleNewBattle = () => {
    clearBattle()
    setBattlePhase('setup')
  }
  
  const validSquads = squads.filter(squad => squad.isValidForCombat())
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-game flex items-center">
            <Swords className="h-8 w-8 mr-3 text-red-500" />
            Battle Arena
          </h1>
          <p className="text-slate-400 mt-1">
            Engage in tactical squad-based combat
          </p>
        </div>
        
        {battlePhase !== 'setup' && (
          <button
            onClick={handleNewBattle}
            className="btn-outline flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Battle
          </button>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      {/* Battle Phase Indicator */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center ${battlePhase === 'setup' ? 'text-primary-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-3 ${
                battlePhase === 'setup' ? 'border-primary-400 bg-primary-400/20' : 'border-slate-500'
              }`}>
                1
              </div>
              <span className="font-medium">Setup</span>
            </div>
            
            <div className={`w-16 h-0.5 ${battlePhase !== 'setup' ? 'bg-primary-400' : 'bg-slate-600'}`} />
            
            <div className={`flex items-center ${battlePhase === 'execution' ? 'text-primary-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-3 ${
                battlePhase === 'execution' ? 'border-primary-400 bg-primary-400/20' : 
                battlePhase === 'results' ? 'border-green-400 bg-green-400/20' : 'border-slate-500'
              }`}>
                {battlePhase === 'results' ? '✓' : '2'}
              </div>
              <span className="font-medium">Battle</span>
            </div>
            
            <div className={`w-16 h-0.5 ${battlePhase === 'results' ? 'bg-primary-400' : 'bg-slate-600'}`} />
            
            <div className={`flex items-center ${battlePhase === 'results' ? 'text-primary-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-3 ${
                battlePhase === 'results' ? 'border-primary-400 bg-primary-400/20' : 'border-slate-500'
              }`}>
                3
              </div>
              <span className="font-medium">Results</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      {battlePhase === 'setup' && (
        <>
          {validSquads.length < 2 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <Swords className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300 mb-2">
                  Not Enough Combat-Ready Squads
                </h3>
                <p className="text-slate-400 mb-4">
                  You need at least 2 squads with living units to start a battle.
                </p>
                <div className="text-sm text-slate-500">
                  <p>Current combat-ready squads: {validSquads.length}/2</p>
                  <p className="mt-2">
                    Go to the Squad Editor to create squads or add units to existing ones.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <BattleSetup
              squads={validSquads}
              onStartBattle={handleStartBattle}
            />
          )}
        </>
      )}
      
      {battlePhase === 'execution' && currentBattle && (
        <BattleExecution
          battle={currentBattle}
          onExecute={handleExecuteBattle}
        />
      )}
      
      {battlePhase === 'results' && battleResult && (
        <BattleResults
          result={battleResult}
          battleLog={battleLog}
          onNewBattle={handleNewBattle}
        />
      )}
    </div>
  )
}