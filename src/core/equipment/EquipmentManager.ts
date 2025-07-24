import { 
  EquipmentLoadout, 
  EquipmentStats, 
  EquipmentSlot, 
  WeaponProperties, 
  ArmorProperties, 
  AccessoryProperties,
  StatBonus,
  SpecialEffect
} from './types'
import { Unit } from '../units'
import { getWeapon } from './WeaponData'
import { getArmor, getAccessory } from './ArmorData'

/**
 * Equipment Manager handles all equipment-related operations
 */
export class EquipmentManager {
  private unit: Unit
  private equipment: EquipmentLoadout

  constructor(unit: Unit) {
    this.unit = unit
    this.equipment = {}
  }

  /**
   * Equip an item to a specific slot
   */
  public equipItem(itemId: string, slot: EquipmentSlot): boolean {
    // Get the item data
    let item: WeaponProperties | ArmorProperties | AccessoryProperties | null = null
    
    if (slot === EquipmentSlot.WEAPON || slot === EquipmentSlot.OFF_HAND) {
      item = getWeapon(itemId)
    } else if (slot === EquipmentSlot.ACCESSORY_1 || slot === EquipmentSlot.ACCESSORY_2) {
      item = getAccessory(itemId)
    } else {
      item = getArmor(itemId)
    }

    if (!item) {
      throw new Error(`Item ${itemId} not found`)
    }

    // Check requirements
    if (!this.canEquipItem(item, slot)) {
      return false
    }

    // Unequip current item in slot if any
    if (this.equipment[slot]) {
      this.unequipItem(slot)
    }

    // Equip the new item
    this.equipment[slot] = item
    
    // Update unit's equipment map
    this.unit.equipment.set(slot, item)

    return true
  }

  /**
   * Unequip an item from a slot
   */
  public unequipItem(slot: EquipmentSlot): boolean {
    if (!this.equipment[slot]) {
      return false
    }

    delete this.equipment[slot]
    this.unit.equipment.delete(slot)
    return true
  }

  /**
   * Check if unit can equip an item
   */
  public canEquipItem(item: WeaponProperties | ArmorProperties | AccessoryProperties, slot: EquipmentSlot): boolean {
    // Check level requirement
    if (this.unit.experience.currentLevel < item.levelRequirement) {
      return false
    }

    // Check stat requirements
    if ('statRequirements' in item && item.statRequirements) {
      const currentStats = this.unit.getCurrentStats()
      
      for (const [stat, required] of Object.entries(item.statRequirements)) {
        if (currentStats[stat as keyof StatBonus] < required) {
          return false
        }
      }
    }

    // Check weapon proficiency for weapons
    if ('type' in item && slot === EquipmentSlot.WEAPON) {
      const proficiency = this.unit.getWeaponProficiency(item.type)
      // Require at least basic proficiency for higher tier weapons
      if (item.rarity === 'rare' && (!proficiency || proficiency.level < 25)) {
        return false
      }
      if (item.rarity === 'epic' && (!proficiency || proficiency.level < 50)) {
        return false
      }
      if (item.rarity === 'legendary' && (!proficiency || proficiency.level < 75)) {
        return false
      }
    }

    return true
  }

  /**
   * Get equipped item in a slot
   */
  public getEquippedItem(slot: EquipmentSlot): WeaponProperties | ArmorProperties | AccessoryProperties | null {
    return this.equipment[slot] || null
  }

  /**
   * Get all equipped items
   */
  public getAllEquippedItems(): EquipmentLoadout {
    return { ...this.equipment }
  }

