/**
 * Skill system types and interfaces
 */

import { UnitStats } from '../units/types'
import { WeaponType, DamageType } from '../equipment/types'

/**
 * Skill tree categories
 */
export enum SkillTreeType {
  GENERAL = 'general',           // Universal skills for all units
  COMBAT = 'combat',             // Combat-focused skills
  MAGIC = 'magic',               // Magic and spellcasting skills
  TACTICS = 'tactics',           // Leadership and formation skills
  SURVIVAL = 'survival',         // Utility and survival skills
  WEAPON_MASTERY = 'weapon_mastery' // Weapon-specific skills
}

/**
 * Skill node types
 */
export enum SkillNodeType {
  STAT_BOOST = 'stat_boost',     // Permanent stat increases
  PASSIVE = 'passive',           // Passive abilities
  ACTIVE = 'active',             // Active abilities
  WEAPON_SKILL = 'weapon_skill', // Weapon-specific bonuses
  FORMATION = 'formation'        // Formation-based abilities
}

/**
 * Skill activation triggers
 */
export enum SkillTrigger {
  PASSIVE = 'passive',           // Always active
  ON_ATTACK = 'on_attack',       // When unit attacks
  ON_HIT = 'on_hit',             // When unit hits target
  ON_CRIT = 'on_crit',           // When unit scores critical hit
  ON_KILL = 'on_kill',           // When unit defeats enemy
  ON_DAMAGE_TAKEN = 'on_damage_taken', // When unit takes damage
  ON_LOW_HP = 'on_low_hp',       // When unit is below 50% HP
  BATTLE_START = 'battle_start', // At start of battle
  TURN_START = 'turn_start',     // At start of unit's turn
  MANUAL = 'manual'              // Player-activated
}

/**
 * Skill effect types
 */
export interface SkillEffect {
  type: 'stat_bonus' | 'damage_bonus' | 'heal' | 'status' | 'special'
  value?: number
  percentage?: number
  duration?: number // In turns, 0 = permanent
  target?: 'self' | 'enemy' | 'allies' | 'all'
  statType?: keyof UnitStats
  damageType?: DamageType
  weaponType?: WeaponType
  condition?: string // Special conditions
}

/**
 * Individual skill node definition
 */
export interface SkillNode {
  id: string
  name: string
  description: string
  flavorText?: string
  
  // Tree structure
  treeType: SkillTreeType
  nodeType: SkillNodeType
  tier: number // 1-5, higher tiers require more investment
  prerequisites: string[] // Required skill IDs
  
  // Costs and requirements
  jpCost: number // Job Points required to unlock
  levelRequirement: number
  statRequirements?: Partial<UnitStats>
  
  // Effects
  trigger: SkillTrigger
  effects: SkillEffect[]
  
  // Metadata
  maxRank: number // How many times can be learned (1 for most skills)
  isCapstone?: boolean // Major skill at end of tree branch
}

/**
 * Learned skill instance
 */
export interface LearnedSkill {
  skillId: string
  rank: number
  learnedAt: Date
}

/**
 * Skill tree progress for a unit
 */
export interface SkillTreeProgress {
  unitId: string
  learnedSkills: Map<string, LearnedSkill>
  availableJP: number
  totalJPSpent: number
  
  // Tree-specific progress
  generalTreeProgress: number
  combatTreeProgress: number
  magicTreeProgress: number
  tacticsTreeProgress: number
  survivalTreeProgress: number
  weaponMasteryProgress: number
}

/**
 * Skill tree definition
 */
export interface SkillTree {
  type: SkillTreeType
  name: string
  description: string
  nodes: SkillNode[]
  maxTier: number
}

/**
 * Active skill cooldown
 */
export interface SkillCooldown {
  skillId: string
  remainingTurns: number
  maxCooldown: number
}

/**
 * Skill activation context
 */
export interface SkillContext {
  caster: any // Unit who has the skill
  target?: any // Target unit (if applicable)
  battle?: any // Battle context
  damage?: number // Damage dealt/taken
  isCritical?: boolean
  weaponType?: WeaponType
}

/**
 * Skill activation result
 */
export interface SkillActivationResult {
  success: boolean
  effects: Array<{
    type: string
    value: number
    target: string
    description: string
  }>
  message?: string
  cooldownTurns?: number
}