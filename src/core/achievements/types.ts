/**
 * Achievement system types and interfaces
 */

import { UnitStats } from '../units/types'

/**
 * Achievement categories
 */
export enum AchievementCategory {
  COMBAT = 'combat',
  SUPPORT = 'support', 
  MASTERY = 'mastery',
  LEGENDARY = 'legendary',
  SPECIALIZED = 'specialized'
}

/**
 * Types of statistics that can be tracked for achievements
 */
export enum StatisticType {
  DAMAGE_TAKEN = 'damage_taken',
  DAMAGE_DEALT = 'damage_dealt',
  HEALING_DONE = 'healing_done',
  KILLS = 'kills',
  CRITICAL_HITS = 'critical_hits',
  BATTLES_WON = 'battles_won',
  BATTLES_SURVIVED = 'battles_survived',
  ATTACKS_DODGED = 'attacks_dodged',
  DAMAGE_BLOCKED = 'damage_blocked',
  UNITS_HEALED = 'units_healed',
  ALLIES_SAVED = 'allies_saved',
  BATTLES_LED = 'battles_led',
  UNITS_TRAINED = 'units_trained',
  WEAPONS_MASTERED = 'weapons_mastered',
  SPELLS_LEARNED = 'spells_learned',
  LOW_HP_SURVIVALS = 'low_hp_survivals',
  DRAGONS_KILLED = 'dragons_killed',
  BEASTS_FOUGHT_WITH = 'beasts_fought_with',
  EMBERS_EMBEDDED = 'embers_embedded',
  FORMATIONS_USED = 'formations_used',
  RARE_ITEMS_FOUND = 'rare_items_found',
  ATTACKS_MADE = 'attacks_made',
  HIGH_ACCURACY_ATTACKS = 'high_accuracy_attacks'
}

/**
 * Achievement requirement definition
 */
export interface AchievementRequirement {
  type: StatisticType
  target: number
  condition?: string // Additional conditions like "below_25_percent_hp"
}

/**
 * Achievement reward definition
 */
export interface AchievementReward {
  statBonuses?: Partial<UnitStats>
  specialAbility?: string
  title?: string
  description: string
  visualEffect?: string // For UI effects like auras
}

/**
 * Core achievement definition
 */
export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  requirement: AchievementRequirement
  reward: AchievementReward
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  isHidden?: boolean // Hidden until unlocked
  prerequisite?: string // Required achievement ID
}

/**
 * Unit's progress toward an achievement
 */
export interface AchievementProgress {
  achievementId: string
  progress: number
  isUnlocked: boolean
  unlockedAt?: Date
}

/**
 * Unit statistics tracking
 */
export interface UnitStatistics {
  // Combat stats
  totalDamageTaken: number
  totalDamageDealt: number
  totalHealingDone: number
  totalKills: number
  criticalHits: number
  attacksDodged: number
  damageBlocked: number
  attacksMade: number
  highAccuracyAttacks: number // Attacks with >90% hit chance that hit
  
  // Battle participation
  battlesWon: number
  battlesLost: number
  battlesSurvived: number
  battlesLed: number
  lowHpSurvivals: number // Times survived battle with <10% HP
  
  // Support stats
  unitsHealed: Set<string> // Unit IDs that have been healed
  alliesSaved: number // Times prevented ally death
  unitsTrainedToMax: number
  
  // Mastery stats
  weaponsMastered: Set<string> // Weapon types at max proficiency
  spellsLearned: Set<string> // Spell IDs learned
  
  // Specialized stats
  dragonsKilled: number
  beastsFoughtWith: Set<string> // Beast unit IDs fought alongside
  embersEmbedded: number
  formationsUsed: Map<string, number> // Formation type -> times used
  rareItemsFound: number
  
  // Tracking sets for unique counts
  enemyTypesKilled: Set<string>
  terrainTypesFoughtOn: Set<string>
  weaponTypesUsed: Set<string>
}

/**
 * Unit achievement data
 */
export interface UnitAchievements {
  unitId: string
  achievements: Map<string, AchievementProgress>
  statistics: UnitStatistics
  activeTitle?: string // Currently displayed title
  unlockedTitles: Set<string>
  
  // Calculated bonuses from achievements
  totalStatBonuses: Partial<UnitStats>
  specialAbilities: Set<string>
  visualEffects: Set<string>
}

/**
 * Achievement notification for UI
 */
export interface AchievementNotification {
  achievement: Achievement
  unitName: string
  unitId: string
  timestamp: Date
}

/**
 * Achievement filter options for UI
 */
export interface AchievementFilter {
  category?: AchievementCategory
  rarity?: string
  unlocked?: boolean
  showHidden?: boolean
}

/**
 * Achievement statistics summary
 */
export interface AchievementSummary {
  totalAchievements: number
  unlockedAchievements: number
  completionPercentage: number
  byCategory: Record<AchievementCategory, {
    total: number
    unlocked: number
  }>
  byRarity: Record<string, {
    total: number
    unlocked: number
  }>
}