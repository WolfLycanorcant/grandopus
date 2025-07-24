import React, { useState } from 'react'
import { Unit } from '../core/units'
import { getRacialTraits } from '../core/units/RaceData'
import { getArchetypeData } from '../core/units/ArchetypeData'
import { ResourceType } from '../core/overworld/types'
import { EquipmentPanel } from './EquipmentPanel'
import { SkillTreePanel } from './SkillTreePanel'
import { AchievementPanel } from './AchievementPanel'
import { RelationshipPanel } from './RelationshipPanel'
import { PromotionPanel } from './PromotionPanel'
import { X, Shield, Sword, Zap, Target, Crown, Heart, Star, Award, Flame, Package } from 'lucide-react'
import clsx from 'clsx'

interface UnitDetailsModalProps {
  unit: Unit
  onClose: () => void
}

export function UnitDetailsModal({ unit, onClose }: UnitDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'equipment' | 'skills' | 'achievements' | 'relationships' | 'promotions'>('stats')
  const [, forceUpdate] = useState({})
  
  const stats = unit.getCurrentStats()
  const racialTraits = getRacialTraits(unit.race)
  const archetypeData = getArchetypeData(unit.archetype)
  
  const handleEquipmentChange = () => {
    // Force re-render to update stats when equipment changes
    forceUpdate({})
  }
  
  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'hp': return <Heart className="h-4 w-4" />
      case 'str': return <Sword className="h-4 w-4" />
      case 'mag': return <Zap className="h-4 w-4" />
      case 'skl': return <Target className="h-4 w-4" />
      case 'arm': return <Shield className="h-4 w-4" />
      case 'ldr': return <Crown className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }
  
  const getStatColor = (statName: string) => {
    switch (statName) {
      case 'hp': return 'text-red-400'
      case 'str': return 'text-orange-400'
      case 'mag': return 'text-purple-400'
      case 'skl': return 'text-yellow-400'
      case 'arm': return 'text-blue-400'
      case 'ldr': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }
  
  const getRaceDisplayName = (race: string) => {
    return race.charAt(0).toUpperCase() + race.slice(1).replace('_', ' ')
  }
  
  const getArchetypeDisplayName = (archetype: string) => {
    return archetype.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="card-header flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {unit.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{unit.name}</h2>
              <p className="text-slate-400 text-sm">
                Level {unit.experience.currentLevel} {getRaceDisplayName(unit.race)} {getArchetypeDisplayName(unit.archetype)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="card-body space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('stats')}
              className={clsx(
                'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              <Award className="h-4 w-4 mr-2" />
              Stats & Abilities
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={clsx(
                'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'equipment'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              <Package className="h-4 w-4 mr-2" />
              Equipment
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={clsx(
                'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'skills'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              <Star className="h-4 w-4 mr-2" />
              Skills
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={clsx(
                'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'achievements'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={clsx(
                'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'relationships'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              <Heart className="h-4 w-4 mr-2" />
              Relationships
            </button>
            <button
              onClick={() => setActiveTab('promotions')}
              className={clsx(
                'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'promotions'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              <Crown className="h-4 w-4 mr-2" />
              Promotions
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'stats' ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Combat Statistics
              </h3>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(stats).map(([statName, value]) => (
                    <div key={statName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={getStatColor(statName)}>
                          {getStatIcon(statName)}
                        </span>
                        <span className="text-slate-300 text-sm font-medium uppercase">
                          {statName}
                        </span>
                      </div>
                      <span className="text-white font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Health Status */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Health Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Current HP</span>
                    <span className={clsx(
                      'font-medium',
                      unit.currentHp === stats.hp ? 'text-green-400' : 
                      unit.currentHp > stats.hp * 0.5 ? 'text-yellow-400' : 'text-red-400'
                    )}>
                      {unit.currentHp} / {stats.hp}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={clsx(
                        'h-2 rounded-full transition-all',
                        unit.currentHp === stats.hp ? 'bg-green-500' :
                        unit.currentHp > stats.hp * 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${(unit.currentHp / stats.hp) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">
                    Status: {unit.isAlive() ? 
                      (unit.isAtFullHealth() ? 'Healthy' : 'Wounded') : 
                      'Defeated'
                    }
                  </div>
                </div>
              </div>
            </div>
            
            {/* Experience & Progression */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Experience & Progression
              </h3>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Level</span>
                    <span className="text-white font-bold text-lg">{unit.experience.currentLevel}</span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Experience</span>
                      <span className="text-slate-300">
                        {unit.experience.currentExp} / {unit.experience.expToNextLevel}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(unit.experience.currentExp / unit.experience.expToNextLevel) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Job Points</span>
                    <span className="text-yellow-400 font-bold">{unit.availableJobPoints}</span>
                  </div>
                </div>
              </div>
              
              {/* Slot Cost */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Squad Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Slot Cost</span>
                    <span className="text-white font-medium">
                      {unit.getSlotCost()} slot{unit.getSlotCost() > 1 ? 's' : ''}
                    </span>
                  </div>
                  {unit.getSlotCost() > 1 && (
                    <p className="text-xs text-amber-400">
                      ⚠️ Large creature - takes multiple squad slots
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Formation Position</span>
                    <span className="text-white font-medium">
                      {unit.formationPosition ? 
                        unit.formationPosition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        'Unassigned'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Racial Traits */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Racial Traits</h3>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">
                    {getRaceDisplayName(unit.race).charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-medium">{racialTraits.name}</h4>
                  <p className="text-slate-400 text-sm">{racialTraits.description}</p>
                </div>
              </div>
              
              {/* Stat Modifiers */}
              {Object.keys(racialTraits.statModifiers).length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Stat Modifiers</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(racialTraits.statModifiers).map(([stat, modifier]) => (
                      <span 
                        key={stat}
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          modifier > 0 ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                        )}
                      >
                        {stat.toUpperCase()}: {modifier > 0 ? '+' : ''}{modifier}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Special Abilities */}
              {racialTraits.specialAbilities.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-slate-300 mb-2">Special Abilities</h5>
                  <div className="flex flex-wrap gap-2">
                    {racialTraits.specialAbilities.map((ability) => (
                      <span 
                        key={ability}
                        className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs font-medium"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Class Abilities */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Class Abilities</h3>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{archetypeData.name}</h4>
                  <p className="text-slate-400 text-sm">{archetypeData.description}</p>
                </div>
              </div>
              
              {/* Class Abilities */}
              <div className="mb-3">
                <h5 className="text-sm font-medium text-slate-300 mb-2">Class Abilities</h5>
                <div className="flex flex-wrap gap-2">
                  {archetypeData.classAbilities.map((ability) => (
                    <span 
                      key={ability}
                      className="px-2 py-1 bg-orange-900/30 text-orange-300 rounded text-xs font-medium"
                    >
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Weapon Proficiencies */}
              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-2">Weapon Proficiencies</h5>
                <div className="grid grid-cols-2 gap-2">
                  {archetypeData.weaponProficiencies.map((weaponType) => {
                    const proficiency = unit.getWeaponProficiency(weaponType)
                    return (
                      <div key={weaponType} className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 capitalize">
                          {weaponType.replace('_', ' ')}
                        </span>
                        <span className="text-white font-medium">
                          {proficiency?.level || 0}/100
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Effects */}
          {unit.statusEffects.size > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Status Effects</h3>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {Array.from(unit.statusEffects).map((effect) => (
                    <span 
                      key={effect}
                      className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded text-xs font-medium"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
            </>
          ) : activeTab === 'equipment' ? (
            /* Equipment Tab */
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Equipment & Gear</h3>
              <EquipmentPanel 
                unit={unit} 
                onEquipmentChange={handleEquipmentChange}
              />
            </div>
          ) : activeTab === 'skills' ? (
            /* Skills Tab */
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Skill Trees & Abilities</h3>
              <SkillTreePanel 
                unit={unit} 
                onSkillLearned={handleEquipmentChange}
              />
            </div>
          ) : activeTab === 'achievements' ? (
            /* Achievements Tab */
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Achievements & Progress</h3>
              <AchievementPanel unit={unit} />
            </div>
          ) : activeTab === 'relationships' ? (
            /* Relationships Tab */
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Relationships & Bonds</h3>
              <RelationshipPanel unit={unit} />
            </div>
          ) : (
            /* Promotions Tab */
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Unit Promotions</h3>
              <PromotionPanel 
                unit={unit} 
                playerResources={{
                  [ResourceType.GOLD]: 1000,
                  [ResourceType.WOOD]: 500,
                  [ResourceType.STONE]: 300,
                  [ResourceType.STEEL]: 200,
                  [ResourceType.FOOD]: 400,
                  [ResourceType.MANA_CRYSTALS]: 100,
                  [ResourceType.HORSES]: 50
                }}
                onPromote={(unitId, advancedArchetype, resourcesUsed) => {
                  console.log(`Unit ${unitId} promoted to ${advancedArchetype}`, resourcesUsed)
                  handleEquipmentChange() // Force re-render
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}