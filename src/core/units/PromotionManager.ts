import { Unit } from './Unit'
import { UnitStats } from './types'
import { ResourceType } from '../overworld/types'
import { 
  PromotionPath, 
  AdvancedArchetype, 
  getAvailablePromotions, 
  canPromoteUnit,
  getPromotionRequirementsSummary,
  PROMOTION_PATHS
} from './PromotionSystem'

/**
 * Promotion status for a unit
 */
export interface UnitPromotionStatus {
  unitId: string
  currentArchetype: string
  promotedArchetype?: AdvancedArchetype
  promotionBonuses: Partial<UnitStats>
  newAbilities: string[]
  levelCapIncrease: number
  promotionDate?: Date
  specialEffects: string[]
}

/**
 * Promotion notification
 */
export interface PromotionNotification {
  unitId: string
  unitName: string
  fromArchetype: string
  toArchetype: AdvancedArchetype
  promotionPath: PromotionPath
  timestamp: Date
}

/**
 * Manages unit promotions and advanced classes
 */
export class PromotionManager {
  private unit: Unit
  private promotionStatus: UnitPromotionStatus
  private notifications: PromotionNotification[] = []

  constructor(unit: Unit) {
    this.unit = unit
    this.promotionStatus = this.initializePromotionStatus()
  }

  /**
   * Initialize promotion status for a unit
   */
  private initializePromotionStatus(): UnitPromotionStatus {
    return {
      unitId: this.unit.id,
      currentArchetype: this.unit.archetype,
      promotionBonuses: {},
      newAbilities: [],
      levelCapIncrease: 0,
      specialEffects: []
    }
  }

  /**
   * Get available promotion paths for this unit
   */
  public getAvailablePromotions(): PromotionPath[] {
    // Don't allow promotion if already promoted
    if (this.promotionStatus.promotedArchetype) {
      return []
    }
    
    return getAvailablePromotions(this.unit)
  }

  /**
   * Check if unit can be promoted to a specific advanced class
   */
  public canPromoteTo(advancedArchetype: AdvancedArchetype): {
    canPromote: boolean
    reason?: string
    missingRequirements?: string[]
  } {
    if (this.promotionStatus.promotedArchetype) {
      return {
        canPromote: false,
        reason: 'Unit is already promoted'
      }
    }

    const promotionPath = PROMOTION_PATHS.find(path => 
      path.fromArchetype === this.unit.archetype && 
      path.toArchetype === advancedArchetype
    )

    if (!promotionPath) {
      return {
        canPromote: false,
        reason: 'Invalid promotion path'
      }
    }

    const requirements = getPromotionRequirementsSummary(promotionPath)
    const canPromote = canPromoteUnit(this.unit, promotionPath)

    if (!canPromote) {
      return {
        canPromote: false,
        reason: 'Requirements not met',
        missingRequirements: requirements.unmet
      }
    }

    return { canPromote: true }
  }

  /**
   * Promote unit to advanced class
   */
  public promoteUnit(
    advancedArchetype: AdvancedArchetype,
    playerResources: Record<ResourceType, number>
  ): {
    success: boolean
    error?: string
    resourcesUsed?: Record<ResourceType, number>
    notification?: PromotionNotification
  } {
    const canPromote = this.canPromoteTo(advancedArchetype)
    
    if (!canPromote.canPromote) {
      return {
        success: false,
        error: canPromote.reason
      }
    }

    const promotionPath = PROMOTION_PATHS.find(path => 
      path.fromArchetype === this.unit.archetype && 
      path.toArchetype === advancedArchetype
    )!

    // Check resource requirements
    const resourcesUsed: Record<ResourceType, number> = {}
    if (promotionPath.requirements.resources) {
      for (const [resource, required] of Object.entries(promotionPath.requirements.resources)) {
        const resourceType = resource as ResourceType
        const requiredAmount = required as number
        
        if ((playerResources[resourceType] || 0) < requiredAmount) {
          return {
            success: false,
            error: `Insufficient ${resourceType}: need ${requiredAmount}, have ${playerResources[resourceType] || 0}`
          }
        }
        
        resourcesUsed[resourceType] = requiredAmount
      }
    }

    // Apply promotion
    this.applyPromotion(promotionPath)

    // Create notification
    const notification: PromotionNotification = {
      unitId: this.unit.id,
      unitName: this.unit.name,
      fromArchetype: this.unit.archetype,
      toArchetype: advancedArchetype,
      promotionPath,
      timestamp: new Date()
    }

    this.notifications.push(notification)

    return {
      success: true,
      resourcesUsed,
      notification
    }
  }

