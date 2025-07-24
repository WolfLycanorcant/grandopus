import { TerrainType, TerrainProperties, BuildingType } from './types'

/**
 * Terrain data defining properties and effects for each terrain type
 */
export const TERRAIN_DATA: Record<TerrainType, TerrainProperties> = {
  [TerrainType.PLAINS]: {
    name: 'Plains',
    description: 'Open grasslands perfect for farming and movement.',
    movementCost: 1,
    defensiveBonus: 0,
    combatModifiers: {},
    canBuild: [
      BuildingType.SETTLEMENT,
      BuildingType.FARM,
      BuildingType.OUTPOST,
      BuildingType.TOWER
    ],
    resourceGeneration: {
      food: 1
    },
    color: '#90EE90',
    passable: true
  },

  [TerrainType.FOREST]: {
    name: 'Forest',
    description: 'Dense woodlands that provide cover and lumber.',
    movementCost: 1.5,
    defensiveBonus: 10,
    combatModifiers: {
      evasionBonus: 10,
      rangedDamagePenalty: -20
    },
    canBuild: [
      BuildingType.OUTPOST,
      BuildingType.LUMBER_MILL,
      BuildingType.TOWER
    ],
    resourceGeneration: {
      wood: 2
    },
    color: '#228B22',
    passable: true
  },

  [TerrainType.HILLS]: {
    name: 'Hills',
    description: 'Rolling hills that provide strategic advantage.',
    movementCost: 1.2,
    defensiveBonus: 15,
    combatModifiers: {
      rangedDamagePenalty: 15 // Bonus for attacking downhill
    },
    canBuild: [
      BuildingType.CASTLE,
      BuildingType.TOWER,
      BuildingType.MINE,
      BuildingType.OUTPOST
    ],
    resourceGeneration: {
      stone: 1
    },
    color: '#8B7355',
    passable: true
  },

  [TerrainType.MOUNTAINS]: {
    name: 'Mountains',
    description: 'Towering peaks rich in minerals but hard to traverse.',
    movementCost: 2,
    defensiveBonus: 25,
    combatModifiers: {
      rangedDamagePenalty: 20
    },
    canBuild: [
      BuildingType.MINE,
      BuildingType.TOWER
    ],
    resourceGeneration: {
      stone: 2,
      steel: 1,
      mana_crystals: 1
    },
    color: '#696969',
    passable: true,
    requiresSpecialMovement: ['mountain_climbing']
  },

  [TerrainType.RIVER]: {
    name: 'River',
    description: 'Flowing water that blocks movement but provides resources.',
    movementCost: 3,
    defensiveBonus: 5,
    combatModifiers: {
      healingBonus: 5
    },
    canBuild: [
      BuildingType.FARM,
      BuildingType.LUMBER_MILL
    ],
    resourceGeneration: {
      food: 2
    },
    color: '#4169E1',
    passable: true,
    requiresSpecialMovement: ['water_walking', 'flight']
  },

  [TerrainType.SWAMP]: {
    name: 'Swamp',
    description: 'Treacherous wetlands that slow movement.',
    movementCost: 2.5,
    defensiveBonus: 5,
    combatModifiers: {
      evasionBonus: 5,
      rangedDamagePenalty: -15
    },
    canBuild: [],
    color: '#556B2F',
    passable: true,
    requiresSpecialMovement: ['swamp_walking']
  },

  [TerrainType.DESERT]: {
    name: 'Desert',
    description: 'Harsh sands that test endurance.',
    movementCost: 1.3,
    defensiveBonus: 0,
    combatModifiers: {
      rangedDamagePenalty: -10 // Sand affects visibility
    },
    canBuild: [
      BuildingType.OUTPOST,
      BuildingType.TOWER
    ],
    color: '#F4A460',
    passable: true
  },

  [TerrainType.SNOW]: {
    name: 'Snow',
    description: 'Frozen lands that slow movement and chill the bones.',
    movementCost: 1.8,
    defensiveBonus: 5,
    combatModifiers: {
      evasionBonus: -5 // Tracks in snow
    },
    canBuild: [
      BuildingType.OUTPOST
    ],
    color: '#FFFAFA',
    passable: true,
    requiresSpecialMovement: ['cold_resistance']
  }
}

/**
 * Get terrain properties by type
 */
export function getTerrainProperties(terrain: TerrainType): TerrainProperties {
  return TERRAIN_DATA[terrain]
}

/**
 * Calculate movement cost for a tile
 */
export function calculateMovementCost(
  terrain: TerrainType, 
  hasSpecialMovement: string[] = []
): number {
  const properties = getTerrainProperties(terrain)
  
  // Check if special movement bypasses terrain penalties
  if (properties.requiresSpecialMovement) {
    const hasRequired = properties.requiresSpecialMovement.some(required => 
      hasSpecialMovement.includes(required)
    )
    if (hasRequired) {
      return 1 // Special movement negates terrain penalties
    }
  }
  
  // Flight bypasses most terrain penalties
  if (hasSpecialMovement.includes('flight')) {
    return 1
  }
  
  return properties.movementCost
}

/**
 * Check if terrain is passable for a unit
 */
export function isTerrainPassable(
  terrain: TerrainType,
  hasSpecialMovement: string[] = []
): boolean {
  const properties = getTerrainProperties(terrain)
  
  if (!properties.passable) {
    return false
  }
  
  // Check special movement requirements
  if (properties.requiresSpecialMovement) {
    return properties.requiresSpecialMovement.some(required => 
      hasSpecialMovement.includes(required)
    ) || hasSpecialMovement.includes('flight')
  }
  
  return true
}

/**
 * Get combat modifiers for terrain
 */
export function getTerrainCombatModifiers(terrain: TerrainType) {
  return getTerrainProperties(terrain).combatModifiers
}

/**
 * Get defensive bonus for terrain
 */
export function getTerrainDefensiveBonus(terrain: TerrainType): number {
  return getTerrainProperties(terrain).defensiveBonus
}

/**
 * Get resource generation for terrain
 */
export function getTerrainResourceGeneration(terrain: TerrainType) {
  return getTerrainProperties(terrain).resourceGeneration || {}
}

/**
 * Check if building can be constructed on terrain
 */
export function canBuildOnTerrain(terrain: TerrainType, building: BuildingType): boolean {
  const properties = getTerrainProperties(terrain)
  return properties.canBuild.includes(building)
}

/**
 * Get all terrain types
 */
export function getAllTerrainTypes(): TerrainType[] {
  return Object.values(TerrainType)
}

/**
 * Get terrain color for map display
 */
export function getTerrainColor(terrain: TerrainType): string {
  return getTerrainProperties(terrain).color
}