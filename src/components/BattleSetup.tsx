import React, { useState } from 'react'
import { Squad } from '../core/squads'
import { SquadCard } from './SquadCard'
import { Play, Sword, Shield, Users, Crown, Zap } from 'lucide-react'
import clsx from 'clsx'

interface BattleSetupProps {
  squads: Squad[]
  onStartBattle: (attackingSquadId: string, defendingSquadId: string) => void
}

export function BattleSetup({ squads, onStartBattle }: BattleSetupProps) {
  const [attackingSquadId, setAttackingSquadId] = useState<string>('')
  const [defendingSquadId, setDefendingSquadId] = useState<string>('')
  
  const attackingSquad = squads.find(s => s.id === attackingSquadId)
  const defendingSquad = squads.find(s => s.id === defendingSquadId)
  
  const canStartBattle = attackingSquadId && defendingSquadId && attackingSquadId !== defendingSquadId
  
  const handleStartBattle = () => {
    if (canStartBattle) {
      onStartBattle(attackingSquadId, defendingSquadId)
    }
  }
  
  const getSquadPreview = (squad: Squad) => {
    const stats = squad.getStats()
    const capacity = squad.getCapacity()
    const leader = squad.getLeader()
    
    return {
      stats,
      capacity,
      leader,
      frontRow: squad.getFrontRowUnits(),
      backRow: squad.getBackRowUnits()
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Squad Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attacking Squad Selection */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Sword className="h-5 w-5 mr-2 text-red-400" />
              Attacking Squad
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {squads.map((squad) => (
                <div
                  key={squad.id}
                  className={clsx(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all',
                    attackingSquadId === squad.id
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  )}
                  onClick={() => setAttackingSquadId(squad.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-white">{squad.name}</h4>
                      <p className="text-sm text-slate-400">
                        {squad.getUnits().length} units • Lv.{squad.getStats().averageLevel} avg
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-300">{squad.getStats().totalHp} HP</div>
                      <div className="text-xs text-slate-400">Power: {Math.floor(squad.getStats().combatPower / 100)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Defending Squad Selection */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-400" />
              Defending Squad
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {squads.map((squad) => (
                <div
                  key={squad.id}
                  className={clsx(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all',
                    defendingSquadId === squad.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500',
                    attackingSquadId === squad.id && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => {
                    if (attackingSquadId !== squad.id) {
                      setDefendingSquadId(squad.id)
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-white">{squad.name}</h4>
                      <p className="text-sm text-slate-400">
                        {squad.getUnits().length} units • Lv.{squad.getStats().averageLevel} avg
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-300">{squad.getStats().totalHp} HP</div>
                      <div className="text-xs text-slate-400">Power: {Math.floor(squad.getStats().combatPower / 100)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Battle Preview */}
      {attackingSquad && defendingSquad && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Battle Preview</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Attacking Squad Details */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Sword className="h-5 w-5 mr-2 text-red-400" />
                  <h4 className="text-lg font-medium text-white">{attackingSquad.name}</h4>
                  <span className="ml-2 text-sm text-red-400">(Attacker)</span>
                </div>
                
                <BattleSquadPreview squad={attackingSquad} color="red" />
              </div>
              
              {/* VS Divider */}
              <div className="lg:col-span-2 flex items-center justify-center py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-red-500 to-transparent"></div>
                  <div className="bg-slate-700 rounded-full p-3">
                    <span className="text-xl font-bold text-white">VS</span>
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-l from-blue-500 to-transparent"></div>
                </div>
              </div>
              
              {/* Defending Squad Details */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-400" />
                  <h4 className="text-lg font-medium text-white">{defendingSquad.name}</h4>
                  <span className="ml-2 text-sm text-blue-400">(Defender)</span>
                </div>
                
                <BattleSquadPreview squad={defendingSquad} color="blue" />
              </div>
            </div>
            
            {/* Battle Prediction */}
            <div className="mt-8 bg-slate-700 rounded-lg p-4">
              <h5 className="text-sm font-medium text-white mb-3">Battle Analysis</h5>
              <BattlePrediction attackingSquad={attackingSquad} defendingSquad={defendingSquad} />
            </div>
          </div>
        </div>
      )}
      
      {/* Start Battle Button */}
      <div className="text-center">
        <button
          onClick={handleStartBattle}
          disabled={!canStartBattle}
          className={clsx(
            'btn flex items-center text-lg px-8 py-4',
            canStartBattle 
              ? 'btn-primary hover:bg-primary-700 transform hover:scale-105' 
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          )}
        >
          <Play className="h-6 w-6 mr-3" />
          {canStartBattle ? 'Start Battle!' : 'Select Both Squads'}
        </button>
        
        {canStartBattle && (
          <p className="text-sm text-slate-400 mt-2">
            Battle will be executed automatically using your squad formations
          </p>
        )}
      </div>
    </div>
  )
}

// Battle Squad Preview Component
function BattleSquadPreview({ squad, color }: { squad: Squad; color: 'red' | 'blue' }) {
  const preview = {
    stats: squad.getStats(),
    capacity: squad.getCapacity(),
    leader: squad.getLeader(),
    frontRow: squad.getFrontRowUnits(),
    backRow: squad.getBackRowUnits()
  }
  
  const colorClasses = {
    red: 'text-red-400 border-red-500/50',
    blue: 'text-blue-400 border-blue-500/50'
  }
  
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-slate-400" />
          <div className="text-lg font-bold text-white">{squad.getUnits().length}</div>
          <div className="text-xs text-slate-400">Units</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-slate-400" />
          <div className="text-lg font-bold text-white">{preview.stats.totalHp}</div>
          <div className="text-xs text-slate-400">Total HP</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <Crown className="h-4 w-4 mx-auto mb-1 text-slate-400" />
          <div className="text-lg font-bold text-white">{preview.stats.averageLevel}</div>
          <div className="text-xs text-slate-400">Avg Level</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <Sword className="h-4 w-4 mx-auto mb-1 text-slate-400" />
          <div className="text-lg font-bold text-white">{Math.floor(preview.stats.combatPower / 100)}</div>
          <div className="text-xs text-slate-400">Power</div>
        </div>
      </div>
      
      {/* Leader */}
      {preview.leader && (
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-sm text-slate-400 mb-1">Squad Leader</div>
          <div className="text-white font-medium">{preview.leader.name}</div>
          <div className="text-xs text-slate-400">
            Lv.{preview.leader.experience.currentLevel} • LDR: {preview.leader.getCurrentStats().ldr}
          </div>
        </div>
      )}
      
      {/* Formation */}
      <div>
        <div className="text-sm text-slate-400 mb-2">Formation</div>
        <div className="grid grid-cols-6 gap-1">
          {/* Front Row */}
          {[0, 1, 2].map((index) => {
            const unit = preview.frontRow[index]
            return (
              <div
                key={`front-${index}`}
                className={clsx(
                  'w-8 h-8 rounded border text-xs flex items-center justify-center',
                  unit 
                    ? `bg-red-500/20 border-red-500/50 text-red-300` 
                    : 'border-slate-600 border-dashed'
                )}
                title={unit?.name}
              >
                {unit ? unit.name.charAt(0) : ''}
              </div>
            )
          })}
          
          {/* Back Row */}
          {[0, 1, 2].map((index) => {
            const unit = preview.backRow[index]
            return (
              <div
                key={`back-${index}`}
                className={clsx(
                  'w-8 h-8 rounded border text-xs flex items-center justify-center',
                  unit 
                    ? `bg-blue-500/20 border-blue-500/50 text-blue-300` 
                    : 'border-slate-600 border-dashed'
                )}
                title={unit?.name}
              >
                {unit ? unit.name.charAt(0) : ''}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Front ({preview.frontRow.length})</span>
          <span>Back ({preview.backRow.length})</span>
        </div>
      </div>
    </div>
  )
}

// Battle Prediction Component
function BattlePrediction({ attackingSquad, defendingSquad }: { attackingSquad: Squad; defendingSquad: Squad }) {
  const attackerStats = attackingSquad.getStats()
  const defenderStats = defendingSquad.getStats()
  
  const powerDifference = attackerStats.combatPower - defenderStats.combatPower
  const levelDifference = attackerStats.averageLevel - defenderStats.averageLevel
  const hpDifference = attackerStats.totalHp - defenderStats.totalHp
  
  const getPrediction = () => {
    const score = powerDifference + (levelDifference * 100) + (hpDifference * 2)
    
    if (Math.abs(score) < 500) {
      return { result: 'Even Match', confidence: 'Low', color: 'text-yellow-400' }
    } else if (score > 0) {
      const confidence = score > 1000 ? 'High' : 'Medium'
      return { result: 'Attacker Favored', confidence, color: 'text-red-400' }
    } else {
      const confidence = score < -1000 ? 'High' : 'Medium'
      return { result: 'Defender Favored', confidence, color: 'text-blue-400' }
    }
  }
  
  const prediction = getPrediction()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div className="text-sm text-slate-400 mb-2">Prediction</div>
        <div className={`text-lg font-medium ${prediction.color}`}>
          {prediction.result}
        </div>
        <div className="text-xs text-slate-400">
          Confidence: {prediction.confidence}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Power Difference:</span>
          <span className={powerDifference > 0 ? 'text-red-400' : powerDifference < 0 ? 'text-blue-400' : 'text-slate-300'}>
            {powerDifference > 0 ? '+' : ''}{Math.floor(powerDifference / 100)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Level Difference:</span>
          <span className={levelDifference > 0 ? 'text-red-400' : levelDifference < 0 ? 'text-blue-400' : 'text-slate-300'}>
            {levelDifference > 0 ? '+' : ''}{levelDifference.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">HP Difference:</span>
          <span className={hpDifference > 0 ? 'text-red-400' : hpDifference < 0 ? 'text-blue-400' : 'text-slate-300'}>
            {hpDifference > 0 ? '+' : ''}{hpDifference}
          </span>
        </div>
      </div>
    </div>
  )
}