import { 
  ArmorProperties, 
  AccessoryProperties, 
  EquipmentSlot, 
  EquipmentRarity 
} from './types'

/**
 * Armor database with starter equipment
 */
export const ARMOR_DATA: Record<string, ArmorProperties> = {
  // HEAD ARMOR
  'leather_cap': {
    id: 'leather_cap',
    name: 'Leather Cap',
    slot: EquipmentSlot.HEAD,
    rarity: EquipmentRarity.COMMON,
    armorValue: 2,
    levelRequirement: 1,
    description: 'A simple leather cap that provides basic protection.',
    flavorText: 'Better than nothing, but not by much.'
  },
  
  'iron_helm': {
    id: 'iron_helm',
    name: 'Iron Helm',
    slot: EquipmentSlot.HEAD,
    rarity: EquipmentRarity.UNCOMMON,
    armorValue: 5,
    levelRequirement: 3,
    statBonuses: { arm: 1 },
    description: 'A sturdy iron helmet with good protection.',
    flavorText: 'Protects the most important part - your head.'
  },
  
  'dragon_helm': {
    id: 'dragon_helm',
    name: 'Dragon Scale Helm',
    slot: EquipmentSlot.HEAD,
    rarity: EquipmentRarity.EPIC,
    armorValue: 12,
    magicResistance: 8,
    levelRequirement: 12,
    statBonuses: { arm: 3, mag: 2 },
    description: 'A helm crafted from dragon scales, nearly indestructible.',
    flavorText: 'The scales shimmer with residual dragon magic.'
  },

  // BODY ARMOR
  'leather_armor': {
    id: 'leather_armor',
    name: 'Leather Armor',
    slot: EquipmentSlot.BODY,
    rarity: EquipmentRarity.COMMON,
    armorValue: 5,
    levelRequirement: 1,
    description: 'Basic leather armor that allows good mobility.',
    flavorText: 'The choice of scouts and light infantry.'
  },
  
  'chainmail': {
    id: 'chainmail',
    name: 'Chainmail',
    slot: EquipmentSlot.BODY,
    rarity: EquipmentRarity.UNCOMMON,
    armorValue: 10,
    levelRequirement: 4,
    statBonuses: { arm: 2 },
    description: 'Interlocked metal rings provide excellent protection.',
    flavorText: 'Takes forever to put on, but worth the protection.'
  },
  
  'plate_armor': {
    id: 'plate_armor',
    name: 'Plate Armor',
    slot: EquipmentSlot.BODY,
    rarity: EquipmentRarity.RARE,
    armorValue: 18,
    levelRequirement: 8,
    statBonuses: { arm: 4, str: 2 },
    statRequirements: { str: 12 },
    description: 'Heavy plate armor that turns aside most attacks.',
    flavorText: 'The pinnacle of defensive craftsmanship.'
  },
  
  'dragonscale_armor': {
    id: 'dragonscale_armor',
    name: 'Dragonscale Armor',
    slot: EquipmentSlot.BODY,
    rarity: EquipmentRarity.LEGENDARY,
    armorValue: 25,
    magicResistance: 15,
    levelRequirement: 15,
    statBonuses: { arm: 6, mag: 4, str: 3 },
    description: 'Armor crafted from the scales of an ancient dragon.',
    flavorText: 'Legends say it makes the wearer nearly invincible.'
  },

  // HAND ARMOR
  'leather_gloves': {
    id: 'leather_gloves',
    name: 'Leather Gloves',
    slot: EquipmentSlot.HANDS,
    rarity: EquipmentRarity.COMMON,
    armorValue: 1,
    levelRequirement: 1,
    statBonuses: { skl: 1 },
    description: 'Simple leather gloves that improve grip.',
    flavorText: 'Every adventurer needs a good pair of gloves.'
  },
  
  'iron_gauntlets': {
    id: 'iron_gauntlets',
    name: 'Iron Gauntlets',
    slot: EquipmentSlot.HANDS,
    rarity: EquipmentRarity.UNCOMMON,
    armorValue: 3,
    levelRequirement: 3,
    statBonuses: { arm: 1, str: 1 },
    description: 'Heavy iron gauntlets that can crush bones.',
    flavorText: 'Your fists become weapons themselves.'
  },

  // FOOT ARMOR
  'leather_boots': {
    id: 'leather_boots',
    name: 'Leather Boots',
    slot: EquipmentSlot.FEET,
    rarity: EquipmentRarity.COMMON,
    armorValue: 1,
    levelRequirement: 1,
    statBonuses: { skl: 1 },
    description: 'Sturdy leather boots for long journeys.',
    flavorText: 'A good pair of boots can save your life.'
  },
  
  'iron_boots': {
    id: 'iron_boots',
    name: 'Iron Boots',
    slot: EquipmentSlot.FEET,
    rarity: EquipmentRarity.UNCOMMON,
    armorValue: 3,
    levelRequirement: 3,
    statBonuses: { arm: 1 },
    description: 'Heavy iron boots that protect your feet.',
    flavorText: 'Perfect for kicking down doors.'
  },
  
  'boots_of_swiftness': {
    id: 'boots_of_swiftness',
    name: 'Boots of Swiftness',
    slot: EquipmentSlot.FEET,
    rarity: EquipmentRarity.RARE,
    armorValue: 2,
    levelRequirement: 6,
    statBonuses: { skl: 4 },
    description: 'Enchanted boots that increase movement speed.',
    flavorText: 'Light as a feather, swift as the wind.'
  }
}

