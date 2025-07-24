import {
  UnitRelationships,
  UnitRelationship,
  RelationshipType,
  AffinitySource,
  AffinityInteraction,
  RelationshipNotification,
  PersonalityTrait,
  RelationshipBonus,
  SquadRelationships,
  RelationshipEvent
} from './types'
import {
  getRelationshipConfig,
  getRelationshipTypeFromAffinity,
  getPersonalityTrait,
  getFormationRules
} from './RelationshipData'
import { Unit } from '../units'

/**
 * Manages relationships and affinity between units
 */
export class RelationshipManager {
  private unit: Unit
  private relationships: UnitRelationships
  private notifications: RelationshipNotification[] = []

  constructor(unit: Unit) {
    this.unit = unit
    this.relationships = this.initializeRelationships()
  }

  /**
   * Initialize relationship data for a unit
   */
  private initializeRelationships(): UnitRelationships {
    return {
      unitId: this.unit.id,
      relationships: new Map(),
      totalFriends: 0,
      totalRivals: 0,
      personalityTraits: this.generatePersonalityTraits(),
      activeBonuses: new Map()
    }
  }

  /**
   * Generate personality traits based on unit characteristics
   */
  private generatePersonalityTraits(): PersonalityTrait[] {
    const traits: PersonalityTrait[] = []
    
    // Base traits based on race
    switch (this.unit.race) {
      case 'human':
        if (Math.random() < 0.3) traits.push(getPersonalityTrait('charismatic')!)
        break
      case 'elf':
        if (Math.random() < 0.4) traits.push(getPersonalityTrait('loner')!)
        break
      case 'dwarf':
        if (Math.random() < 0.5) traits.push(getPersonalityTrait('loyal')!)
        break
      case 'orc':
        if (Math.random() < 0.4) traits.push(getPersonalityTrait('hothead')!)
        break
      case 'angel':
        if (Math.random() < 0.6) traits.push(getPersonalityTrait('protective')!)
        break
    }
    
    // Base traits based on archetype
    switch (this.unit.archetype) {
      case 'knight':
        if (Math.random() < 0.5) traits.push(getPersonalityTrait('protective')!)
        break
      case 'cleric':
        if (Math.random() < 0.4) traits.push(getPersonalityTrait('mentor')!)
        break
      case 'mage':
        if (Math.random() < 0.3) traits.push(getPersonalityTrait('pragmatic')!)
        break
      case 'rogue':
        if (Math.random() < 0.4) traits.push(getPersonalityTrait('loner')!)
        break
    }
    
    // Random additional trait
    if (Math.random() < 0.3) {
      const allTraits = ['competitive', 'mentor', 'protective', 'pragmatic']
      const randomTrait = allTraits[Math.floor(Math.random() * allTraits.length)]
      const trait = getPersonalityTrait(randomTrait)
      if (trait && !traits.find(t => t.id === trait.id)) {
        traits.push(trait)
      }
    }
    
    return traits.filter(Boolean)
  }

  /**
   * Record an interaction between this unit and another
   */
  public recordInteraction(
    otherUnitId: string,
    source: AffinitySource,
    baseAffinityChange: number,
    description: string,
    contextData?: any
  ): RelationshipNotification[] {
    const notifications: RelationshipNotification[] = []
    
    // Get or create relationship
    let relationship = this.relationships.relationships.get(otherUnitId)
    if (!relationship) {
      relationship = this.createNewRelationship(otherUnitId)
      this.relationships.relationships.set(otherUnitId, relationship)
    }
    
    // Calculate actual affinity change based on personality traits
    const affinityChange = this.calculateAffinityChange(baseAffinityChange, source)
    
    // Record the interaction
    const interaction: AffinityInteraction = {
      source,
      affinityChange,
      timestamp: new Date(),
      description,
      contextData
    }
    
    relationship.interactionHistory.push(interaction)
    relationship.lastInteraction = new Date()
    
    // Update affinity points
    const oldAffinity = relationship.affinityPoints
    const oldType = relationship.relationshipType
    
    relationship.affinityPoints = Math.max(-100, Math.min(100, relationship.affinityPoints + affinityChange))
    
    // Update relationship type based on new affinity
    const newType = getRelationshipTypeFromAffinity(relationship.affinityPoints)
    
    if (newType !== oldType) {
      relationship.relationshipType = newType
      
      // Create notification for relationship change
      const notification: RelationshipNotification = {
        type: 'relationship_changed',
        unitId1: this.unit.id,
        unitId2: otherUnitId,
        unitName1: this.unit.name,
        unitName2: 'Unknown', // Would need to be filled by caller
        oldRelationship: oldType,
        newRelationship: newType,
        description: `Relationship changed from ${oldType} to ${newType}`,
        timestamp: new Date()
      }
      
      notifications.push(notification)
      this.notifications.push(notification)
    }
    
    // Update relationship statistics
    this.updateRelationshipStatistics()
    
    return notifications
  }

