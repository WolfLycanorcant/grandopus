/**
 * Squad system type definitions
 */

import { Unit } from '../units';
import { FormationPosition } from '../units/types';

/**
 * Squad formation layout
 * Represents a 3x2 grid (front row and back row)
 */
export interface SquadFormation {
  frontLeft?: Unit;
  frontCenter?: Unit;
  frontRight?: Unit;
  backLeft?: Unit;
  backCenter?: Unit;
  backRight?: Unit;
}

/**
 * Formation bonuses applied to units based on position
 */
export interface FormationBonuses {
  frontRow: {
    armorBonus: number;      // +10% armor
    physicalDamageBonus: number; // +5% physical damage
  };
  backRow: {
    rangedDamageBonus: number;   // +15% ranged/magic damage
    physicalDamageReduction: number; // -10% physical damage taken
  };
}

/**
 * Squad capacity calculation factors
 */
export interface SquadCapacity {
  baseCapacity: number;        // Base squad size (3-9 based on game progress)
  leadershipBonus: number;     // Additional slots from leader's LDR stat
  maxCapacity: number;         // Hard cap (12 units)
  currentUsedSlots: number;    // Current slots occupied
  availableSlots: number;      // Remaining slots
}

/**
 * Squad statistics and combat effectiveness
 */
export interface SquadStats {
  totalHp: number;
  averageLevel: number;
  totalSlots: number;
  frontRowCount: number;
  backRowCount: number;
  leadershipValue: number;
  combatPower: number;         // Calculated combat effectiveness
}

/**
 * Squad artifacts (max 3 per squad)
 */
export interface SquadArtifact {
  id: string;
  name: string;
  description: string;
  effects: ArtifactEffect[];
  requiredLeadership?: number;
}

/**
 * Artifact effects that apply to the entire squad
 */
export interface ArtifactEffect {
  type: 'stat_bonus' | 'damage_bonus' | 'resistance' | 'special_ability';
  target: 'all' | 'front_row' | 'back_row' | 'leader';
  value: number;
  description: string;
}

/**
 * Squad drilling and training bonuses
 */
export interface SquadDrill {
  id: string;
  name: string;
  description: string;
  requirements: {
    minLevel: number;
    trainingTime: number;      // Time investment required
    cost?: Record<string, number>; // Resource cost
  };
  effects: DrillEffect[];
}

/**
 * Drill effects that improve squad performance
 */
export interface DrillEffect {
  type: 'formation_bonus' | 'combat_bonus' | 'special_ability';
  description: string;
  value: number;
}

/**
 * Squad combat state during battles
 */
export interface SquadCombatState {
  isInCombat: boolean;
  currentInitiative: number;
  hasActed: boolean;
  combatModifiers: CombatModifier[];
}

/**
 * Temporary combat modifiers
 */
export interface CombatModifier {
  type: string;
  value: number;
  duration: number;
  source: string;
}

/**
 * Squad movement and positioning on strategic map
 */
export interface SquadPosition {
  x: number;
  y: number;
  facing: 'north' | 'south' | 'east' | 'west';
  movementPoints: number;
  maxMovementPoints: number;
}

/**
 * Squad experience and progression
 */
export interface SquadExperience {
  battlesWon: number;
  battlesLost: number;
  totalBattles: number;
  squadCohesion: number;       // 0-100, affects performance bonuses
  veteranBonus: number;        // Bonus from experience
}