import { Archetype, ArchetypeData } from './types';
import { WeaponType } from '../equipment';

/**
 * Archetype definitions with stat growth and abilities
 */
export const ARCHETYPE_DATA: Record<Archetype, ArchetypeData> = {
  [Archetype.HEAVY_INFANTRY]: {
    name: 'Heavy Infantry',
    description: 'Heavily armored frontline fighters',
    baseStats: {
      hp: 45,
      str: 12,
      mag: 4,
      skl: 8,
      arm: 15,
      ldr: 6
    },
    statGrowth: {
      hp: 8,    // High HP growth
      str: 3,   // Good STR growth
      mag: 1,   // Low MAG growth
      skl: 2,   // Moderate SKL growth
      arm: 3,   // Good ARM growth
      ldr: 1    // Low LDR growth
    },
    weaponProficiencies: [
      WeaponType.SWORD,
      WeaponType.AXE,
      WeaponType.SPEAR,
      WeaponType.MACE
    ],
    classAbilities: ['Shield Wall', 'Taunt'],
    promotionRequirements: {
      level: 10,
      resources: { steel: 30, leather: 20 },
      equipment: ['Heavy Armor']
    }
  },

  [Archetype.LIGHT_INFANTRY]: {
    name: 'Light Infantry',
    description: 'Mobile and versatile fighters',
    baseStats: {
      hp: 35,
      str: 10,
      mag: 6,
      skl: 12,
      arm: 8,
      ldr: 8
    },
    statGrowth: {
      hp: 6,
      str: 2,
      mag: 1,
      skl: 3,   // Good SKL growth
      arm: 2,
      ldr: 2
    },
    weaponProficiencies: [
      WeaponType.SWORD,
      WeaponType.SPEAR,
      WeaponType.DAGGER,
      WeaponType.BOW
    ],
    classAbilities: ['Quick Strike', 'Dodge'],
    promotionRequirements: {
      level: 8,
      resources: { steel: 20, leather: 15 }
    }
  },

  [Archetype.ARCHER]: {
    name: 'Archer',
    description: 'Ranged specialists with keen aim',
    baseStats: {
      hp: 30,
      str: 8,
      mag: 6,
      skl: 15,  // High skill for accuracy
      arm: 6,
      ldr: 7
    },
    statGrowth: {
      hp: 5,
      str: 2,
      mag: 1,
      skl: 4,   // Excellent SKL growth
      arm: 1,
      ldr: 1
    },
    weaponProficiencies: [
      WeaponType.BOW,
      WeaponType.CROSSBOW,
      WeaponType.DAGGER
    ],
    classAbilities: ['Aimed Shot', 'Multi-Shot'],
    promotionRequirements: {
      level: 8,
      resources: { wood: 25, steel: 15 },
      equipment: ['Composite Bow']
    }
  },

  [Archetype.MAGE]: {
    name: 'Mage',
    description: 'Masters of arcane magic',
    baseStats: {
      hp: 25,
      str: 4,
      mag: 18,  // High magic
      skl: 10,
      arm: 4,
      ldr: 8
    },
    statGrowth: {
      hp: 4,
      str: 1,
      mag: 5,   // Excellent MAG growth
      skl: 2,
      arm: 1,
      ldr: 2
    },
    weaponProficiencies: [
      WeaponType.STAFF,
      WeaponType.WAND,
      WeaponType.DAGGER
    ],
    classAbilities: ['Fireball', 'Magic Missile', 'Mana Shield'],
    promotionRequirements: {
      level: 10,
      resources: { mana_crystal: 20, wood: 15 },
      equipment: ['Arcane Staff']
    }
  },

  [Archetype.CLERIC]: {
    name: 'Cleric',
    description: 'Divine healers and support specialists',
    baseStats: {
      hp: 32,
      str: 6,
      mag: 15,  // Good magic for healing
      skl: 8,
      arm: 8,
      ldr: 12   // Good leadership
    },
    statGrowth: {
      hp: 6,
      str: 1,
      mag: 4,   // Good MAG growth
      skl: 2,
      arm: 2,
      ldr: 3    // Good LDR growth
    },
    weaponProficiencies: [
      WeaponType.STAFF,
      WeaponType.MACE,
      WeaponType.WAND
    ],
    classAbilities: ['Heal', 'Bless', 'Turn Undead'],
    promotionRequirements: {
      level: 9,
      resources: { mana_crystal: 15, gold: 100 },
      equipment: ['Holy Symbol']
    }
  },

  [Archetype.KNIGHT]: {
    name: 'Knight',
    description: 'Elite mounted warriors and leaders',
    baseStats: {
      hp: 50,
      str: 15,
      mag: 6,
      skl: 10,
      arm: 18,  // High armor
      ldr: 15   // High leadership
    },
    statGrowth: {
      hp: 7,
      str: 3,
      mag: 1,
      skl: 2,
      arm: 3,
      ldr: 4    // Excellent LDR growth
    },
    weaponProficiencies: [
      WeaponType.SWORD,
      WeaponType.SPEAR,
      WeaponType.MACE
    ],
    classAbilities: ['Charge', 'Rally', 'Shield Bash'],
    promotionRequirements: {
      level: 15,
      resources: { steel: 50, horses: 1 },
      equipment: ['Lance', 'Plate Armor']
    }
  },

  [Archetype.ROGUE]: {
    name: 'Rogue',
    description: 'Stealthy assassins and scouts',
    baseStats: {
      hp: 28,
      str: 9,
      mag: 5,
      skl: 18,  // Very high skill
      arm: 5,
      ldr: 6
    },
    statGrowth: {
      hp: 5,
      str: 2,
      mag: 1,
      skl: 4,   // Excellent SKL growth
      arm: 1,
      ldr: 1
    },
    weaponProficiencies: [
      WeaponType.DAGGER,
      WeaponType.BOW,
      WeaponType.SWORD
    ],
    classAbilities: ['Backstab', 'Stealth', 'Poison Blade'],
    promotionRequirements: {
      level: 12,
      resources: { steel: 25, poison: 10 },
      equipment: ['Masterwork Dagger']
    }
  },

  [Archetype.BEAST_TAMER]: {
    name: 'Beast Tamer',
    description: 'Specialists in commanding beasts and creatures',
    baseStats: {
      hp: 35,
      str: 8,
      mag: 10,
      skl: 12,
      arm: 7,
      ldr: 20   // Very high leadership for beasts
    },
    statGrowth: {
      hp: 6,
      str: 2,
      mag: 2,
      skl: 3,
      arm: 1,
      ldr: 5    // Excellent LDR growth
    },
    weaponProficiencies: [
      WeaponType.STAFF,
      WeaponType.SPEAR,
      WeaponType.BOW
    ],
    classAbilities: ['Pack Leader', 'Beast Bond', 'Shared Resolve'],
    promotionRequirements: {
      level: 12,
      resources: { food: 50, mana_crystal: 10 },
      equipment: ['Beast Whistle']
    }
  },

  [Archetype.DWARVEN_ENGINEER]: {
    name: 'Dwarven Engineer',
    description: 'Master craftsmen and siege specialists',
    baseStats: {
      hp: 40,
      str: 12,
      mag: 8,
      skl: 15,  // High skill for crafting
      arm: 12,
      ldr: 10
    },
    statGrowth: {
      hp: 6,
      str: 2,
      mag: 2,
      skl: 3,   // Good SKL growth
      arm: 2,
      ldr: 2
    },
    weaponProficiencies: [
      WeaponType.HAMMER,
      WeaponType.AXE,
      WeaponType.CROSSBOW
    ],
    classAbilities: ['Craft Siege Equipment', 'Repair', 'Fortify'],
    promotionRequirements: {
      level: 14,
      resources: { steel: 40, stone: 30, tools: 1 },
      equipment: ['Master Tools']
    }
  }
};

