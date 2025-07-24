import { Unit } from '../units'
import { StatisticType, AchievementNotification } from './types'

/**
 * Helper functions to integrate achievement tracking into game systems
 */
export class AchievementIntegration {
  
  /**
   * Track battle participation and outcomes
   */
  static trackBattleParticipation(
    unit: Unit, 
    isLeader: boolean = false, 
    won: boolean = false, 
    survived: boolean = true,
    hadLowHp: boolean = false,
    noCasualties: boolean = false
  ): AchievementNotification[] {
    const notifications: AchievementNotification[] = []
    
    // Track battles survived
    if (survived) {
      notifications.push(...unit.achievementManager.recordStatistic(StatisticType.BATTLES_SURVIVED, 1))
    }
    
    // Track battles won
    if (won && survived) {
      const condition = noCasualties ? 'no_casualties' : undefined
      notifications.push(...unit.achievementManager.recordStatistic(StatisticType.BATTLES_WON, 1, condition))
    }
    
    // Track battles led (if unit is squad leader)
    if (isLeader) {
      notifications.push(...unit.achievementManager.recordStatistic(StatisticType.BATTLES_LED, 1))
    }
    
    // Track low HP survivals
    if (survived && hadLowHp) {
      notifications.push(...unit.achievementManager.recordStatistic(StatisticType.LOW_HP_SURVIVALS, 1))
    }
    
    return notifications
  }

  /**
   * Track combat actions during battle
   */
  static trackCombatAction(
    unit: Unit,
    action: 'attack' | 'critical' | 'kill' | 'dodge' | 'block',
    value: number = 1,
    enemyType?: string,
    isHighAccuracy?: boolean
  ): AchievementNotification[] {
    const notifications: AchievementNotification[] = []
    
    switch (action) {
      case 'attack':
        notifications.push(...unit.achievementManager.recordStatistic(StatisticType.ATTACKS_MADE, value))
        if (isHighAccuracy) {
          notifications.push(...unit.achievementManager.recordStatistic(StatisticType.HIGH_ACCURACY_ATTACKS, value))
        }
        break
        
      case 'critical':
        notifications.push(...unit.achievementManager.recordStatistic(StatisticType.CRITICAL_HITS, value))
        break
        
      case 'kill':
        notifications.push(...unit.achievementManager.recordStatistic(StatisticType.KILLS, value))
        
        // Track specific enemy types
        if (enemyType === 'dragon') {
          notifications.push(...unit.achievementManager.recordStatistic(StatisticType.DRAGONS_KILLED, value))
        }
        break
        
      case 'dodge':
        notifications.push(...unit.achievementManager.recordStatistic(StatisticType.ATTACKS_DODGED, value))
        break
        
      case 'block':
        notifications.push(...unit.achievementManager.recordStatistic(StatisticType.DAMAGE_BLOCKED, value))
        break
    }
    
    return notifications
  }

  /**
   * Track damage taken
   */
  static trackDamageTaken(unit: Unit, damage: number): AchievementNotification[] {
    return unit.achievementManager.recordStatistic(StatisticType.DAMAGE_TAKEN, damage)
  }

  /**
   * Track damage dealt
   */
  static trackDamageDealt(unit: Unit, damage: number): AchievementNotification[] {
    return unit.achievementManager.recordStatistic(StatisticType.DAMAGE_DEALT, damage)
  }

  /**
   * Track healing actions
   */
  static trackHealing(
    healer: Unit, 
    targetUnitId: string, 
    healingAmount: number,
    savedFromDeath: boolean = false
  ): AchievementNotification[] {
    const notifications: AchievementNotification[] = []
    
    // Track total healing done
    notifications.push(...healer.achievementManager.recordStatistic(StatisticType.HEALING_DONE, healingAmount))
    
    // Track unique units healed
    notifications.push(...healer.achievementManager.recordStatistic(StatisticType.UNITS_HEALED, targetUnitId))
    
    // Track allies saved from death
    if (savedFromDeath) {
      notifications.push(...healer.achievementManager.recordStatistic(StatisticType.ALLIES_SAVED, 1))
    }
    
    return notifications
  }

  /**
   * Track weapon mastery
   */
  static trackWeaponMastery(unit: Unit, weaponType: string): AchievementNotification[] {
    return unit.achievementManager.recordStatistic(StatisticType.WEAPONS_MASTERED, weaponType)
  }

  /**
   * Track spell learning
   */
  static trackSpellLearned(unit: Unit, spellId: string): AchievementNotification[] {
    return unit.achievementManager.recordStatistic(StatisticType.SPELLS_LEARNED, spellId)
  }

  /**
   * Track unit training completion
   */
  static trackUnitTraining(trainer: Unit): AchievementNotification[] {
    return trainer.achievementManager.recordStatistic(StatisticType.UNITS_TRAINED, 1)
  }

  /**
   * Track ember embedding
   */
  static trackEmberEmbedding(unit: Unit): AchievementNotification[] {
    return unit.achievementManager.recordStatistic(StatisticType.EMBERS_EMBEDDED, 1)
  }

  /**
   * Track formation usage
   */
  static trackFormationUsage(unit: Unit, formationType: string): AchievementNotification[] {
    return unit.achievementManager.recordStatistic(StatisticType.FORMATIONS_USED, formationType)
  }

