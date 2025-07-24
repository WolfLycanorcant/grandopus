/**
 * Battle System - Core gameplay loop implementation
 */

export { BattleEngine } from './BattleEngine'
export { BattleManager } from './BattleManager'
export * from './types'
export * from './BattleCalculations'

// Re-export for convenience
export type {
  BattleResult,
  BattleTurn,
  CombatAction,
  DamageResult,
  StatusEffect,
  BattleConfiguration,
  CombatStats
} from './types'