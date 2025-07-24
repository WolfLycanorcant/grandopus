import { 
  HexCoordinate, 
  MapTile, 
  BuildingType, 
  Faction, 
  ResourceType 
} from './types'
import { OverworldManager } from './OverworldManager'
import { ArmyMovementSystem } from './ArmyMovementSystem'
import { PathfindingSystem } from './PathfindingSystem'
import { hexDistance, getHexNeighbors, hexToKey } from './HexUtils'
import { getBuildingProperties } from './BuildingData'

export interface AIDecision {
  type: 'move_army' | 'build_structure' | 'upgrade_building' | 'recruit_units' | 'end_turn'
  priority: number
  details: any
  reasoning: string
}

export interface AIPersonality {
  aggressiveness: number // 0-1, how likely to attack
  expansionism: number // 0-1, how much to prioritize territory
  economicFocus: number // 0-1, how much to prioritize economy
  defensiveness: number // 0-1, how much to prioritize defense
}

/**
 * Strategic AI system for computer-controlled factions
 */
export class StrategicAI {
  private personality: AIPersonality
  private faction: Faction
  private overworldManager: OverworldManager

  constructor(
    faction: Faction, 
    overworldManager: OverworldManager,
    personality?: Partial<AIPersonality>
  ) {
    this.faction = faction
    this.overworldManager = overworldManager
    this.personality = {
      aggressiveness: 0.6,
      expansionism: 0.7,
      economicFocus: 0.5,
      defensiveness: 0.4,
      ...personality
    }
  }

