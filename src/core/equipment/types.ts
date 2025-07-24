/**
 * Equipment and weapon system types
 */

// Weapon Types
export enum WeaponType {
  SWORD = 'sword',
  AXE = 'axe',
  SPEAR = 'spear',
  MACE = 'mace',
  DAGGER = 'dagger',
  BOW = 'bow',
  CROSSBOW = 'crossbow',
  STAFF = 'staff',
  WAND = 'wand',
  HAMMER = 'hammer'
}

// Damage Types
export enum DamageType {
  PHYSICAL = 'physical',
  FIRE = 'fire',
  ICE = 'ice',
  LIGHTNING = 'lightning',
  HOLY = 'holy',
  DARK = 'dark'
}

// Physical Damage Subtypes
export enum PhysicalDamageType {
  SLASHING = 'slashing',
  PIERCING = 'piercing',
  BLUDGEONING = 'bludgeoning'
}

// Equipment Slots
export enum EquipmentSlot {
  WEAPON = 'weapon',
  OFF_HAND = 'off_hand',
  HEAD = 'head',
  BODY = 'body',
  HANDS = 'hands',
  FEET = 'feet',
  ACCESSORY_1 = 'accessory_1',
  ACCESSORY_2 = 'accessory_2'
}

// Equipment Rarity
export enum EquipmentRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// Stat Bonuses
export interface StatBonus {
  hp?: number
  str?: number
  mag?: number
  skl?: number
  arm?: number
  ldr?: number
}

// Weapon Properties
export interface WeaponProperties {
  id: string
  name: string
  type: WeaponType
  rarity: EquipmentRarity
  
  // Damage
  baseDamage: number
  damageType: DamageType
  physicalDamageType?: PhysicalDamageType
  
  // Requirements
  levelRequirement: number
  statRequirements?: StatBonus
  
  // Bonuses
  statBonuses?: StatBonus
  hitBonus?: number
  critBonus?: number
  
  // Ember System
  emberSlots: number
  embeddedEmbers: Ember[]
  
  // Flavor
  description: string
  flavorText?: string
}

// Armor Properties
export interface ArmorProperties {
  id: string
  name: string
  slot: EquipmentSlot
  rarity: EquipmentRarity
  
  // Defense
  armorValue: number
  magicResistance?: number
  
  // Requirements
  levelRequirement: number
  statRequirements?: StatBonus
  
  // Bonuses
  statBonuses?: StatBonus
  
  // Set Information
  setId?: string
  setPiece?: number
  
  // Flavor
  description: string
  flavorText?: string
}

// Accessory Properties
export interface AccessoryProperties {
  id: string
  name: string
  slot: EquipmentSlot.ACCESSORY_1 | EquipmentSlot.ACCESSORY_2
  rarity: EquipmentRarity
  
  // Requirements
  levelRequirement: number
  statRequirements?: StatBonus
  
  // Bonuses
  statBonuses?: StatBonus
  specialEffects?: SpecialEffect[]
  
  // Flavor
  description: string
  flavorText?: string
}

// Ember System
export interface Ember {
  id: string
  name: string
  type: 'damage' | 'stat' | 'special'
  rarity: EquipmentRarity
  
  // Effects
  damageBonus?: number
  damageType?: DamageType
  statBonuses?: StatBonus
  specialEffect?: SpecialEffect
  
  // Requirements
  levelRequirement: number
  
  description: string
}

// Special Effects
export interface SpecialEffect {
  id: string
  name: string
  description: string
  trigger: 'on_hit' | 'on_crit' | 'on_kill' | 'passive' | 'on_damage_taken'
  effect: {
    type: 'damage' | 'heal' | 'buff' | 'debuff' | 'status'
    value?: number
    duration?: number
    target?: 'self' | 'enemy' | 'allies' | 'all'
  }
}

// Equipment Set
export interface EquipmentSet {
  id: string
  name: string
  pieces: string[] // Equipment IDs that belong to this set
  setBonuses: {
    [pieceCount: number]: {
      name: string
      description: string
      statBonuses?: StatBonus
      specialEffects?: SpecialEffect[]
    }
  }
}

// Complete Equipment Loadout
export interface EquipmentLoadout {
  [EquipmentSlot.WEAPON]?: WeaponProperties
  [EquipmentSlot.OFF_HAND]?: WeaponProperties | ArmorProperties
  [EquipmentSlot.HEAD]?: ArmorProperties
  [EquipmentSlot.BODY]?: ArmorProperties
  [EquipmentSlot.HANDS]?: ArmorProperties
  [EquipmentSlot.FEET]?: ArmorProperties
  [EquipmentSlot.ACCESSORY_1]?: AccessoryProperties
  [EquipmentSlot.ACCESSORY_2]?: AccessoryProperties
}

// Equipment Stats Summary
export interface EquipmentStats {
  totalStatBonuses: StatBonus
  totalArmorValue: number
  totalMagicResistance: number
  activeSetBonuses: Array<{
    setName: string
    pieceCount: number
    bonusName: string
    description: string
  }>
  specialEffects: SpecialEffect[]
}

// Weapon Proficiency (from existing types, but enhanced)
export interface WeaponProficiency {
  weaponType: WeaponType
  level: number // 0-100
  experience: number
  tier: number // 1-5, unlocks special abilities
}

// Proficiency Tiers and Bonuses
export interface ProficiencyTier {
  tier: number
  requiredLevel: number
  damageBonus: number
  hitBonus: number
  specialAbility?: {
    name: string
    description: string
    effect: SpecialEffect
  }
}