import { Unit } from '../units'
import { DamageResult, StatusEffect, CombatStats } from './types'

/**
 * Battle calculation utilities
 */

/**
 * Calculate damage from attacker to target
 */
export function calculateDamage(attacker: Unit, target: Unit): DamageResult {
  const attackerStats = attacker.getCurrentStats()
  const targetStats = target.getCurrentStats()
  
  // Get weapon data
  const weapon = attacker.equipment.weapon
  const baseDamage = weapon?.baseDamage || attackerStats.str
  
  // Calculate base damage
  let damage = baseDamage
  
  // Apply attacker stat modifiers
  if (weapon?.damageType === 'magical') {
    damage += attackerStats.mag * 0.5
  } else {
    damage += attackerStats.str * 0.3
  }
  
  // Apply weapon proficiency bonus
  const proficiency = attacker.getWeaponProficiency(weapon?.type || 'sword')
  const proficiencyBonus = 1 + (proficiency / 100)
  damage *= proficiencyBonus
  
  // Calculate accuracy and evasion
  const accuracy = calculateAccuracy(attacker, target)
  const hitRoll = Math.random() * 100
  
  if (hitRoll > accuracy) {
    // Miss
    return {
      baseDamage,
      totalDamage: 0,
      actualDamage: 0,
      damageType: weapon?.damageType || 'physical',
      isCritical: false,
      targetDefeated: false
    }
  }
  
  // Check for critical hit
  const criticalChance = calculateCriticalChance(attacker)
  const critRoll = Math.random() * 100
  const isCritical = critRoll <= criticalChance
  
  if (isCritical) {
    damage *= 2.0 // Critical multiplier
  }
  
  // Apply formation bonuses
  damage *= getFormationDamageMultiplier(attacker)
  
  // Apply target's defense
  const defense = calculateDefense(target, weapon?.damageType || 'physical')
  const finalDamage = Math.max(1, Math.floor(damage - defense))
  
  return {
    baseDamage,
    totalDamage: finalDamage,
    actualDamage: finalDamage,
    damageType: weapon?.damageType || 'physical',
    isCritical,
    targetDefeated: target.currentHp <= finalDamage
  }
}

/**
 * Calculate hit accuracy
 */
export function calculateAccuracy(attacker: Unit, target: Unit): number {
  const attackerStats = attacker.getCurrentStats()
  const targetStats = target.getCurrentStats()
  
  // Base accuracy from skill
  let accuracy = 75 + (attackerStats.skl * 2)
  
  // Weapon accuracy modifier
  const weapon = attacker.equipment.weapon
  if (weapon?.accuracy) {
    accuracy += weapon.accuracy
  }
  
  // Target evasion
  const evasion = 5 + (targetStats.skl * 1.5)
  accuracy -= evasion
  
  // Formation bonuses
  accuracy += getFormationAccuracyBonus(attacker)
  
  // Clamp between 5% and 95%
  return Math.max(5, Math.min(95, accuracy))
}

/**
 * Calculate critical hit chance
 */
export function calculateCriticalChance(attacker: Unit): number {
  const stats = attacker.getCurrentStats()
  
  // Base critical chance from skill
  let critChance = stats.skl * 0.5
  
  // Weapon critical bonus
  const weapon = attacker.equipment.weapon
  if (weapon?.criticalChance) {
    critChance += weapon.criticalChance
  }
  
  // Equipment bonuses
  critChance += getEquipmentCriticalBonus(attacker)
  
  // Clamp between 0% and 50%
  return Math.max(0, Math.min(50, critChance))
}

/**
 * Calculate defense value
 */
export function calculateDefense(defender: Unit, damageType: string): number {
  const stats = defender.getCurrentStats()
  
  if (damageType === 'magical') {
    // Magic resistance
    let magicDefense = stats.mag * 0.3
    magicDefense += getEquipmentMagicDefense(defender)
    return magicDefense
  } else {
    // Physical armor
    let armor = stats.arm
    armor += getEquipmentArmor(defender)
    armor *= getFormationDefenseMultiplier(defender)
    return armor
  }
}

/**
 * Get formation damage multiplier
 */
export function getFormationDamageMultiplier(unit: Unit): number {
  // This would integrate with the squad formation system
  // For now, return base multiplier
  return 1.0
}

