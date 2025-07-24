import { BuildingType, BuildingProperties, ResourceType } from './types'

/**
 * Building data defining properties and effects for each building type
 */
export const BUILDING_DATA: Record<BuildingType, BuildingProperties> = {
  [BuildingType.SETTLEMENT]: {
    name: 'Settlement',
    description: 'A basic settlement that provides population and basic resources.',
    buildCost: {
      [ResourceType.WOOD]: 50,
      [ResourceType.STONE]: 30,
      [ResourceType.GOLD]: 100
    },
    buildTime: 3,
    maxLevel: 5,
    resourceGeneration: {
      [ResourceType.GOLD]: 10,
      [ResourceType.FOOD]: 5
    },
    healingRate: 5,
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.WOOD]: 75, [ResourceType.STONE]: 50, [ResourceType.GOLD]: 150 }
      },
      {
        level: 3,
        cost: { [ResourceType.WOOD]: 100, [ResourceType.STONE]: 75, [ResourceType.GOLD]: 200 }
      },
      {
        level: 4,
        cost: { [ResourceType.WOOD]: 150, [ResourceType.STONE]: 100, [ResourceType.GOLD]: 300 }
      },
      {
        level: 5,
        cost: { [ResourceType.WOOD]: 200, [ResourceType.STONE]: 150, [ResourceType.GOLD]: 500 }
      }
    ]
  },

  [BuildingType.CASTLE]: {
    name: 'Castle',
    description: 'A mighty fortress that provides strong defense and military training.',
    buildCost: {
      [ResourceType.STONE]: 200,
      [ResourceType.STEEL]: 100,
      [ResourceType.GOLD]: 500
    },
    buildTime: 8,
    maxLevel: 3,
    resourceGeneration: {
      [ResourceType.GOLD]: 20
    },
    defensiveBonus: 50,
    healingRate: 15,
    visionRange: 3,
    recruitmentBonus: 25,
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.STONE]: 300, [ResourceType.STEEL]: 150, [ResourceType.GOLD]: 750 }
      },
      {
        level: 3,
        cost: { [ResourceType.STONE]: 500, [ResourceType.STEEL]: 250, [ResourceType.GOLD]: 1000 }
      }
    ]
  },

  [BuildingType.CHURCH]: {
    name: 'Church',
    description: 'A holy site that provides healing and removes curses.',
    buildCost: {
      [ResourceType.WOOD]: 75,
      [ResourceType.STONE]: 100,
      [ResourceType.GOLD]: 200
    },
    buildTime: 4,
    maxLevel: 3,
    resourceGeneration: {
      [ResourceType.GOLD]: 5
    },
    healingRate: 20,
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.WOOD]: 100, [ResourceType.STONE]: 150, [ResourceType.GOLD]: 300 }
      },
      {
        level: 3,
        cost: { [ResourceType.WOOD]: 150, [ResourceType.STONE]: 200, [ResourceType.GOLD]: 500 }
      }
    ]
  },

  [BuildingType.FARM]: {
    name: 'Farm',
    description: 'Agricultural facility that produces food for your armies.',
    buildCost: {
      [ResourceType.WOOD]: 30,
      [ResourceType.GOLD]: 50
    },
    buildTime: 2,
    maxLevel: 4,
    resourceGeneration: {
      [ResourceType.FOOD]: 15
    },
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.WOOD]: 50, [ResourceType.GOLD]: 75 }
      },
      {
        level: 3,
        cost: { [ResourceType.WOOD]: 75, [ResourceType.GOLD]: 100 }
      },
      {
        level: 4,
        cost: { [ResourceType.WOOD]: 100, [ResourceType.GOLD]: 150 }
      }
    ]
  },

  [BuildingType.BLACKSMITH]: {
    name: 'Blacksmith',
    description: 'Forge that produces weapons, armor, and steel.',
    buildCost: {
      [ResourceType.WOOD]: 40,
      [ResourceType.STONE]: 60,
      [ResourceType.STEEL]: 20,
      [ResourceType.GOLD]: 150
    },
    buildTime: 5,
    maxLevel: 4,
    resourceGeneration: {
      [ResourceType.STEEL]: 8
    },
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.STONE]: 80, [ResourceType.STEEL]: 30, [ResourceType.GOLD]: 200 }
      },
      {
        level: 3,
        cost: { [ResourceType.STONE]: 120, [ResourceType.STEEL]: 50, [ResourceType.GOLD]: 300 }
      },
      {
        level: 4,
        cost: { [ResourceType.STONE]: 200, [ResourceType.STEEL]: 80, [ResourceType.GOLD]: 500 }
      }
    ]
  },

  [BuildingType.OUTPOST]: {
    name: 'Outpost',
    description: 'Military outpost that extends vision and provides basic defense.',
    buildCost: {
      [ResourceType.WOOD]: 25,
      [ResourceType.GOLD]: 75
    },
    buildTime: 2,
    maxLevel: 2,
    resourceGeneration: {
      [ResourceType.GOLD]: 5
    },
    defensiveBonus: 15,
    visionRange: 2,
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.WOOD]: 40, [ResourceType.STONE]: 30, [ResourceType.GOLD]: 100 }
      }
    ]
  },

  [BuildingType.TOWER]: {
    name: 'Tower',
    description: 'Watchtower that provides excellent vision and magical research.',
    buildCost: {
      [ResourceType.STONE]: 80,
      [ResourceType.MANA_CRYSTALS]: 10,
      [ResourceType.GOLD]: 200
    },
    buildTime: 4,
    maxLevel: 3,
    resourceGeneration: {
      [ResourceType.MANA_CRYSTALS]: 3
    },
    visionRange: 4,
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.STONE]: 120, [ResourceType.MANA_CRYSTALS]: 20, [ResourceType.GOLD]: 300 }
      },
      {
        level: 3,
        cost: { [ResourceType.STONE]: 200, [ResourceType.MANA_CRYSTALS]: 40, [ResourceType.GOLD]: 500 }
      }
    ]
  },

  [BuildingType.MINE]: {
    name: 'Mine',
    description: 'Excavation site that produces stone, steel, and precious materials.',
    buildCost: {
      [ResourceType.WOOD]: 60,
      [ResourceType.STEEL]: 30,
      [ResourceType.GOLD]: 200
    },
    buildTime: 6,
    maxLevel: 4,
    resourceGeneration: {
      [ResourceType.STONE]: 10,
      [ResourceType.STEEL]: 5
    },
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.WOOD]: 80, [ResourceType.STEEL]: 50, [ResourceType.GOLD]: 300 }
      },
      {
        level: 3,
        cost: { [ResourceType.STEEL]: 80, [ResourceType.GOLD]: 500 }
      },
      {
        level: 4,
        cost: { [ResourceType.STEEL]: 120, [ResourceType.MANA_CRYSTALS]: 20, [ResourceType.GOLD]: 800 }
      }
    ]
  },

  [BuildingType.LUMBER_MILL]: {
    name: 'Lumber Mill',
    description: 'Processing facility that efficiently harvests and processes wood.',
    buildCost: {
      [ResourceType.WOOD]: 40,
      [ResourceType.STEEL]: 15,
      [ResourceType.GOLD]: 100
    },
    buildTime: 3,
    maxLevel: 3,
    resourceGeneration: {
      [ResourceType.WOOD]: 20
    },
    upgradeRequirements: [
      {
        level: 2,
        cost: { [ResourceType.WOOD]: 60, [ResourceType.STEEL]: 25, [ResourceType.GOLD]: 150 }
      },
      {
        level: 3,
        cost: { [ResourceType.WOOD]: 100, [ResourceType.STEEL]: 40, [ResourceType.GOLD]: 250 }
      }
    ]
  }
}

