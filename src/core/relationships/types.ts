/**
 * Unit relationship and affinity system types
 */

import { UnitStats } from '../units/types'

/**
 * Types of relationships between units
 */
export enum RelationshipType {
  NEUTRAL = 'neutral',
  FRIENDLY = 'friendly',
  CLOSE_FRIENDS = 'close_friends',
  BROTHERS_IN_ARMS = 'brothers_in_arms',
  RIVALS = 'rivals',
  BITTER_RIVALS = 'bitter_rivals',
  ROMANTIC = 'romantic',
  MENTOR_STUDENT = 'mentor_student',
  FAMILY = 'family'
}

/**
 * How relationships are formed
 */
export enum AffinitySource {
  BATTLE_TOGETHER = 'battle_together',
  HEALING_RECEIVED = 'healing_received',
  LIFE_SAVED = 'life_saved',
  SHARED_VICTORY = 'shared_victory',
  TRAINING_TOGETHER = 'training_together',
  RACIAL_AFFINITY = 'racial_affinity',
  CLASS_SYNERGY = 'class_synergy',
  EQUIPMENT_SHARING = 'equipment_sharing',
  FORMATION_SYNERGY = 'formation_synergy',
  PERSONALITY_CLASH = 'personality_clash', // Negative
  COMPETITION = 'competition', // Can be positive or negative
  BETRAYAL = 'betrayal', // Negative
  SACRIFICE = 'sacrifice' // Positive
}

/**
 * Relationship bonuses that apply in combat
 */
export interface RelationshipBonus {
  name: string
  description: string
  
  // Stat bonuses when units are near each other
  statBonuses?: Partial<UnitStats>
  
  // Combat bonuses
  damageBonus?: number // % bonus to damage
  accuracyBonus?: number // % bonus to hit chance
  criticalBonus?: number // % bonus to critical hit chance
  evasionBonus?: number // % bonus to dodge chance
  
  // Special abilities
  specialAbilities?: RelationshipAbility[]
  
  // Conditions for activation
  maxDistance?: number // Max tiles apart for bonus to apply
  requiresBothUnits?: boolean // Both units must be alive
  activatesOnLowHp?: boolean // Bonus when either unit is low HP
}

/**
 * Special abilities granted by relationships
 */
export interface RelationshipAbility {
  id: string
  name: string
  description: string
  trigger: 'passive' | 'on_damage' | 'on_low_hp' | 'on_ally_death' | 'manual'
  effect: {
    type: 'heal' | 'damage_boost' | 'protect' | 'revive' | 'enrage' | 'inspire'
    value?: number
    duration?: number // In turns
    target: 'self' | 'ally' | 'both' | 'squad'
  }
  cooldown?: number // Turns between uses
  usesPerBattle?: number // Limited uses per battle
}

/**
 * Individual relationship between two units
 */
export interface UnitRelationship {
  unitId1: string
  unitId2: string
  
  // Relationship strength (-100 to +100)
  affinityPoints: number
  relationshipType: RelationshipType
  
  // History of interactions
  interactionHistory: AffinityInteraction[]
  
  // Relationship formed date
  formedAt: Date
  lastInteraction: Date
  
  // Relationship-specific data
  battlesTogther: number
  timesHealed: number
  timesSaved: number
  sharedVictories: number
  
  // Special relationship flags
  isLocked?: boolean // Prevents relationship from changing (story relationships)
  isHidden?: boolean // Hidden from UI (secret relationships)
  customName?: string // Player-given relationship name
}

/**
 * Record of an interaction that affects affinity
 */
export interface AffinityInteraction {
  source: AffinitySource
  affinityChange: number
  timestamp: Date
  battleId?: string
  description: string
  
  // Context data
  contextData?: {
    damageHealed?: number
    enemiesDefeated?: number
    formationType?: string
    equipmentShared?: string
  }
}

/**
 * Relationship configuration for different types
 */
export interface RelationshipConfig {
  type: RelationshipType
  name: string
  description: string
  
