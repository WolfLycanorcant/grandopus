import React, { useState } from 'react'
import { Unit } from '../core/units'
import { useGameStore } from '../stores/gameStore'
import { ResourceType } from '../core/overworld/types'
import { 
  AdvancedArchetype,
  PROMOTION_PATHS 
} from '../core/units/PromotionSystem'
import { 
  Crown, 
  Plus, 
  Star, 
  Award,
  RefreshCw,
  Zap,
  Target,
  Users
} from 'lucide-react'

export function PromotionTestPanel() {
  const { units, playerResources, promoteUnit } = useGameStore()
  const [testResults, setTestResults] = useState<string[]>([])
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  const addTestResult = (result: string) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
  }

  const handleAddResources = () => {
    // This would need to be implemented in the game store
    // For now, we'll just show what would happen
    addTestResult('Added 1000 gold, 500 steel, 200 mana crystals for testing')
  }

  const handleLevelUpUnit = () => {
    if (!selectedUnit) {
      addTestResult('No unit selected')
      return
    }

    // Add experience to level up the unit
    const expNeeded = selectedUnit.experience.expToNextLevel
    selectedUnit.addExperience(expNeeded + 100)
    addTestResult(`${selectedUnit.name} leveled up to ${selectedUnit.experience.currentLevel}`)
  }

  const handleAddAchievements = () => {
    if (!selectedUnit) {
      addTestResult('No unit selected')
      return
    }

    // Simulate earning some achievements
    const achievements = ['Guardian', 'Battle-Scarred', 'Weapon Master', 'Inspiring Leader']
    achievements.forEach(achievement => {
      // This would need integration with the achievement system
      addTestResult(`${selectedUnit.name} earned achievement: ${achievement}`)
    })
  }

  const handleTestPromotion = (promotionPath: typeof PROMOTION_PATHS[0]) => {
    if (!selectedUnit) {
      addTestResult('No unit selected')
      return
    }

    const canPromote = selectedUnit.promotionManager.canPromoteTo(promotionPath.toArchetype)
    
    if (!canPromote.canPromote) {
      addTestResult(`Cannot promote ${selectedUnit.name}: ${canPromote.reason}`)
      return
    }

    // Check if we have enough resources
    const requirements = selectedUnit.promotionManager.getPromotionRequirements(promotionPath.toArchetype)
    const canAfford = requirements.canAfford(playerResources)
    
    if (!canAfford) {
      addTestResult(`Cannot afford promotion for ${selectedUnit.name}`)
      return
    }

    // Calculate resource cost
    const resourcesUsed: Record<ResourceType, number> = {}
    requirements.resources.forEach(({ type, amount }) => {
      resourcesUsed[type] = amount
    })

    // Promote the unit
    promoteUnit(selectedUnit.id, promotionPath.toArchetype, resourcesUsed)
    addTestResult(`${selectedUnit.name} promoted to ${promotionPath.name}!`)
  }

  const getAvailablePromotions = (unit: Unit) => {
    return PROMOTION_PATHS.filter(path => 
      path.fromArchetype === unit.archetype
    )
  }

  const getPromotionIcon = (promotionName: string) => {
    const lowerName = promotionName.toLowerCase()
    
    if (lowerName.includes('paladin') || lowerName.includes('champion')) {
      return <Crown className="h-4 w-4" />
    }
    if (lowerName.includes('mage') || lowerName.includes('archmage')) {
      return <Zap className="h-4 w-4" />
    }
    if (lowerName.includes('sniper') || lowerName.includes('marksman')) {
      return <Target className="h-4 w-4" />
    }
    if (lowerName.includes('master') || lowerName.includes('leader')) {
      return <Users className="h-4 w-4" />
    }
    
    return <Star className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Crown className="h-5 w-5 mr-2 text-yellow-400" />
          Promotion System Testing
        </h3>

        {/* Unit Selection */}
        <div className="mb-4">
          <label className="block text-slate-300 text-sm mb-2">Select Unit to Test</label>
          <select
            value={selectedUnit?.id || ''}
            onChange={(e) => {
              const unit = units.find(u => u.id === e.target.value)
              setSelectedUnit(unit || null)
            }}
            className="w-full bg-slate-600 text-white rounded px-3 py-2"
          >
            <option value="">Choose a unit...</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} (Lv.{unit.experience.currentLevel} {unit.archetype})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            onClick={handleAddResources}
            className="flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resources</span>
          </button>

          <button
            onClick={handleLevelUpUnit}
            disabled={!selectedUnit}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded transition-colors"
          >
            <Star className="h-4 w-4" />
            <span>Level Up</span>
          </button>

          <button
            onClick={handleAddAchievements}
            disabled={!selectedUnit}
            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 px-3 rounded transition-colors"
          >
            <Award className="h-4 w-4" />
            <span>Add Achievements</span>
          </button>

          <button
            onClick={() => {
              setTestResults([])
              setSelectedUnit(null)
            }}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Current Resources */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Current Resources</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Gold:</span>
            <span className="text-yellow-400">{playerResources[ResourceType.GOLD]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Steel:</span>
            <span className="text-blue-400">{playerResources[ResourceType.STEEL]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Mana:</span>
            <span className="text-purple-400">{playerResources[ResourceType.MANA_CRYSTALS]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Wood:</span>
            <span className="text-amber-400">{playerResources[ResourceType.WOOD]}</span>
          </div>
        </div>
      </div>

      {/* Selected Unit Info */}
      {selectedUnit && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Selected Unit</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-white font-medium">{selectedUnit.name}</div>
              <div className="text-slate-400 text-sm">
                Lv.{selectedUnit.experience.currentLevel} {selectedUnit.race} {selectedUnit.archetype}
              </div>
            </div>
            
            <div>
              <div className="text-slate-400 text-sm">Promotion Status:</div>
              <div className={selectedUnit.promotionManager.isPromoted() ? 'text-yellow-400' : 'text-slate-300'}>
                {selectedUnit.promotionManager.isPromoted() 
                  ? selectedUnit.promotionManager.getPromotionDisplayName()
                  : 'Not Promoted'
                }
              </div>
            </div>
          </div>

          {/* Available Promotions */}
          {!selectedUnit.promotionManager.isPromoted() && (
            <div>
              <h5 className="text-xs font-medium text-slate-400 mb-2">Available Promotions</h5>
              <div className="space-y-2">
                {getAvailablePromotions(selectedUnit).map(promotionPath => {
                  const canPromote = selectedUnit.promotionManager.canPromoteTo(promotionPath.toArchetype)
                  const requirements = selectedUnit.promotionManager.getPromotionRequirements(promotionPath.toArchetype)
                  const canAfford = requirements.canAfford(playerResources)
                  
                  return (
                    <div key={promotionPath.toArchetype} className="flex items-center justify-between bg-slate-600 rounded p-2">
                      <div className="flex items-center space-x-2">
                        {getPromotionIcon(promotionPath.name)}
                        <span className="text-white text-sm">{promotionPath.name}</span>
                        <span className="text-xs text-slate-400">
                          (Lv.{promotionPath.requirements.level})
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleTestPromotion(promotionPath)}
                        disabled={!canPromote.canPromote || !canAfford}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        {!canPromote.canPromote ? 'Locked' : !canAfford ? 'No Resources' : 'Promote'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Test Results</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm text-slate-400 font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promotion Paths Reference */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">All Promotion Paths</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROMOTION_PATHS.map(path => (
            <div key={path.toArchetype} className="bg-slate-600 rounded p-2">
              <div className="flex items-center space-x-2 mb-1">
                {getPromotionIcon(path.name)}
                <span className="text-white text-sm font-medium">{path.name}</span>
              </div>
              <div className="text-xs text-slate-400">
                From: {path.fromArchetype.replace('_', ' ')}
              </div>
              <div className="text-xs text-slate-400">
                Level {path.requirements.level} • +{path.levelCapIncrease} Cap
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}