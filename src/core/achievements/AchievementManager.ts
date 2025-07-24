import { 
  UnitAchievements, 
  UnitStatistics, 
  AchievementProgress, 
  Achievement,
  AchievementNotification,
  StatisticType,
  AchievementSummary,
  AchievementCategory
} from './types'
import { getAchievement, getAllAchievements } from './AchievementData'
import { Unit } from '../units'
import { UnitStats } from '../units/types'

/**
 * Manages achievement tracking and unlocking for units
 */
export class AchievementManager {
  private unit: Unit
  private achievements: UnitAchievements
  private notifications: AchievementNotification[] = []

  constructor(unit: Unit) {
    this.unit = unit
    this.achievements = this.initializeAchievements()
  }

  /**
   * Initialize achievement data for a unit
   */
  private initializeAchievements(): UnitAchievements {
    const achievements = new Map<string, AchievementProgress>()
    
    // Initialize progress for all achievements
    getAllAchievements().forEach(achievement => {
      achievements.set(achievement.id, {
        achievementId: achievement.id,
        progress: 0,
        isUnlocked: false
      })
    })

    return {
      unitId: this.unit.id,
      achievements,
      statistics: this.initializeStatistics(),
      unlockedTitles: new Set(),
      totalStatBonuses: {},
      specialAbilities: new Set(),
      visualEffects: new Set()
    }
  }

  /**
   * Initialize unit statistics tracking
   */
  private initializeStatistics(): UnitStatistics {
    return {
      totalDamageTaken: 0,
      totalDamageDealt: 0,
      totalHealingDone: 0,
      totalKills: 0,
      criticalHits: 0,
      attacksDodged: 0,
      damageBlocked: 0,
      attacksMade: 0,
      highAccuracyAttacks: 0,
      battlesWon: 0,
      battlesLost: 0,
      battlesSurvived: 0,
      battlesLed: 0,
      lowHpSurvivals: 0,
      unitsHealed: new Set(),
      alliesSaved: 0,
      unitsTrainedToMax: 0,
      weaponsMastered: new Set(),
      spellsLearned: new Set(),
      dragonsKilled: 0,
      beastsFoughtWith: new Set(),
      embersEmbedded: 0,
      formationsUsed: new Map(),
      rareItemsFound: 0,
      enemyTypesKilled: new Set(),
      terrainTypesFoughtOn: new Set(),
      weaponTypesUsed: new Set()
    }
  }

  /**
   * Record a statistic and check for achievement progress
   */
  public recordStatistic(type: StatisticType, value: number | string, condition?: string): AchievementNotification[] {
    const newNotifications: AchievementNotification[] = []

    // Update the statistic
    this.updateStatistic(type, value)

    // Check all achievements for progress
    getAllAchievements().forEach(achievement => {
      if (achievement.requirement.type === type) {
        const progress = this.achievements.achievements.get(achievement.id)
        if (progress && !progress.isUnlocked) {
          // Check if condition matches (if specified)
          if (achievement.requirement.condition && achievement.requirement.condition !== condition) {
            return
          }

          const currentValue = this.getStatisticValue(type)
          const newProgress = Math.min(currentValue, achievement.requirement.target)
          
          if (newProgress > progress.progress) {
            progress.progress = newProgress
            
            // Check if achievement is now unlocked
            if (newProgress >= achievement.requirement.target) {
              const notification = this.unlockAchievement(achievement.id)
              if (notification) {
                newNotifications.push(notification)
              }
            }
          }
        }
      }
    })

    return newNotifications
  }

