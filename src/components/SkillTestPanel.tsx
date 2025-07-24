import React, { useState } from 'react'
import { Unit, UnitFactory } from '../core/units'
import { SkillPanel } from './SkillPanel'
import { 
  SkillTreeType, 
  SkillNodeType 
} from '../core/skills/types'
import { 
  getSkillsByTree, 
  SKILL_TREES 
} from '../core/skills/SkillData'
import { 
  Book, 
  Plus, 
  Zap, 
  RefreshCw,
  Award,
  Target
} from 'lucide-react'

export function SkillTestPanel() {
  // Create a test unit for skill testing
  const [testUnit] = useState(() => {
    return UnitFactory.createUnit({
      name: 'Skill Tester',
      race: 'human' as any,
      archetype: 'knight' as any,
      level: 5
    })
  })
  const [showSkillPanel, setShowSkillPanel] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
  }

  const handleAddJobPoints = (amount: number) => {
    testUnit.skillManager.addJobPoints(amount)
    addTestResult(`Added ${amount} Job Points. Total: ${testUnit.skillManager.getAvailableJP()}`)
  }

  const handleLearnRandomSkill = () => {
    // Find a learnable skill
    const allSkills = SKILL_TREES.flatMap(tree => tree.nodes)
    const learnableSkills = allSkills.filter(skill => {
      const canLearn = testUnit.skillManager.canLearnSkill(skill.id)
      return canLearn.canLearn && !testUnit.skillManager.hasSkill(skill.id)
    })

    if (learnableSkills.length === 0) {
      addTestResult('No skills available to learn')
      return
    }

    const randomSkill = learnableSkills[Math.floor(Math.random() * learnableSkills.length)]
    if (testUnit.skillManager.learnSkill(randomSkill.id)) {
      addTestResult(`Learned skill: ${randomSkill.name}`)
    } else {
      addTestResult(`Failed to learn skill: ${randomSkill.name}`)
    }
  }

  const handleTestSkillActivation = () => {
    const learnedSkills = testUnit.skillManager.getAllLearnedSkills()
    const activeSkills = learnedSkills.filter(learned => {
      const skill = SKILL_TREES.flatMap(tree => tree.nodes).find(s => s.id === learned.skillId)
      return skill?.nodeType === SkillNodeType.ACTIVE
    })

    if (activeSkills.length === 0) {
      addTestResult('No active skills to test')
      return
    }

    const randomActiveSkill = activeSkills[Math.floor(Math.random() * activeSkills.length)]
    const result = testUnit.skillManager.activateSkill(randomActiveSkill.skillId, {
      caster: testUnit,
      battle: null
    })

    if (result.success) {
      addTestResult(`Activated skill: ${randomActiveSkill.skillId} - ${result.message}`)
    } else {
      addTestResult(`Failed to activate skill: ${randomActiveSkill.skillId} - ${result.message}`)
    }
  }

  const handleResetSkills = () => {
    // Create a new skill manager (effectively resetting)
    testUnit.skillManager = new (testUnit.skillManager.constructor as any)(testUnit)
    addTestResult('Reset all skills and JP')
  }

  const skillProgress = testUnit.skillManager.getProgress()
  const skillBonuses = testUnit.skillManager.getSkillStatBonuses()
  const learnedSkills = testUnit.skillManager.getAllLearnedSkills()

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Book className="h-5 w-5 mr-2 text-blue-400" />
          Skill System Testing
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => handleAddJobPoints(50)}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+50 JP</span>
          </button>

          <button
            onClick={() => handleAddJobPoints(200)}
            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+200 JP</span>
          </button>

          <button
            onClick={handleLearnRandomSkill}
            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded transition-colors"
          >
            <Award className="h-4 w-4" />
            <span>Learn Random</span>
          </button>

          <button
            onClick={handleTestSkillActivation}
            className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded transition-colors"
          >
            <Zap className="h-4 w-4" />
            <span>Test Active</span>
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowSkillPanel(!showSkillPanel)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors"
          >
            <Target className="h-4 w-4" />
            <span>{showSkillPanel ? 'Hide' : 'Show'} Skill Panel</span>
          </button>

          <button
            onClick={handleResetSkills}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Skills</span>
          </button>
        </div>
      </div>

      {/* Skill Status */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Current Status</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {skillProgress.availableJP}
            </div>
            <div className="text-sm text-slate-400">Available JP</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {skillProgress.totalJPSpent}
            </div>
            <div className="text-sm text-slate-400">Total JP Spent</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {learnedSkills.length}
            </div>
            <div className="text-sm text-slate-400">Skills Learned</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Object.values(skillBonuses).reduce((sum, bonus) => sum + (bonus || 0), 0)}
            </div>
            <div className="text-sm text-slate-400">Total Stat Bonus</div>
          </div>
        </div>

        {/* Skill Bonuses */}
        {Object.keys(skillBonuses).some(stat => (skillBonuses as any)[stat] > 0) && (
          <div>
            <h5 className="text-xs font-medium text-slate-400 mb-2">Active Skill Bonuses</h5>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(skillBonuses).map(([stat, bonus]) => (
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
        <div className="mt-4">
          <h5 className="text-xs font-medium text-slate-400 mb-2">Tree Progress</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">General:</span>
              <span className="text-white">{skillProgress.generalTreeProgress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Combat:</span>
              <span className="text-white">{skillProgress.combatTreeProgress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Magic:</span>
              <span className="text-white">{skillProgress.magicTreeProgress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tactics:</span>
              <span className="text-white">{skillProgress.tacticsTreeProgress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learned Skills */}
      {learnedSkills.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Learned Skills</h4>
          <div className="space-y-2">
            {learnedSkills.map(learned => {
              const skill = SKILL_TREES.flatMap(tree => tree.nodes).find(s => s.id === learned.skillId)
              return (
                <div key={learned.skillId} className="flex justify-between items-center text-sm bg-slate-600 rounded p-2">
                  <div>
                    <span className="text-white font-medium">{skill?.name || learned.skillId}</span>
                    {learned.rank > 1 && (
                      <span className="text-yellow-400 ml-2">Rank {learned.rank}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {skill?.treeType.replace('_', ' ')} • Tier {skill?.tier}
                  </div>
                </div>
              )
            })}
          </div>
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

      {/* Skill Panel */}
      {showSkillPanel && (
        <SkillPanel 
          unit={testUnit} 
          onSkillLearned={(skillId) => addTestResult(`Learned skill: ${skillId}`)}
        />
      )}
    </div>
  )
}