  /**
   * Calculate actual affinity change based on personality traits
   */
  private calculateAffinityChange(baseChange: number, source: AffinitySource): number {
    let multiplier = 1.0
    
    // Apply personality trait modifiers
    this.relationships.personalityTraits.forEach(trait => {
      const modifier = trait.affinityModifiers[source]
      if (modifier !== undefined) {
        multiplier *= modifier
      }
    })
    
    return Math.round(baseChange * multiplier)
  }

  /**
   * Create a new relationship between units
   */
  private createNewRelationship(otherUnitId: string): UnitRelationship {
    return {
      unitId1: this.unit.id,
      unitId2: otherUnitId,
      affinityPoints: 0,
      relationshipType: RelationshipType.NEUTRAL,
      interactionHistory: [],
      formedAt: new Date(),
      lastInteraction: new Date(),
      battlesTogther: 0,
      timesHealed: 0,
      timesSaved: 0,
      sharedVictories: 0
    }
  }

  /**
   * Update relationship statistics
   */
  private updateRelationshipStatistics(): void {
    let friends = 0
    let rivals = 0
    let strongestBondAffinity = -101
    let biggestRivalAffinity = 101
    let strongestBond: string | undefined
    let biggestRival: string | undefined
    
    this.relationships.relationships.forEach((relationship, unitId) => {
      if (relationship.affinityPoints > 20) {
        friends++
      } else if (relationship.affinityPoints < -20) {
        rivals++
      }
      
      if (relationship.affinityPoints > strongestBondAffinity) {
        strongestBondAffinity = relationship.affinityPoints
        strongestBond = unitId
      }
      
      if (relationship.affinityPoints < biggestRivalAffinity) {
        biggestRivalAffinity = relationship.affinityPoints
        biggestRival = unitId
      }
    })
    
    this.relationships.totalFriends = friends
    this.relationships.totalRivals = rivals
    this.relationships.strongestBond = strongestBond
    this.relationships.biggestRival = biggestRival
  }

  /**
   * Get relationship with another unit
   */
  public getRelationship(otherUnitId: string): UnitRelationship | null {
    return this.relationships.relationships.get(otherUnitId) || null
  }

  /**
   * Get all relationships
   */
  public getAllRelationships(): Map<string, UnitRelationship> {
    return new Map(this.relationships.relationships)
  }

  /**
   * Get relationships of a specific type
   */
  public getRelationshipsByType(type: RelationshipType): UnitRelationship[] {
    const relationships: UnitRelationship[] = []
    
    this.relationships.relationships.forEach(relationship => {
      if (relationship.relationshipType === type) {
        relationships.push(relationship)
      }
    })
    
    return relationships
  }

  /**
   * Get active relationship bonuses for current battle context
   */
  public getActiveRelationshipBonuses(nearbyUnits: string[]): Map<string, RelationshipBonus> {
    const activeBonuses = new Map<string, RelationshipBonus>()
    
    nearbyUnits.forEach(unitId => {
      const relationship = this.getRelationship(unitId)
      if (!relationship) return
      
      const config = getRelationshipConfig(relationship.relationshipType)
      const bonus = config.bonuses
      
      // Check if bonus should be active based on conditions
      if (this.shouldBonusBeActive(bonus, relationship, nearbyUnits.includes(unitId))) {
        activeBonuses.set(unitId, bonus)
      }
    })
    
    this.relationships.activeBonuses = activeBonuses
    return activeBonuses
  }

  /**
   * Check if a relationship bonus should be active
   */
  private shouldBonusBeActive(
    bonus: RelationshipBonus,
    relationship: UnitRelationship,
    isNearby: boolean
  ): boolean {
    // Check distance requirement
    if (bonus.maxDistance !== undefined && !isNearby) {
      return false
    }
    
    // Check if both units need to be alive
    if (bonus.requiresBothUnits && !this.unit.isAlive()) {
      return false
    }
    
    // Check low HP activation
    if (bonus.activatesOnLowHp) {
      const lowHpThreshold = this.unit.getCurrentStats().hp * 0.25
      if (this.unit.currentHp > lowHpThreshold) {
        return false
      }
    }
    
    return true
  }

  /**
   * Get relationship stat bonuses
   */
  public getRelationshipStatBonuses(): Partial<import('../units/types').UnitStats> {
    const bonuses: Partial<import('../units/types').UnitStats> = {}
    
    this.relationships.activeBonuses.forEach(bonus => {
      if (bonus.statBonuses) {
        Object.entries(bonus.statBonuses).forEach(([stat, value]) => {
          if (bonuses[stat as keyof import('../units/types').UnitStats] === undefined) {
            bonuses[stat as keyof import('../units/types').UnitStats] = 0
          }
          bonuses[stat as keyof import('../units/types').UnitStats]! += value
        })
      }
    })
    
    return bonuses
  }

