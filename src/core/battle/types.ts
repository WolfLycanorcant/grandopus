import { Unit } from '../units'
import { Squad } from '../squads'

/**
 * Battle system types and interfaces
 */

export enum BattlePhase {
  INITIATIVE = 'initiative',
  COMBAT = 'combat',
  RESOLUTION = 'resolution'
}

export interface BattleState {
  id: string
  attackingSquad: Squad
  defendingSquad: Squad
  currentPhase: BattlePhase
  currentTurn: number
  turnOrder: Unit[]
  activeUnitIndex: number
  isComplete: boolean
  winner: Squad | null
  battleLog: string[]
}

export interface BattleResult {
  winner: Squad
  loser: Squad
  turnsElapsed: number
  battleLog: string[]
  casualties: {
    attacking: Unit[]
    defending: Unit[]
  }
  experienceGained: number
}

export interface BattleTurn {
  turnNumber: number
  activeUnit: Unit
  action: CombatAction
  result: DamageResult | null
  battleState: any // Snapshot of battle state
}

export interface CombatAction {
  type: 'attack' | 'cast_spell' | 'use_item' | 'move' | 'wait'
  actor: Unit
  target?: Unit
  weapon?: any
  spell?: any
  item?: any
  position?: { x: number; y: number }
}

export interface DamageResult {
  baseDamage: number
  totalDamage: number
  actualDamage: number
  damageType: 'physical' | 'magical' | 'elemental'
  isCritical: boolean
  targetDefeated: boolean
  statusEffects?: StatusEffect[]
}

export interface StatusEffect {
  id: string
  name: string
  type: 'buff' | 'debuff' | 'dot' | 'hot'
  duration: number
  effect: {
    stat?: string
    modifier?: number
    damagePerTurn?: number
    healPerTurn?: number
  }
}

export interface BattleConfiguration {
  environment: 'plains' | 'forest' | 'desert' | 'snow' | 'volcanic'
  weather: 'clear' | 'rain' | 'snow' | 'fog'
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
  terrainEffects: TerrainEffect[]
}

export interface TerrainEffect {
  name: string
  description: string
  effects: {
    movementCost?: number
    damageModifier?: number
    accuracyModifier?: number
    coverBonus?: number
  }
}

export interface CombatStats {
  accuracy: number
  evasion: number
  criticalChance: number
  criticalMultiplier: number
  armor: number
  magicResistance: number
  statusResistance: number
}

export interface WeaponData {
  id: string
  name: string
  type: 'sword' | 'axe' | 'bow' | 'staff' | 'dagger' | 'spear'
  baseDamage: number
  damageType: 'physical' | 'magical'
  accuracy: number
  criticalChance: number
  range: number
  specialEffects?: string[]
}

export interface SpellData {
  id: string
  name: string
  school: 'fire' | 'ice' | 'lightning' | 'earth' | 'holy' | 'dark'
  manaCost: number
  baseDamage: number
  range: number
  areaOfEffect: number
  castTime: number
  cooldown: number
  statusEffects?: StatusEffect[]
}

export interface BattleEvent {
  type: 'unit_death' | 'critical_hit' | 'spell_cast' | 'status_applied' | 'battle_end'
  timestamp: number
  data: any
}

export interface FormationBonus {
  name: string
  description: string
  conditions: string[]
  effects: {
    damageBonus?: number
    defenseBonus?: number
    accuracyBonus?: number
    initiativeBonus?: number
  }
}

export interface CombatModifier {
  id: string
  name: string
  source: 'formation' | 'equipment' | 'spell' | 'terrain' | 'weather'
  duration: number
  effects: {
    statModifiers?: Record<string, number>
    damageModifiers?: Record<string, number>
    specialEffects?: string[]
  }
}

export interface BattleCallbacks {
  onBattleStart?: (battle: BattleState) => void
  onTurnExecuted?: (turn: BattleTurn) => void
  onBattleEnd?: (result: BattleResult) => void
  onUnitDefeated?: (unit: Unit) => void
  onCriticalHit?: (attacker: Unit, target: Unit, damage: number) => void
}