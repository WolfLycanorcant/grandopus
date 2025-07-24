import { 
  SkillTreeProgress, 
  LearnedSkill, 
  SkillNode, 
  SkillTreeType,
  SkillActivationResult,
  SkillContext,
  SkillCooldown
} from './types'
import { getSkill, getPrerequisites, SKILL_TREES } from './SkillData'
import { Unit } from '../units'

/**
 * Manages skill learning, activation, and progression for units
 */
export class SkillManager {
  private unit: Unit
  private progress: SkillTreeProgress
  private activeCooldowns: Map<string, SkillCooldown>

  constructor(unit: Unit) {
    this.unit = unit
    this.activeCooldowns = new Map()
    
    // Initialize skill progress
    this.progress = {
      unitId: unit.id,
      learnedSkills: new Map(),
      availableJP: 0,
      totalJPSpent: 0,
      generalTreeProgress: 0,
      combatTreeProgress: 0,
      magicTreeProgress: 0,
      tacticsTreeProgress: 0,
      survivalTreeProgress: 0,
      weaponMasteryProgress: 0
    }
  }

  /**
   * Add Job Points to the unit
   */
  public addJobPoints(amount: number): void {
    this.progress.availableJP += amount
  }

  /**
   * Get available Job Points
   */
  public getAvailableJP(): number {
    return this.progress.availableJP
  }

  /**
   * Check if unit can learn a skill
   */
  public canLearnSkill(skillId: string): { canLearn: boolean; reason?: string } {
    const skill = getSkill(skillId)
    if (!skill) {
      return { canLearn: false, reason: 'Skill not found' }
    }

    // Check if already learned at max rank
    const learned = this.progress.learnedSkills.get(skillId)
    if (learned && learned.rank >= skill.maxRank) {
      return { canLearn: false, reason: 'Already learned at maximum rank' }
    }

    // Check Job Points
    if (this.progress.availableJP < skill.jpCost) {
      return { canLearn: false, reason: `Requires ${skill.jpCost} JP (have ${this.progress.availableJP})` }
    }

    // Check level requirement
    if (this.unit.experience.currentLevel < skill.levelRequirement) {
      return { canLearn: false, reason: `Requires level ${skill.levelRequirement}` }
    }

    // Check stat requirements
    if (skill.statRequirements) {
      const currentStats = this.unit.getCurrentStats()
      for (const [stat, required] of Object.entries(skill.statRequirements)) {
        if (currentStats[stat as keyof typeof currentStats] < required) {
          return { canLearn: false, reason: `Requires ${required} ${stat.toUpperCase()}` }
        }
      }
    }

    // Check prerequisites
    for (const prereqId of skill.prerequisites) {
      if (!this.hasSkill(prereqId)) {
        const prereqSkill = getSkill(prereqId)
        return { 
          canLearn: false, 
          reason: `Requires skill: ${prereqSkill?.name || prereqId}` 
        }
      }
    }

    return { canLearn: true }
  }

  /**
   * Learn a skill
   */
  public learnSkill(skillId: string): boolean {
    const canLearn = this.canLearnSkill(skillId)
    if (!canLearn.canLearn) {
      return false
    }

    const skill = getSkill(skillId)
    if (!skill) return false

    // Deduct JP cost
    this.progress.availableJP -= skill.jpCost
    this.progress.totalJPSpent += skill.jpCost

    // Add or upgrade skill
    const existing = this.progress.learnedSkills.get(skillId)
    const newRank = existing ? existing.rank + 1 : 1

    this.progress.learnedSkills.set(skillId, {
      skillId,
      rank: newRank,
      learnedAt: new Date()
    })

    // Update tree progress
    this.updateTreeProgress(skill.treeType)

    // Apply passive effects immediately
    this.applySkillEffects(skill)

    return true
  }

  /**
   * Check if unit has a specific skill
   */
  public hasSkill(skillId: string): boolean {
    return this.progress.learnedSkills.has(skillId)
  }

