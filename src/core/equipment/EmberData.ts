import { 
  Ember, 
  DamageType, 
  EquipmentRarity,
  SpecialEffect
} from './types'

/**
 * Ember database with various types of weapon enhancements
 */
export const EMBER_DATA: Record<string, Ember> = {
  // DAMAGE EMBERS
  'fire_ember': {
    id: 'fire_ember',
    name: 'Fire Ember',
    type: 'damage',
    rarity: EquipmentRarity.COMMON,
    damageBonus: 3,
    damageType: DamageType.FIRE,
    levelRequirement: 1,
    description: 'Adds fire damage to weapon attacks.'
  },

  'ice_ember': {
    id: 'ice_ember',
    name: 'Ice Ember',
    type: 'damage',
    rarity: EquipmentRarity.COMMON,
    damageBonus: 3,
    damageType: DamageType.ICE,
    levelRequirement: 1,
    description: 'Adds ice damage to weapon attacks.'
  },

  'lightning_ember': {
    id: 'lightning_ember',
    name: 'Lightning Ember',
    type: 'damage',
    rarity: EquipmentRarity.COMMON,
    damageBonus: 3,
    damageType: DamageType.LIGHTNING,
    levelRequirement: 1,
    description: 'Adds lightning damage to weapon attacks.'
  },

  'greater_fire_ember': {
    id: 'greater_fire_ember',
    name: 'Greater Fire Ember',
    type: 'damage',
    rarity: EquipmentRarity.UNCOMMON,
    damageBonus: 6,
    damageType: DamageType.FIRE,
    levelRequirement: 5,
    description: 'Adds significant fire damage to weapon attacks.'
  },

  'dragonfire_ember': {
    id: 'dragonfire_ember',
    name: 'Dragonfire Ember',
    type: 'damage',
    rarity: EquipmentRarity.EPIC,
    damageBonus: 12,
    damageType: DamageType.FIRE,
    levelRequirement: 12,
    specialEffect: {
      id: 'dragonfire_burst',
      name: 'Dragonfire Burst',
      description: '15% chance to deal AoE fire damage on hit',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 8,
        target: 'all'
      }
    },
    description: 'Infuses weapon with ancient dragon fire.'
  },

  // STAT EMBERS
  'strength_ember': {
    id: 'strength_ember',
    name: 'Strength Ember',
    type: 'stat',
    rarity: EquipmentRarity.COMMON,
    statBonuses: { str: 2 },
    levelRequirement: 1,
    description: 'Permanently increases the wielder\'s strength.'
  },

  'magic_ember': {
    id: 'magic_ember',
    name: 'Magic Ember',
    type: 'stat',
    rarity: EquipmentRarity.COMMON,
    statBonuses: { mag: 2 },
    levelRequirement: 1,
    description: 'Permanently increases the wielder\'s magic power.'
  },

  'skill_ember': {
    id: 'skill_ember',
    name: 'Skill Ember',
    type: 'stat',
    rarity: EquipmentRarity.COMMON,
    statBonuses: { skl: 2 },
    levelRequirement: 1,
    description: 'Permanently increases the wielder\'s skill.'
  },

  'vitality_ember': {
    id: 'vitality_ember',
    name: 'Vitality Ember',
    type: 'stat',
    rarity: EquipmentRarity.UNCOMMON,
    statBonuses: { hp: 10 },
    levelRequirement: 3,
    description: 'Permanently increases the wielder\'s health.'
  },

  'armor_ember': {
    id: 'armor_ember',
    name: 'Armor Ember',
    type: 'stat',
    rarity: EquipmentRarity.UNCOMMON,
    statBonuses: { arm: 3 },
    levelRequirement: 3,
    description: 'Permanently increases the wielder\'s armor.'
  },

  'leadership_ember': {
    id: 'leadership_ember',
    name: 'Leadership Ember',
    type: 'stat',
    rarity: EquipmentRarity.RARE,
    statBonuses: { ldr: 3 },
    levelRequirement: 6,
    description: 'Permanently increases the wielder\'s leadership.'
  },

  'supreme_power_ember': {
    id: 'supreme_power_ember',
    name: 'Supreme Power Ember',
    type: 'stat',
    rarity: EquipmentRarity.LEGENDARY,
    statBonuses: { str: 5, mag: 5, skl: 3 },
    levelRequirement: 15,
    description: 'A legendary ember that greatly enhances all combat abilities.'
  },

  // SPECIAL EMBERS
  'vampiric_ember': {
    id: 'vampiric_ember',
    name: 'Vampiric Ember',
    type: 'special',
    rarity: EquipmentRarity.RARE,
    levelRequirement: 8,
    specialEffect: {
      id: 'life_steal',
      name: 'Life Steal',
      description: 'Heal for 25% of damage dealt',
      trigger: 'on_hit',
      effect: {
        type: 'heal',
        value: 25,
        target: 'self'
      }
    },
    description: 'Allows the wielder to drain life from enemies.'
  },

  'critical_ember': {
    id: 'critical_ember',
    name: 'Critical Ember',
    type: 'special',
    rarity: EquipmentRarity.UNCOMMON,
    levelRequirement: 4,
    specialEffect: {
      id: 'critical_boost',
      name: 'Critical Boost',
      description: '+15% critical hit chance',
      trigger: 'passive',
      effect: {
        type: 'buff',
        value: 15,
        target: 'self'
      }
    },
    description: 'Increases the chance of landing critical hits.'
  },

  'berserker_ember': {
    id: 'berserker_ember',
    name: 'Berserker Ember',
    type: 'special',
    rarity: EquipmentRarity.RARE,
    levelRequirement: 7,
    specialEffect: {
      id: 'berserker_rage',
      name: 'Berserker Rage',
      description: '+50% damage when below 25% HP',
      trigger: 'passive',
      effect: {
        type: 'buff',
        value: 50,
        target: 'self'
      }
    },
    description: 'Grants immense power when near death.'
  },

  'phoenix_ember': {
    id: 'phoenix_ember',
    name: 'Phoenix Ember',
    type: 'special',
    rarity: EquipmentRarity.LEGENDARY,
    levelRequirement: 18,
    specialEffect: {
      id: 'phoenix_rebirth',
      name: 'Phoenix Rebirth',
      description: 'Revive with 50% HP when defeated (once per battle)',
      trigger: 'on_damage_taken',
      effect: {
        type: 'heal',
        value: 50,
        target: 'self'
      }
    },
    description: 'Contains the essence of the immortal phoenix.'
  },

  'executioner_ember': {
    id: 'executioner_ember',
    name: 'Executioner Ember',
    type: 'special',
    rarity: EquipmentRarity.EPIC,
    levelRequirement: 10,
    specialEffect: {
      id: 'execute',
      name: 'Execute',
      description: 'Instantly kill enemies below 15% HP',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 999,
        target: 'enemy'
      }
    },
    description: 'Delivers swift death to weakened foes.'
  },

  'mana_burn_ember': {
    id: 'mana_burn_ember',
    name: 'Mana Burn Ember',
    type: 'special',
    rarity: EquipmentRarity.RARE,
    levelRequirement: 9,
    specialEffect: {
      id: 'mana_burn',
      name: 'Mana Burn',
      description: 'Reduce enemy magic power on hit',
      trigger: 'on_hit',
      effect: {
        type: 'debuff',
        value: 3,
        target: 'enemy'
      }
    },
    description: 'Disrupts enemy spellcasting abilities.'
  },

  'chain_lightning_ember': {
    id: 'chain_lightning_ember',
    name: 'Chain Lightning Ember',
    type: 'special',
    rarity: EquipmentRarity.EPIC,
    damageBonus: 5,
    damageType: DamageType.LIGHTNING,
    levelRequirement: 11,
    specialEffect: {
      id: 'chain_lightning',
      name: 'Chain Lightning',
      description: '30% chance to hit 2 additional enemies',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 75,
        target: 'all'
      }
    },
    description: 'Lightning jumps between multiple enemies.'
  }
}

