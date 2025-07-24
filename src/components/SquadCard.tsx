import React from 'react'
import { Squad } from '../core/squads'
import { Trash2, Eye, Users, Crown, Sword, Shield } from 'lucide-react'
import clsx from 'clsx'

interface SquadCardProps {
  squad: Squad
  onClick?: () => void
  onDelete?: () => void
  showActions?: boolean
  isSelected?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function SquadCard({ 
  squad, 
  onClick, 
  onDelete, 
  showActions = false, 
  isSelected = false,
  size = 'medium'
}: SquadCardProps) {
  const stats = squad.getStats()
  const capacity = squad.getCapacity()
  const leader = squad.getLeader()
  const units = squad.getUnits()
  
  const cardSizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  }
  
  return (
    <div
      className={clsx(
        'card transition-all duration-200 hover:shadow-xl',
        cardSizeClasses[size],
        isSelected && 'ring-2 ring-primary-500 ring-offset-2 ring-offset-slate-900',
        onClick && 'cursor-pointer hover:bg-slate-750'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{squad.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Users className="h-3 w-3" />
            <span>{units.length} units</span>
            <span>•</span>
            <span>Lv.{stats.averageLevel} avg</span>
          </div>
        </div>
        
        {/* Game Progress Level Badge */}
        <div className="bg-secondary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          T{squad.gameProgressLevel}
        </div>
      </div>
      
      {/* Capacity Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Capacity</span>
          <span className="text-slate-300">
            {capacity.currentUsedSlots}/{capacity.availableSlots + capacity.currentUsedSlots}
          </span>
        </div>
        <div className="stat-bar">
          <div 
            className="stat-bar-fill bg-gradient-to-r from-blue-600 to-blue-400"
            style={{ 
              width: `${Math.min((capacity.currentUsedSlots / (capacity.availableSlots + capacity.currentUsedSlots)) * 100, 100)}%` 
            }}
          />
        </div>
      </div>
      
      {/* Leader Info */}
      {leader && (
        <div className="mb-3 bg-slate-700 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="h-3 w-3 text-yellow-400 mr-1" />
              <span className="text-xs text-slate-400">Leader:</span>
            </div>
            <span className="text-xs text-slate-300">LDR {leader.getCurrentStats().ldr}</span>
          </div>
          <div className="text-sm text-white font-medium truncate">{leader.name}</div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-slate-700 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center mb-1">
            <Shield className="h-3 w-3 text-red-400 mr-1" />
            <span className="text-slate-400">HP</span>
          </div>
          <span className="text-white font-medium">{stats.totalHp}</span>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center mb-1">
            <Sword className="h-3 w-3 text-orange-400 mr-1" />
            <span className="text-slate-400">Power</span>
          </div>
          <span className="text-white font-medium">{Math.floor(stats.combatPower / 100)}</span>
        </div>
      </div>
      
      {/* Formation Preview */}
      <div className="mb-4">
        <div className="text-xs text-slate-400 mb-2">Formation</div>
        <div className="grid grid-cols-6 gap-1">
          {/* Front Row */}
          {[0, 1, 2].map((index) => {
            const frontUnits = squad.getFrontRowUnits()
            const unit = frontUnits[index]
            return (
              <div
                key={`front-${index}`}
                className={clsx(
                  'w-6 h-6 rounded border text-xs flex items-center justify-center',
                  unit 
                    ? 'bg-red-500/20 border-red-500/50 text-red-300' 
                    : 'border-slate-600 border-dashed'
                )}
              >
                {unit ? unit.name.charAt(0) : ''}
              </div>
            )
          })}
          
          {/* Back Row */}
          {[0, 1, 2].map((index) => {
            const backUnits = squad.getBackRowUnits()
            const unit = backUnits[index]
            return (
              <div
                key={`back-${index}`}
                className={clsx(
                  'w-6 h-6 rounded border text-xs flex items-center justify-center',
                  unit 
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                    : 'border-slate-600 border-dashed'
                )}
              >
                {unit ? unit.name.charAt(0) : ''}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Front ({stats.frontRowCount})</span>
          <span>Back ({stats.backRowCount})</span>
        </div>
      </div>
      
      {/* Battle Record */}
      {squad.experience.totalBattles > 0 && (
        <div className="mb-4 bg-slate-700 rounded-lg p-2">
          <div className="text-xs text-slate-400 mb-1">Battle Record</div>
          <div className="flex justify-between text-xs">
            <span className="text-green-400">{squad.experience.battlesWon}W</span>
            <span className="text-red-400">{squad.experience.battlesLost}L</span>
            <span className="text-slate-300">
              {squad.experience.squadCohesion}% cohesion
            </span>
          </div>
        </div>
      )}
      
      {/* Artifacts Preview */}
      {squad.artifacts.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">Artifacts ({squad.artifacts.length}/3)</div>
          <div className="flex flex-wrap gap-1">
            {squad.artifacts.slice(0, 2).map((artifact, index) => (
              <span
                key={index}
                className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full border border-purple-600/30"
              >
                {artifact.name}
              </span>
            ))}
            {squad.artifacts.length > 2 && (
              <span className="text-slate-500 text-xs">
                +{squad.artifacts.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Combat Readiness */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Combat Ready:</span>
          <span className={clsx(
            'font-medium',
            squad.isValidForCombat() ? 'text-green-400' : 'text-red-400'
          )}>
            {squad.isValidForCombat() ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      {showActions && (
        <div className="flex justify-between pt-3 border-t border-slate-700">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
            className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            Edit
          </button>
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}