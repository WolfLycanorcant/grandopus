import { Race, RacialTraits } from './types';
import { DamageType } from '../equipment';

/**
 * Racial trait definitions based on design document
 */
export const RACE_DATA: Record<Race, RacialTraits> = {
  [Race.HUMAN]: {
    name: 'Human',
    description: 'Balanced and adaptable with no penalties',
    statModifiers: {},
    slotCost: { slots: 1 },
    specialAbilities: []
  },

  [Race.ELF]: {
    name: 'Elf',
    description: 'Magical and agile forest dwellers',
    statModifiers: {
      mag: 15,  // +15% magic damage
      skl: 10   // +10% evasion
    },
    slotCost: { slots: 1 },
    specialAbilities: ['Forest Stride'], // Ignores forest terrain
    resistances: []
  },

  [Race.DWARF]: {
    name: 'Dwarf',
    description: 'Hardy mountain folk with superior craftsmanship',
    statModifiers: {
      arm: 20   // +20% armor
    },
    slotCost: { slots: 1 },
    specialAbilities: ['Stonecunning'], // Ignores building terrain
    resistances: []
  },

  [Race.ORC]: {
    name: 'Orc',
    description: 'Savage warriors with raw physical power',
    statModifiers: {
      str: 10,  // +10% physical damage
      arm: -10  // -10% armor
    },
    slotCost: { slots: 1 },
    specialAbilities: [],
    resistances: []
  },

  [Race.GOBLIN]: {
    name: 'Goblin',
    description: 'Cunning and quick but fragile',
    statModifiers: {
      str: 10,  // +10% physical damage
      arm: -10  // -10% armor
    },
    slotCost: { slots: 1 },
    specialAbilities: [],
    resistances: []
  },

  [Race.ANGEL]: {
    name: 'Angel',
    description: 'Divine beings with holy powers',
    statModifiers: {
      mag: 15   // +15% magic resistance (applied as MAG bonus)
    },
    slotCost: { slots: 1 },
    specialAbilities: ['Aura of Light'], // Heal 5% HP/turn to allies
    resistances: [DamageType.HOLY],
    immunities: []
  },

  [Race.DEMON]: {
    name: 'Demon',
    description: 'Infernal creatures with fire mastery',
    statModifiers: {},
    slotCost: { slots: 1 },
    specialAbilities: ['Infernal Aura'], // 5% damage/turn to adjacent enemies
    resistances: [],
    immunities: [DamageType.FIRE]
  },

  [Race.BEAST]: {
    name: 'Beast',
    description: 'Powerful creatures with primal instincts',
    statModifiers: {
      hp: 25,   // High HP
      str: 20   // High STR
    },
    slotCost: {
      slots: 2,
      reason: 'Large creature takes 2 squad slots'
    },
    specialAbilities: ['Primal Fury'], // +20% crit below 50% HP
    resistances: []
  },

  [Race.DRAGON]: {
    name: 'Dragon',
    description: 'Ancient wyrms with devastating breath attacks',
    statModifiers: {
      hp: 40,   // Very high HP
      str: 30,  // Very high STR
      mag: 25   // High MAG for breath weapons
    },
    slotCost: {
      slots: 2,
      reason: 'Massive creature takes 2 squad slots'
    },
    specialAbilities: ['Flight', 'Dragonfire'], // AoE fire damage
    resistances: [DamageType.FIRE],
    immunities: []
  },

  [Race.GRIFFON]: {
    name: 'Griffon',
    description: 'Majestic flying mounts with keen senses',
    statModifiers: {
      skl: 20   // +30% movement speed (represented as SKL bonus)
    },
    slotCost: {
      slots: 2,
      reason: 'Flying mount takes 2 squad slots'
    },
    specialAbilities: ['Flight'],
    resistances: []
  }
};

/**
 * Get racial traits for a specific race
 */
export function getRacialTraits(race: Race): RacialTraits {
  return RACE_DATA[race];
}

/**
 * Get all available races
 */
export function getAllRaces(): Race[] {
  return Object.values(Race);
}

/**
 * Check if a race is a large creature (takes 2 slots)
 */
export function isLargeCreature(race: Race): boolean {
  return RACE_DATA[race].slotCost.slots > 1;
}

/**
 * Get races that have specific abilities
 */
export function getRacesWithAbility(ability: string): Race[] {
  return getAllRaces().filter(race =>
    RACE_DATA[race].specialAbilities.includes(ability)
  );
}

/**
 * Get races immune to specific damage type
 */
export function getRacesImmuneToType(damageType: DamageType): Race[] {
  return getAllRaces().filter(race =>
    RACE_DATA[race].immunities?.includes(damageType) || false
  );
}

/**
 * Get races resistant to specific damage type
 */
export function getRacesResistantToType(damageType: DamageType): Race[] {
  return getAllRaces().filter(race =>
    RACE_DATA[race].resistances?.includes(damageType) || false
  );
}