import React, { useState } from 'react'
import { Unit } from '../core/units'
import { 
  SkillTreeType, 
  SkillNode, 
  SkillNodeType,
  LearnedSkill 
} from '../core/skills/types'
import { 
  SKILL_TREES, 
  getSkillsByTree, 
  getSkillsByTier,
  getPrerequisites 
} from '../core/skills/SkillData'
import { 
  Zap, 
  Sword, 
  Sparkles, 
  Users, 
  Shield, 
  Star,
  Lock,
  CheckCircle,
  Circle,
  ArrowRight,
  Coins
} from 'lucide-react'
import clsx from 'clsx'

interface SkillTreePanelProps {
  unit: Unit
  onSkillLearned?: () => void
}

export function SkillTreePanel({ unit, onSkillLearned }: SkillTreePanelProps) {
  const [selectedTree, setSelectedTree] = useState<SkillTreeType>(SkillTreeType.GENERAL)
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null)
  
  const getTreeIcon = (treeType: SkillTreeType) => {
    switch (treeType) {
      case SkillTreeType.GENERAL: return <Shield className="h-5 w-5" />
      case SkillTreeType.COMBAT: return <Sword className="h-5 w-5" />
      case SkillTreeType.MAGIC: return <Sparkles className="h-5 w-5" />
      case SkillTreeType.TACTICS: return <Users className="h-5 w-5" />
      default: return <Star className="h-5 w-5" />
    }
  }
  
  const getTreeName = (treeType: SkillTreeType) => {
    const tree = SKILL_TREES.find(t => t.type === treeType)
    return tree?.name || treeType
  }
  
  const getNodeTypeIcon = (nodeType: SkillNodeType) => {
    switch (nodeType) {
      case SkillNodeType.STAT_BOOST: return <Zap className="h-4 w-4" />
      case SkillNodeType.PASSIVE: return <Shield className="h-4 w-4" />
      case SkillNodeType.ACTIVE: return <Star className="h-4 w-4" />
      case SkillNodeType.FORMATION: return <Users className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }
  
  const getSkillStatus = (skill: SkillNode): 'learned' | 'available' | 'locked' => {
    if (unit.skillManager.hasSkill(skill.id)) {
      return 'learned'
    }
    
    const canLearn = unit.skillManager.canLearnSkill(skill.id)
    return canLearn.canLearn ? 'available' : 'locked'
  }
  
  const getStatusColor = (status: 'learned' | 'available' | 'locked') => {
    switch (status) {
      case 'learned': return 'border-green-500 bg-green-900/20 text-green-300'
      case 'available': return 'border-blue-500 bg-blue-900/20 text-blue-300 hover:bg-blue-800/30'
      case 'locked': return 'border-gray-600 bg-gray-800/20 text-gray-500'
    }
  }
  
  const getStatusIcon = (status: 'learned' | 'available' | 'locked') => {
    switch (status) {
      case 'learned': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'available': return <Circle className="h-4 w-4 text-blue-400" />
      case 'locked': return <Lock className="h-4 w-4 text-gray-500" />
    }
  }
  
  const handleLearnSkill = (skillId: string) => {
    const success = unit.skillManager.learnSkill(skillId)
    if (success) {
      onSkillLearned?.()
      setSelectedSkill(null)
    } else {
      const canLearn = unit.skillManager.canLearnSkill(skillId)
      alert(`Cannot learn skill: ${canLearn.reason}`)
    }
  }
  
  const renderSkillNode = (skill: SkillNode) => {
    const status = getSkillStatus(skill)
    const learned = unit.skillManager.getLearnedSkill(skill.id)
    
    return (
      <div
        key={skill.id}
        className={clsx(
          'border-2 rounded-lg p-3 cursor-pointer transition-all duration-200',
          getStatusColor(status),
          selectedSkill?.id === skill.id && 'ring-2 ring-yellow-400'
        )}
        onClick={() => setSelectedSkill(skill)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getNodeTypeIcon(skill.nodeType)}
            <span className="font-medium text-sm">{skill.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon(status)}
            {learned && learned.rank > 1 && (
              <span className="text-xs bg-yellow-600 text-yellow-100 px-1 rounded">
                {learned.rank}/{skill.maxRank}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-xs text-slate-400 mb-2">{skill.description}</p>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Tier {skill.tier}</span>
            {skill.isCapstone && (
              <span className="bg-yellow-600 text-yellow-100 px-1 rounded">Capstone</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Coins className="h-3 w-3 text-yellow-400" />
            <span className="text-yellow-400">{skill.jpCost}</span>
          </div>
        </div>
      </div>
    )
  }
  
  const renderSkillTree = () => {
    const skills = getSkillsByTree(selectedTree)
    const maxTier = Math.max(...skills.map(s => s.tier))
    
    return (
      <div className="space-y-6">
        {Array.from({ length: maxTier }, (_, i) => i + 1).map(tier => {
          const tierSkills = getSkillsByTier(selectedTree, tier)
          
          return (
            <div key={tier} className="space-y-3">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-slate-300">Tier {tier}</h4>
                <div className="flex-1 h-px bg-slate-600"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tierSkills.map(renderSkillNode)}
              </div>
              
              {tier < maxTier && (
                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-slate-500 rotate-90" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
  
  const availableJP = unit.skillManager.getAvailableJP()
  const progress = unit.skillManager.getProgress()
  
  return (
    <div className="space-y-4">
      {/* Header with JP */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Skill Trees</h3>
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">{availableJP} JP</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="text-center">
            <div className="text-slate-400">Total Spent</div>
            <div className="text-white font-medium">{progress.totalJPSpent} JP</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">General</div>
            <div className="text-green-400 font-medium">{progress.generalTreeProgress}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">Combat</div>
            <div className="text-red-400 font-medium">{progress.combatTreeProgress}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">Magic</div>
            <div className="text-purple-400 font-medium">{progress.magicTreeProgress}</div>
          </div>
        </div>
      </div>
      
      {/* Tree Selection */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SKILL_TREES.map(tree => (
            <button
              key={tree.type}
              onClick={() => setSelectedTree(tree.type)}
              className={clsx(
                'flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors',
                selectedTree === tree.type
                  ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                  : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
              )}
            >
              {getTreeIcon(tree.type)}
              <div className="text-left">
                <div className="text-sm font-medium">{tree.name}</div>
                <div className="text-xs opacity-75">
                  {getSkillsByTree(tree.type).filter(s => unit.skillManager.hasSkill(s.id)).length}/
                  {getSkillsByTree(tree.type).length}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Skill Tree */}
        <div className="lg:col-span-2 bg-slate-700 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-4">
            {getTreeName(selectedTree)}
          </h4>
          <div className="max-h-96 overflow-y-auto">
            {renderSkillTree()}
          </div>
        </div>
        
        {/* Skill Details */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-4">Skill Details</h4>
          
          {selectedSkill ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {getNodeTypeIcon(selectedSkill.nodeType)}
                  <h5 className="font-medium text-white">{selectedSkill.name}</h5>
                  {selectedSkill.isCapstone && (
                    <span className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded text-xs">
                      Capstone
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 mb-2">{selectedSkill.description}</p>
                {selectedSkill.flavorText && (
                  <p className="text-xs text-slate-400 italic">"{selectedSkill.flavorText}"</p>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost:</span>
                  <span className="text-yellow-400">{selectedSkill.jpCost} JP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Level Req:</span>
                  <span className="text-white">{selectedSkill.levelRequirement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Rank:</span>
                  <span className="text-white">{selectedSkill.maxRank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tier:</span>
                  <span className="text-white">{selectedSkill.tier}</span>
                </div>
              </div>
              
              {selectedSkill.prerequisites.length > 0 && (
                <div>
                  <h6 className="text-sm font-medium text-slate-300 mb-2">Prerequisites:</h6>
                  <div className="space-y-1">
                    {getPrerequisites(selectedSkill.id).map(prereq => (
                      <div key={prereq.id} className="flex items-center space-x-2 text-sm">
                        {unit.skillManager.hasSkill(prereq.id) ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-red-400" />
                        )}
                        <span className={unit.skillManager.hasSkill(prereq.id) ? 'text-green-300' : 'text-red-300'}>
                          {prereq.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h6 className="text-sm font-medium text-slate-300 mb-2">Effects:</h6>
                <div className="space-y-1">
                  {selectedSkill.effects.map((effect, index) => (
                    <div key={index} className="text-sm text-slate-300">
                      {effect.type === 'stat_bonus' && (
                        <span>+{effect.value} {effect.statType?.toUpperCase()}</span>
                      )}
                      {effect.type === 'damage_bonus' && (
                        <span>
                          {effect.percentage ? `+${effect.percentage}%` : `+${effect.value}`} damage
                          {effect.condition && ` (${effect.condition})`}
                        </span>
                      )}
                      {effect.type === 'heal' && (
                        <span>
                          Heal {effect.percentage ? `${effect.percentage}%` : effect.value} HP
                          {effect.condition && ` (${effect.condition})`}
                        </span>
                      )}
                      {effect.type === 'special' && (
                        <span>{effect.condition}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {getSkillStatus(selectedSkill) === 'available' && (
                <button
                  onClick={() => handleLearnSkill(selectedSkill.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Learn Skill ({selectedSkill.jpCost} JP)
                </button>
              )}
              
              {getSkillStatus(selectedSkill) === 'locked' && (
                <div className="text-center text-red-400 text-sm">
                  {unit.skillManager.canLearnSkill(selectedSkill.id).reason}
                </div>
              )}
              
              {getSkillStatus(selectedSkill) === 'learned' && (
                <div className="text-center text-green-400 text-sm font-medium">
                  ✓ Skill Learned
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a skill to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}