  /**
   * Calculate total equipment stats
   */
  public calculateEquipmentStats(): EquipmentStats {
    const totalStatBonuses: StatBonus = {
      hp: 0,
      str: 0,
      mag: 0,
      skl: 0,
      arm: 0,
      ldr: 0
    }

    let totalArmorValue = 0
    let totalMagicResistance = 0
    const specialEffects: SpecialEffect[] = []
    const activeSetBonuses: Array<{
      setName: string
      pieceCount: number
      bonusName: string
      description: string
    }> = []

    // Calculate bonuses from each equipped item
    for (const item of Object.values(this.equipment)) {
      if (!item) continue

      // Add stat bonuses
      if (item.statBonuses) {
        for (const [stat, bonus] of Object.entries(item.statBonuses)) {
          if (totalStatBonuses[stat as keyof StatBonus] !== undefined) {
            totalStatBonuses[stat as keyof StatBonus]! += bonus
          }
        }
      }

      // Add armor value
      if ('armorValue' in item) {
        totalArmorValue += item.armorValue
      }

      // Add magic resistance
      if ('magicResistance' in item && item.magicResistance) {
        totalMagicResistance += item.magicResistance
      }

      // Add special effects
      if ('specialEffects' in item && item.specialEffects) {
        specialEffects.push(...item.specialEffects)
      }
    }

    // TODO: Calculate set bonuses (implement when we have equipment sets)

    return {
      totalStatBonuses,
      totalArmorValue,
      totalMagicResistance,
      activeSetBonuses,
      specialEffects
    }
  }

  /**
   * Get weapon damage bonus from current weapon and proficiency
   */
  public getWeaponDamageBonus(): number {
    const weapon = this.equipment[EquipmentSlot.WEAPON] as WeaponProperties
    if (!weapon || !('type' in weapon)) {
      return 0
    }

    const proficiency = this.unit.getWeaponProficiency(weapon.type)
    if (!proficiency) {
      return weapon.baseDamage
    }

    // Base damage + proficiency bonus
    const proficiencyBonus = Math.floor(weapon.baseDamage * (proficiency.level / 100))
    return weapon.baseDamage + proficiencyBonus
  }

  /**
   * Get weapon hit bonus from current weapon and proficiency
   */
  public getWeaponHitBonus(): number {
    const weapon = this.equipment[EquipmentSlot.WEAPON] as WeaponProperties
    if (!weapon || !('type' in weapon)) {
      return 0
    }

    let hitBonus = weapon.hitBonus || 0
    
    const proficiency = this.unit.getWeaponProficiency(weapon.type)
    if (proficiency) {
      // Add proficiency hit bonus
      hitBonus += Math.floor(proficiency.level / 10)
    }

    return hitBonus
  }

  /**
   * Get weapon crit bonus from current weapon and proficiency
   */
  public getWeaponCritBonus(): number {
    const weapon = this.equipment[EquipmentSlot.WEAPON] as WeaponProperties
    if (!weapon || !('type' in weapon)) {
      return 0
    }

    let critBonus = weapon.critBonus || 0
    
    const proficiency = this.unit.getWeaponProficiency(weapon.type)
    if (proficiency) {
      // Add proficiency crit bonus at higher levels
      if (proficiency.level >= 50) {
        critBonus += 5
      }
      if (proficiency.level >= 75) {
        critBonus += 5
      }
    }

    return critBonus
  }

  /**
   * Get currently equipped weapon
   */
  public getEquippedWeapon(): WeaponProperties | null {
    const weapon = this.equipment[EquipmentSlot.WEAPON]
    return (weapon && 'type' in weapon) ? weapon as WeaponProperties : null
  }

  /**
   * Check if unit has a weapon equipped
   */
  public hasWeaponEquipped(): boolean {
    return this.getEquippedWeapon() !== null
  }

  /**
   * Get equipment summary for display
   */
  public getEquipmentSummary(): string {
    const equippedCount = Object.keys(this.equipment).length
    const weapon = this.getEquippedWeapon()
    const stats = this.calculateEquipmentStats()
    
    let summary = `${equippedCount}/8 slots equipped`
    
    if (weapon) {
      summary += ` | ${weapon.name}`
    }
    
    if (stats.totalArmorValue > 0) {
      summary += ` | ${stats.totalArmorValue} armor`
    }

    return summary
  }

  /**
   * Serialize equipment to JSON
   */
  public toJSON(): any {
    const equipmentData: any = {}
    
    for (const [slot, item] of Object.entries(this.equipment)) {
      if (item) {
        equipmentData[slot] = item.id
      }
    }

    return equipmentData
  }

  /**
   * Load equipment from JSON data
   */
  public fromJSON(data: any): void {
    this.equipment = {}
    
    for (const [slot, itemId] of Object.entries(data)) {
      if (typeof itemId === 'string') {
        this.equipItem(itemId, slot as EquipmentSlot)
      }
    }
  }
}