/**
 * Get building properties by type
 */
export function getBuildingProperties(building: BuildingType): BuildingProperties {
  return BUILDING_DATA[building]
}

/**
 * Calculate total resource generation for a building at a specific level
 */
export function calculateBuildingResourceGeneration(
  building: BuildingType, 
  level: number
): Partial<Record<ResourceType, number>> {
  const properties = getBuildingProperties(building)
  const baseGeneration = properties.resourceGeneration
  
  // Each level increases generation by 50%
  const multiplier = 1 + (level - 1) * 0.5
  
  const scaledGeneration: Partial<Record<ResourceType, number>> = {}
  for (const [resource, amount] of Object.entries(baseGeneration)) {
    scaledGeneration[resource as ResourceType] = Math.floor(amount * multiplier)
  }
  
  return scaledGeneration
}

/**
 * Calculate building upgrade cost
 */
export function getBuildingUpgradeCost(
  building: BuildingType, 
  currentLevel: number
): Partial<Record<ResourceType, number>> | null {
  const properties = getBuildingProperties(building)
  
  if (currentLevel >= properties.maxLevel) {
    return null // Already at max level
  }
  
  const upgrade = properties.upgradeRequirements?.find(req => req.level === currentLevel + 1)
  return upgrade?.cost || null
}

/**
 * Check if building can be upgraded
 */
export function canUpgradeBuilding(
  building: BuildingType,
  currentLevel: number,
  availableResources: Partial<Record<ResourceType, number>>
): { canUpgrade: boolean; reason?: string } {
  const properties = getBuildingProperties(building)
  
  if (currentLevel >= properties.maxLevel) {
    return { canUpgrade: false, reason: 'Already at maximum level' }
  }
  
  const upgradeCost = getBuildingUpgradeCost(building, currentLevel)
  if (!upgradeCost) {
    return { canUpgrade: false, reason: 'No upgrade available' }
  }
  
  // Check resource requirements
  for (const [resource, cost] of Object.entries(upgradeCost)) {
    const available = availableResources[resource as ResourceType] || 0
    if (available < cost) {
      return { 
        canUpgrade: false, 
        reason: `Requires ${cost} ${resource} (have ${available})` 
      }
    }
  }
  
  return { canUpgrade: true }
}

/**
 * Get building defensive bonus at level
 */
export function getBuildingDefensiveBonus(building: BuildingType, level: number): number {
  const properties = getBuildingProperties(building)
  const baseBonus = properties.defensiveBonus || 0
  
  // Each level increases defensive bonus by 25%
  return Math.floor(baseBonus * (1 + (level - 1) * 0.25))
}

/**
 * Get building healing rate at level
 */
export function getBuildingHealingRate(building: BuildingType, level: number): number {
  const properties = getBuildingProperties(building)
  const baseHealing = properties.healingRate || 0
  
  // Each level increases healing by 50%
  return Math.floor(baseHealing * (1 + (level - 1) * 0.5))
}

/**
 * Get building vision range at level
 */
export function getBuildingVisionRange(building: BuildingType, level: number): number {
  const properties = getBuildingProperties(building)
  const baseVision = properties.visionRange || 0
  
  // Each level increases vision by 1
  return baseVision + (level - 1)
}

/**
 * Get all building types
 */
export function getAllBuildingTypes(): BuildingType[] {
  return Object.values(BuildingType)
}

/**
 * Get buildings that can produce a specific resource
 */
export function getBuildingsByResource(resource: ResourceType): BuildingType[] {
  return Object.entries(BUILDING_DATA)
    .filter(([_, properties]) => 
      Object.keys(properties.resourceGeneration).includes(resource)
    )
    .map(([building, _]) => building as BuildingType)
}