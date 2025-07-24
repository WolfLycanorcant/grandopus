import { Unit } from '../units'
import { AffinitySource, RelationshipNotification } from './types'

/**
 * Helper functions to integrate relationship tracking into game systems
 */
export class RelationshipIntegration {
  
  /**
   * Track battle participation between units
   */
  static trackBattleParticipation(
    units: Unit[],
    battleWon: boolean = false,
    battleId?: string
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Track relationships between all units that fought together
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const unit1 = units[i]
        const unit2 = units[j]
        
        // Both units fought together
        const battleAffinity = battleWon ? 6 : 3 // More affinity if they won together
        
        notifications.push(...unit1.relationshipManager.recordInteraction(
          unit2.id,
          AffinitySource.BATTLE_TOGETHER,
          battleAffinity,
          `Fought together in battle${battleWon ? ' (Victory)' : ''}`,
          { battleId, battleWon }
        ))
        
        notifications.push(...unit2.relationshipManager.recordInteraction(
          unit1.id,
          AffinitySource.BATTLE_TOGETHER,
          battleAffinity,
          `Fought together in battle${battleWon ? ' (Victory)' : ''}`,
          { battleId, battleWon }
        ))
        
        // If they won, also track shared victory
        if (battleWon) {
          notifications.push(...unit1.relationshipManager.recordInteraction(
            unit2.id,
            AffinitySource.SHARED_VICTORY,
            4,
            'Celebrated victory together',
            { battleId }
          ))
          
          notifications.push(...unit2.relationshipManager.recordInteraction(
            unit1.id,
            AffinitySource.SHARED_VICTORY,
            4,
            'Celebrated victory together',
            { battleId }
          ))
        }
      }
    }
    
    return notifications
  }

  /**
   * Track healing interactions
   */
  static trackHealing(
    healer: Unit,
    target: Unit,
    healingAmount: number,
    savedFromDeath: boolean = false
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    if (healer.id === target.id) return notifications // Can't heal self for relationship
    
    // Base affinity for healing
    let affinityGain = Math.min(10, Math.floor(healingAmount / 5)) // 1 affinity per 5 HP healed, max 10
    
    if (savedFromDeath) {
      // Major affinity boost for saving a life
      notifications.push(...target.relationshipManager.recordInteraction(
        healer.id,
        AffinitySource.LIFE_SAVED,
        20,
        'Saved my life with healing magic',
        { healingAmount }
      ))
      
      // Healer also gains some affinity for being a hero
      notifications.push(...healer.relationshipManager.recordInteraction(
        target.id,
        AffinitySource.SACRIFICE,
        8,
        'Risked everything to save an ally',
        { healingAmount }
      ))
    } else {
      // Regular healing affinity
      notifications.push(...target.relationshipManager.recordInteraction(
        healer.id,
        AffinitySource.HEALING_RECEIVED,
        affinityGain,
        `Received ${healingAmount} healing`,
        { healingAmount }
      ))
    }
    
    return notifications
  }

  /**
   * Track equipment sharing
   */
  static trackEquipmentSharing(
    giver: Unit,
    receiver: Unit,
    equipmentName: string,
    equipmentValue: number
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Affinity based on equipment value/rarity
    const affinityGain = Math.min(15, Math.floor(equipmentValue / 10))
    
    notifications.push(...receiver.relationshipManager.recordInteraction(
      giver.id,
      AffinitySource.EQUIPMENT_SHARING,
      affinityGain,
      `Shared ${equipmentName} with me`,
      { equipmentShared: equipmentName }
    ))
    
    // Giver gets smaller affinity boost for being generous
    notifications.push(...giver.relationshipManager.recordInteraction(
      receiver.id,
      AffinitySource.EQUIPMENT_SHARING,
      Math.floor(affinityGain / 2),
      `Shared ${equipmentName} generously`,
      { equipmentShared: equipmentName }
    ))
    
    return notifications
  }

  /**
   * Track training together
   */
  static trackTrainingTogether(
    trainer: Unit,
    student: Unit,
    skillLearned?: string
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Training builds mentor-student relationships
    notifications.push(...student.relationshipManager.recordInteraction(
      trainer.id,
      AffinitySource.TRAINING_TOGETHER,
      8,
      skillLearned ? `Learned ${skillLearned} from mentor` : 'Trained together',
      { skillLearned }
    ))
    
    notifications.push(...trainer.relationshipManager.recordInteraction(
      student.id,
      AffinitySource.TRAINING_TOGETHER,
      6,
      skillLearned ? `Taught ${skillLearned} to student` : 'Trained together',
      { skillLearned }
    ))
    
    return notifications
  }

  /**
   * Track formation synergy
   */
  static trackFormationSynergy(
    units: Unit[],
    formationType: string,
    effectiveness: number
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    if (units.length < 2) return notifications
    
    // Units that work well together in formation gain affinity
    const affinityGain = Math.floor(effectiveness / 10) // Based on formation effectiveness
    
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const unit1 = units[i]
        const unit2 = units[j]
        
        notifications.push(...unit1.relationshipManager.recordInteraction(
          unit2.id,
          AffinitySource.FORMATION_SYNERGY,
          affinityGain,
          `Worked well together in ${formationType} formation`,
          { formationType, effectiveness }
        ))
        
        notifications.push(...unit2.relationshipManager.recordInteraction(
          unit1.id,
          AffinitySource.FORMATION_SYNERGY,
          affinityGain,
          `Worked well together in ${formationType} formation`,
          { formationType, effectiveness }
        ))
      }
    }
    
    return notifications
  }

  /**
   * Track personality clashes
   */
  static trackPersonalityClash(
    unit1: Unit,
    unit2: Unit,
    reason: string
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Negative affinity for personality conflicts
    const affinityLoss = -8
    
    notifications.push(...unit1.relationshipManager.recordInteraction(
      unit2.id,
      AffinitySource.PERSONALITY_CLASH,
      affinityLoss,
      `Personality clash: ${reason}`
    ))
    
    notifications.push(...unit2.relationshipManager.recordInteraction(
      unit1.id,
      AffinitySource.PERSONALITY_CLASH,
      affinityLoss,
      `Personality clash: ${reason}`
    ))
    
    return notifications
  }

  /**
   * Track competition between units
   */
  static trackCompetition(
    winner: Unit,
    loser: Unit,
    competitionType: string,
    isHealthy: boolean = true
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    const affinityChange = isHealthy ? -3 : -8 // Healthy competition vs bitter rivalry
    
    notifications.push(...winner.relationshipManager.recordInteraction(
      loser.id,
      AffinitySource.COMPETITION,
      affinityChange,
      `${isHealthy ? 'Competed with' : 'Defeated'} in ${competitionType}`,
      { competitionType, isHealthy }
    ))
    
    notifications.push(...loser.relationshipManager.recordInteraction(
      winner.id,
      AffinitySource.COMPETITION,
      affinityChange,
      `${isHealthy ? 'Competed with' : 'Lost to'} in ${competitionType}`,
      { competitionType, isHealthy }
    ))
    
    return notifications
  }

  /**
   * Track betrayal (major negative relationship event)
   */
  static trackBetrayal(
    betrayer: Unit,
    victim: Unit,
    betrayalType: string
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Major negative affinity for betrayal
    notifications.push(...victim.relationshipManager.recordInteraction(
      betrayer.id,
      AffinitySource.BETRAYAL,
      -30,
      `Betrayed me: ${betrayalType}`
    ))
    
    // Betrayer might feel guilty (smaller negative affinity)
    notifications.push(...betrayer.relationshipManager.recordInteraction(
      victim.id,
      AffinitySource.BETRAYAL,
      -15,
      `Betrayed trust: ${betrayalType}`
    ))
    
    return notifications
  }

  /**
   * Track sacrifice (major positive relationship event)
   */
  static trackSacrifice(
    sacrificer: Unit,
    beneficiary: Unit,
    sacrificeType: string,
    sacrificeValue: number
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Major positive affinity for sacrifice
    const affinityGain = Math.min(25, 15 + Math.floor(sacrificeValue / 10))
    
    notifications.push(...beneficiary.relationshipManager.recordInteraction(
      sacrificer.id,
      AffinitySource.SACRIFICE,
      affinityGain,
      `Made great sacrifice: ${sacrificeType}`,
      { sacrificeType, sacrificeValue }
    ))
    
    // Sacrificer gains some affinity for being noble
    notifications.push(...sacrificer.relationshipManager.recordInteraction(
      beneficiary.id,
      AffinitySource.SACRIFICE,
      Math.floor(affinityGain / 2),
      `Sacrificed for ally: ${sacrificeType}`,
      { sacrificeType, sacrificeValue }
    ))
    
    return notifications
  }

  /**
   * Check for racial affinity bonuses/penalties
   */
  static checkRacialAffinity(unit1: Unit, unit2: Unit): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Define racial compatibility
    const racialCompatibility: Record<string, Record<string, number>> = {
      'human': { 'elf': 5, 'dwarf': 3, 'angel': 8, 'orc': -3, 'demon': -5 },
      'elf': { 'human': 5, 'dwarf': -3, 'angel': 10, 'demon': -8, 'dragon': 5 },
      'dwarf': { 'human': 3, 'elf': -3, 'orc': -8, 'dragon': -2, 'angel': 5 },
      'angel': { 'human': 8, 'elf': 10, 'dwarf': 5, 'demon': -20, 'dragon': 3 },
      'demon': { 'human': -5, 'elf': -8, 'angel': -20, 'orc': 8, 'dragon': 5 },
      'orc': { 'human': -3, 'dwarf': -8, 'demon': 8, 'goblin': 15, 'beast': 5 },
      'goblin': { 'orc': 15, 'human': -2, 'elf': -5, 'beast': 8 },
      'beast': { 'orc': 5, 'goblin': 8, 'dragon': 10, 'human': 2 },
      'dragon': { 'elf': 5, 'dwarf': -2, 'angel': 3, 'demon': 5, 'beast': 10 },
      'griffon': { 'elf': 8, 'angel': 12, 'human': 5, 'dragon': 3 }
    }
    
    const race1 = unit1.race
    const race2 = unit2.race
    
    const affinity1to2 = racialCompatibility[race1]?.[race2] || 0
    const affinity2to1 = racialCompatibility[race2]?.[race1] || 0
    
    if (affinity1to2 !== 0) {
      notifications.push(...unit1.relationshipManager.recordInteraction(
        unit2.id,
        AffinitySource.RACIAL_AFFINITY,
        affinity1to2,
        `Racial ${affinity1to2 > 0 ? 'compatibility' : 'tension'} with ${race2}`
      ))
    }
    
    if (affinity2to1 !== 0) {
      notifications.push(...unit2.relationshipManager.recordInteraction(
        unit1.id,
        AffinitySource.RACIAL_AFFINITY,
        affinity2to1,
        `Racial ${affinity2to1 > 0 ? 'compatibility' : 'tension'} with ${race1}`
      ))
    }
    
    return notifications
  }

  /**
   * Check for class synergy bonuses
   */
  static checkClassSynergy(unit1: Unit, unit2: Unit): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Define class compatibility
    const classCompatibility: Record<string, Record<string, number>> = {
      'knight': { 'cleric': 12, 'archer': 8, 'mage': 5, 'knight': -5 }, // Knights work well with support
      'cleric': { 'knight': 12, 'heavy_infantry': 10, 'mage': 8, 'cleric': 3 }, // Clerics support everyone
      'mage': { 'archer': 8, 'cleric': 8, 'knight': 5, 'mage': -3 }, // Mages complement ranged
      'archer': { 'mage': 8, 'knight': 8, 'rogue': 10, 'archer': 5 }, // Archers work with everyone
      'rogue': { 'archer': 10, 'light_infantry': 8, 'rogue': -5 }, // Rogues prefer mobility
      'heavy_infantry': { 'cleric': 10, 'knight': 8, 'heavy_infantry': 5 }, // Tanks need support
      'light_infantry': { 'rogue': 8, 'archer': 6, 'light_infantry': 3 }, // Mobile units
      'beast_tamer': { 'beast_tamer': 15, 'archer': 5, 'rogue': 5 }, // Beast tamers understand each other
      'dwarven_engineer': { 'heavy_infantry': 8, 'knight': 6, 'dwarven_engineer': 10 } // Engineers support tanks
    }
    
    const class1 = unit1.archetype
    const class2 = unit2.archetype
    
    const affinity1to2 = classCompatibility[class1]?.[class2] || 0
    const affinity2to1 = classCompatibility[class2]?.[class1] || 0
    
    if (affinity1to2 !== 0) {
      notifications.push(...unit1.relationshipManager.recordInteraction(
        unit2.id,
        AffinitySource.CLASS_SYNERGY,
        affinity1to2,
        `Class ${affinity1to2 > 0 ? 'synergy' : 'conflict'} with ${class2}`
      ))
    }
    
    if (affinity2to1 !== 0 && affinity2to1 !== affinity1to2) {
      notifications.push(...unit2.relationshipManager.recordInteraction(
        unit1.id,
        AffinitySource.CLASS_SYNERGY,
        affinity2to1,
        `Class ${affinity2to1 > 0 ? 'synergy' : 'conflict'} with ${class1}`
      ))
    }
    
    return notifications
  }

  /**
   * Process all relationship notifications
   */
  static processNotifications(notifications: RelationshipNotification[]): void {
    if (notifications.length === 0) return
    
    // Group notifications by type for better display
    const notificationsByType = new Map<string, RelationshipNotification[]>()
    
    notifications.forEach(notification => {
      const type = notification.type
      const typeNotifications = notificationsByType.get(type) || []
      typeNotifications.push(notification)
      notificationsByType.set(type, typeNotifications)
    })
    
    // Display notifications (this could be enhanced with a proper notification system)
    notificationsByType.forEach((typeNotifications, type) => {
      typeNotifications.forEach(notification => {
        const emoji = type === 'relationship_formed' ? '🤝' : 
                     type === 'relationship_changed' ? '💫' : '❤️'
        
        console.log(`${emoji} ${notification.unitName1} & ${notification.unitName2}: ${notification.description}`)
        
        // You could dispatch these to a global notification system here
        // Example: NotificationSystem.showRelationship(notification)
      })
    })
  }

  /**
   * Initialize relationships when units first meet
   */
  static initializeRelationships(unit1: Unit, unit2: Unit): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Check for initial racial and class compatibility
    notifications.push(...this.checkRacialAffinity(unit1, unit2))
    notifications.push(...this.checkClassSynergy(unit1, unit2))
    
    return notifications
  }

  /**
   * Comprehensive battle integration - call this after each battle
   */
  static integrateBattleResults(
    participants: Unit[],
    battleWon: boolean,
    battleId?: string,
    healingEvents?: Array<{
      healer: Unit
      target: Unit
      amount: number
      savedFromDeath: boolean
    }>,
    formationEffectiveness?: number
  ): RelationshipNotification[] {
    const allNotifications: RelationshipNotification[] = []
    
    // Track battle participation
    allNotifications.push(...this.trackBattleParticipation(participants, battleWon, battleId))
    
    // Track healing events
    if (healingEvents) {
      healingEvents.forEach(event => {
        allNotifications.push(...this.trackHealing(
          event.healer,
          event.target,
          event.amount,
          event.savedFromDeath
        ))
      })
    }
    
    // Track formation synergy if provided
    if (formationEffectiveness && formationEffectiveness > 75) {
      allNotifications.push(...this.trackFormationSynergy(
        participants,
        'battle_formation',
        formationEffectiveness
      ))
    }
    
    // Initialize relationships for units that haven't met before
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const unit1 = participants[i]
        const unit2 = participants[j]
        
        // Check if they have any relationship history
        if (!unit1.relationshipManager.getRelationship(unit2.id)) {
          allNotifications.push(...this.initializeRelationships(unit1, unit2))
        }
      }
    }
    
    return allNotifications
  }

  /**
   * Update active relationship bonuses for combat
   */
  static updateActiveRelationshipBonuses(
    units: Unit[],
    positionMap: Map<string, { x: number; y: number }>
  ): void {
    units.forEach(unit => {
      const unitPosition = positionMap.get(unit.id)
      if (!unitPosition) return
      
      // Find nearby units (within relationship bonus range)
      const nearbyUnits: string[] = []
      
      units.forEach(otherUnit => {
        if (otherUnit.id === unit.id) return
        
        const otherPosition = positionMap.get(otherUnit.id)
        if (!otherPosition) return
        
        // Calculate distance (simple Manhattan distance)
        const distance = Math.abs(unitPosition.x - otherPosition.x) + 
                        Math.abs(unitPosition.y - otherPosition.y)
        
        if (distance <= 3) { // Within 3 tiles
          nearbyUnits.push(otherUnit.id)
        }
      })
      
      // Update active bonuses based on nearby units
      unit.relationshipManager.getActiveRelationshipBonuses(nearbyUnits)
    })
  }
}