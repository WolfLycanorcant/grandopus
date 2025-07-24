import React, { useState } from 'react'
import { BattleResult, BattleLogEntry } from '../core/battle'
import { Trophy, Skull, Award, RotateCcw, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

interface BattleResultsProps {
  result: BattleResult
  battleLog: BattleLogEntry[]
  onNewBattle: () => void
}

export function BattleResults({ result, battleLog, onNewBattle }: BattleResultsProps) {
  const [showDetailedLog, setShowDetailedLog] = useState(false)
  const [logFilter, setLogFilter] = useState<'all' | 'attack' | 'damage' | 'info'>('all')
  const [expandedSections, setExpandedSections] = useState({
    casualties: false,
    experience: false,
    statistics: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const filteredLog = battleLog.filter(entry => {
    if (logFilter === 'all') return true
    return entry.type === logFilter
  })

  const getLogEntryColor = (type: BattleLogEntry['type']) => {
    switch (type) {
      case 'attack': return 'text-red-400'
      case 'damage': return 'text-orange-400'
      case 'heal': return 'text-green-400'
      case 'info': return 'text-slate-400'
      default: return 'text-slate-300'
    }
  }

  const getVictoryIcon = () => {
    switch (result.victoryCondition) {
      case 'elimination':
        return <Skull className="h-8 w-8 text-red-400" />
      case 'timeout':
        return <Award className="h-8 w-8 text-yellow-400" />
      default:
        return <Trophy className="h-8 w-8 text-primary-400" />
    }
  }

  const getVictoryMessage = () => {
    switch (result.victoryCondition) {
      case 'elimination':
        return 'Total Victory - All enemies defeated!'
      case 'timeout':
        return 'Victory by Endurance - Battle time limit reached'
      default:
        return 'Victory Achieved!'
    }
  }

  return (
    <div className="space-y-6">
      {/* Victory Banner */}
      <div className="card">
        <div className="card-body text-center py-8">
          <div className="flex justify-center mb-4">
            {getVictoryIcon()}
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {result.winner.name} Wins!
          </h2>

          <p className="text-lg text-slate-300 mb-4">
            {getVictoryMessage()}
          </p>

          <div className="flex justify-center items-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">{result.rounds}</div>
              <div className="text-slate-400">Rounds</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {result.casualties.winner.length + result.casualties.loser.length}
              </div>
              <div className="text-slate-400">Total Casualties</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{result.experience.winner}</div>
              <div className="text-slate-400">EXP Gained</div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Winner */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary-400" />
              Winner: {result.winner.name}
            </h3>
          </div>
          <div className="card-body">
            <BattleSquadSummary
              squad={result.winner}
              casualties={result.casualties.winner}
              experience={result.experience.winner}
              isWinner={true}
            />
          </div>
        </div>

        {/* Loser */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Skull className="h-5 w-5 mr-2 text-slate-400" />
              Defeated: {result.loser.name}
            </h3>
          </div>
          <div className="card-body">
            <BattleSquadSummary
              squad={result.loser}
              casualties={result.casualties.loser}
              experience={result.experience.loser}
              isWinner={false}
            />
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        {/* Casualties */}
        <div className="card">
          <div className="card-header">
            <button
              onClick={() => toggleSection('casualties')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Skull className="h-5 w-5 mr-2 text-red-400" />
                Battle Casualties ({result.casualties.winner.length + result.casualties.loser.length})
              </h3>
              {expandedSections.casualties ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {expandedSections.casualties && (
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">
                    {result.winner.name} Casualties ({result.casualties.winner.length})
                  </h4>
                  {result.casualties.winner.length === 0 ? (
                    <p className="text-slate-400 text-sm">No casualties - flawless victory!</p>
                  ) : (
                    <div className="space-y-2">
                      {result.casualties.winner.map((unit) => (
                        <div key={unit.id} className="bg-slate-700 rounded p-3">
                          <div className="font-medium text-white">{unit.name}</div>
                          <div className="text-sm text-slate-400">
                            Lv.{unit.experience.currentLevel} {unit.race} {unit.archetype.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">
                    {result.loser.name} Casualties ({result.casualties.loser.length})
                  </h4>
                  {result.casualties.loser.length === 0 ? (
                    <p className="text-slate-400 text-sm">No casualties</p>
                  ) : (
                    <div className="space-y-2">
                      {result.casualties.loser.map((unit) => (
                        <div key={unit.id} className="bg-slate-700 rounded p-3">
                          <div className="font-medium text-white">{unit.name}</div>
                          <div className="text-sm text-slate-400">
                            Lv.{unit.experience.currentLevel} {unit.race} {unit.archetype.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Experience Rewards */}
        <div className="card">
          <div className="card-header">
            <button
              onClick={() => toggleSection('experience')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-400" />
                Experience Rewards
              </h3>
              {expandedSections.experience ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {expandedSections.experience && (
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-green-400 mb-2">
                    {result.winner.name} (Winner)
                  </h4>
                  <div className="text-2xl font-bold text-white mb-2">
                    +{result.experience.winner} EXP
                  </div>
                  <p className="text-sm text-slate-300">
                    Distributed among all surviving units
                  </p>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-slate-300 mb-2">
                    {result.loser.name} (Defeated)
                  </h4>
                  <div className="text-2xl font-bold text-slate-400 mb-2">
                    +{result.experience.loser} EXP
                  </div>
                  <p className="text-sm text-slate-400">
                    Consolation experience for survivors
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Battle Statistics */}
        <div className="card">
          <div className="card-header">
            <button
              onClick={() => toggleSection('statistics')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-400" />
                Battle Statistics
              </h3>
              {expandedSections.statistics ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {expandedSections.statistics && (
            <div className="card-body">
              <BattleStatistics statistics={result.statistics} />
            </div>
          )}
        </div>
      </div>

      {/* Battle Log */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Battle Log ({battleLog.length} entries)</h3>
            <div className="flex items-center space-x-4">
              {/* Filter */}
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="select text-sm"
              >
                <option value="all">All Events</option>
                <option value="attack">Attacks Only</option>
                <option value="damage">Damage Only</option>
                <option value="info">Info Only</option>
              </select>

              {/* Toggle Detailed View */}
              <button
                onClick={() => setShowDetailedLog(!showDetailedLog)}
                className="btn-outline text-sm flex items-center"
              >
                {showDetailedLog ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showDetailedLog ? 'Simple' : 'Detailed'}
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="battle-log max-h-96 overflow-y-auto">
            {filteredLog.map((entry, index) => (
              <div key={index} className={clsx('battle-log-entry', getLogEntryColor(entry.type))}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-xs text-slate-500 mr-2">
                      R{entry.round} {entry.phase}:
                    </span>
                    <span>{entry.message}</span>
                  </div>

                  {showDetailedLog && entry.details && (
                    <div className="text-xs text-slate-500 ml-4">
                      {entry.damage && `${entry.damage} dmg`}
                      {entry.healing && `${entry.healing} heal`}
                    </div>
                  )}
                </div>

                {showDetailedLog && entry.details && (
                  <div className="mt-1 text-xs text-slate-600">
                    {JSON.stringify(entry.details, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="text-center">
        <button
          onClick={onNewBattle}
          className="btn-primary text-lg px-8 py-4 flex items-center mx-auto"
        >
          <RotateCcw className="h-6 w-6 mr-3" />
          Start New Battle
        </button>
      </div>
    </div>
  )
}

// Battle Squad Summary Component
function BattleSquadSummary({
  squad,
  casualties,
  experience,
  isWinner
}: {
  squad: any
  casualties: any[]
  experience: number
  isWinner: boolean
}) {
  const stats = squad.getStats()
  const survivors = squad.getUnits().filter((unit: any) => unit.isAlive())

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{survivors.length}</div>
          <div className="text-xs text-slate-400">Survivors</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-400">{casualties.length}</div>
          <div className="text-xs text-slate-400">Casualties</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-400">+{experience}</div>
          <div className="text-xs text-slate-400">EXP</div>
        </div>
      </div>

      {/* Survivors List */}
      {survivors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Surviving Units</h4>
          <div className="space-y-1">
            {survivors.map((unit: any) => (
              <div key={unit.id} className="bg-slate-700 rounded p-2 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-white">{unit.name}</div>
                  <div className="text-xs text-slate-400">
                    Lv.{unit.experience.currentLevel} {unit.race}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{unit.currentHp}/{unit.getMaxStats().hp}</div>
                  <div className="text-xs text-slate-400">HP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Battle Statistics Component
function BattleStatistics({ statistics }: { statistics: any }) {
  const damageEntries = Object.entries(statistics.totalDamageDealt || {}) as [string, number][]
  const critEntries = Object.entries(statistics.criticalHits || {}) as [string, number][]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Damage Dealt */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Damage Dealt</h4>
        {damageEntries.length === 0 ? (
          <p className="text-slate-400 text-sm">No damage data available</p>
        ) : (
          <div className="space-y-2">
            {damageEntries.map(([unitId, damage]) => (
              <div key={unitId} className="bg-slate-700 rounded p-3 flex justify-between">
                <span className="text-slate-300">Unit {unitId.slice(-8)}</span>
                <span className="text-white font-medium">{damage} damage</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Critical Hits */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Critical Hits</h4>
        {critEntries.length === 0 ? (
          <p className="text-slate-400 text-sm">No critical hits recorded</p>
        ) : (
          <div className="space-y-2">
            {critEntries.map(([unitId, crits]) => (
              <div key={unitId} className="bg-slate-700 rounded p-3 flex justify-between">
                <span className="text-slate-300">Unit {unitId.slice(-8)}</span>
                <span className="text-yellow-400 font-medium">{crits} crits</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}