/**
 * Get formation accuracy bonus
 */
export function getFormationAccuracyBonus(unit: Unit): number {
  // Formation-based accuracy bonuses
  return 0
}

/**
 * Get formation defense multiplier
 */
export function getFormationDefenseMultiplier(unit: Unit): number {
  // Front row gets +10% armor bonus
  // This would check the unit's position in formation
  return 1.0
}

/**
 * Get equipment critical bonus
 */
export function getEquipmentCriticalBonus(unit: Unit): number {
  let bonus = 0
  
  // Check all equipment for critical bonuses
  if (unit.equipment.weapon?.specialEffects?.includes('critical_boost')) {
    bonus += 5
  }
  
  // Add other equipment bonuses
  return bonus
}

/**
 * Get equipment armor value
 */
export function getEquipmentArmor(unit: Unit): number {
  let armor = 0
  
  // Sum armor from all equipment pieces
  if (unit.equipment.head?.armorValue) armor += unit.equipment.head.armorValue
  if (unit.equipment.body?.armorValue) armor += unit.equipment.body.armorValue
  if (unit.equipment.hands?.armorValue) armor += unit.equipment.hands.armorValue
  if (unit.equipment.feet?.armorValue) armor += unit.equipment.feet.armorValue
  
  return armor
}

/**
 * Get equipment magic defense
 */
export function getEquipmentMagicDefense(unit: Unit): number {
  let magicDefense = 0
  
  // Sum magic resistance from equipment
  if (unit.equipment.head?.magicResistance) magicDefense += unit.equipment.head.magicResistance
  if (unit.equipment.body?.magicResistance) magicDefense += unit.equipment.body.magicResistance
  
  return magicDefense
}

/**
 * Apply status effects to a unit
 */
export function applyStatusEffects(unit: Unit, effects: StatusEffect[]): void {
  effects.forEach(effect => {
    // Add status effect to unit
    unit.addStatusEffect(effect)
  })
}

/**
 * Process status effects at start of turn
 */
export function processStatusEffects(unit: Unit): { damage: number, healing: number } {
  let totalDamage = 0
  let totalHealing = 0
  
  // Process each active status effect
  unit.getActiveStatusEffects().forEach(effect => {
    if (effect.effect.damagePerTurn) {
      totalDamage += effect.effect.damagePerTurn
    }
    if (effect.effect.healPerTurn) {
      totalHealing += effect.effect.healPerTurn
    }
    
    // Reduce duration
    effect.duration--
  })
  
  // Remove expired effects
  unit.removeExpiredStatusEffects()
  
  return { damage: totalDamage, healing: totalHealing }
}

/**
 * Check victory conditions
 */
export function checkVictoryConditions(attackingUnits: Unit[], defendingUnits: Unit[]): 'attacking' | 'defending' | null {
  const attackingAlive = attackingUnits.some(unit => unit.currentHp > 0)
  const defendingAlive = defendingUnits.some(unit => unit.currentHp > 0)
  
  if (!attackingAlive && !defendingAlive) {
    return null // Draw (shouldn't happen)
  } else if (!attackingAlive) {
    return 'defending'
  } else if (!defendingAlive) {
    return 'attacking'
  }
  
  return null // Battle continues
}

/**
 * Calculate experience gained from battle
 */
export function calculateExperienceGain(winner: Unit[], loser: Unit[], turnsElapsed: number): number {
  const baseExp = 50
  const enemyLevelBonus = loser.reduce((sum, unit) => sum + unit.experience.currentLevel, 0) * 5
  const speedBonus = Math.max(0, 100 - turnsElapsed * 5) // Bonus for quick victories
  
  return baseExp + enemyLevelBonus + speedBonus
}

/**
 * Calculate combat stats for a unit
 */
export function calculateCombatStats(unit: Unit): CombatStats {
  const baseStats = unit.getCurrentStats()
  
  return {
    accuracy: calculateAccuracy(unit, unit), // Placeholder target
    evasion: 5 + (baseStats.skl * 1.5),
    criticalChance: calculateCriticalChance(unit),
    criticalMultiplier: 2.0,
    armor: baseStats.arm + getEquipmentArmor(unit),
    magicResistance: baseStats.mag * 0.3 + getEquipmentMagicDefense(unit),
    statusResistance: baseStats.mag * 0.2
  }
}