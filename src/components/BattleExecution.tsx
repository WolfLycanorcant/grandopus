import React, { useState } from 'react'
import { BattleEngine } from '../core/battle'
import { Play, Pause, FastForward, Eye, Users, Sword, Shield } from 'lucide-react'

interface BattleExecutionProps {
  battle: BattleEngine
  onExecute: () => void
}

export function BattleExecution({ battle, onExecute }: BattleExecutionProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  
  const battleState = battle.getBattleState()
  const attackingSquad = battleState.attackingSquad
  const defendingSquad = battleState.defendingSquad
  
  const handleExecute = async () => {
    setIsExecuting(true)
    
    // Add a small delay for better UX
    setTimeout(() => {
      onExecute()
      setIsExecuting(false)
    }, 1000)
  }
  
  return (
    <div className="space-y-6">
      {/* Battle Header */}
      <div className="card">
        <div className="card-body">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {attackingSquad.name} vs {defendingSquad.name}
            </h2>
            <p className="text-slate-400">
              Battle ID: {battleState.id}
            </p>
          </div>
        </div>
      </div>
      
      {/* Squad Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attacking Squad */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Sword className="h-5 w-5 mr-2 text-red-400" />
              {attackingSquad.name}
              <span className="ml-2 text-sm text-red-400">(Attacker)</span>
            </h3>
          </div>
          <div className="card-body">
            <BattleSquadDisplay squad={attackingSquad} color="red" />
          </div>
        </div>
        
        {/* Defending Squad */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-400" />
              {defendingSquad.name}
              <span className="ml-2 text-sm text-blue-400">(Defender)</span>
            </h3>
          </div>
          <div className="card-body">
            <BattleSquadDisplay squad={defendingSquad} color="blue" />
          </div>
        </div>
      </div>
      
      {/* Battle Controls */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white">Battle Control</h3>
        </div>
        <div className="card-body">
          <div className="text-center space-y-4">
            <div className="bg-slate-700 rounded-lg p-6">
              <div className="text-lg text-white mb-2">Ready to Begin Combat</div>
              <p className="text-slate-400 mb-4">
                The battle will be executed automatically using Ogre Battle-style mechanics:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-primary-400 font-medium mb-1">Initiative Phase</div>
                  <div className="text-slate-300">Calculate turn order based on unit speed</div>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-primary-400 font-medium mb-1">Attack Phase</div>
                  <div className="text-slate-300">Front row attacks first, then back row</div>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-primary-400 font-medium mb-1">Counter Phase</div>
                  <div className="text-slate-300">Defending squad counter-attacks</div>
                </div>
              </div>
              
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="btn-primary text-lg px-8 py-4 flex items-center mx-auto"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Executing Battle...
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6 mr-3" />
                    Execute Battle
                  </>
                )}
              </button>
            </div>
            
            {/* Battle Mechanics Info */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-3">Battle Mechanics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div>
                  <div className="text-slate-400 mb-1">Formation Bonuses:</div>
                  <ul className="space-y-1">
                    <li>• Front Row: +10% armor, +5% physical damage</li>
                    <li>• Back Row: +15% ranged damage, -10% physical taken</li>
                  </ul>
                </div>
                
                <div>
                  <div className="text-slate-400 mb-1">Damage Formula:</div>
                  <ul className="space-y-1">
                    <li>• Base damage × proficiency bonus</li>
                    <li>• × stat modifier (STR/MAG)</li>
                    <li>• × formation bonuses × resistances</li>
                  </ul>
                </div>
                
                <div>
                  <div className="text-slate-400 mb-1">Special Abilities:</div>
                  <ul className="space-y-1">
                    <li>• Racial traits (immunities, resistances)</li>
                    <li>• Class abilities (varies by archetype)</li>
                    <li>• Critical hits based on skill difference</li>
                  </ul>
                </div>
                
                <div>
                  <div className="text-slate-400 mb-1">Victory Conditions:</div>
                  <ul className="space-y-1">
                    <li>• Eliminate all enemy units</li>
                    <li>• Battle timeout (10 rounds max)</li>
                    <li>• Winner determined by remaining HP</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pre-Battle Analysis */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Pre-Battle Analysis
          </h3>
        </div>
        <div className="card-body">
          <PreBattleAnalysis attackingSquad={attackingSquad} defendingSquad={defendingSquad} />
        </div>
      </div>
    </div>
  )
}

// Battle Squad Display Component
function BattleSquadDisplay({ squad, color }: { squad: any; color: 'red' | 'blue' }) {
  const stats = squad.getStats()
  const units = squad.getUnits()
  const frontRow = squad.getFrontRowUnits()
  const backRow = squad.getBackRowUnits()
  
  return (
    <div className="space-y-4">
      {/* Squad Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{units.length}</div>
          <div className="text-xs text-slate-400">Units</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.totalHp}</div>
          <div className="text-xs text-slate-400">Total HP</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.averageLevel}</div>
          <div className="text-xs text-slate-400">Avg Level</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{Math.floor(stats.combatPower / 100)}</div>
          <div className="text-xs text-slate-400">Power</div>
        </div>
      </div>
      
      {/* Formation Display */}
      <div>
        <div className="text-sm text-slate-400 mb-2">Battle Formation</div>
        
        {/* Front Row */}
        <div className="mb-3">
          <div className="text-xs text-red-300 mb-1">Front Row ({frontRow.length})</div>
          <div className="space-y-1">
            {frontRow.map((unit, index) => (
              <div key={unit.id} className="bg-red-500/10 border border-red-500/30 rounded p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-white">{unit.name}</div>
                    <div className="text-xs text-slate-400">
                      Lv.{unit.experience.currentLevel} {unit.race} {unit.archetype.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{unit.currentHp}/{unit.getMaxStats().hp}</div>
                    <div className="text-xs text-slate-400">HP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Back Row */}
        <div>
          <div className="text-xs text-blue-300 mb-1">Back Row ({backRow.length})</div>
          <div className="space-y-1">
            {backRow.map((unit, index) => (
              <div key={unit.id} className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-white">{unit.name}</div>
                    <div className="text-xs text-slate-400">
                      Lv.{unit.experience.currentLevel} {unit.race} {unit.archetype.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{unit.currentHp}/{unit.getMaxStats().hp}</div>
                    <div className="text-xs text-slate-400">HP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Pre-Battle Analysis Component
function PreBattleAnalysis({ attackingSquad, defendingSquad }: { attackingSquad: any; defendingSquad: any }) {
  const attackerStats = attackingSquad.getStats()
  const defenderStats = defendingSquad.getStats()
  
  const attackerUnits = attackingSquad.getUnits()
  const defenderUnits = defendingSquad.getUnits()
  
  // Analyze unit types
  const getUnitTypeCount = (units: any[]) => {
    const types = {
      physical: 0,
      magical: 0,
      support: 0,
      tank: 0
    }
    
    units.forEach(unit => {
      const stats = unit.getCurrentStats()
      if (stats.str > stats.mag && stats.arm > stats.skl) types.tank++
      else if (stats.str > stats.mag) types.physical++
      else if (stats.mag > stats.str) types.magical++
      else types.support++
    })
    
    return types
  }
  
  const attackerTypes = getUnitTypeCount(attackerUnits)
  const defenderTypes = getUnitTypeCount(defenderUnits)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Unit Composition */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Unit Composition</h4>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-red-300 mb-2">{attackingSquad.name}</div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-white font-medium">{attackerTypes.tank}</div>
                <div className="text-slate-400">Tank</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-white font-medium">{attackerTypes.physical}</div>
                <div className="text-slate-400">Physical</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-white font-medium">{attackerTypes.magical}</div>
                <div className="text-slate-400">Magical</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-white font-medium">{attackerTypes.support}</div>
                <div className="text-slate-400">Support</div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-blue-300 mb-2">{defendingSquad.name}</div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-white font-medium">{defenderTypes.tank}</div>
                <div className="text-slate-400">Tank</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-white font-medium">{defenderTypes.physical}</div>
                <div className="text-slate-400">Physical</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-white font-medium">{defenderTypes.magical}</div>
                <div className="text-slate-400">Magical</div>
              </div>
              <div className="bg-slate-700 rounded p-2 text-center">
                <div className="text-white font-medium">{defenderTypes.support}</div>
                <div className="text-slate-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tactical Advantages */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Tactical Analysis</h4>
        <div className="space-y-2 text-xs">
          <div className="bg-slate-700 rounded p-3">
            <div className="text-slate-400 mb-1">Formation Advantage:</div>
            <div className="text-slate-300">
              {attackerStats.frontRowCount > defenderStats.frontRowCount 
                ? `${attackingSquad.name} has stronger front line`
                : defenderStats.frontRowCount > attackerStats.frontRowCount
                ? `${defendingSquad.name} has stronger front line`
                : 'Even front line strength'
              }
            </div>
          </div>
          
          <div className="bg-slate-700 rounded p-3">
            <div className="text-slate-400 mb-1">Level Advantage:</div>
            <div className="text-slate-300">
              {attackerStats.averageLevel > defenderStats.averageLevel
                ? `${attackingSquad.name} (+${(attackerStats.averageLevel - defenderStats.averageLevel).toFixed(1)} levels)`
                : defenderStats.averageLevel > attackerStats.averageLevel
                ? `${defendingSquad.name} (+${(defenderStats.averageLevel - attackerStats.averageLevel).toFixed(1)} levels)`
                : 'Even level match'
              }
            </div>
          </div>
          
          <div className="bg-slate-700 rounded p-3">
            <div className="text-slate-400 mb-1">HP Advantage:</div>
            <div className="text-slate-300">
              {attackerStats.totalHp > defenderStats.totalHp
                ? `${attackingSquad.name} (+${attackerStats.totalHp - defenderStats.totalHp} HP)`
                : defenderStats.totalHp > attackerStats.totalHp
                ? `${defendingSquad.name} (+${defenderStats.totalHp - attackerStats.totalHp} HP)`
                : 'Even HP totals'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}