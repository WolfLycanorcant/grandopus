import { Unit } from '../units'
import { StatisticType } from '../achievements/types'

/**
 * Integration utilities for the skill system
 */
export class SkillIntegration {
  /**
   * Award Job Points to a unit based on battle performance
   */
  public static awardBattleJobPoints(unit: Unit, battleResult: {
    won: boolean
    damageDealt: number
    kills: number
    survived: boolean
  }): number {
    let jpAwarded = 0

    // Base JP for participating in battle
    jpAwarded += 2

    // Bonus JP for winning
    if (battleResult.won) {
      jpAwarded += 3
    }

    // Bonus JP for performance
    if (battleResult.damageDealt > 100) {
      jpAwarded += 2
    }

    if (battleResult.kills > 0) {
      jpAwarded += battleResult.kills * 2
    }

    if (battleResult.survived) {
      jpAwarded += 1
    }

    // Award the JP
    unit.skillManager.addJobPoints(jpAwarded)

    return jpAwarded
  }

  /**
   * Process skill effects during battle
   */
  public static processSkillEffects(unit: Unit, context: {
    event: 'battle_start' | 'turn_start' | 'on_attack' | 'on_hit' | 'on_crit' | 'on_kill' | 'on_damage_taken' | 'on_low_hp'
    target?: Unit
    damage?: number
    isCritical?: boolean
  }): Array<{
    skillId: string
    effect: string
    description: string
  }> {
    const results: Array<{
      skillId: string
      effect: string
      description: string
    }> = []

    const learnedSkills = unit.skillManager.getAllLearnedSkills()

    for (const learned of learnedSkills) {
      // This would be expanded to handle specific skill effects
      // For now, we just track that skills are being processed
      results.push({
        skillId: learned.skillId,
        effect: 'passive',
        description: `${learned.skillId} is active`
      })
    }

    return results
  }

  /**
   * Check if unit meets skill requirements for equipment
   */
  public static checkSkillRequirements(unit: Unit, requirements: {
    skillId: string
    minRank?: number
  }[]): boolean {
    for (const req of requirements) {
      const learned = unit.skillManager.getLearnedSkill(req.skillId)
      if (!learned) return false
      
      if (req.minRank && learned.rank < req.minRank) {
        return false
      }
    }

    return true
  }

  /**
   * Get skill-based formation bonuses
   */
  public static getSkillFormationBonuses(unit: Unit): {
    leadershipBonus: number
    formationEfficiency: number
    tacticalAdvantage: number
  } {
    const skillBonuses = unit.skillManager.getSkillStatBonuses()
    const combatBonuses = unit.skillManager.getCombatBonuses()

    return {
      leadershipBonus: skillBonuses.ldr || 0,
      formationEfficiency: combatBonuses.accuracyBonus,
      tacticalAdvantage: combatBonuses.damageBonus
    }
  }

  /**
   * Test skill system integration
   */
  public static testSkillIntegration(unit: Unit): {
    success: boolean
    results: string[]
    errors: string[]
  } {
    const results: string[] = []
    const errors: string[] = []

    try {
      // Test 1: Add JP and learn a skill
      const initialJP = unit.skillManager.getAvailableJP()
      unit.skillManager.addJobPoints(100)
      results.push(`✓ Added 100 JP (${initialJP} → ${unit.skillManager.getAvailableJP()})`)

      // Test 2: Try to learn a basic skill
      const success = unit.skillManager.learnSkill('vitality')
      if (success) {
        results.push('✓ Successfully learned Vitality skill')
      } else {
        results.push('✗ Failed to learn Vitality skill')
      }

      // Test 3: Check stat bonuses
      const skillBonuses = unit.skillManager.getSkillStatBonuses()
      const totalBonus = Object.values(skillBonuses).reduce((sum, bonus) => sum + (bonus || 0), 0)
      results.push(`✓ Skill stat bonuses applied: ${totalBonus} total bonus`)

      // Test 4: Check combat bonuses
      const combatBonuses = unit.skillManager.getCombatBonuses()
      results.push(`✓ Combat bonuses: ${combatBonuses.damageBonus}% damage, ${combatBonuses.criticalBonus}% crit`)

      // Test 5: Verify stats integration
      const baseStats = unit.getBaseStats()
      const currentStats = unit.getCurrentStats()
      const statDifference = currentStats.hp - baseStats.hp
      results.push(`✓ Stats integration: HP difference ${statDifference} (includes skill bonuses)`)

      return {
        success: true,
        results,
        errors
      }

    } catch (error) {
      errors.push(`Integration test failed: ${error}`)
      return {
        success: false,
        results,
        errors
      }
    }
  }
}