  /**
   * Get learned skill info
   */
  public getLearnedSkill(skillId: string): LearnedSkill | null {
    return this.progress.learnedSkills.get(skillId) || null
  }

  /**
   * Get all learned skills
   */
  public getAllLearnedSkills(): LearnedSkill[] {
    return Array.from(this.progress.learnedSkills.values())
  }

  /**
   * Get available skills for a tree
   */
  public getAvailableSkills(treeType: SkillTreeType): SkillNode[] {
    const tree = SKILL_TREES.find(t => t.type === treeType)
    if (!tree) return []

    return tree.nodes.filter(skill => {
      const canLearn = this.canLearnSkill(skill.id)
      return canLearn.canLearn || this.hasSkill(skill.id)
    })
  }

  /**
   * Activate a skill (for active skills)
   */
  public activateSkill(skillId: string, context: SkillContext): SkillActivationResult {
    const skill = getSkill(skillId)
    if (!skill || !this.hasSkill(skillId)) {
      return { success: false, effects: [] }
    }

    // Check cooldown
    const cooldown = this.activeCooldowns.get(skillId)
    if (cooldown && cooldown.remainingTurns > 0) {
      return { 
        success: false, 
        effects: [],
        message: `Skill on cooldown for ${cooldown.remainingTurns} turns`
      }
    }

    // Apply skill effects
    const effects = this.processSkillEffects(skill, context)
    
    // Set cooldown if applicable
    if (skill.nodeType === 'active') {
      this.activeCooldowns.set(skillId, {
        skillId,
        remainingTurns: 3, // Default cooldown
        maxCooldown: 3
      })
    }

    return {
      success: true,
      effects,
      message: `${skill.name} activated!`,
      cooldownTurns: 3
    }
  }

  /**
   * Process skill effects
   */
  private processSkillEffects(skill: SkillNode, context: SkillContext): Array<{
    type: string
    value: number
    target: string
    description: string
  }> {
    const results = []

    for (const effect of skill.effects) {
      switch (effect.type) {
        case 'stat_bonus':
          if (effect.statType && effect.value) {
            results.push({
              type: 'stat_bonus',
              value: effect.value,
              target: 'self',
              description: `+${effect.value} ${effect.statType.toUpperCase()}`
            })
          }
          break

        case 'damage_bonus':
          if (effect.value || effect.percentage) {
            const bonus = effect.value || (effect.percentage || 0)
            results.push({
              type: 'damage_bonus',
              value: bonus,
              target: effect.target || 'self',
              description: `${bonus > 0 ? '+' : ''}${bonus}${effect.percentage ? '%' : ''} damage`
            })
          }
          break

        case 'heal':
          if (effect.value || effect.percentage) {
            const healAmount = effect.value || 
              (effect.percentage ? Math.floor(this.unit.getMaxStats().hp * (effect.percentage / 100)) : 0)
            
            this.unit.heal(healAmount)
            results.push({
              type: 'heal',
              value: healAmount,
              target: 'self',
              description: `Healed ${healAmount} HP`
            })
          }
          break

        case 'special':
          results.push({
            type: 'special',
            value: effect.value || effect.percentage || 0,
            target: effect.target || 'self',
            description: effect.condition || 'Special effect'
          })
          break
      }
    }

    return results
  }

  /**
   * Apply passive skill effects to unit stats
   */
  private applySkillEffects(skill: SkillNode): void {
    for (const effect of skill.effects) {
      if (effect.type === 'stat_bonus' && effect.statType && effect.value) {
        // These are applied when calculating current stats
        // The Unit class should check learned skills when calculating stats
      }
    }
  }