/**
 * Accessory database
 */
export const ACCESSORY_DATA: Record<string, AccessoryProperties> = {
  'iron_ring': {
    id: 'iron_ring',
    name: 'Iron Ring',
    slot: EquipmentSlot.ACCESSORY_1,
    rarity: EquipmentRarity.COMMON,
    levelRequirement: 1,
    statBonuses: { str: 1 },
    description: 'A simple iron ring that boosts strength.',
    flavorText: 'Heavy and practical.'
  },
  
  'ring_of_protection': {
    id: 'ring_of_protection',
    name: 'Ring of Protection',
    slot: EquipmentSlot.ACCESSORY_1,
    rarity: EquipmentRarity.UNCOMMON,
    levelRequirement: 4,
    statBonuses: { arm: 2, hp: 5 },
    description: 'A magical ring that provides protection.',
    flavorText: 'Glows faintly with protective magic.'
  },
  
  'amulet_of_power': {
    id: 'amulet_of_power',
    name: 'Amulet of Power',
    slot: EquipmentSlot.ACCESSORY_2,
    rarity: EquipmentRarity.RARE,
    levelRequirement: 7,
    statBonuses: { mag: 3, str: 2 },
    description: 'An ancient amulet that channels raw power.',
    flavorText: 'Pulses with ancient magic.'
  },
  
  'dragonfire_pendant': {
    id: 'dragonfire_pendant',
    name: 'Dragonfire Pendant',
    slot: EquipmentSlot.ACCESSORY_2,
    rarity: EquipmentRarity.EPIC,
    levelRequirement: 10,
    statBonuses: { mag: 5, str: 3 },
    specialEffects: [{
      id: 'fire_immunity',
      name: 'Fire Immunity',
      description: 'Immune to fire damage',
      trigger: 'passive',
      effect: {
        type: 'buff',
        value: 100,
        target: 'self'
      }
    }],
    description: 'A pendant containing the essence of dragonfire.',
    flavorText: 'Burns with eternal flame, yet never consumes.'
  },
  
  'cloak_of_shadows': {
    id: 'cloak_of_shadows',
    name: 'Cloak of Shadows',
    slot: EquipmentSlot.ACCESSORY_1,
    rarity: EquipmentRarity.RARE,
    levelRequirement: 8,
    statBonuses: { skl: 4 },
    specialEffects: [{
      id: 'stealth',
      name: 'Stealth',
      description: '15% chance to avoid attacks',
      trigger: 'on_damage_taken',
      effect: {
        type: 'buff',
        value: 15,
        target: 'self'
      }
    }],
    description: 'A cloak that bends light and shadow.',
    flavorText: 'Makes the wearer one with the shadows.'
  }
}

/**
 * Get armor by ID
 */
export function getArmor(armorId: string): ArmorProperties | null {
  return ARMOR_DATA[armorId] || null
}

/**
 * Get accessory by ID
 */
export function getAccessory(accessoryId: string): AccessoryProperties | null {
  return ACCESSORY_DATA[accessoryId] || null
}

/**
 * Get armor by slot
 */
export function getArmorBySlot(slot: EquipmentSlot): ArmorProperties[] {
  return Object.values(ARMOR_DATA).filter(armor => armor.slot === slot)
}

/**
 * Get accessories by slot
 */
export function getAccessoriesBySlot(slot: EquipmentSlot.ACCESSORY_1 | EquipmentSlot.ACCESSORY_2): AccessoryProperties[] {
  return Object.values(ACCESSORY_DATA).filter(accessory => accessory.slot === slot)
}

/**
 * Get equipment by rarity
 */
export function getEquipmentByRarity(rarity: EquipmentRarity): (ArmorProperties | AccessoryProperties)[] {
  const armor = Object.values(ARMOR_DATA).filter(item => item.rarity === rarity)
  const accessories = Object.values(ACCESSORY_DATA).filter(item => item.rarity === rarity)
  return [...armor, ...accessories]
}

/**
 * Get starter equipment set
 */
export function getStarterEquipment(): {
  armor: ArmorProperties[]
  accessories: AccessoryProperties[]
} {
  return {
    armor: [
      ARMOR_DATA.leather_cap,
      ARMOR_DATA.leather_armor,
      ARMOR_DATA.leather_gloves,
      ARMOR_DATA.leather_boots
    ],
    accessories: [
      ACCESSORY_DATA.iron_ring
    ]
  }
}