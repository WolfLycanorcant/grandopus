import React, { useState } from 'react'
import { Unit } from '../core/units'
import { ResourceType } from '../core/overworld/types'
import { 
  PromotionPath, 
  AdvancedArchetype,
  PROMOTION_PATHS 
} from '../core/units/PromotionSystem'
import { 
  Crown, 
  Star, 
  Sword, 
  Shield, 
  Zap, 
  Heart,
  Target,
  Users,
  Award,
  ArrowUp,
  CheckCircle,
  Lock,
  AlertCircle,
  Coins,
  Gem
} from 'lucide-react'
import clsx from 'clsx'

interface PromotionPanelProps {
  unit: Unit
  playerResources: Record<ResourceType, number>
  onPromote?: (unitId: string, advancedArchetype: AdvancedArchetype, resourcesUsed: Record<ResourceType, number>) => void
}

export function PromotionPanel({ unit, playerResources, onPromote }: PromotionPanelProps) {
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionPath | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const promotionSummary = unit.promotionManager.getPromotionSummary()
  const availablePromotions = unit.promotionManager.getAvailablePromotions()

  const getArchetypeIcon = (archetype: string) => {
    const lowerArchetype = archetype.toLowerCase()
    
    if (lowerArchetype.includes('paladin') || lowerArchetype.includes('templar') || lowerArchetype.includes('crusader')) {
      return <Crown className="h-5 w-5" />
    }
    if (lowerArchetype.includes('mage') || lowerArchetype.includes('elementalist')) {
      return <Zap className="h-5 w-5" />
    }
    if (lowerArchetype.includes('berserker') || lowerArchetype.includes('champion') || lowerArchetype.includes('warlord')) {
      return <Sword className="h-5 w-5" />
    }
    if (lowerArchetype.includes('guardian') || lowerArchetype.includes('protector')) {
      return <Shield className="h-5 w-5" />
    }
    if (lowerArchetype.includes('sniper') || lowerArchetype.includes('hunter') || lowerArchetype.includes('marksman')) {
      return <Target className="h-5 w-5" />
    }
    if (lowerArchetype.includes('priest') || lowerArchetype.includes('oracle')) {
      return <Heart className="h-5 w-5" />
    }
    if (lowerArchetype.includes('master') || lowerArchetype.includes('leader')) {
      return <Users className="h-5 w-5" />
    }
    
    return <Star className="h-5 w-5" />
  }

  const getPromotionRarity = (promotionPath: PromotionPath): 'common' | 'rare' | 'epic' | 'legendary' => {
    const req = promotionPath.requirements
    const totalResourceCost = Object.values(req.resources || {}).reduce((sum, cost) => sum + cost, 0)
    
    if (totalResourceCost > 1000 || req.level >= 20) return 'legendary'
    if (totalResourceCost > 500 || req.level >= 15) return 'epic'
    if (totalResourceCost > 200 || req.level >= 12) return 'rare'
    return 'common'
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 text-gray-400'
      case 'rare': return 'border-blue-500 text-blue-400'
      case 'epic': return 'border-purple-500 text-purple-400'
      case 'legendary': return 'border-yellow-500 text-yellow-400'
      default: return 'border-gray-500 text-gray-400'
    }
  }

  const getResourceIcon = (resourceType: ResourceType) => {
    switch (resourceType) {
      case ResourceType.GOLD: return <Coins className="h-4 w-4 text-yellow-400" />
      case ResourceType.STEEL: return <Sword className="h-4 w-4 text-blue-400" />
      case ResourceType.MANA_CRYSTALS: return <Gem className="h-4 w-4 text-purple-400" />
      case ResourceType.WOOD: return <div className="h-4 w-4 bg-amber-600 rounded" />
      case ResourceType.STONE: return <div className="h-4 w-4 bg-gray-400 rounded" />
      case ResourceType.FOOD: return <div className="h-4 w-4 bg-green-400 rounded" />
      case ResourceType.HORSES: return <div className="h-4 w-4 bg-amber-800 rounded" />
      default: return <div className="h-4 w-4 bg-slate-400 rounded" />
    }
  }

  const canAffordPromotion = (promotionPath: PromotionPath): boolean => {
    if (!promotionPath.requirements.resources) return true
    
    return Object.entries(promotionPath.requirements.resources).every(([resource, cost]) => {
      return (playerResources[resource as ResourceType] || 0) >= cost
    })
  }

  const handlePromote = (promotionPath: PromotionPath) => {
    setSelectedPromotion(promotionPath)
    setShowConfirmation(true)
  }

  const confirmPromotion = () => {
    if (!selectedPromotion) return
    
    const result = unit.promotionManager.promoteUnit(
      selectedPromotion.toArchetype,
      playerResources
    )
    
    if (result.success && result.resourcesUsed && onPromote) {
      onPromote(unit.id, selectedPromotion.toArchetype, result.resourcesUsed)
    }
    
    setShowConfirmation(false)
    setSelectedPromotion(null)
  }

  const renderPromotionCard = (promotionPath: PromotionPath) => {
    const canPromote = unit.promotionManager.canPromoteTo(promotionPath.toArchetype)
    const canAfford = canAffordPromotion(promotionPath)
    const rarity = getPromotionRarity(promotionPath)
    const requirements = unit.promotionManager.getPromotionRequirements(promotionPath.toArchetype)

    return (
      <div
        key={promotionPath.toArchetype}
        className={clsx(
          'border-2 rounded-lg p-4 transition-all cursor-pointer',
          getRarityColor(rarity),
          canPromote.canPromote && canAfford 
            ? 'hover:bg-slate-600/50 hover:scale-105' 
            : 'opacity-60 cursor-not-allowed'
        )}
        onClick={() => canPromote.canPromote && canAfford && handlePromote(promotionPath)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'p-2 rounded-lg',
              rarity === 'legendary' ? 'bg-yellow-900/30' :
              rarity === 'epic' ? 'bg-purple-900/30' :
              rarity === 'rare' ? 'bg-blue-900/30' :
              'bg-gray-900/30'
            )}>
              {getArchetypeIcon(promotionPath.name)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{promotionPath.name}</h3>
              <p className="text-sm text-slate-400 capitalize">{rarity} Promotion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canPromote.canPromote ? (
              canAfford ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              )
            ) : (
              <Lock className="h-5 w-5 text-red-400" />
            )}
            <span className={clsx(
              'px-2 py-1 rounded text-xs font-medium',
              rarity === 'legendary' ? 'bg-yellow-900/30 text-yellow-400' :
              rarity === 'epic' ? 'bg-purple-900/30 text-purple-400' :
              rarity === 'rare' ? 'bg-blue-900/30 text-blue-400' :
              'bg-gray-900/30 text-gray-400'
            )}>
              +{promotionPath.levelCapIncrease} Levels
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4">{promotionPath.description}</p>

        {/* Stat Bonuses */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-slate-400 mb-2">Stat Bonuses</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(promotionPath.statBonuses).map(([stat, bonus]) => (
              bonus && bonus !== 0 && (
                <div key={stat} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase">{stat}:</span>
                  <span className={bonus > 0 ? 'text-green-400' : 'text-red-400'}>
                    {bonus > 0 ? '+' : ''}{bonus}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* New Abilities */}
        {promotionPath.newAbilities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-slate-400 mb-2">New Abilities</h4>
            <div className="flex flex-wrap gap-1">
              {promotionPath.newAbilities.map(ability => (
                <span 
                  key={ability}
                  className="px-2 py-1 bg-indigo-900/30 text-indigo-300 rounded text-xs"
                >
                  {ability}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resource Requirements */}
        {requirements.resources.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-slate-400 mb-2">Resource Cost</h4>
            <div className="grid grid-cols-2 gap-2">
              {requirements.resources.map(({ type, amount }) => {
                const hasEnough = (playerResources[type] || 0) >= amount
                return (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      {getResourceIcon(type)}
                      <span className="text-slate-400 capitalize">{type.replace('_', ' ')}:</span>
                    </div>
                    <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                      {amount}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Requirements Status */}
        <div className="text-xs">
          {!canPromote.canPromote ? (
            <div className="text-red-400">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              {canPromote.reason}
            </div>
          ) : !canAfford ? (
            <div className="text-yellow-400">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Insufficient resources
            </div>
          ) : (
            <div className="text-green-400">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              Ready to promote!
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Promotion Status */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-400" />
            Promotion Status
          </h3>
          {promotionSummary.isPromoted && (
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Promoted</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Current Class</h4>
            <div className="flex items-center space-x-2">
              {getArchetypeIcon(promotionSummary.currentClass)}
              <span className="text-white font-medium">
                {promotionSummary.isPromoted ? promotionSummary.promotedClass : promotionSummary.currentClass}
              </span>
            </div>
            
            {promotionSummary.promotionDate && (
              <p className="text-xs text-slate-400 mt-1">
                Promoted on {promotionSummary.promotionDate.toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Level Cap</h4>
            <div className="text-white">
              <span className="text-2xl font-bold">{unit.experience.maxLevel || 99}</span>
              {promotionSummary.levelCapIncrease > 0 && (
                <span className="text-green-400 ml-2">
                  (+{promotionSummary.levelCapIncrease})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Promotion Bonuses */}
        {Object.keys(promotionSummary.statBonuses).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Promotion Bonuses</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(promotionSummary.statBonuses).map(([stat, bonus]) => (
                bonus && bonus !== 0 && (
                  <div key={stat} className="flex justify-between text-sm">
                    <span className="text-slate-400 uppercase">{stat}:</span>
                    <span className="text-green-400">+{bonus}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Special Effects */}
        {promotionSummary.specialEffects.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Special Effects</h4>
            <div className="space-y-1">
              {promotionSummary.specialEffects.map((effect, index) => (
                <div key={index} className="text-sm text-purple-300 flex items-center">
                  <Star className="h-3 w-3 mr-2" />
                  {effect}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Promotions */}
      {!promotionSummary.isPromoted && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ArrowUp className="h-5 w-5 mr-2 text-blue-400" />
            Available Promotions
          </h3>

          {availablePromotions.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No promotions available</p>
              <p className="text-sm text-slate-500 mt-1">
                Continue leveling and earning achievements to unlock advanced classes
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {availablePromotions.map(renderPromotionCard)}
            </div>
          )}
        </div>
      )}

      {/* All Promotion Paths (for reference) */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-purple-400" />
          All {unit.archetype.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Promotions
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {PROMOTION_PATHS
            .filter(path => path.fromArchetype === unit.archetype)
            .map(path => (
              <div
                key={path.toArchetype}
                className={clsx(
                  'border rounded-lg p-3 transition-all',
                  promotionSummary.isPromoted && promotionSummary.promotedClass === path.name
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : availablePromotions.some(ap => ap.toArchetype === path.toArchetype)
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-slate-600 bg-slate-800/50'
                )}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getArchetypeIcon(path.name)}
                  <h4 className="font-medium text-white">{path.name}</h4>
                  {promotionSummary.isPromoted && promotionSummary.promotedClass === path.name && (
                    <CheckCircle className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                
                <p className="text-xs text-slate-400 mb-2">{path.description}</p>
                
                <div className="text-xs text-slate-500">
                  Level {path.requirements.level} • +{path.levelCapIncrease} Level Cap
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedPromotion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-yellow-900/30 rounded-lg">
                  {getArchetypeIcon(selectedPromotion.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Promote to {selectedPromotion.name}?
                  </h3>
                  <p className="text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Resource Cost</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedPromotion.requirements.resources || {}).map(([resource, cost]) => (
                      <div key={resource} className="flex items-center justify-between text-sm bg-slate-700 rounded p-2">
                        <div className="flex items-center space-x-2">
                          {getResourceIcon(resource as ResourceType)}
                          <span className="text-slate-300 capitalize">{resource.replace('_', ' ')}</span>
                        </div>
                        <span className="text-white font-medium">{cost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Benefits</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-green-400">
                      • Level cap increased by {selectedPromotion.levelCapIncrease}
                    </div>
                    {Object.entries(selectedPromotion.statBonuses).map(([stat, bonus]) => (
                      bonus && bonus !== 0 && (
                        <div key={stat} className="text-sm text-green-400">
                          • {stat.toUpperCase()}: {bonus > 0 ? '+' : ''}{bonus}
                        </div>
                      )
                    ))}
                    {selectedPromotion.newAbilities.map(ability => (
                      <div key={ability} className="text-sm text-blue-400">
                        • New Ability: {ability}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={confirmPromotion}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Confirm Promotion
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}