/**
 * Get archetype data for a specific archetype
 */
export function getArchetypeData(archetype: Archetype): ArchetypeData {
  return ARCHETYPE_DATA[archetype];
}

/**
 * Get all available archetypes
 */
export function getAllArchetypes(): Archetype[] {
  return Object.values(Archetype);
}

/**
 * Get archetypes that can use a specific weapon type
 */
export function getArchetypesForWeapon(weaponType: WeaponType): Archetype[] {
  return getAllArchetypes().filter(archetype =>
    ARCHETYPE_DATA[archetype].weaponProficiencies.includes(weaponType)
  );
}

/**
 * Get archetypes with high leadership (good for squad leaders)
 */
export function getLeadershipArchetypes(minLeadership: number = 12): Archetype[] {
  return getAllArchetypes().filter(archetype =>
    ARCHETYPE_DATA[archetype].baseStats.ldr >= minLeadership
  );
}

/**
 * Get magic-focused archetypes
 */
export function getMagicArchetypes(minMagic: number = 12): Archetype[] {
  return getAllArchetypes().filter(archetype =>
    ARCHETYPE_DATA[archetype].baseStats.mag >= minMagic
  );
}

/**
 * Calculate total stat at a given level
 */
export function calculateStatAtLevel(
  archetype: Archetype,
  statName: keyof typeof ARCHETYPE_DATA[Archetype]['baseStats'],
  level: number
): number {
  const data = ARCHETYPE_DATA[archetype];
  const baseStat = data.baseStats[statName];
  const growth = data.statGrowth[statName];
  
  return baseStat + (growth * (level - 1));
}