  /**
   * Update a specific statistic
   */
  private updateStatistic(type: StatisticType, value: number | string): void {
    const stats = this.achievements.statistics

    switch (type) {
      case StatisticType.DAMAGE_TAKEN:
        stats.totalDamageTaken += value as number
        break
      case StatisticType.DAMAGE_DEALT:
        stats.totalDamageDealt += value as number
        break
      case StatisticType.HEALING_DONE:
        stats.totalHealingDone += value as number
        break
      case StatisticType.KILLS:
        stats.totalKills += value as number
        break
      case StatisticType.CRITICAL_HITS:
        stats.criticalHits += value as number
        break
      case StatisticType.ATTACKS_DODGED:
        stats.attacksDodged += value as number
        break
      case StatisticType.DAMAGE_BLOCKED:
        stats.damageBlocked += value as number
        break
      case StatisticType.ATTACKS_MADE:
        stats.attacksMade += value as number
        break
      case StatisticType.HIGH_ACCURACY_ATTACKS:
        stats.highAccuracyAttacks += value as number
        break
      case StatisticType.BATTLES_WON:
        stats.battlesWon += value as number
        break
      case StatisticType.BATTLES_SURVIVED:
        stats.battlesSurvived += value as number
        break
      case StatisticType.BATTLES_LED:
        stats.battlesLed += value as number
        break
      case StatisticType.LOW_HP_SURVIVALS:
        stats.lowHpSurvivals += value as number
        break
      case StatisticType.UNITS_HEALED:
        stats.unitsHealed.add(value as string)
        break
      case StatisticType.ALLIES_SAVED:
        stats.alliesSaved += value as number
        break
      case StatisticType.UNITS_TRAINED:
        stats.unitsTrainedToMax += value as number
        break
      case StatisticType.WEAPONS_MASTERED:
        stats.weaponsMastered.add(value as string)
        break
      case StatisticType.SPELLS_LEARNED:
        stats.spellsLearned.add(value as string)
        break
      case StatisticType.DRAGONS_KILLED:
        stats.dragonsKilled += value as number
        break
      case StatisticType.BEASTS_FOUGHT_WITH:
        stats.beastsFoughtWith.add(value as string)
        break
      case StatisticType.EMBERS_EMBEDDED:
        stats.embersEmbedded += value as number
        break
      case StatisticType.FORMATIONS_USED:
        const formationType = value as string
        stats.formationsUsed.set(formationType, (stats.formationsUsed.get(formationType) || 0) + 1)
        break
      case StatisticType.RARE_ITEMS_FOUND:
        stats.rareItemsFound += value as number
        break
    }
  }

  /**
   * Get current value for a statistic type
   */
  private getStatisticValue(type: StatisticType): number {
    const stats = this.achievements.statistics

    switch (type) {
      case StatisticType.DAMAGE_TAKEN: return stats.totalDamageTaken
      case StatisticType.DAMAGE_DEALT: return stats.totalDamageDealt
      case StatisticType.HEALING_DONE: return stats.totalHealingDone
      case StatisticType.KILLS: return stats.totalKills
      case StatisticType.CRITICAL_HITS: return stats.criticalHits
      case StatisticType.ATTACKS_DODGED: return stats.attacksDodged
      case StatisticType.DAMAGE_BLOCKED: return stats.damageBlocked
      case StatisticType.ATTACKS_MADE: return stats.attacksMade
      case StatisticType.HIGH_ACCURACY_ATTACKS: return stats.highAccuracyAttacks
      case StatisticType.BATTLES_WON: return stats.battlesWon
      case StatisticType.BATTLES_SURVIVED: return stats.battlesSurvived
      case StatisticType.BATTLES_LED: return stats.battlesLed
      case StatisticType.LOW_HP_SURVIVALS: return stats.lowHpSurvivals
      case StatisticType.UNITS_HEALED: return stats.unitsHealed.size
      case StatisticType.ALLIES_SAVED: return stats.alliesSaved
      case StatisticType.UNITS_TRAINED: return stats.unitsTrainedToMax
      case StatisticType.WEAPONS_MASTERED: return stats.weaponsMastered.size
      case StatisticType.SPELLS_LEARNED: return stats.spellsLearned.size
      case StatisticType.DRAGONS_KILLED: return stats.dragonsKilled
      case StatisticType.BEASTS_FOUGHT_WITH: return stats.beastsFoughtWith.size
      case StatisticType.EMBERS_EMBEDDED: return stats.embersEmbedded
      case StatisticType.FORMATIONS_USED: 
        return Array.from(stats.formationsUsed.values()).reduce((sum, count) => sum + count, 0)
      case StatisticType.RARE_ITEMS_FOUND: return stats.rareItemsFound
      default: return 0
    }
  }

