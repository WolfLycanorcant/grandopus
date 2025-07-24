import { 
  WeaponProperties, 
  WeaponType, 
  DamageType, 
  PhysicalDamageType, 
  EquipmentRarity 
} from './types'

/**
 * Weapon database with starter weapons for each type
 */
export const WEAPON_DATA: Record<string, WeaponProperties> = {
  // SWORDS
  'iron_sword': {
    id: 'iron_sword',
    name: 'Iron Sword',
    type: WeaponType.SWORD,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 12,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.SLASHING,
    levelRequirement: 1,
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A basic iron sword. Reliable and well-balanced.',
    flavorText: 'The weapon of choice for new recruits.'
  },
  
  'steel_sword': {
    id: 'steel_sword',
    name: 'Steel Sword',
    type: WeaponType.SWORD,
    rarity: EquipmentRarity.UNCOMMON,
    baseDamage: 18,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.SLASHING,
    levelRequirement: 5,
    statBonuses: { str: 2 },
    emberSlots: 2,
    embeddedEmbers: [],
    description: 'A well-crafted steel sword with superior balance.',
    flavorText: 'Forged by skilled smiths, this blade has seen many battles.'
  },
  
  'dragonfire_blade': {
    id: 'dragonfire_blade',
    name: 'Dragonfire Blade',
    type: WeaponType.SWORD,
    rarity: EquipmentRarity.EPIC,
    baseDamage: 28,
    damageType: DamageType.FIRE,
    physicalDamageType: PhysicalDamageType.SLASHING,
    levelRequirement: 15,
    statBonuses: { str: 5, mag: 3 },
    hitBonus: 10,
    critBonus: 15,
    emberSlots: 3,
    embeddedEmbers: [],
    description: 'A legendary blade infused with dragon fire.',
    flavorText: 'The blade burns with eternal flame, forged from dragon scales.'
  },

  // BOWS
  'hunting_bow': {
    id: 'hunting_bow',
    name: 'Hunting Bow',
    type: WeaponType.BOW,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 10,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.PIERCING,
    levelRequirement: 1,
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A simple bow used for hunting game.',
    flavorText: 'Carved from yew wood, perfect for beginners.'
  },
  
  'elven_longbow': {
    id: 'elven_longbow',
    name: 'Elven Longbow',
    type: WeaponType.BOW,
    rarity: EquipmentRarity.RARE,
    baseDamage: 22,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.PIERCING,
    levelRequirement: 8,
    statBonuses: { skl: 4, str: 2 },
    hitBonus: 15,
    emberSlots: 2,
    embeddedEmbers: [],
    description: 'An elegant longbow crafted by elven artisans.',
    flavorText: 'Blessed by forest spirits, it never misses its mark.'
  },

  // STAFFS
  'wooden_staff': {
    id: 'wooden_staff',
    name: 'Wooden Staff',
    type: WeaponType.STAFF,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 8,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.BLUDGEONING,
    levelRequirement: 1,
    statBonuses: { mag: 2 },
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A simple wooden staff for novice spellcasters.',
    flavorText: 'Carved from ancient oak, it hums with latent magic.'
  },
  
  'arcane_staff': {
    id: 'arcane_staff',
    name: 'Arcane Staff',
    type: WeaponType.STAFF,
    rarity: EquipmentRarity.RARE,
    baseDamage: 15,
    damageType: DamageType.LIGHTNING,
    levelRequirement: 10,
    statBonuses: { mag: 6, skl: 2 },
    hitBonus: 5,
    emberSlots: 3,
    embeddedEmbers: [],
    description: 'A staff crackling with arcane energy.',
    flavorText: 'Lightning dances along its length, eager to be unleashed.'
  },

  // AXES
  'iron_axe': {
    id: 'iron_axe',
    name: 'Iron Axe',
    type: WeaponType.AXE,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 14,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.SLASHING,
    levelRequirement: 1,
    critBonus: 10,
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A heavy iron axe that cleaves through armor.',
    flavorText: 'Simple but effective, favored by warriors.'
  },
  
  'dwarven_waraxe': {
    id: 'dwarven_waraxe',
    name: 'Dwarven Waraxe',
    type: WeaponType.AXE,
    rarity: EquipmentRarity.EPIC,
    baseDamage: 32,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.SLASHING,
    levelRequirement: 12,
    statBonuses: { str: 4, arm: 2 },
    critBonus: 20,
    emberSlots: 2,
    embeddedEmbers: [],
    description: 'A masterwork axe forged in the depths of dwarven halls.',
    flavorText: 'Runes of power glow along its edge, promising devastation.'
  },

  // SPEARS
  'iron_spear': {
    id: 'iron_spear',
    name: 'Iron Spear',
    type: WeaponType.SPEAR,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 11,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.PIERCING,
    levelRequirement: 1,
    hitBonus: 5,
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A long iron spear with excellent reach.',
    flavorText: 'The weapon of disciplined soldiers and guards.'
  },

  // MACES
  'iron_mace': {
    id: 'iron_mace',
    name: 'Iron Mace',
    type: WeaponType.MACE,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 13,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.BLUDGEONING,
    levelRequirement: 1,
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A heavy mace that crushes armor and bone.',
    flavorText: 'Blessed by clerics, effective against the undead.'
  },

  // DAGGERS
  'iron_dagger': {
    id: 'iron_dagger',
    name: 'Iron Dagger',
    type: WeaponType.DAGGER,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 8,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.PIERCING,
    levelRequirement: 1,
    hitBonus: 10,
    critBonus: 15,
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A quick, light dagger perfect for swift strikes.',
    flavorText: 'Small but deadly in the right hands.'
  },

  // CROSSBOWS
  'light_crossbow': {
    id: 'light_crossbow',
    name: 'Light Crossbow',
    type: WeaponType.CROSSBOW,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 12,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.PIERCING,
    levelRequirement: 1,
    hitBonus: 8,
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A mechanical crossbow that requires little training.',
    flavorText: 'Point, aim, and pull the trigger.'
  },

  // WANDS
  'apprentice_wand': {
    id: 'apprentice_wand',
    name: 'Apprentice Wand',
    type: WeaponType.WAND,
    rarity: EquipmentRarity.COMMON,
    baseDamage: 6,
    damageType: DamageType.LIGHTNING,
    levelRequirement: 1,
    statBonuses: { mag: 3 },
    hitBonus: 5,
    emberSlots: 2,
    embeddedEmbers: [],
    description: 'A basic wand for channeling magical energy.',
    flavorText: 'Every mage starts somewhere.'
  },

  // HAMMERS
  'war_hammer': {
    id: 'war_hammer',
    name: 'War Hammer',
    type: WeaponType.HAMMER,
    rarity: EquipmentRarity.UNCOMMON,
    baseDamage: 16,
    damageType: DamageType.PHYSICAL,
    physicalDamageType: PhysicalDamageType.BLUDGEONING,
    levelRequirement: 3,
    statBonuses: { str: 2 },
    critBonus: 12,
    emberSlots: 1,
    embeddedEmbers: [],
    description: 'A heavy hammer that can shatter shields.',
    flavorText: 'Favored by dwarven engineers and heavy infantry.'
  }
}