  /**
   * Update tree progress
   */
  private updateTreeProgress(treeType: SkillTreeType): void {
    const learnedInTree = Array.from(this.progress.learnedSkills.values())
      .filter(learned => {
        const skill = getSkill(learned.skillId)
        return skill?.treeType === treeType
      }).length

    switch (treeType) {
      case SkillTreeType.GENERAL:
        this.progress.generalTreeProgress = learnedInTree
        break
      case SkillTreeType.COMBAT:
        this.progress.combatTreeProgress = learnedInTree
        break
      case SkillTreeType.MAGIC:
        this.progress.magicTreeProgress = learnedInTree
        break
      case SkillTreeType.TACTICS:
        this.progress.tacticsTreeProgress = learnedInTree
        break
      case SkillTreeType.SURVIVAL:
        this.progress.survivalTreeProgress = learnedInTree
        break
      case SkillTreeType.WEAPON_MASTERY:
        this.progress.weaponMasteryProgress = learnedInTree
        break
    }
  }

  /**
   * Reduce cooldowns (call at start of each turn)
   */
  public reduceCooldowns(): void {
    for (const [skillId, cooldown] of this.activeCooldowns.entries()) {
      cooldown.remainingTurns--
      if (cooldown.remainingTurns <= 0) {
        this.activeCooldowns.delete(skillId)
      }
    }
  }

  /**
   * Get skill tree progress
   */
  public getProgress(): SkillTreeProgress {
    return { ...this.progress }
  }

  /**
   * Calculate stat bonuses from learned skills
   */
  public getSkillStatBonuses(): Partial<import('../units/types').UnitStats> {
    const bonuses: Partial<import('../units/types').UnitStats> = {
      hp: 0,
      str: 0,
      mag: 0,
      skl: 0,
      arm: 0,
      ldr: 0
    }

    for (const learned of this.progress.learnedSkills.values()) {
      const skill = getSkill(learned.skillId)
      if (!skill) continue

      for (const effect of skill.effects) {
        if (effect.type === 'stat_bonus' && effect.statType && effect.value) {
          const currentBonus = bonuses[effect.statType] || 0
          bonuses[effect.statType] = currentBonus + (effect.value * learned.rank)
        }
      }
    }

    return bonuses
  }

  /**
   * Serialize to JSON
   */
  public toJSON(): any {
    const learnedSkillsArray = Array.from(this.progress.learnedSkills.entries()).map(([id, skill]) => ({
      id,
      ...skill
    }))

    return {
      unitId: this.progress.unitId,
      learnedSkills: learnedSkillsArray,
      availableJP: this.progress.availableJP,
      totalJPSpent: this.progress.totalJPSpent,
      treeProgress: {
        general: this.progress.generalTreeProgress,
        combat: this.progress.combatTreeProgress,
        magic: this.progress.magicTreeProgress,
        tactics: this.progress.tacticsTreeProgress,
        survival: this.progress.survivalTreeProgress,
        weaponMastery: this.progress.weaponMasteryProgress
      }
    }
  }

  /**
   * Load from JSON
   */
  public fromJSON(data: any): void {
    this.progress.availableJP = data.availableJP || 0
    this.progress.totalJPSpent = data.totalJPSpent || 0
    
    // Load learned skills
    this.progress.learnedSkills.clear()
    if (data.learnedSkills) {
      for (const skillData of data.learnedSkills) {
        this.progress.learnedSkills.set(skillData.id, {
          skillId: skillData.skillId,
          rank: skillData.rank,
          learnedAt: new Date(skillData.learnedAt)
        })
      }
    }

    // Load tree progress
    if (data.treeProgress) {
      this.progress.generalTreeProgress = data.treeProgress.general || 0
      this.progress.combatTreeProgress = data.treeProgress.combat || 0
      this.progress.magicTreeProgress = data.treeProgress.magic || 0
      this.progress.tacticsTreeProgress = data.treeProgress.tactics || 0
      this.progress.survivalTreeProgress = data.treeProgress.survival || 0
      this.progress.weaponMasteryProgress = data.treeProgress.weaponMastery || 0
    }
  }
}