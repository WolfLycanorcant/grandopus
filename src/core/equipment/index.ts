// Equipment System Exports
export * from './types'
export * from './WeaponData'
export * from './ArmorData'
export * from './EmberData'
export * from './EmberManager'
export * from './ProficiencySystem'
export * from './EquipmentManager'

// Re-export commonly used types for convenience
export type {
  WeaponProperties,
  ArmorProperties,
  AccessoryProperties,
  EquipmentLoadout,
  EquipmentStats,
  StatBonus,
  SpecialEffect,
  WeaponProficiency,
  ProficiencyTier,
  Ember
} from './types'

export {
  WeaponType,
  DamageType,
  PhysicalDamageType,
  EquipmentSlot,
  EquipmentRarity
} from './types'