/**
 * Get weapon by ID
 */
export function getWeapon(weaponId: string): WeaponProperties | null {
  return WEAPON_DATA[weaponId] || null
}

/**
 * Get all weapons of a specific type
 */
export function getWeaponsByType(type: WeaponType): WeaponProperties[] {
  return Object.values(WEAPON_DATA).filter(weapon => weapon.type === type)
}

/**
 * Get weapons by rarity
 */
export function getWeaponsByRarity(rarity: EquipmentRarity): WeaponProperties[] {
  return Object.values(WEAPON_DATA).filter(weapon => weapon.rarity === rarity)
}

/**
 * Get weapons available at a specific level
 */
export function getWeaponsForLevel(level: number): WeaponProperties[] {
  return Object.values(WEAPON_DATA).filter(weapon => weapon.levelRequirement <= level)
}

/**
 * Get all weapon types
 */
export function getAllWeaponTypes(): WeaponType[] {
  return Object.values(WeaponType)
}

/**
 * Get starter weapon for each type
 */
export function getStarterWeapons(): WeaponProperties[] {
  return [
    WEAPON_DATA.iron_sword,
    WEAPON_DATA.hunting_bow,
    WEAPON_DATA.wooden_staff,
    WEAPON_DATA.iron_axe,
    WEAPON_DATA.iron_spear,
    WEAPON_DATA.iron_mace,
    WEAPON_DATA.iron_dagger,
    WEAPON_DATA.light_crossbow,
    WEAPON_DATA.apprentice_wand,
    WEAPON_DATA.war_hammer
  ]
}