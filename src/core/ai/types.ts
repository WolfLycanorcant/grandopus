/**
 * AI system types for faction behavior and decision making
 */

import { HexCoordinate, Faction, BuildingType, ResourceType } from '../overworld/types'
import { Squad } from '../squads'

/**
 * AI personality types that influence decision making
 */
export enum AIPersonality {
  AGGRESSIVE = 'aggressive',     // Prioritizes combat and expansion
  DEFENSIVE = 'defensive',       // Focuses on fortification and protection
  ECONOMIC = 'economic',         // Emphasizes resource generation and trade
  BALANCED = 'balanced',         // Mixed strategy approach
  OPPORTUNISTIC = 'opportunistic' // Adapts based on current situation
}

/**
 * AI difficulty levels
 */
export enum AIDifficulty {
  EASY = 'easy',       // Basic AI with simple decisions
  NORMAL = 'normal',   // Standard AI with tactical awareness
  HARD = 'hard',       // Advanced AI with strategic planning
  EXPERT = 'expert'    // Master AI with complex decision trees
}

/**
 * AI decision types
 */
export enum AIDecisionType {
  BUILD_STRUCTURE = 'build_structure',
  RECRUIT_UNITS = 'recruit_units',
  MOVE_ARMY = 'move_army',
  ATTACK_TARGET = 'attack_target',
  DEFEND_POSITION = 'defend_position',
  EXPAND_TERRITORY = 'expand_territory',
  GATHER_RESOURCES = 'gather_resources',
  UPGRADE_BUILDING = 'upgrade_building',
  FORM_ALLIANCE = 'form_alliance',
  END_TURN = 'end_turn'
}

/**
 * AI decision with priority and reasoning
 */
export interface AIDecision {
  type: AIDecisionType
  priority: number // 0-100, higher = more important
  target?: HexCoordinate
  buildingType?: BuildingType
  armyId?: string
  reasoning: string
  expectedOutcome: string
  resourceCost?: Partial<Record<ResourceType, number>>
  turnDelay?: number // How many turns to wait before executing
}

/**
 * AI faction state and memory
 */
export interface AIFactionState {
  faction: Faction
  personality: AIPersonality
  difficulty: AIDifficulty
  
  // Strategic memory
  knownEnemyPositions: Map<string, { coordinate: HexCoordinate; lastSeen: number; strength: number }>
  threatAssessment: Map<Faction, number> // 0-100 threat level
  territoryValue: Map<string, number> // Hex coordinate -> strategic value
  
  // Resource management
  resourcePriorities: Record<ResourceType, number> // 0-100 priority
  buildingQueue: Array<{ coordinate: HexCoordinate; buildingType: BuildingType; priority: number }>
  
  // Military planning
  armyObjectives: Map<string, { objective: string; target?: HexCoordinate; priority: number }>
  defensivePositions: HexCoordinate[]
  expansionTargets: HexCoordinate[]
  
  // Diplomatic state
  relations: Map<Faction, number> // -100 to 100, negative = hostile
  tradeAgreements: Map<Faction, { resources: ResourceType[]; duration: number }>
  
  // Turn planning
  currentTurnPlan: AIDecision[]
  longTermGoals: Array<{ goal: string; priority: number; deadline?: number }>
}

/**
 * AI evaluation criteria for different decisions
 */
export interface AIEvaluationCriteria {
  // Military factors
  militaryStrength: number
  enemyThreat: number
  defensivePosition: number
  
  // Economic factors
  resourceIncome: number
  resourceReserves: number
  economicGrowth: number
  
  // Strategic factors
  territoryControl: number
  strategicPositions: number
  diplomaticSituation: number
  
  // Situational factors
  timeUrgency: number
  opportunityWindow: number
  riskAssessment: number
}

/**
 * AI behavior configuration
 */
export interface AIBehaviorConfig {
  personality: AIPersonality
  difficulty: AIDifficulty
  
  // Decision weights (0-1)
  aggressionWeight: number
  economicWeight: number
  defensiveWeight: number
  expansionWeight: number
  
  // Thresholds
  attackThreshold: number // Minimum advantage needed to attack
  retreatThreshold: number // Health percentage to retreat
  buildingPriorityThreshold: number
  
  // Timing
  planningHorizon: number // How many turns to plan ahead
  reactionTime: number // Turns to respond to threats
  
  // Risk tolerance
  riskTolerance: number // 0-1, higher = more willing to take risks
  conservatism: number // 0-1, higher = more cautious
}

/**
 * AI action result
 */
export interface AIActionResult {
  success: boolean
  action: AIDecision
  actualOutcome: string
  resourcesSpent?: Partial<Record<ResourceType, number>>
  newThreats?: HexCoordinate[]
  strategicValue?: number
  message: string
}

/**
 * AI faction intelligence report
 */
export interface AIIntelligenceReport {
  faction: Faction
  turn: number
  
  // Military assessment
  totalArmies: number
  estimatedStrength: number
  armyPositions: Array<{ coordinate: HexCoordinate; strength: number; movement: number }>
  
  // Economic assessment
  estimatedResources: Partial<Record<ResourceType, number>>
  resourceIncome: Partial<Record<ResourceType, number>>
  buildingCount: Record<BuildingType, number>
  
  // Strategic assessment
  territorySize: number
  strategicBuildings: Array<{ coordinate: HexCoordinate; type: BuildingType; level: number }>
  defensiveStrength: number
  expansionPotential: number
  
  // Threat analysis
  immediateThreats: HexCoordinate[]
  vulnerablePositions: HexCoordinate[]
  likelyNextMoves: AIDecision[]
  
  // Diplomatic status
  hostilityLevel: number // 0-100
  tradeValue: number
  alliancePotential: number
}

/**
 * AI event types for reactive behavior
 */
export enum AIEventType {
  ENEMY_ARMY_SPOTTED = 'enemy_army_spotted',
  TERRITORY_ATTACKED = 'territory_attacked',
  BUILDING_DESTROYED = 'building_destroyed',
  RESOURCE_SHORTAGE = 'resource_shortage',
  ALLY_REQUEST = 'ally_request',
  TRADE_OPPORTUNITY = 'trade_opportunity',
  STRATEGIC_POSITION_AVAILABLE = 'strategic_position_available',
  ENEMY_WEAKNESS_DETECTED = 'enemy_weakness_detected'
}

/**
 * AI event for reactive decision making
 */
export interface AIEvent {
  type: AIEventType
  turn: number
  location?: HexCoordinate
  faction?: Faction
  severity: number // 0-100
  data: any
  expiresAt?: number // Turn when event becomes irrelevant
}