  /**
   * Unlock an achievement
   */
  private unlockAchievement(achievementId: string): AchievementNotification | null {
    const achievement = getAchievement(achievementId)
    const progress = this.achievements.achievements.get(achievementId)
    
    if (!achievement || !progress || progress.isUnlocked) {
      return null
    }

    // Mark as unlocked
    progress.isUnlocked = true
    progress.unlockedAt = new Date()

    // Apply rewards
    this.applyAchievementReward(achievement)

    // Add title if provided
    if (achievement.reward.title) {
      this.achievements.unlockedTitles.add(achievement.reward.title)
      if (!this.achievements.activeTitle) {
        this.achievements.activeTitle = achievement.reward.title
      }
    }

    // Create notification
    const notification: AchievementNotification = {
      achievement,
      unitName: this.unit.name,
      unitId: this.unit.id,
      timestamp: new Date()
    }

    this.notifications.push(notification)
    return notification
  }

  /**
   * Apply achievement reward to unit
   */
  private applyAchievementReward(achievement: Achievement): void {
    // Apply stat bonuses
    if (achievement.reward.statBonuses) {
      for (const [stat, bonus] of Object.entries(achievement.reward.statBonuses)) {
        if (this.achievements.totalStatBonuses[stat as keyof UnitStats] === undefined) {
          this.achievements.totalStatBonuses[stat as keyof UnitStats] = 0
        }
        this.achievements.totalStatBonuses[stat as keyof UnitStats]! += bonus
      }
    }

    // Add special abilities
    if (achievement.reward.specialAbility) {
      this.achievements.specialAbilities.add(achievement.reward.specialAbility)
    }

    // Add visual effects
    if (achievement.reward.visualEffect) {
      this.achievements.visualEffects.add(achievement.reward.visualEffect)
    }
  }

  /**
   * Get achievement progress for a specific achievement
   */
  public getAchievementProgress(achievementId: string): AchievementProgress | null {
    return this.achievements.achievements.get(achievementId) || null
  }

  /**
   * Get all achievement progress
   */
  public getAllAchievementProgress(): Map<string, AchievementProgress> {
    return new Map(this.achievements.achievements)
  }

  /**
   * Get unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    const unlocked: Achievement[] = []
    
    this.achievements.achievements.forEach((progress, achievementId) => {
      if (progress.isUnlocked) {
        const achievement = getAchievement(achievementId)
        if (achievement) {
          unlocked.push(achievement)
        }
      }
    })
    
    return unlocked
  }

  /**
   * Get achievement stat bonuses
   */
  public getAchievementStatBonuses(): Partial<UnitStats> {
    return { ...this.achievements.totalStatBonuses }
  }

  /**
   * Get special abilities from achievements
   */
  public getSpecialAbilities(): Set<string> {
    return new Set(this.achievements.specialAbilities)
  }

  /**
   * Get visual effects from achievements
   */
  public getVisualEffects(): Set<string> {
    return new Set(this.achievements.visualEffects)
  }

  /**
   * Get unit statistics
   */
  public getStatistics(): UnitStatistics {
    return { ...this.achievements.statistics }
  }