  /**
   * Make strategic decisions for the AI faction
   */
  public makeStrategicDecisions(): AIDecision[] {
    const decisions: AIDecision[] = []

    // Analyze current situation
    const situation = this.analyzeSituation()

    // Generate potential decisions
    decisions.push(...this.evaluateArmyMovements(situation))
    decisions.push(...this.evaluateBuildingConstruction(situation))
    decisions.push(...this.evaluateBuildingUpgrades(situation))

    // Sort by priority and return top decisions
    return decisions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5) // Limit to top 5 decisions per turn
  }

  /**
   * Analyze the current strategic situation
   */
  private analyzeSituation(): {
    ownedTiles: MapTile[]
    ownedBuildings: Array<{ coordinate: HexCoordinate; building: NonNullable<MapTile['building']> }>
    armies: Array<{ coordinate: HexCoordinate; army: NonNullable<MapTile['army']> }>
    enemyThreats: Array<{ coordinate: HexCoordinate; threat: number }>
    expansionOpportunities: Array<{ coordinate: HexCoordinate; value: number }>
    resources: Partial<Record<ResourceType, number>>
  } {
    const state = this.overworldManager.getState()
    const ownedTiles = this.overworldManager.getTilesByFaction(this.faction)
    const ownedBuildings = this.overworldManager.getBuildingsByFaction(this.faction)
    const resources = this.overworldManager.getPlayerResources(this.faction)

    // Find armies
    const armies: Array<{ coordinate: HexCoordinate; army: NonNullable<MapTile['army']> }> = []
    for (const tile of state.tiles.values()) {
      if (tile.army && tile.army.faction === this.faction) {
        armies.push({ coordinate: tile.coordinate, army: tile.army })
      }
    }

    // Identify enemy threats
    const enemyThreats: Array<{ coordinate: HexCoordinate; threat: number }> = []
    for (const tile of state.tiles.values()) {
      if (tile.army && tile.army.faction !== this.faction && tile.army.faction !== Faction.NEUTRAL) {
        const threat = this.calculateThreatLevel(tile.coordinate, tile.army)
        enemyThreats.push({ coordinate: tile.coordinate, threat })
      }
    }

    // Find expansion opportunities
    const expansionOpportunities: Array<{ coordinate: HexCoordinate; value: number }> = []
    for (const tile of state.tiles.values()) {
      if (tile.controlledBy === Faction.NEUTRAL || 
          (tile.controlledBy !== this.faction && tile.controlledBy !== Faction.NEUTRAL)) {
        const value = this.calculateExpansionValue(tile)
        if (value > 0) {
          expansionOpportunities.push({ coordinate: tile.coordinate, value })
        }
      }
    }

    return {
      ownedTiles,
      ownedBuildings,
      armies,
      enemyThreats,
      expansionOpportunities,
      resources
    }
  }

  /**
   * Evaluate potential army movements
   */
  private evaluateArmyMovements(situation: ReturnType<typeof this.analyzeSituation>): AIDecision[] {
    const decisions: AIDecision[] = []

    for (const army of situation.armies) {
      const movementRange = ArmyMovementSystem.calculateArmyMovementRange(army.army.squads)
      const strategicOptions = ArmyMovementSystem.analyzeStrategicOptions(
        army.coordinate,
        movementRange,
        this.overworldManager.getState().tiles,
        this.faction
      )

      // Aggressive moves
      if (this.personality.aggressiveness > 0.5) {
        for (const target of strategicOptions.offensiveTargets.slice(0, 3)) {
          decisions.push({
            type: 'move_army',
            priority: target.priority * this.personality.aggressiveness * 100,
            details: {
              from: army.coordinate,
              to: target.coordinate,
              armyId: `army_${hexToKey(army.coordinate)}`
            },
            reasoning: `Aggressive move: ${target.reason}`
          })
        }
      }

      // Expansionist moves
      if (this.personality.expansionism > 0.4) {
        for (const target of strategicOptions.economicTargets.slice(0, 2)) {
          decisions.push({
            type: 'move_army',
            priority: target.value * this.personality.expansionism * 80,
            details: {
              from: army.coordinate,
              to: target.coordinate,
              armyId: `army_${hexToKey(army.coordinate)}`
            },
            reasoning: `Expansion move: ${target.reason}`
          })
        }
      }

      // Defensive moves
      if (this.personality.defensiveness > 0.3) {
        const nearbyThreats = situation.enemyThreats.filter(threat => 
          hexDistance(threat.coordinate, army.coordinate) <= movementRange + 2
        )

        if (nearbyThreats.length > 0) {
          const bestDefensivePos = strategicOptions.defensivePositions[0]
          if (bestDefensivePos) {
            decisions.push({
              type: 'move_army',
              priority: bestDefensivePos.value * this.personality.defensiveness * 90,
              details: {
                from: army.coordinate,
                to: bestDefensivePos.coordinate,
                armyId: `army_${hexToKey(army.coordinate)}`
              },
              reasoning: `Defensive positioning: ${bestDefensivePos.reason}`
            })
          }
        }
      }
    }

    return decisions
  }

  /**
   * Evaluate building construction opportunities
   */
  private evaluateBuildingConstruction(situation: ReturnType<typeof this.analyzeSituation>): AIDecision[] {
    const decisions: AIDecision[] = []

    // Find suitable construction sites
    const constructionSites = situation.ownedTiles.filter(tile => !tile.building)

    for (const site of constructionSites) {
      // Economic buildings
      if (this.personality.economicFocus > 0.4) {
        const economicBuildings = [BuildingType.FARM, BuildingType.MINE, BuildingType.LUMBER_MILL]
        
        for (const buildingType of economicBuildings) {
          if (this.canAffordBuilding(buildingType, situation.resources)) {
            const value = this.calculateBuildingValue(site, buildingType)
            
            decisions.push({
              type: 'build_structure',
              priority: value * this.personality.economicFocus * 70,
              details: {
                coordinate: site.coordinate,
                buildingType
              },
              reasoning: `Economic development: ${buildingType} for resource generation`
            })
          }
        }
      }

      // Military buildings
      if (this.personality.defensiveness > 0.3 || this.personality.aggressiveness > 0.6) {
        const militaryBuildings = [BuildingType.OUTPOST, BuildingType.CASTLE, BuildingType.TOWER]
        
        for (const buildingType of militaryBuildings) {
          if (this.canAffordBuilding(buildingType, situation.resources)) {
            const strategicValue = this.calculateMilitaryBuildingValue(site, buildingType, situation)
            
            decisions.push({
              type: 'build_structure',
              priority: strategicValue * (this.personality.defensiveness + this.personality.aggressiveness) * 60,
              details: {
                coordinate: site.coordinate,
                buildingType
              },
              reasoning: `Military infrastructure: ${buildingType} for strategic control`
            })
          }
        }
      }
    }

    return decisions
  }

  /**
   * Evaluate building upgrade opportunities
   */
  private evaluateBuildingUpgrades(situation: ReturnType<typeof this.analyzeSituation>): AIDecision[] {
    const decisions: AIDecision[] = []

    for (const building of situation.ownedBuildings) {
      const buildingProps = getBuildingProperties(building.building.type)
      
      if (building.building.level < buildingProps.maxLevel) {
        // Calculate upgrade value
        const currentGeneration = buildingProps.resourceGeneration
        const upgradeValue = Object.values(currentGeneration).reduce((sum, amount) => sum + amount, 0)
        
        // Economic buildings get priority based on economic focus
        let priority = upgradeValue * 50
        
        if (this.isEconomicBuilding(building.building.type)) {
          priority *= this.personality.economicFocus
        } else if (this.isMilitaryBuilding(building.building.type)) {
          priority *= (this.personality.defensiveness + this.personality.aggressiveness) / 2
        }

        decisions.push({
          type: 'upgrade_building',
          priority,
          details: {
            coordinate: building.coordinate,
            currentLevel: building.building.level
          },
          reasoning: `Upgrade ${building.building.type} for improved efficiency`
        })
      }
    }

    return decisions
  }

  /**
   * Calculate threat level of an enemy army
   */
  private calculateThreatLevel(coordinate: HexCoordinate, army: NonNullable<MapTile['army']>): number {
    let threat = army.squads.length * 20 // Base threat per squad
    
    // Distance to our territory affects threat
    const ownedTiles = this.overworldManager.getTilesByFaction(this.faction)
    const minDistance = Math.min(...ownedTiles.map(tile => 
      hexDistance(coordinate, tile.coordinate)
    ))
    
    // Closer threats are more dangerous
    threat *= Math.max(0.1, 1 - (minDistance / 10))
    
    return threat
  }

  /**
   * Calculate expansion value of a tile
   */
  private calculateExpansionValue(tile: MapTile): number {
    let value = 10 // Base value for any territory
    
    // Strategic buildings are valuable
    if (tile.building) {
      value += 50
      
      if (this.isEconomicBuilding(tile.building.type)) {
        value += 30 * this.personality.economicFocus
      }
      
      if (this.isMilitaryBuilding(tile.building.type)) {
        value += 25 * this.personality.defensiveness
      }
    }
    
    // Terrain bonuses
    if (tile.terrain === 'hills' || tile.terrain === 'mountains') {
      value += 15 // Defensive advantage
    }
    
    // Resource generation
    // This would need terrain resource data
    value += 5
    
    return value
  }

  /**
   * Calculate building construction value
   */
  private calculateBuildingValue(site: MapTile, buildingType: BuildingType): number {
    const buildingProps = getBuildingProperties(buildingType)
    let value = 0
    
    // Resource generation value
    for (const [resource, amount] of Object.entries(buildingProps.resourceGeneration)) {
      value += amount * this.getResourcePriority(resource as ResourceType)
    }
    
    // Terrain compatibility
    // This would need terrain building compatibility data
    value += 10
    
    return value
  }

  /**
   * Calculate military building strategic value
   */
  private calculateMilitaryBuildingValue(
    site: MapTile, 
    buildingType: BuildingType, 
    situation: ReturnType<typeof this.analyzeSituation>
  ): number {
    let value = 20 // Base military value
    
    // Proximity to threats increases value
    const nearbyThreats = situation.enemyThreats.filter(threat => 
      hexDistance(threat.coordinate, site.coordinate) <= 5
    )
    
    value += nearbyThreats.length * 15
    
    // Border positions are more valuable
    const neighbors = getHexNeighbors(site.coordinate)
    const borderValue = neighbors.filter(neighbor => {
      const neighborTile = this.overworldManager.getTile(neighbor)
      return neighborTile && neighborTile.controlledBy !== this.faction
    }).length
    
    value += borderValue * 10
    
    return value
  }

  /**
   * Check if AI can afford a building
   */
  private canAffordBuilding(
    buildingType: BuildingType, 
    resources: Partial<Record<ResourceType, number>>
  ): boolean {
    const buildingProps = getBuildingProperties(buildingType)
    
    for (const [resource, cost] of Object.entries(buildingProps.buildCost)) {
      const available = resources[resource as ResourceType] || 0
      if (available < cost) {
        return false
      }
    }
    
    return true
  }

  /**
   * Get resource priority for AI decision making
   */
  private getResourcePriority(resource: ResourceType): number {
    switch (resource) {
      case ResourceType.GOLD: return 10 // Always valuable
      case ResourceType.FOOD: return 8 // Important for armies
      case ResourceType.STEEL: return 7 // Military equipment
      case ResourceType.WOOD: return 6 // Construction
      case ResourceType.STONE: return 6 // Construction
      case ResourceType.MANA_CRYSTALS: return 5 // Specialized
      case ResourceType.HORSES: return 4 // Cavalry
      default: return 3
    }
  }

  /**
   * Check if building type is economic
   */
  private isEconomicBuilding(buildingType: BuildingType): boolean {
    return [
      BuildingType.FARM,
      BuildingType.MINE,
      BuildingType.LUMBER_MILL
    ].includes(buildingType)
  }

  /**
   * Check if building type is military
   */
  private isMilitaryBuilding(buildingType: BuildingType): boolean {
    return [
      BuildingType.CASTLE,
      BuildingType.OUTPOST,
      BuildingType.TOWER
    ].includes(buildingType)
  }

  /**
   * Execute AI decisions
   */
  public executeDecisions(decisions: AIDecision[]): void {
    for (const decision of decisions.slice(0, 3)) { // Execute top 3 decisions
      try {
        switch (decision.type) {
          case 'move_army':
            // This would need integration with the movement system
            console.log(`AI ${this.faction}: ${decision.reasoning}`)
            break
            
          case 'build_structure':
            const buildSuccess = this.overworldManager.buildStructure(
              decision.details.coordinate,
              decision.details.buildingType,
              this.faction
            )
            if (buildSuccess) {
              console.log(`AI ${this.faction}: Built ${decision.details.buildingType}`)
            }
            break
            
          case 'upgrade_building':
            const upgradeSuccess = this.overworldManager.upgradeBuilding(
              decision.details.coordinate,
              this.faction
            )
            if (upgradeSuccess) {
              console.log(`AI ${this.faction}: Upgraded building`)
            }
            break
        }
      } catch (error) {
        console.warn(`AI decision failed: ${error}`)
      }
    }
  }
}