  /**
   * Track rare item discovery
   */
  static trackRareItemFound(unit: Unit): AchievementNotification[] {
    return unit.achievementManager.recordStatistic(StatisticType.RARE_ITEMS_FOUND, 1)
  }

  /**
   * Track beast companionship
   */
  static trackBeastCompanionship(unit: Unit, beastUnitId: string): AchievementNotification[] {
    return unit.achievementManager.recordStatistic(StatisticType.BEASTS_FOUGHT_WITH, beastUnitId)
  }

  /**
   * Batch process multiple achievement notifications
   */
  static processNotifications(notifications: AchievementNotification[]): void {
    if (notifications.length === 0) return
    
    // Group notifications by unit for better display
    const notificationsByUnit = new Map<string, AchievementNotification[]>()
    
    notifications.forEach(notification => {
      const unitNotifications = notificationsByUnit.get(notification.unitId) || []
      unitNotifications.push(notification)
      notificationsByUnit.set(notification.unitId, unitNotifications)
    })
    
    // Display notifications (this could be enhanced with a proper notification system)
    notificationsByUnit.forEach((unitNotifications, unitId) => {
      unitNotifications.forEach(notification => {
        console.log(`🏆 ${notification.unitName} unlocked: ${notification.achievement.name}`)
        console.log(`   ${notification.achievement.reward.description}`)
        
        // You could dispatch these to a global notification system here
        // Example: NotificationSystem.showAchievement(notification)
      })
    })
  }

  /**
   * Auto-track weapon proficiency achievements when proficiency increases
   */
  static checkWeaponProficiencyAchievements(unit: Unit): AchievementNotification[] {
    const notifications: AchievementNotification[] = []
    
    // Check if unit has mastered enough weapons for the achievement
    let masteredCount = 0
    unit.weaponProficiencies.forEach(proficiency => {
      if (proficiency.level >= 100) { // Assuming 100 is max proficiency
        masteredCount++
      }
    })
    
    // Update the mastered weapons count
    const weaponTypes = Array.from(unit.weaponProficiencies.keys())
    weaponTypes.forEach(weaponType => {
      const proficiency = unit.getWeaponProficiency(weaponType)
      if (proficiency && proficiency.level >= 100) {
        notifications.push(...this.trackWeaponMastery(unit, weaponType))
      }
    })
    
    return notifications
  }

  /**
   * Integration with ember system
   */
  static integrateWithEmberSystem(unit: Unit, emberId: string): AchievementNotification[] {
    return this.trackEmberEmbedding(unit)
  }

  /**
   * Integration with level up system
   */
  static integrateWithLevelUp(unit: Unit, newLevel: number): AchievementNotification[] {
    const notifications: AchievementNotification[] = []
    
    // Check weapon proficiency achievements on level up
    notifications.push(...this.checkWeaponProficiencyAchievements(unit))
    
    return notifications
  }

  /**
   * Integration with battle system - call this after each battle
   */
  static integrateBattleResults(
    participants: Array<{
      unit: Unit
      isLeader: boolean
      survived: boolean
      hadLowHp: boolean
      damageDealt: number
      damageTaken: number
      kills: number
      criticalHits: number
      attacksMade: number
      attacksDodged: number
      damageBlocked: number
      healingDone: number
      unitsHealed: string[]
      alliesSaved: number
    }>,
    battleWon: boolean,
    noCasualties: boolean = false
  ): AchievementNotification[] {
    const allNotifications: AchievementNotification[] = []
    
    participants.forEach(participant => {
      const { unit } = participant
      
      // Track battle participation
      allNotifications.push(...this.trackBattleParticipation(
        unit,
        participant.isLeader,
        battleWon,
        participant.survived,
        participant.hadLowHp,
        noCasualties
      ))
      
      // Track combat statistics
      if (participant.damageDealt > 0) {
        allNotifications.push(...this.trackDamageDealt(unit, participant.damageDealt))
      }
      
      if (participant.damageTaken > 0) {
        allNotifications.push(...this.trackDamageTaken(unit, participant.damageTaken))
      }
      
      if (participant.kills > 0) {
        allNotifications.push(...this.trackCombatAction(unit, 'kill', participant.kills))
      }
      
      if (participant.criticalHits > 0) {
        allNotifications.push(...this.trackCombatAction(unit, 'critical', participant.criticalHits))
      }
      
      if (participant.attacksMade > 0) {
        allNotifications.push(...this.trackCombatAction(unit, 'attack', participant.attacksMade))
      }
      
      if (participant.attacksDodged > 0) {
        allNotifications.push(...this.trackCombatAction(unit, 'dodge', participant.attacksDodged))
      }
      
      if (participant.damageBlocked > 0) {
        allNotifications.push(...this.trackCombatAction(unit, 'block', participant.damageBlocked))
      }
      
      // Track healing
      if (participant.healingDone > 0) {
        participant.unitsHealed.forEach(healedUnitId => {
          allNotifications.push(...this.trackHealing(unit, healedUnitId, participant.healingDone / participant.unitsHealed.length))
        })
      }
      
      if (participant.alliesSaved > 0) {
        // This would be tracked within the healing function when savedFromDeath = true
      }
    })
    
    return allNotifications
  }
}