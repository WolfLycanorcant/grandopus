import React from 'react'
import { Unit } from '../core/units'
import { Trash2, Eye, Sword, Shield, Zap, Crown } from 'lucide-react'
import clsx from 'clsx'

interface UnitCardProps {
  unit: Unit
  onClick?: () => void
  onDelete?: () => void
  showActions?: boolean
  isSelected?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function UnitCard({ 
  unit, 
  onClick, 
  onDelete, 
  showActions = false, 
  isSelected = false,
  size = 'medium'
}: UnitCardProps) {
  const stats = unit.getCurrentStats()
  const maxStats = unit.getMaxStats()
  const racialTraits = unit.getRacialAbilities()
  const classAbilities = unit.getClassAbilities()
  
  // Get race color
  const getRaceColor = (race: string) => {
    const colors: Record<string, string> = {
      human: 'text-slate-300',
      elf: 'text-green-400',
      dwarf: 'text-orange-400',
      orc: 'text-red-400',
      goblin: 'text-yellow-400',
      angel: 'text-blue-300',
      demon: 'text-purple-400',
      beast: 'text-amber-400',
      dragon: 'text-red-500',
      griffon: 'text-indigo-400'
    }
    return colors[race] || 'text-slate-300'
  }
  
  // Get archetype color
  const getArchetypeColor = (archetype: string) => {
    const colors: Record<string, string> = {
      heavy_infantry: 'text-red-400',
      light_infantry: 'text-orange-400',
      archer: 'text-green-400',
      mage: 'text-blue-400',
      cleric: 'text-yellow-400',
      knight: 'text-purple-400',
      rogue: 'text-gray-400',
      beast_tamer: 'text-amber-400',
      dwarven_engineer: 'text-orange-500'
    }
    return colors[archetype] || 'text-slate-300'
  }
  
  const cardSizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  }
  
  return (
    <div
      className={clsx(
        'unit-card',
        cardSizeClasses[size],
        isSelected && 'selected',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{unit.name}</h3>
          <div className="flex items-center space-x-2 text-sm">
            <span className={getRaceColor(unit.race)}>
              {unit.race.charAt(0).toUpperCase() + unit.race.slice(1)}
            </span>
            <span className="text-slate-500">•</span>
            <span className={getArchetypeColor(unit.archetype)}>
              {unit.archetype.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>
        
        {/* Level Badge */}
        <div className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          Lv.{unit.experience.currentLevel}
        </div>
      </div>
      
      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">HP</span>
          <span className="text-slate-300">{unit.currentHp}/{maxStats.hp}</span>
        </div>
        <div className="stat-bar">
          <div 
            className="hp-bar"
            style={{ width: `${(unit.currentHp / maxStats.hp) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Experience Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">EXP</span>
          <span className="text-slate-300">
            {unit.experience.currentExp}/{unit.experience.expToNextLevel}
          </span>
        </div>
        <div className="stat-bar">
          <div 
            className="exp-bar"
            style={{ 
              width: `${(unit.experience.currentExp / unit.experience.expToNextLevel) * 100}%` 
            }}
          />
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Sword className="h-3 w-3 text-red-400 mr-1" />
            <span className="text-slate-400">STR</span>
          </div>
          <span className="text-white font-medium">{stats.str}</span>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="h-3 w-3 text-blue-400 mr-1" />
            <span className="text-slate-400">MAG</span>
          </div>
          <span className="text-white font-medium">{stats.mag}</span>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Shield className="h-3 w-3 text-green-400 mr-1" />
            <span className="text-slate-400">ARM</span>
          </div>
          <span className="text-white font-medium">{stats.arm}</span>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Eye className="h-3 w-3 text-yellow-400 mr-1" />
            <span className="text-slate-400">SKL</span>
          </div>
          <span className="text-white font-medium">{stats.skl}</span>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Crown className="h-3 w-3 text-purple-400 mr-1" />
            <span className="text-slate-400">LDR</span>
          </div>
          <span className="text-white font-medium">{stats.ldr}</span>
        </div>
        
        <div className="text-center">
          <span className="text-slate-400 text-xs">Slots</span>
          <div className="text-white font-medium">{unit.getSlotCost()}</div>
        </div>
      </div>
      
      {/* Abilities Preview */}
      {(racialTraits.length > 0 || classAbilities.length > 0) && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">Abilities</div>
          <div className="flex flex-wrap gap-1">
            {[...racialTraits.slice(0, 2), ...classAbilities.slice(0, 2)].map((ability, index) => (
              <span
                key={index}
                className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full"
              >
                {ability}
              </span>
            ))}
            {(racialTraits.length + classAbilities.length) > 4 && (
              <span className="text-slate-500 text-xs">
                +{(racialTraits.length + classAbilities.length) - 4} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Status Effects */}
      {unit.statusEffects.size > 0 && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2">Status</div>
          <div className="flex flex-wrap gap-1">
            {Array.from(unit.statusEffects).map((effect) => (
              <span
                key={effect}
                className="bg-yellow-600/20 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-600/30"
              >
                {effect.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
      
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
            Details
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