  /**
   * Apply promotion effects to the unit
   */
  private applyPromotion(promotionPath: PromotionPath): void {
    // Update promotion status
    this.promotionStatus.promotedArchetype = promotionPath.toArchetype
    this.promotionStatus.promotionBonuses = { ...promotionPath.statBonuses }
    this.promotionStatus.newAbilities = [...promotionPath.newAbilities]
    this.promotionStatus.levelCapIncrease = promotionPath.levelCapIncrease
    this.promotionStatus.promotionDate = new Date()
    this.promotionStatus.specialEffects = [...(promotionPath.specialEffects || [])]

    // Increase level cap
    this.unit.experience.maxLevel += promotionPath.levelCapIncrease

    // Apply stat bonuses (these will be included in getCurrentStats)
    // The bonuses are stored and applied when stats are calculated

    // Add new abilities to skill system
    promotionPath.newAbilities.forEach(ability => {
      // This would integrate with the skill system to add new abilities
      // For now, we track them in the promotion status
    })
  }

  /**
   * Get promotion stat bonuses for getCurrentStats integration
   */
  public getPromotionStatBonuses(): Partial<UnitStats> {
    return { ...this.promotionStatus.promotionBonuses }
  }

  /**
   * Get special effects from promotion
   */
  public getSpecialEffects(): string[] {
    return [...this.promotionStatus.specialEffects]
  }

  /**
   * Get new abilities from promotion
   */
  public getNewAbilities(): string[] {
    return [...this.promotionStatus.newAbilities]
  }

  /**
   * Check if unit is promoted
   */
  public isPromoted(): boolean {
    return !!this.promotionStatus.promotedArchetype
  }

  /**
   * Get promoted archetype
   */
  public getPromotedArchetype(): AdvancedArchetype | null {
    return this.promotionStatus.promotedArchetype || null
  }

  /**
   * Get promotion display name
   */
  public getPromotionDisplayName(): string {
    if (!this.promotionStatus.promotedArchetype) {
      return this.unit.archetype.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const promotionPath = PROMOTION_PATHS.find(path => 
      path.toArchetype === this.promotionStatus.promotedArchetype
    )

    return promotionPath?.name || this.promotionStatus.promotedArchetype.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Get promotion requirements for a specific path
   */
  public getPromotionRequirements(advancedArchetype: AdvancedArchetype): {
    requirements: string[]
    resources: Array<{ type: ResourceType; amount: number }>
    canAfford: (playerResources: Record<ResourceType, number>) => boolean
  } {
    const promotionPath = PROMOTION_PATHS.find(path => 
      path.fromArchetype === this.unit.archetype && 
      path.toArchetype === advancedArchetype
    )

    if (!promotionPath) {
      return {
        requirements: ['Invalid promotion path'],
        resources: [],
        canAfford: () => false
      }
    }

    const summary = getPromotionRequirementsSummary(promotionPath)
    
    return {
      requirements: [...summary.met, ...summary.unmet],
      resources: summary.resources,
      canAfford: (playerResources: Record<ResourceType, number>) => {
        return summary.resources.every(req => 
          (playerResources[req.type] || 0) >= req.amount
        )
      }
    }
  }

  /**
   * Get recent promotion notifications
   */
  public getRecentNotifications(limit: number = 5): PromotionNotification[] {
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
   * Get promotion summary for UI
   */
  public getPromotionSummary(): {
    isPromoted: boolean
    currentClass: string
    promotedClass?: string
    promotionDate?: Date
    statBonuses: Partial<UnitStats>
    newAbilities: string[]
    specialEffects: string[]
    levelCapIncrease: number
  } {
    return {
      isPromoted: this.isPromoted(),
      currentClass: this.unit.archetype.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      promotedClass: this.getPromotionDisplayName(),
      promotionDate: this.promotionStatus.promotionDate,
      statBonuses: this.getPromotionStatBonuses(),
      newAbilities: this.getNewAbilities(),
      specialEffects: this.getSpecialEffects(),
      levelCapIncrease: this.promotionStatus.levelCapIncrease
    }
  }

  /**
   * Serialize to JSON
   */
  public toJSON(): any {
    return {
      unitId: this.promotionStatus.unitId,
      currentArchetype: this.promotionStatus.currentArchetype,
      promotedArchetype: this.promotionStatus.promotedArchetype,
      promotionBonuses: this.promotionStatus.promotionBonuses,
      newAbilities: this.promotionStatus.newAbilities,
      levelCapIncrease: this.promotionStatus.levelCapIncrease,
      promotionDate: this.promotionStatus.promotionDate?.toISOString(),
      specialEffects: this.promotionStatus.specialEffects,
      notifications: this.notifications.map(n => ({
        ...n,
        timestamp: n.timestamp.toISOString()
      }))
    }
  }

  /**
   * Load from JSON
   */
  public fromJSON(data: any): void {
    this.promotionStatus = {
      unitId: data.unitId,
      currentArchetype: data.currentArchetype,
      promotedArchetype: data.promotedArchetype,
      promotionBonuses: data.promotionBonuses || {},
      newAbilities: data.newAbilities || [],
      levelCapIncrease: data.levelCapIncrease || 0,
      promotionDate: data.promotionDate ? new Date(data.promotionDate) : undefined,
      specialEffects: data.specialEffects || []
    }

    if (data.notifications) {
      this.notifications = data.notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }))
    }
  }
}