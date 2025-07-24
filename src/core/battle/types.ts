/**
 * Battle system type definitions
 */

import { Unit } from '../units';
import { Squad } from '../squads';
import { DamageType, WeaponType } from '../units/types';

/**
 * Battle phases in Ogre Battle style combat
 */
export enum BattlePhase {
  SETUP = 'setup',           // Pre-battle setup
  INITIATIVE = 'initiative', // Calculate turn order
  ATTACK = 'attack',         // Attacking squad's turn
  COUNTER = 'counter',       // Defending squad's counter-attack
  RESOLUTION = 'resolution', // Battle end and cleanup
  COMPLETE = 'complete'      // Battle finished
}

/**
 * Battle state tracking
 */
export interface BattleState {
  id: string;
  phase: BattlePhase;
  currentRound: number;
  maxRounds: number;
  attackingSquad: Squad;
  defendingSquad: Squad;
  winner?: Squad;
  battleLog: BattleLogEntry[];
  isComplete: boolean;
}

/**
 * Battle log entry for tracking what happened
 */
export interface BattleLogEntry {
  round: number;
  phase: BattlePhase;
  timestamp: Date;
  type: 'attack' | 'damage' | 'heal' | 'status' | 'ability' | 'formation' | 'info';
  attacker?: Unit;
  target?: Unit;
  damage?: number;
  healing?: number;
  message: string;
  details?: Record<string, any>;
}

/**
 * Combat action that a unit can perform
 */
export interface CombatAction {
  id: string;
  name: string;
  type: 'attack' | 'ability' | 'item';
  performer: Unit;
  targets: Unit[];
  damageType?: DamageType;
  weaponType?: WeaponType;
  baseDamage?: number;
  accuracy?: number;
  effects?: CombatEffect[];
}

/**
 * Effects that can be applied during combat
 */
export interface CombatEffect {
  type: 'damage' | 'heal' | 'status' | 'stat_modifier';
  value: number;
  duration?: number;
  target: 'self' | 'target' | 'all_allies' | 'all_enemies';
  description: string;
}

/**
 * Damage calculation result
 */
export interface DamageResult {
  baseDamage: number;
  finalDamage: number;
  damageType: DamageType;
  isCritical: boolean;
  isBlocked: boolean;
  resistanceApplied: number;
  modifiers: DamageModifier[];
}

/**
 * Damage calculation modifiers
 */
export interface DamageModifier {
  source: string;
  type: 'weapon_proficiency' | 'weapon_bonus' | 'stat_bonus' | 'formation_bonus' | 'racial_trait' | 'artifact' | 'resistance' | 'critical_hit' | 'equipment_bonus';
  value: number;
  description: string;
}

/**
 * Initiative calculation for turn order
 */
export interface InitiativeResult {
  unit: Unit;
  initiative: number;
  modifiers: InitiativeModifier[];
}

/**
 * Initiative modifiers
 */
export interface InitiativeModifier {
  source: string;
  value: number;
  description: string;
}

/**
 * Formation bonuses applied during combat
 */
export interface FormationCombatBonus {
  unit: Unit;
  position: 'front' | 'back';
  bonuses: {
    armorBonus?: number;
    physicalDamageBonus?: number;
    rangedDamageBonus?: number;
    physicalDamageReduction?: number;
  };
}

/**
 * Battle configuration options
 */
export interface BattleConfig {
  maxRounds: number;
  allowRetreat: boolean;
  terrainEffects?: TerrainEffect[];
  weatherEffects?: WeatherEffect[];
  ambushModifier?: number;
}

/**
 * Terrain effects on battle
 */
export interface TerrainEffect {
  type: string;
  name: string;
  effects: {
    movementPenalty?: number;
    damageBonusType?: DamageType;
    damageBonus?: number;
    evasionBonus?: number;
    other?: string;
  };
}

/**
 * Weather effects on battle
 */
export interface WeatherEffect {
  type: string;
  name: string;
  effects: {
    accuracyModifier?: number;
    damageTypeBonus?: Record<DamageType, number>;
    visibilityReduction?: boolean;
  };
}

/**
 * Battle victory conditions
 */
export enum VictoryCondition {
  ELIMINATION = 'elimination',     // All enemy units defeated
  RETREAT = 'retreat',            // Enemy squad retreats
  TIMEOUT = 'timeout',            // Battle time limit reached
  OBJECTIVE = 'objective'         // Special objective completed
}

/**
 * Battle result summary
 */
export interface BattleResult {
  winner: Squad;
  loser: Squad;
  victoryCondition: VictoryCondition;
  rounds: number;
  casualties: {
    winner: Unit[];
    loser: Unit[];
  };
  experience: {
    winner: number;
    loser: number;
  };
  loot?: BattleLoot;
  statistics: BattleStatistics;
}

/**
 * Loot gained from battle
 */
export interface BattleLoot {
  resources: Record<string, number>;
  equipment?: any[];
  artifacts?: any[];
}

/**
 * Battle statistics for analysis
 */
export interface BattleStatistics {
  totalDamageDealt: Record<string, number>;  // unitId -> damage
  totalDamageTaken: Record<string, number>;  // unitId -> damage
  totalHealing: Record<string, number>;      // unitId -> healing
  criticalHits: Record<string, number>;      // unitId -> crits
  accuracyRate: Record<string, number>;      // unitId -> hit rate
  abilitiesUsed: Record<string, string[]>;   // unitId -> abilities
}