  /**
   * Get combat bonuses from relationships
   */
  public getCombatBonuses(): {
    damageBonus: number
    accuracyBonus: number
    criticalBonus: number
    evasionBonus: number
  } {
    let damageBonus = 0
    let accuracyBonus = 0
    let criticalBonus = 0
    let evasionBonus = 0
    
    this.relationships.activeBonuses.forEach(bonus => {
      damageBonus += bonus.damageBonus || 0
      accuracyBonus += bonus.accuracyBonus || 0
      criticalBonus += bonus.criticalBonus || 0
      evasionBonus += bonus.evasionBonus || 0
    })
    
    return { damageBonus, accuracyBonus, criticalBonus, evasionBonus }
  }

  /**
   * Get personality traits
   */
  public getPersonalityTraits(): PersonalityTrait[] {
    return [...this.relationships.personalityTraits]
  }

  /**
   * Add personality trait
   */
  public addPersonalityTrait(traitId: string): boolean {
    const trait = getPersonalityTrait(traitId)
    if (!trait) return false
    
    // Check if trait already exists
    if (this.relationships.personalityTraits.find(t => t.id === traitId)) {
      return false
    }
    
    this.relationships.personalityTraits.push(trait)
    return true
  }

  /**
   * Remove personality trait
   */
  public removePersonalityTrait(traitId: string): boolean {
    const index = this.relationships.personalityTraits.findIndex(t => t.id === traitId)
    if (index === -1) return false
    
    this.relationships.personalityTraits.splice(index, 1)
    return true
  }

  /**
   * Get relationship statistics
   */
  public getRelationshipStatistics(): {
    totalRelationships: number
    totalFriends: number
    totalRivals: number
    strongestBond?: string
    biggestRival?: string
    averageAffinity: number
  } {
    const relationships = Array.from(this.relationships.relationships.values())
    const totalAffinity = relationships.reduce((sum, rel) => sum + rel.affinityPoints, 0)
    
    return {
      totalRelationships: relationships.length,
      totalFriends: this.relationships.totalFriends,
      totalRivals: this.relationships.totalRivals,
      strongestBond: this.relationships.strongestBond,
      biggestRival: this.relationships.biggestRival,
      averageAffinity: relationships.length > 0 ? totalAffinity / relationships.length : 0
    }
  }

  /**
   * Get recent notifications
   */
  public getRecentNotifications(limit: number = 10): RelationshipNotification[] {
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
   * Force set relationship (for story events, family relationships, etc.)
   */
  public setRelationship(
    otherUnitId: string,
    type: RelationshipType,
    affinity: number,
    isLocked: boolean = false
  ): void {
    let relationship = this.relationships.relationships.get(otherUnitId)
    if (!relationship) {
      relationship = this.createNewRelationship(otherUnitId)
      this.relationships.relationships.set(otherUnitId, relationship)
    }
    
    relationship.relationshipType = type
    relationship.affinityPoints = Math.max(-100, Math.min(100, affinity))
    relationship.isLocked = isLocked
    
    this.updateRelationshipStatistics()
  }

  /**
   * Decay relationships over time (called periodically)
   */
  public decayRelationships(daysPassed: number): void {
    this.relationships.relationships.forEach(relationship => {
      if (relationship.isLocked) return
      
      const daysSinceLastInteraction = daysPassed
      if (daysSinceLastInteraction > 30) { // 30 days without interaction
        // Decay towards neutral
        const decayAmount = Math.floor(daysSinceLastInteraction / 30)
        
        if (relationship.affinityPoints > 0) {
          relationship.affinityPoints = Math.max(0, relationship.affinityPoints - decayAmount)
        } else if (relationship.affinityPoints < 0) {
          relationship.affinityPoints = Math.min(0, relationship.affinityPoints + decayAmount)
        }
        
        // Update relationship type
        relationship.relationshipType = getRelationshipTypeFromAffinity(relationship.affinityPoints)
      }
    })
    
    this.updateRelationshipStatistics()
  }

  /**
   * Serialize relationships to JSON
   */
  public toJSON(): any {
    return {
      unitId: this.relationships.unitId,
      relationships: Array.from(this.relationships.relationships.entries()),
      totalFriends: this.relationships.totalFriends,
      totalRivals: this.relationships.totalRivals,
      strongestBond: this.relationships.strongestBond,
      biggestRival: this.relationships.biggestRival,
      personalityTraits: this.relationships.personalityTraits.map(t => t.id),
      activeBonuses: Array.from(this.relationships.activeBonuses.entries())
    }
  }

  /**
   * Load relationships from JSON
   */
  public fromJSON(data: any): void {
    this.relationships.relationships = new Map(data.relationships)
    this.relationships.totalFriends = data.totalFriends
    this.relationships.totalRivals = data.totalRivals
    this.relationships.strongestBond = data.strongestBond
    this.relationships.biggestRival = data.biggestRival
    
    // Restore personality traits
    this.relationships.personalityTraits = data.personalityTraits
      .map((id: string) => getPersonalityTrait(id))
      .filter(Boolean)
    
    this.relationships.activeBonuses = new Map(data.activeBonuses)
  }
}