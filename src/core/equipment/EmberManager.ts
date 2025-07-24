import { 
  Ember, 
  WeaponProperties, 
  EquipmentSlot,
  StatBonus
} from './types'
import { getEmber } from './EmberData'
import { Unit } from '../units'
import { AchievementIntegration } from '../achievements/AchievementIntegration'

/**
 * Manages ember embedding and removal from weapons
 */
export class EmberManager {
  private unit: Unit

  constructor(unit: Unit) {
    this.unit = unit
  }

  /**
   * Embed an ember into a weapon
   */
  public embedEmber(weaponSlot: EquipmentSlot, emberId: string): boolean {
    // Get the weapon
    const weapon = this.unit.getEquippedItem(weaponSlot) as WeaponProperties
    if (!weapon || !('emberSlots' in weapon)) {
      throw new Error('No weapon equipped in this slot')
    }

    // Get the ember
    const ember = getEmber(emberId)
    if (!ember) {
      throw new Error(`Ember ${emberId} not found`)
    }

    // Check if weapon has available ember slots
    if (weapon.embeddedEmbers.length >= weapon.emberSlots) {
      throw new Error('Weapon has no available ember slots')
    }

    // Check if ember is already embedded
    if (weapon.embeddedEmbers.some(e => e.id === emberId)) {
      throw new Error('This ember is already embedded in the weapon')
    }

    // Check level requirement
    if (this.unit.experience.currentLevel < ember.levelRequirement) {
      throw new Error(`Requires level ${ember.levelRequirement}`)
    }

    // Check if unit can use this ember type (optional restrictions)
    if (!this.canUseEmber(ember)) {
      throw new Error('Unit cannot use this type of ember')
    }

    // Embed the ember
    weapon.embeddedEmbers.push(ember)

    // Track achievement progress
    const notifications = AchievementIntegration.trackEmberEmbedding(this.unit)
    AchievementIntegration.processNotifications(notifications)

    return true
  }

  /**
   * Remove an ember from a weapon
   */
  public removeEmber(weaponSlot: EquipmentSlot, emberId: string): boolean {
    // Get the weapon
    const weapon = this.unit.getEquippedItem(weaponSlot) as WeaponProperties
    if (!weapon || !('emberSlots' in weapon)) {
      throw new Error('No weapon equipped in this slot')
    }

    // Find and remove the ember
    const emberIndex = weapon.embeddedEmbers.findIndex(e => e.id === emberId)
    if (emberIndex === -1) {
      throw new Error('Ember not found in weapon')
    }

    weapon.embeddedEmbers.splice(emberIndex, 1)
    return true
  }

  /**
   * Get all embedded embers for a weapon
   */
  public getEmbeddedEmbers(weaponSlot: EquipmentSlot): Ember[] {
    const weapon = this.unit.getEquippedItem(weaponSlot) as WeaponProperties
    if (!weapon || !('emberSlots' in weapon)) {
      return []
    }

    return [...weapon.embeddedEmbers]
  }

  /**
   * Get available ember slots for a weapon
   */
  public getAvailableEmberSlots(weaponSlot: EquipmentSlot): number {
    const weapon = this.unit.getEquippedItem(weaponSlot) as WeaponProperties
    if (!weapon || !('emberSlots' in weapon)) {
      return 0
    }

    return weapon.emberSlots - weapon.embeddedEmbers.length
  }

  /**
   * Calculate total ember bonuses for a weapon
   */
  public calculateEmberBonuses(weaponSlot: EquipmentSlot): {
    damageBonus: number
    statBonuses: StatBonus
    specialEffects: Array<{
      name: string
      description: string
      trigger: string
    }>
  } {
    const weapon = this.unit.getEquippedItem(weaponSlot) as WeaponProperties
    if (!weapon || !('emberSlots' in weapon)) {
      return {
        damageBonus: 0,
        statBonuses: {},
        specialEffects: []
      }
    }

    let totalDamageBonus = 0
    const totalStatBonuses: StatBonus = {}
    const specialEffects: Array<{
      name: string
      description: string
      trigger: string
    }> = []

    for (const ember of weapon.embeddedEmbers) {
      // Add damage bonus
      if (ember.damageBonus) {
        totalDamageBonus += ember.damageBonus
      }

      // Add stat bonuses
      if (ember.statBonuses) {
        for (const [stat, bonus] of Object.entries(ember.statBonuses)) {
          if (totalStatBonuses[stat as keyof StatBonus] === undefined) {
            totalStatBonuses[stat as keyof StatBonus] = 0
          }
          totalStatBonuses[stat as keyof StatBonus]! += bonus
        }
      }

      // Add special effects
      if (ember.specialEffect) {
        specialEffects.push({
          name: ember.specialEffect.name,
          description: ember.specialEffect.description,
          trigger: ember.specialEffect.trigger
        })
      }
    }

    return {
      damageBonus: totalDamageBonus,
      statBonuses: totalStatBonuses,
      specialEffects
    }
  }

