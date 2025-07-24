/**
 * Core type definitions for the unit system
 */

import { WeaponType, DamageType } from '../equipment';

/**
 * Base unit statistics
 */
export interface UnitStats {
  hp: number;      // Health Points
  str: number;     // Strength (physical damage/resistance)
  mag: number;     // Magic (magic damage/resistance)
  skl: number;     // Skill (hit chance, dodge, crits)
  arm: number;     // Armor (physical damage reduction)
  ldr: number;     // Leadership (squad capacity + buffs)
}

/**
 * Available races in the game
 */
export enum Race {
  HUMAN = 'human',
  ELF = 'elf',
  DWARF = 'dwarf',
  ORC = 'orc',
  GOBLIN = 'goblin',
  ANGEL = 'angel',
  DEMON = 'demon',
  BEAST = 'beast',
  DRAGON = 'dragon',
  GRIFFON = 'griffon'
}

/**
 * Unit archetypes/classes
 */
export enum Archetype {
  HEAVY_INFANTRY = 'heavy_infantry',
  LIGHT_INFANTRY = 'light_infantry',
  ARCHER = 'archer',
  MAGE = 'mage',
  CLERIC = 'cleric',
  KNIGHT = 'knight',
  ROGUE = 'rogue',
  BEAST_TAMER = 'beast_tamer',
  DWARVEN_ENGINEER = 'dwarven_engineer'
}

// WeaponType and DamageType are imported from equipment system above

/**
 * Equipment slot types
 */
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

/**
 * Unit slot cost (for squad capacity)
 */
export interface SlotCost {
  slots: number;
  reason?: string;
}

/**
 * Race-specific traits and bonuses
 */
export interface RacialTraits {
  name: string;
  description: string;
  statModifiers: Partial<UnitStats>;
  slotCost: SlotCost;
  specialAbilities: string[];
  resistances?: DamageType[];
  immunities?: DamageType[];
  weaknesses?: DamageType[];
}

/**
 * Archetype-specific growth and abilities
 */
export interface ArchetypeData {
  name: string;
  description: string;
  statGrowth: UnitStats;  // Growth per level
  baseStats: UnitStats;   // Starting stats
  weaponProficiencies: WeaponType[];
  classAbilities: string[];
  promotionRequirements?: {
    level: number;
    resources: Record<string, number>;
    equipment?: string[];
  };
}

/**
 * Weapon proficiency data
 */
export interface WeaponProficiency {
  weaponType: WeaponType;
  level: number;        // 0-100
  experience: number;   // XP towards next level
}

/**
 * Unit formation position
 */
export enum FormationPosition {
  FRONT_LEFT = 'front_left',
  FRONT_CENTER = 'front_center',
  FRONT_RIGHT = 'front_right',
  BACK_LEFT = 'back_left',
  BACK_CENTER = 'back_center',
  BACK_RIGHT = 'back_right'
}

/**
 * Unit status effects
 */
export enum StatusEffect {
  POISONED = 'poisoned',
  BLESSED = 'blessed',
  CURSED = 'cursed',
  ENRAGED = 'enraged',
  STUNNED = 'stunned',
  REGENERATING = 'regenerating'
}

/**
 * Unit experience and leveling
 */
export interface UnitExperience {
  currentLevel: number;
  currentExp: number;
  expToNextLevel: number;
  jobPoints: number;
}