  // Affinity thresholds
  minAffinity: number
  maxAffinity: number
  
  // Bonuses granted by this relationship
  bonuses: RelationshipBonus
  
  // Visual representation
  color: string
  icon: string
  
  // Rarity and special properties
  isRare?: boolean
  requiresSpecialCondition?: string
}

/**
 * Unit's complete relationship data
 */
export interface UnitRelationships {
  unitId: string
  relationships: Map<string, UnitRelationship>
  
  // Relationship statistics
  totalFriends: number
  totalRivals: number
  strongestBond?: string // Unit ID of strongest positive relationship
  biggestRival?: string // Unit ID of strongest negative relationship
  
  // Personality traits that affect relationship formation
  personalityTraits: PersonalityTrait[]
  
  // Active relationship bonuses in current battle
  activeBonuses: Map<string, RelationshipBonus>
}

/**
 * Personality traits that affect how relationships form
 */
export interface PersonalityTrait {
  id: string
  name: string
  description: string
  
  // How this trait affects relationship formation
  affinityModifiers: {
    [source in AffinitySource]?: number // Multiplier for affinity gain/loss
  }
  
  // Special relationship rules
  specialRules?: {
    fasterBonding?: boolean // Forms relationships quicker
    slowerBonding?: boolean // Forms relationships slower
    loyalFriend?: boolean // Positive relationships decay slower
    holdGrudges?: boolean // Negative relationships decay slower
    loner?: boolean // Harder to form any relationships
    charismatic?: boolean // Easier to form positive relationships
  }
}

/**
 * Squad relationship dynamics
 */
export interface SquadRelationships {
  squadId: string
  
  // Overall squad cohesion (0-100)
  cohesion: number
  
  // Relationship network analysis
  friendshipGroups: string[][] // Groups of units with strong positive relationships
  rivalryPairs: string[][] // Pairs of units with negative relationships
  
  // Squad-wide bonuses from relationships
  squadBonuses: {
    moraleBonus: number // % bonus to all stats from high cohesion
    formationBonus: number // % bonus to formation effectiveness
    experienceBonus: number // % bonus to experience gain
  }
  
  // Relationship events
  recentEvents: RelationshipEvent[]
}

/**
 * Events that can occur based on relationships
 */
export interface RelationshipEvent {
  id: string
  type: 'friendship_formed' | 'rivalry_developed' | 'bond_strengthened' | 'conflict_resolved'
  involvedUnits: string[]
  description: string
  timestamp: Date
  
  // Effects of the event
  effects: {
    affinityChanges?: Array<{
      unitId1: string
      unitId2: string
      change: number
    }>
    squadBonuses?: Partial<UnitStats>
    specialAbilities?: string[]
  }
}

/**
 * Relationship formation rules
 */
export interface RelationshipFormationRule {
  id: string
  name: string
  description: string
  
  // Conditions for this rule to apply
  conditions: {
    raceCompatibility?: { [race: string]: number } // Bonus/penalty for race combinations
    classCompatibility?: { [archetype: string]: number } // Bonus/penalty for class combinations
    personalityCompatibility?: { [trait: string]: number } // Personality trait interactions
    levelDifference?: { max: number; penalty: number } // Penalty for large level gaps
  }
  
  // Affinity modifiers when this rule applies
  affinityModifier: number
}

/**
 * Relationship notification for UI
 */
export interface RelationshipNotification {
  type: 'relationship_formed' | 'relationship_changed' | 'bonus_activated' | 'ability_unlocked'
  unitId1: string
  unitId2: string
  unitName1: string
  unitName2: string
  oldRelationship?: RelationshipType
  newRelationship: RelationshipType
  description: string
  timestamp: Date
}

/**
 * Relationship filter for UI
 */
export interface RelationshipFilter {
  relationshipType?: RelationshipType
  minAffinity?: number
  maxAffinity?: number
  showHidden?: boolean
  sortBy?: 'affinity' | 'type' | 'recent' | 'battles_together'
}