  /**
   * Get weapon damage including ember bonuses
   */
  public getWeaponDamageWithEmbers(weaponSlot: EquipmentSlot): number {
    const baseDamage = this.unit.equipmentManager.getWeaponDamageBonus()
    const emberBonuses = this.calculateEmberBonuses(weaponSlot)
    
    return baseDamage + emberBonuses.damageBonus
  }

  /**
   * Check if unit can use a specific ember
   */
  private canUseEmber(ember: Ember): boolean {
    // Add any restrictions here
    // For example, only mages can use certain magic embers
    
    // For now, allow all embers for all units
    // You can add restrictions based on unit archetype, race, etc.
    
    return true
  }

  /**
   * Get ember compatibility info
   */
  public getEmberCompatibility(emberId: string): {
    canUse: boolean
    reason?: string
  } {
    const ember = getEmber(emberId)
    if (!ember) {
      return { canUse: false, reason: 'Ember not found' }
    }

    // Check level requirement
    if (this.unit.experience.currentLevel < ember.levelRequirement) {
      return { 
        canUse: false, 
        reason: `Requires level ${ember.levelRequirement}` 
      }
    }

    // Check if unit can use this ember type
    if (!this.canUseEmber(ember)) {
      return { 
        canUse: false, 
        reason: 'Unit cannot use this ember type' 
      }
    }

    return { canUse: true }
  }

  /**
   * Get summary of all ember effects for the unit
   */
  public getEmberEffectsSummary(): {
    totalDamageBonus: number
    totalStatBonuses: StatBonus
    allSpecialEffects: Array<{
      weaponSlot: EquipmentSlot
      emberName: string
      effectName: string
      description: string
    }>
  } {
    let totalDamageBonus = 0
    const totalStatBonuses: StatBonus = {}
    const allSpecialEffects: Array<{
      weaponSlot: EquipmentSlot
      emberName: string
      effectName: string
      description: string
    }> = []

    // Check main weapon
    const mainWeaponBonuses = this.calculateEmberBonuses(EquipmentSlot.WEAPON)
    totalDamageBonus += mainWeaponBonuses.damageBonus
    
    // Add stat bonuses
    for (const [stat, bonus] of Object.entries(mainWeaponBonuses.statBonuses)) {
      if (totalStatBonuses[stat as keyof StatBonus] === undefined) {
        totalStatBonuses[stat as keyof StatBonus] = 0
      }
      totalStatBonuses[stat as keyof StatBonus]! += bonus
    }

    // Add special effects
    const mainWeapon = this.unit.getEquippedItem(EquipmentSlot.WEAPON) as WeaponProperties
    if (mainWeapon && 'embeddedEmbers' in mainWeapon) {
      for (const ember of mainWeapon.embeddedEmbers) {
        if (ember.specialEffect) {
          allSpecialEffects.push({
            weaponSlot: EquipmentSlot.WEAPON,
            emberName: ember.name,
            effectName: ember.specialEffect.name,
            description: ember.specialEffect.description
          })
        }
      }
    }

    // Check off-hand weapon if it exists
    const offHandWeapon = this.unit.getEquippedItem(EquipmentSlot.OFF_HAND) as WeaponProperties
    if (offHandWeapon && 'embeddedEmbers' in offHandWeapon) {
      const offHandBonuses = this.calculateEmberBonuses(EquipmentSlot.OFF_HAND)
      totalDamageBonus += offHandBonuses.damageBonus

      // Add stat bonuses
      for (const [stat, bonus] of Object.entries(offHandBonuses.statBonuses)) {
        if (totalStatBonuses[stat as keyof StatBonus] === undefined) {
          totalStatBonuses[stat as keyof StatBonus] = 0
        }
        totalStatBonuses[stat as keyof StatBonus]! += bonus
      }

      // Add special effects
      for (const ember of offHandWeapon.embeddedEmbers) {
        if (ember.specialEffect) {
          allSpecialEffects.push({
            weaponSlot: EquipmentSlot.OFF_HAND,
            emberName: ember.name,
            effectName: ember.specialEffect.name,
            description: ember.specialEffect.description
          })
        }
      }
    }

    return {
      totalDamageBonus,
      totalStatBonuses,
      allSpecialEffects
    }
  }
}