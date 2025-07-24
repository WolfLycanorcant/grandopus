/**
 * Strategic overworld system types
 */

import { Squad } from '../squads'

/**
 * Hex coordinate system (axial coordinates)
 */
export interface HexCoordinate {
  q: number // column
  r: number // row
}

/**
 * Terrain types that affect movement and combat
 */
export enum TerrainType {
  PLAINS = 'plains',
  FOREST = 'forest',
  HILLS = 'hills',
  MOUNTAINS = 'mountains',
  RIVER = 'river',
  SWAMP = 'swamp',
  DESERT = 'desert',
  SNOW = 'snow'
}

/**
 * Building types that can be constructed
 */
export enum BuildingType {
  SETTLEMENT = 'settlement',
  CASTLE = 'castle',
  CHURCH = 'church',
  FARM = 'farm',
  BLACKSMITH = 'blacksmith',
  OUTPOST = 'outpost',
  TOWER = 'tower',
  MINE = 'mine',
  LUMBER_MILL = 'lumber_mill'
}

/**
 * Resource types
 */
export enum ResourceType {
  GOLD = 'gold',
  STEEL = 'steel',
  WOOD = 'wood',
  STONE = 'stone',
  FOOD = 'food',
  MANA_CRYSTALS = 'mana_crystals',
  HORSES = 'horses'
}

/**
 * Player faction/allegiance
 */
export enum Faction {
  PLAYER = 'player',
  NEUTRAL = 'neutral',
  ENEMY = 'enemy',
  ALLIED = 'allied'
}

/**
 * Terrain properties and effects
 */
export interface TerrainProperties {
  name: string
  description: string
  movementCost: number // 1 = normal, 2 = slow, 0.5 = fast
  defensiveBonus: number // % bonus to defense when defending
  combatModifiers: {
    evasionBonus?: number
    rangedDamagePenalty?: number
    magicBonus?: number
    healingBonus?: number
  }
  canBuild: BuildingType[] // What can be built on this terrain
  resourceGeneration?: Partial<Record<ResourceType, number>> // Resources per turn
  color: string // Hex color for map display
  passable: boolean // Can units move through
  requiresSpecialMovement?: string[] // Special abilities needed (e.g., "flight", "water_walking")
}

/**
 * Building properties and effects
 */
export interface BuildingProperties {
  name: string
  description: string
  buildCost: Partial<Record<ResourceType, number>>
  buildTime: number // Turns to construct
  maxLevel: number
  
  // Per-turn effects
  resourceGeneration: Partial<Record<ResourceType, number>>
  
  // Combat effects
  defensiveBonus?: number
  healingRate?: number // HP healed per turn for garrisoned units
  
  // Special effects
  visionRange?: number // Extended vision
  recruitmentBonus?: number // Faster unit training
  
  // Upgrade requirements
  upgradeRequirements?: {
    level: number
    cost: Partial<Record<ResourceType, number>>
    prerequisites?: BuildingType[]
  }[]
}

/**
 * Map tile containing terrain, buildings, and units
 */
export interface MapTile {
  coordinate: HexCoordinate
  terrain: TerrainType
  building?: {
    type: BuildingType
    level: number
    faction: Faction
    constructionProgress?: number // 0-100, undefined if complete
  }
  
  // Units and armies
  army?: {
    squads: Squad[]
    faction: Faction
    movementPoints: number
    maxMovementPoints: number
  }
  
  // Resources
  resources?: Partial<Record<ResourceType, number>>
  
  // Visibility and control
  controlledBy: Faction
  visibleTo: Set<Faction>
  exploredBy: Set<Faction>
  
  // Special properties
  isCapital?: boolean
  isStrategicPoint?: boolean
  
  // Events and modifiers
  temporaryEffects?: Array<{
    name: string
    description: string
    turnsRemaining: number
    effects: any
  }>
}

/**
 * Army movement and pathfinding
 */
export interface MovementPath {
  tiles: HexCoordinate[]
  totalCost: number
  isValid: boolean
  blockedBy?: string // Reason if invalid
}

/**
 * Battle context when armies meet
 */
export interface OverworldBattle {
  location: HexCoordinate
  attacker: {
    squads: Squad[]
    faction: Faction
  }
  defender: {
    squads: Squad[]
    faction: Faction
  }
  terrain: TerrainType
  building?: BuildingType
  isSeige: boolean
}

/**
 * Strategic events that can occur
 */
export interface StrategicEvent {
  id: string
  name: string
  description: string
  location?: HexCoordinate
  faction?: Faction
  
  // Event effects
  resourceChanges?: Partial<Record<ResourceType, number>>
  buildingEffects?: Array<{
    location: HexCoordinate
    effect: string
  }>
  
  // Player choices
  choices?: Array<{
    text: string
    effects: any
    requirements?: any
  }>
  
  // Timing
  turnsActive: number
  maxTurns?: number
}

/**
 * Victory conditions
 */
export enum VictoryCondition {
  CONQUEST = 'conquest', // Control all enemy settlements
  ELIMINATION = 'elimination', // Destroy all enemy armies
  ECONOMIC = 'economic', // Accumulate resources
  ARTIFACT = 'artifact', // Find/control special items
  SURVIVAL = 'survival' // Survive for X turns
}

/**
 * Game state for the overworld
 */
export interface OverworldState {
  currentTurn: number
  activePlayer: Faction
  
  // Map data
  mapSize: { width: number; height: number }
  tiles: Map<string, MapTile> // Key: "q,r" coordinate string
  
  // Player resources
  playerResources: Record<Faction, Partial<Record<ResourceType, number>>>
  
  // Victory conditions
  victoryConditions: VictoryCondition[]
  gameEnded: boolean
  winner?: Faction
  
  // Events and notifications
  activeEvents: StrategicEvent[]
  notifications: Array<{
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
    turn: number
  }>
}

/**
 * Pathfinding and movement utilities
 */
export interface PathfindingOptions {
  maxDistance?: number
  avoidEnemies?: boolean
  requiresSpecialMovement?: string[]
  faction: Faction
}

/**
 * Map generation parameters
 */
export interface MapGenerationConfig {
  width: number
  height: number
  terrainDistribution: Partial<Record<TerrainType, number>> // 0-1 percentage
  resourceDensity: number // 0-1
  buildingDensity: number // 0-1
  playerStartPositions: HexCoordinate[]
  seed?: number
}