  /**
   * Get achievement summary
   */
  public getAchievementSummary(): AchievementSummary {
    const allAchievements = getAllAchievements()
    const unlockedCount = this.getUnlockedAchievements().length
    
    const byCategory: Record<AchievementCategory, { total: number; unlocked: number }> = {
      [AchievementCategory.COMBAT]: { total: 0, unlocked: 0 },
      [AchievementCategory.SUPPORT]: { total: 0, unlocked: 0 },
      [AchievementCategory.MASTERY]: { total: 0, unlocked: 0 },
      [AchievementCategory.LEGENDARY]: { total: 0, unlocked: 0 },
      [AchievementCategory.SPECIALIZED]: { total: 0, unlocked: 0 }
    }
    
    const byRarity: Record<string, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 }
    }

    allAchievements.forEach(achievement => {
      const progress = this.achievements.achievements.get(achievement.id)
      const isUnlocked = progress?.isUnlocked || false
      
      byCategory[achievement.category].total++
      if (isUnlocked) byCategory[achievement.category].unlocked++
      
      byRarity[achievement.rarity].total++
      if (isUnlocked) byRarity[achievement.rarity].unlocked++
    })

    return {
      totalAchievements: allAchievements.length,
      unlockedAchievements: unlockedCount,
      completionPercentage: Math.round((unlockedCount / allAchievements.length) * 100),
      byCategory,
      byRarity
    }
  }

  /**
   * Get recent notifications
   */
  public getRecentNotifications(limit: number = 10): AchievementNotification[] {
    return this.notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Clear notifications
   */
  public clearNotifications(): void {
    this.notifications = []
  }

  /**
   * Set active title
   */
  public setActiveTitle(title: string): boolean {
    if (this.achievements.unlockedTitles.has(title)) {
      this.achievements.activeTitle = title
      return true
    }
    return false
  }

  /**
   * Get active title
   */
  public getActiveTitle(): string | undefined {
    return this.achievements.activeTitle
  }

  /**
   * Get unlocked titles
   */
  public getUnlockedTitles(): Set<string> {
    return new Set(this.achievements.unlockedTitles)
  }

  /**
   * Serialize achievements to JSON
   */
  public toJSON(): any {
    return {
      unitId: this.achievements.unitId,
      achievements: Array.from(this.achievements.achievements.entries()),
      statistics: {
        ...this.achievements.statistics,
        unitsHealed: Array.from(this.achievements.statistics.unitsHealed),
        weaponsMastered: Array.from(this.achievements.statistics.weaponsMastered),
        spellsLearned: Array.from(this.achievements.statistics.spellsLearned),
        beastsFoughtWith: Array.from(this.achievements.statistics.beastsFoughtWith),
        formationsUsed: Array.from(this.achievements.statistics.formationsUsed.entries()),
        enemyTypesKilled: Array.from(this.achievements.statistics.enemyTypesKilled),
        terrainTypesFoughtOn: Array.from(this.achievements.statistics.terrainTypesFoughtOn),
        weaponTypesUsed: Array.from(this.achievements.statistics.weaponTypesUsed)
      },
      activeTitle: this.achievements.activeTitle,
      unlockedTitles: Array.from(this.achievements.unlockedTitles),
      totalStatBonuses: this.achievements.totalStatBonuses,
      specialAbilities: Array.from(this.achievements.specialAbilities),
      visualEffects: Array.from(this.achievements.visualEffects)
    }
  }

  /**
   * Load achievements from JSON
   */
  public fromJSON(data: any): void {
    this.achievements.achievements = new Map(data.achievements)
    
    // Restore statistics
    this.achievements.statistics = {
      ...data.statistics,
      unitsHealed: new Set(data.statistics.unitsHealed),
      weaponsMastered: new Set(data.statistics.weaponsMastered),
      spellsLearned: new Set(data.statistics.spellsLearned),
      beastsFoughtWith: new Set(data.statistics.beastsFoughtWith),
      formationsUsed: new Map(data.statistics.formationsUsed),
      enemyTypesKilled: new Set(data.statistics.enemyTypesKilled),
      terrainTypesFoughtOn: new Set(data.statistics.terrainTypesFoughtOn),
      weaponTypesUsed: new Set(data.statistics.weaponTypesUsed)
    }
    
    this.achievements.activeTitle = data.activeTitle
    this.achievements.unlockedTitles = new Set(data.unlockedTitles)
    this.achievements.totalStatBonuses = data.totalStatBonuses
    this.achievements.specialAbilities = new Set(data.specialAbilities)
    this.achievements.visualEffects = new Set(data.visualEffects)
  }
}