/**
 * Get ember by ID
 */
export function getEmber(emberId: string): Ember | null {
  return EMBER_DATA[emberId] || null
}

/**
 * Get embers by type
 */
export function getEmbersByType(type: 'damage' | 'stat' | 'special'): Ember[] {
  return Object.values(EMBER_DATA).filter(ember => ember.type === type)
}

/**
 * Get embers by rarity
 */
export function getEmbersByRarity(rarity: EquipmentRarity): Ember[] {
  return Object.values(EMBER_DATA).filter(ember => ember.rarity === rarity)
}

/**
 * Get embers available at a specific level
 */
export function getEmbersForLevel(level: number): Ember[] {
  return Object.values(EMBER_DATA).filter(ember => ember.levelRequirement <= level)
}

/**
 * Get starter embers for new players
 */
export function getStarterEmbers(): Ember[] {
  return [
    EMBER_DATA.fire_ember,
    EMBER_DATA.ice_ember,
    EMBER_DATA.lightning_ember,
    EMBER_DATA.strength_ember,
    EMBER_DATA.magic_ember,
    EMBER_DATA.skill_ember
  ]
}

/**
 * Get all available embers
 */
export function getAllEmbers(): Ember[] {
  return Object.values(EMBER_DATA)
}

/**
 * Get embers by damage type
 */
export function getEmbersByDamageType(damageType: DamageType): Ember[] {
  return Object.values(EMBER_DATA).filter(ember => ember.damageType === damageType)
}