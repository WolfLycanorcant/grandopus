import React, { useState } from 'react'
import { Unit } from '../core/units'
import { 
  RelationshipType, 
  AffinitySource,
  UnitRelationship,
  RelationshipFilter
} from '../core/relationships'
import { 
  getRelationshipConfig,
  getRelationshipTypeFromAffinity
} from '../core/relationships/RelationshipData'
import { 
  Heart, 
  Users, 
  Zap, 
  Shield, 
  Sword, 
  Smile,
  Frown,
  X,
  Crown,
  Book,
  Filter,
  Search,
  Plus,
  Minus,
  Star,
  Target
} from 'lucide-react'
import clsx from 'clsx'

interface RelationshipPanelProps {
  unit: Unit
  availableUnits?: Unit[] // Other units that can form relationships with
}

export function RelationshipPanel({ unit, availableUnits = [] }: RelationshipPanelProps) {
  const [filter, setFilter] = useState<RelationshipFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<RelationshipType | 'all'>('all')
  const [showCreateRelationship, setShowCreateRelationship] = useState(false)

  const allRelationships = unit.relationshipManager.getAllRelationships()
  const relationshipStats = unit.relationshipManager.getRelationshipStatistics()
  const personalityTraits = unit.relationshipManager.getPersonalityTraits()
  const relationshipBonuses = unit.relationshipManager.getRelationshipStatBonuses()
  const combatBonuses = unit.relationshipManager.getCombatBonuses()

  const getRelationshipIcon = (type: RelationshipType) => {
    switch (type) {
      case RelationshipType.NEUTRAL: return <Minus className="h-4 w-4" />
      case RelationshipType.FRIENDLY: return <Smile className="h-4 w-4" />
      case RelationshipType.CLOSE_FRIENDS: return <Heart className="h-4 w-4" />
      case RelationshipType.BROTHERS_IN_ARMS: return <Shield className="h-4 w-4" />
      case RelationshipType.RIVALS: return <Zap className="h-4 w-4" />
      case RelationshipType.BITTER_RIVALS: return <X className="h-4 w-4" />
      case RelationshipType.ROMANTIC: return <Heart className="h-4 w-4 text-pink-400" />
      case RelationshipType.MENTOR_STUDENT: return <Book className="h-4 w-4" />
      case RelationshipType.FAMILY: return <Users className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  const getRelationshipColor = (type: RelationshipType) => {
    const config = getRelationshipConfig(type)
    return config.color
  }

  const getAffinityColor = (affinity: number) => {
    if (affinity >= 80) return 'text-pink-400' // Romantic level
    if (affinity >= 50) return 'text-yellow-400' // Brothers in arms
    if (affinity >= 30) return 'text-blue-400' // Close friends
    if (affinity >= 10) return 'text-green-400' // Friendly
    if (affinity >= -10) return 'text-slate-400' // Neutral
    if (affinity >= -30) return 'text-orange-400' // Rivals
    return 'text-red-400' // Bitter rivals
  }

  const getPersonalityTraitIcon = (traitId: string) => {
    switch (traitId) {
      case 'charismatic': return <Star className="h-3 w-3" />
      case 'loyal': return <Shield className="h-3 w-3" />
      case 'competitive': return <Target className="h-3 w-3" />
      case 'loner': return <Minus className="h-3 w-3" />
      case 'hothead': return <Zap className="h-3 w-3" />
      case 'mentor': return <Book className="h-3 w-3" />
      case 'protective': return <Shield className="h-3 w-3" />
      case 'pragmatic': return <Crown className="h-3 w-3" />
      default: return <Star className="h-3 w-3" />
    }
  }

  const getFilteredRelationships = () => {
    let relationships = Array.from(allRelationships.values())

    // Filter by relationship type
    if (selectedRelationshipType !== 'all') {
      relationships = relationships.filter(rel => rel.relationshipType === selectedRelationshipType)
    }

    // Filter by search term (would need unit names - simplified for now)
    if (searchTerm) {
      relationships = relationships.filter(rel =>
        rel.unitId2.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return relationships
  }

  const handleCreateRelationship = (targetUnitId: string, type: RelationshipType, affinity: number) => {
    unit.relationshipManager.setRelationship(targetUnitId, type, affinity)
    setShowCreateRelationship(false)
  }

  const getAffinitySourceDescription = (source: AffinitySource) => {
    switch (source) {
      case AffinitySource.BATTLE_TOGETHER: return 'Fought together in battle'
      case AffinitySource.HEALING_RECEIVED: return 'Received healing'
      case AffinitySource.LIFE_SAVED: return 'Life was saved'
      case AffinitySource.SHARED_VICTORY: return 'Shared victory'
      case AffinitySource.TRAINING_TOGETHER: return 'Trained together'
      case AffinitySource.RACIAL_AFFINITY: return 'Racial compatibility'
      case AffinitySource.CLASS_SYNERGY: return 'Class synergy'
      case AffinitySource.EQUIPMENT_SHARING: return 'Shared equipment'
      case AffinitySource.FORMATION_SYNERGY: return 'Formation synergy'
      case AffinitySource.PERSONALITY_CLASH: return 'Personality clash'
      case AffinitySource.COMPETITION: return 'Competition'
      case AffinitySource.BETRAYAL: return 'Betrayal'
      case AffinitySource.SACRIFICE: return 'Sacrifice made'
      default: return 'Unknown interaction'
    }
  }

  return (
    <div className="space-y-6">
      {/* Relationship Overview */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Relationships Overview
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {relationshipStats.totalRelationships}
            </div>
            <div className="text-sm text-slate-400">
              Total Bonds
            </div>
          </div>
        </div>

        {/* Relationship Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {relationshipStats.totalFriends}
            </div>
            <div className="text-sm text-slate-400">Friends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {relationshipStats.totalRivals}
            </div>
            <div className="text-sm text-slate-400">Rivals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(relationshipStats.averageAffinity)}
            </div>
            <div className="text-sm text-slate-400">Avg Affinity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {personalityTraits.length}
            </div>
            <div className="text-sm text-slate-400">Traits</div>
          </div>
        </div>

        {/* Personality Traits */}
        {personalityTraits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Personality Traits</h4>
            <div className="flex flex-wrap gap-2">
              {personalityTraits.map((trait) => (
                <div
                  key={trait.id}
                  className="flex items-center space-x-1 px-2 py-1 bg-slate-600 rounded text-xs"
                  title={trait.description}
                >
                  {getPersonalityTraitIcon(trait.id)}
                  <span className="text-slate-300 capitalize">{trait.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Relationship Bonuses */}
      {(Object.keys(relationshipBonuses).length > 0 || 
        combatBonuses.damageBonus > 0 || 
        combatBonuses.accuracyBonus > 0) && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
            <Heart className="h-4 w-4 mr-2 text-pink-400" />
            Active Relationship Bonuses
          </h4>

          <div className="space-y-3">
            {/* Stat Bonuses */}
            {Object.keys(relationshipBonuses).length > 0 && (
              <div>
                <span className="text-xs text-slate-400">Stat Bonuses:</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.entries(relationshipBonuses).map(([stat, bonus]) => (
                    bonus > 0 && (
                      <div key={stat} className="flex justify-between text-sm">
                        <span className="text-slate-300 uppercase">{stat}:</span>
                        <span className="text-green-400">+{bonus}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Combat Bonuses */}
            {(combatBonuses.damageBonus > 0 || combatBonuses.accuracyBonus > 0 || 
              combatBonuses.criticalBonus > 0 || combatBonuses.evasionBonus > 0) && (
              <div>
                <span className="text-xs text-slate-400">Combat Bonuses:</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {combatBonuses.damageBonus > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Damage:</span>
                      <span className="text-orange-400">+{combatBonuses.damageBonus}%</span>
                    </div>
                  )}
                  {combatBonuses.accuracyBonus > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Accuracy:</span>
                      <span className="text-blue-400">+{combatBonuses.accuracyBonus}%</span>
                    </div>
                  )}
                  {combatBonuses.criticalBonus > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Critical:</span>
                      <span className="text-yellow-400">+{combatBonuses.criticalBonus}%</span>
                    </div>
                  )}
                  {combatBonuses.evasionBonus > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Evasion:</span>
                      <span className="text-green-400">+{combatBonuses.evasionBonus}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search relationships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Relationship Type Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedRelationshipType('all')}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedRelationshipType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-slate-400 hover:text-slate-300'
              )}
            >
              All
            </button>
            {Object.values(RelationshipType).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedRelationshipType(type)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1',
                  selectedRelationshipType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-600 text-slate-400 hover:text-slate-300'
                )}
              >
                {getRelationshipIcon(type)}
                <span className="capitalize">{type.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Create Relationship Button */}
        {availableUnits.length > 0 && (
          <button
            onClick={() => setShowCreateRelationship(true)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Relationship</span>
          </button>
        )}
      </div>

      {/* Relationships List */}
      <div className="space-y-3">
        {getFilteredRelationships().map((relationship) => {
          const config = getRelationshipConfig(relationship.relationshipType)
          const recentInteractions = relationship.interactionHistory.slice(-3)

          return (
            <div
              key={relationship.unitId2}
              className="bg-slate-700 border border-slate-600 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Relationship Icon */}
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: config.color + '20', color: config.color }}
                  >
                    {getRelationshipIcon(relationship.relationshipType)}
                  </div>

                  {/* Relationship Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-white">
                        {relationship.unitId2} {/* Would show actual unit name */}
                      </h4>
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: config.color + '20', color: config.color }}
                      >
                        {config.name}
                      </span>
                      {config.isRare && (
                        <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs font-medium">
                          Rare
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 mb-2">
                      {config.description}
                    </p>

                    {/* Affinity Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          Affinity: {relationship.affinityPoints}/100
                        </span>
                        <span className={getAffinityColor(relationship.affinityPoints)}>
                          {relationship.affinityPoints > 0 ? '+' : ''}{relationship.affinityPoints}
                        </span>
                      </div>

                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className={clsx(
                            'h-2 rounded-full transition-all duration-300',
                            relationship.affinityPoints >= 0 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
                          )}
                          style={{ 
                            width: `${Math.abs(relationship.affinityPoints)}%`,
                            marginLeft: relationship.affinityPoints < 0 ? `${100 - Math.abs(relationship.affinityPoints)}%` : '0'
                          }}
                        />
                      </div>
                    </div>

                    {/* Relationship Stats */}
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Battles Together:</span>
                        <span className="text-white ml-2">{relationship.battlesTogther}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Times Healed:</span>
                        <span className="text-white ml-2">{relationship.timesHealed}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Lives Saved:</span>
                        <span className="text-white ml-2">{relationship.timesSaved}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Shared Victories:</span>
                        <span className="text-white ml-2">{relationship.sharedVictories}</span>
                      </div>
                    </div>

                    {/* Recent Interactions */}
                    {recentInteractions.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-slate-400 mb-2">Recent Interactions</h5>
                        <div className="space-y-1">
                          {recentInteractions.map((interaction, index) => (
                            <div key={index} className="text-xs text-slate-500 flex justify-between">
                              <span>{getAffinitySourceDescription(interaction.source)}</span>
                              <span className={interaction.affinityChange > 0 ? 'text-green-400' : 'text-red-400'}>
                                {interaction.affinityChange > 0 ? '+' : ''}{interaction.affinityChange}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Relationship Bonuses */}
                    <div className="mt-3 p-2 bg-slate-800 rounded text-sm">
                      <span className="text-slate-400">Bonuses: </span>
                      <span className="text-green-400">{config.bonuses.description}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {getFilteredRelationships().length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No relationships found</p>
            <p className="text-sm text-slate-500 mt-1">
              {allRelationships.size === 0 
                ? 'This unit hasn\'t formed any relationships yet'
                : 'Try adjusting your filters'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Relationship Modal */}
      {showCreateRelationship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Create New Relationship
              </h3>
              <button
                onClick={() => setShowCreateRelationship(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="card-body">
              <p className="text-slate-400 mb-4">
                Select a unit and relationship type to create a bond.
              </p>
              
              <div className="space-y-4">
                {availableUnits.map((targetUnit) => (
                  <div key={targetUnit.id} className="border border-slate-600 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-medium">{targetUnit.name}</h4>
                        <p className="text-sm text-slate-400">
                          Lv.{targetUnit.experience.currentLevel} {targetUnit.race} {targetUnit.archetype}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCreateRelationship(targetUnit.id, RelationshipType.FRIENDLY, 20)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                        >
                          Friend
                        </button>
                        <button
                          onClick={() => handleCreateRelationship(targetUnit.id, RelationshipType.RIVALS, -20)}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded"
                        >
                          Rival
                        </button>
                        <button
                          onClick={() => handleCreateRelationship(targetUnit.id, RelationshipType.FAMILY, 70)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded"
                        >
                          Family
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}