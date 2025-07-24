import React, { useState } from 'react'
import { Unit } from '../core/units'
import { 
  SkillTreeType, 
  SkillNode, 
  SkillNodeType,
  LearnedSkill 
} from '../core/skills/types'
import { 
  getSkillsByTree, 
  getSkillsByTier, 
  SKILL_TREES 
} from '../core/skills/SkillData'
import { 
  Book, 
  Sword, 
  Zap, 
  Crown, 
  Shield, 
  Target,
  Star,
  Lock,
  CheckCircle,
  Plus,
  Minus,
  ArrowRight,
  Info
} from 'lucide-react'
import clsx from 'clsx'

interface SkillPanelProps {
  unit: Unit
  onSkillLearned?: (skillId: string) => void
}

export function SkillPanel({ unit, onSkillLearned }: SkillPanelProps) {
  const [selectedTree, setSelectedTree] = useState<SkillTreeType>(SkillTreeType.GENERAL)
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null)
  const [showConfirmLearn, setShowConfirmLearn] = useState(false)

  const skillProgress = unit.skillManager.getProgress()
  const availableJP = unit.skillManager.getAvailableJP()
  const learnedSkills = unit.skillManager.getAllLearnedSkills()
  const skillStatBonuses = unit.skillManager.getSkillStatBonuses()

  const getTreeIcon = (treeType: SkillTreeType) => {
    switch (treeType) {
      case SkillTreeType.GENERAL: return <Star className="h-4 w-4" />
      case SkillTreeType.COMBAT: return <Sword className="h-4 w-4" />
      case SkillTreeType.MAGIC: return <Zap className="h-4 w-4" />
      case SkillTreeType.TACTICS: return <Crown className="h-4 w-4" />
      case SkillTreeType.SURVIVAL: return <Shield className="h-4 w-4" />
      case SkillTreeType.WEAPON_MASTERY: return <Target className="h-4 w-4" />
      default: return <Book className="h-4 w-4" />
    }
  }

  const getTreeColor = (treeType: SkillTreeType) => {
    switch (treeType) {
      case SkillTreeType.GENERAL: return 'text-slate-400 bg-slate-900/30'
      case SkillTreeType.COMBAT: return 'text-red-400 bg-red-900/30'
      case SkillTreeType.MAGIC: return 'text-blue-400 bg-blue-900/30'
      case SkillTreeType.TACTICS: return 'text-yellow-400 bg-yellow-900/30'
      case SkillTreeType.SURVIVAL: return 'text-green-400 bg-green-900/30'
      case SkillTreeType.WEAPON_MASTERY: return 'text-purple-400 bg-purple-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  const getNodeTypeIcon = (nodeType: SkillNodeType) => {
    switch (nodeType) {
      case SkillNodeType.STAT_BOOST: return <Plus className="h-3 w-3" />
      case SkillNodeType.PASSIVE: return <Shield className="h-3 w-3" />
      case SkillNodeType.ACTIVE: return <Zap className="h-3 w-3" />
      case SkillNodeType.WEAPON_SKILL: return <Sword className="h-3 w-3" />
      case SkillNodeType.FORMATION: return <Crown className="h-3 w-3" />
      default: return <Star className="h-3 w-3" />
    }
  }

  const isSkillLearned = (skillId: string): boolean => {
    return unit.skillManager.hasSkill(skillId)
  }

  const canLearnSkill = (skill: SkillNode): { canLearn: boolean; reason?: string } => {
    return unit.skillManager.canLearnSkill(skill.id)
  }

  const getSkillRank = (skillId: string): number => {
    const learned = unit.skillManager.getLearnedSkill(skillId)
    return learned?.rank || 0
  }

  const handleLearnSkill = (skill: SkillNode) => {
    setSelectedSkill(skill)
    setShowConfirmLearn(true)
  }

  const confirmLearnSkill = () => {
    if (selectedSkill && unit.skillManager.learnSkill(selectedSkill.id)) {
      onSkillLearned?.(selectedSkill.id)
      setShowConfirmLearn(false)
      setSelectedSkill(null)
    }
  }

  const getTreeProgress = (treeType: SkillTreeType): { learned: number; total: number } => {
    const treeSkills = getSkillsByTree(treeType)
    const learnedCount = treeSkills.filter(skill => isSkillLearned(skill.id)).length
    return { learned: learnedCount, total: treeSkills.length }
  }

  const renderSkillNode = (skill: SkillNode) => {
    const learned = isSkillLearned(skill.id)
    const canLearn = canLearnSkill(skill)
    const rank = getSkillRank(skill.id)
    const maxRank = skill.maxRank

    return (
      <div
        key={skill.id}
        className={clsx(
          'relative border rounded-lg p-3 cursor-pointer transition-all',
          learned ? 'border-green-500 bg-green-900/20' : 
          canLearn.canLearn ? 'border-blue-500 bg-blue-900/20 hover:bg-blue-900/30' :
          'border-slate-600 bg-slate-700/50',
          skill.isCapstone && 'ring-2 ring-yellow-400/50'
        )}
        onClick={() => setSelectedSkill(skill)}
      >
        {/* Skill Status Icon */}
        <div className="absolute top-2 right-2">
          {learned ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : canLearn.canLearn ? (
            <Plus className="h-4 w-4 text-blue-400" />
          ) : (
            <Lock className="h-4 w-4 text-slate-500" />
          )}
        </div>

        {/* Skill Info */}
        <div className="pr-6">
          <div className="flex items-center space-x-2 mb-1">
            <div className={clsx('p-1 rounded', getTreeColor(skill.treeType))}>
              {getNodeTypeIcon(skill.nodeType)}
            </div>
            <h4 className={clsx(
              'font-medium text-sm',
              learned ? 'text-green-400' : 
              canLearn.canLearn ? 'text-blue-400' : 'text-slate-400'
            )}>
              {skill.name}
            </h4>
            {skill.isCapstone && (
              <Star className="h-3 w-3 text-yellow-400" />
            )}
          </div>

          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
            {skill.description}
          </p>

          <div className="flex justify-between items-center text-xs">
            <div className="flex space-x-3">
              <span className="text-slate-500">
                JP: {skill.jpCost}
              </span>
              <span className="text-slate-500">
                Lv: {skill.levelRequirement}
              </span>
              {maxRank > 1 && (
                <span className={clsx(
                  learned ? 'text-green-400' : 'text-slate-500'
                )}>
                  Rank: {rank}/{maxRank}
                </span>
              )}
            </div>
            <span className={clsx(
              'px-2 py-1 rounded text-xs',
              `tier-${skill.tier}`,
              skill.tier === 1 ? 'bg-slate-600 text-slate-300' :
              skill.tier === 2 ? 'bg-blue-600 text-blue-200' :
              'bg-purple-600 text-purple-200'
            )}>
              T{skill.tier}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderSkillTree = () => {
    const treeSkills = getSkillsByTree(selectedTree)
    const maxTier = Math.max(...treeSkills.map(s => s.tier))
    
    return (
      <div className="space-y-6">
        {Array.from({ length: maxTier }, (_, i) => i + 1).map(tier => {
          const tierSkills = getSkillsByTier(selectedTree, tier)
          
          return (
            <div key={tier} className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-slate-300">
                  Tier {tier}
                </h4>
                <div className="flex-1 h-px bg-slate-600" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tierSkills.map(renderSkillNode)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Skill Overview */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Book className="h-5 w-5 mr-2 text-blue-400" />
            Skill Development
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">
              {availableJP}
            </div>
            <div className="text-sm text-slate-400">
              Job Points
            </div>
          </div>
        </div>

        {/* Skill Stat Bonuses */}
        {Object.keys(skillStatBonuses).some(stat => (skillStatBonuses as any)[stat] > 0) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Skill Bonuses</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(skillStatBonuses).map(([stat, bonus]) => (
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

        {/* Tree Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SKILL_TREES.map(tree => {
            const progress = getTreeProgress(tree.type)
            return (
              <div key={tree.type} className="text-center">
                <div className={clsx(
                  'p-2 rounded-lg mb-2',
                  getTreeColor(tree.type)
                )}>
                  {getTreeIcon(tree.type)}
                </div>
                <div className="text-sm text-white font-medium">
                  {progress.learned}/{progress.total}
                </div>
                <div className="text-xs text-slate-400 capitalize">
                  {tree.type.replace('_', ' ')}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tree Selection */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {SKILL_TREES.map(tree => (
            <button
              key={tree.type}
              onClick={() => setSelectedTree(tree.type)}
              className={clsx(
                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                selectedTree === tree.type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-slate-400 hover:text-slate-300'
              )}
            >
              {getTreeIcon(tree.type)}
              <span className="capitalize">{tree.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skill Tree */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-white mb-1">
            {SKILL_TREES.find(t => t.type === selectedTree)?.name}
          </h4>
          <p className="text-sm text-slate-400">
            {SKILL_TREES.find(t => t.type === selectedTree)?.description}
          </p>
        </div>

        {renderSkillTree()}
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={clsx('p-2 rounded-lg', getTreeColor(selectedSkill.treeType))}>
                    {getNodeTypeIcon(selectedSkill.nodeType)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedSkill.name}
                    </h3>
                    <p className="text-sm text-slate-400 capitalize">
                      {selectedSkill.nodeType.replace('_', ' ')} • Tier {selectedSkill.tier}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-300 mb-2">{selectedSkill.description}</p>
                  {selectedSkill.flavorText && (
                    <p className="text-sm text-slate-500 italic">"{selectedSkill.flavorText}"</p>
                  )}
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Requirements</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Job Points:</span>
                      <span className={availableJP >= selectedSkill.jpCost ? 'text-green-400' : 'text-red-400'}>
                        {selectedSkill.jpCost} JP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Level:</span>
                      <span className={unit.experience.currentLevel >= selectedSkill.levelRequirement ? 'text-green-400' : 'text-red-400'}>
                        {selectedSkill.levelRequirement}
                      </span>
                    </div>
                    {selectedSkill.prerequisites.length > 0 && (
                      <div>
                        <span className="text-slate-400">Prerequisites:</span>
                        <div className="mt-1 space-y-1">
                          {selectedSkill.prerequisites.map(prereqId => {
                            const hasPrereq = isSkillLearned(prereqId)
                            return (
                              <div key={prereqId} className={clsx(
                                'text-xs px-2 py-1 rounded',
                                hasPrereq ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                              )}>
                                {prereqId.replace('_', ' ')}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Effects */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Effects</h4>
                  <div className="space-y-2">
                    {selectedSkill.effects.map((effect, index) => (
                      <div key={index} className="text-sm bg-slate-700 rounded p-2">
                        <div className="text-green-400">
                          {effect.type === 'stat_bonus' && `+${effect.value} ${effect.statType?.toUpperCase()}`}
                          {effect.type === 'damage_bonus' && `${effect.percentage ? '+' + effect.percentage + '%' : '+' + effect.value} damage`}
                          {effect.type === 'heal' && `Heal ${effect.percentage ? effect.percentage + '% HP' : effect.value + ' HP'}`}
                          {effect.type === 'special' && effect.condition}
                        </div>
                        {effect.target && effect.target !== 'self' && (
                          <div className="text-xs text-slate-400 mt-1">
                            Target: {effect.target}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learn Button */}
                {!isSkillLearned(selectedSkill.id) && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleLearnSkill(selectedSkill)}
                      disabled={!canLearnSkill(selectedSkill).canLearn}
                      className={clsx(
                        'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
                        canLearnSkill(selectedSkill).canLearn
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      Learn Skill ({selectedSkill.jpCost} JP)
                    </button>
                  </div>
                )}

                {!canLearnSkill(selectedSkill).canLearn && (
                  <div className="text-sm text-red-400 bg-red-900/20 rounded p-2">
                    {canLearnSkill(selectedSkill).reason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Learn Modal */}
      {showConfirmLearn && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Learn Skill?
            </h3>
            <p className="text-slate-300 mb-4">
              Learn <span className="text-blue-400 font-medium">{selectedSkill.name}</span> for{' '}
              <span className="text-yellow-400 font-medium">{selectedSkill.jpCost} JP</span>?
            </p>
            <p className="text-sm text-slate-400 mb-6">
              You will have {availableJP - selectedSkill.jpCost} JP remaining.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmLearnSkill}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Learn
              </button>
              <button
                onClick={() => setShowConfirmLearn(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}