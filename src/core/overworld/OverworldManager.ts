import { 
  OverworldState, 
  MapTile, 
  HexCoordinate, 
  TerrainType, 
  BuildingType, 
  ResourceType, 
  Faction,
  MovementPath,
  PathfindingOptions,
  StrategicEvent,
  VictoryCondition
} from './types'
import { Squad } from '../squads'
import { hexToKey, keyToHex, hexDistance, getHexNeighbors, getHexesInRange } from './HexUtils'
import { getTerrainProperties, calculateMovementCost, isTerrainPassable } from './TerrainData'
import { getBuildingProperties, calculateBuildingResourceGeneration } from './BuildingData'
import { calculateSquadBuildingBonuses, applyBuildingBonusesToSquad, SquadBuildingBonuses } from './BuildingEffects'

/**
 * Core overworld manager handling strategic gameplay
 */
export class OverworldManager {
  private state: OverworldState
  private eventQueue: StrategicEvent[]

  constructor(mapWidth: number = 20, mapHeight: number = 15) {
    this.eventQueue = []
    this.state = {
      currentTurn: 1,
      activePlayer: Faction.PLAYER,
      mapSize: { width: mapWidth, height: mapHeight },
      tiles: new Map(),
      playerResources: {
        [Faction.PLAYER]: {
          [ResourceType.GOLD]: 500,
          [ResourceType.WOOD]: 100,
          [ResourceType.STONE]: 50,
          [ResourceType.STEEL]: 25,
          [ResourceType.FOOD]: 200,
          [ResourceType.MANA_CRYSTALS]: 10,
          [ResourceType.HORSES]: 5
        },
        [Faction.ENEMY]: {
          [ResourceType.GOLD]: 300,
          [ResourceType.WOOD]: 75,
          [ResourceType.STONE]: 40,
          [ResourceType.STEEL]: 15,
          [ResourceType.FOOD]: 150,
          [ResourceType.MANA_CRYSTALS]: 5,
          [ResourceType.HORSES]: 3
        },
        [Faction.NEUTRAL]: {},
        [Faction.ALLIED]: {}
      },
      victoryConditions: [VictoryCondition.CONQUEST],
      gameEnded: false,
      activeEvents: [],
      notifications: []
    }
    
    this.generateBasicMap()
  }

  /**
   * Generate a basic map with varied terrain
   */
  private generateBasicMap(): void {
    const { width, height } = this.state.mapSize
    
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const q = col - Math.floor((row + (row & 1)) / 2)
        const r = row
        const coordinate: HexCoordinate = { q, r }
        
        // Simple terrain generation
        const terrain = this.generateTerrain(coordinate)
        
        const tile: MapTile = {
          coordinate,
          terrain,
          controlledBy: Faction.NEUTRAL,
          visibleTo: new Set([Faction.PLAYER]), // Player can see all for now
          exploredBy: new Set([Faction.PLAYER])
        }
        
        // Add some starting buildings
        if (col === 2 && row === 2) {
          // Player starting settlement
          tile.building = {
            type: BuildingType.SETTLEMENT,
            level: 1,
            faction: Faction.PLAYER
          }
          tile.controlledBy = Faction.PLAYER
          tile.isCapital = true
        } else if (col === width - 3 && row === height - 3) {
          // Enemy starting settlement
          tile.building = {
            type: BuildingType.SETTLEMENT,
            level: 1,
            faction: Faction.ENEMY
          }
          tile.controlledBy = Faction.ENEMY
        }
        
        this.state.tiles.set(hexToKey(coordinate), tile)
      }
    }
  }

  /**
   * Simple terrain generation
   */
  private generateTerrain(coordinate: HexCoordinate): TerrainType {
    const { q, r } = coordinate
    const noise = Math.sin(q * 0.3) * Math.cos(r * 0.3) + Math.sin(q * 0.1) * Math.cos(r * 0.1)
    
    if (noise > 0.6) return TerrainType.MOUNTAINS
    if (noise > 0.3) return TerrainType.HILLS
    if (noise > 0.1) return TerrainType.FOREST
    if (noise < -0.3) return TerrainType.RIVER
    if (noise < -0.1) return TerrainType.SWAMP
    
    return TerrainType.PLAINS
  }

  /**
   * Get tile at coordinate
   */
  public getTile(coordinate: HexCoordinate): MapTile | null {
    return this.state.tiles.get(hexToKey(coordinate)) || null
  }

  /**
   * Get all tiles
   */
  public getAllTiles(): MapTile[] {
    return Array.from(this.state.tiles.values())
  }

  /**
   * Move army to new location
   */
  public moveArmy(from: HexCoordinate, to: HexCoordinate, faction: Faction): boolean {
    const fromTile = this.getTile(from)
    const toTile = this.getTile(to)
    
    if (!fromTile || !toTile || !fromTile.army || fromTile.army.faction !== faction) {
      return false
    }
    
    // Check if movement is valid
    const distance = hexDistance(from, to)
    if (distance > fromTile.army.movementPoints) {
      return false
    }
    
    // Check if terrain is passable
    if (!isTerrainPassable(toTile.terrain)) {
      return false
    }
    
    // Calculate movement cost
    const movementCost = calculateMovementCost(toTile.terrain)
    
    // Check for enemy armies (combat)
    if (toTile.army && toTile.army.faction !== faction) {
      // Initiate battle
      this.initiateBattle(from, to)
      return true
    }
    
    // Move army
    toTile.army = fromTile.army
    toTile.army.movementPoints -= movementCost
    delete fromTile.army
    
    // Capture territory if uncontrolled
    if (toTile.controlledBy === Faction.NEUTRAL) {
      toTile.controlledBy = faction
    }
    
    return true
  }

  /**
   * Initiate battle between armies
   */
  private initiateBattle(attackerPos: HexCoordinate, defenderPos: HexCoordinate): void {
    const attackerTile = this.getTile(attackerPos)
    const defenderTile = this.getTile(defenderPos)
    
    if (!attackerTile?.army || !defenderTile?.army) return
    
    // For now, just add a notification
    // In a full implementation, this would trigger the battle system
    this.addNotification(
      `Battle initiated at ${hexToKey(defenderPos)}!`,
      'warning'
    )
  }

  /**
   * Build structure on tile
   */
  public buildStructure(
    coordinate: HexCoordinate, 
    buildingType: BuildingType, 
    faction: Faction
  ): boolean {
    const tile = this.getTile(coordinate)
    if (!tile || tile.controlledBy !== faction) {
      return false
    }
    
    // Check if building already exists
    if (tile.building) {
      return false
    }
    
    // Check terrain compatibility
    const terrainProps = getTerrainProperties(tile.terrain)
    if (!terrainProps.canBuild.includes(buildingType)) {
      return false
    }
    
    // Check resource costs
    const buildingProps = getBuildingProperties(buildingType)
    const playerResources = this.state.playerResources[faction]
    
    for (const [resource, cost] of Object.entries(buildingProps.buildCost)) {
      const available = playerResources[resource as ResourceType] || 0
      if (available < cost) {
        return false
      }
    }
    
    // Deduct resources
    for (const [resource, cost] of Object.entries(buildingProps.buildCost)) {
      playerResources[resource as ResourceType] = 
        (playerResources[resource as ResourceType] || 0) - cost
    }
    
    // Start construction
    tile.building = {
      type: buildingType,
      level: 1,
      faction,
      constructionProgress: 0
    }
    
    this.addNotification(
      `Construction of ${buildingProps.name} started at ${hexToKey(coordinate)}`,
      'info'
    )
    
    return true
  }

  /**
   * Upgrade building
   */
  public upgradeBuilding(coordinate: HexCoordinate, faction: Faction): boolean {
    const tile = this.getTile(coordinate)
    if (!tile || !tile.building || tile.building.faction !== faction) {
      return false
    }
    
    const building = tile.building
    const buildingProps = getBuildingProperties(building.type)
    
    if (building.level >= buildingProps.maxLevel) {
      return false
    }
    
    // Check upgrade costs (simplified)
    const upgradeCost = buildingProps.upgradeRequirements?.[building.level - 1]?.cost
    if (!upgradeCost) return false
    
    const playerResources = this.state.playerResources[faction]
    
    // Check if player has enough resources
    for (const [resource, cost] of Object.entries(upgradeCost)) {
      const available = playerResources[resource as ResourceType] || 0
      if (available < cost) {
        return false
      }
    }
    
    // Deduct resources and upgrade
    for (const [resource, cost] of Object.entries(upgradeCost)) {
      playerResources[resource as ResourceType] = 
        (playerResources[resource as ResourceType] || 0) - cost
    }
    
    building.level++
    
    this.addNotification(
      `${buildingProps.name} upgraded to level ${building.level}`,
      'success'
    )
    
    return true
  }

  /**
   * Process end of turn
   */
  public endTurn(): void {
    // Generate resources from buildings
    this.generateResources()
    
    // Process construction
    this.processConstruction()
    
    // Apply building effects to squads (healing, bonuses, etc.)
    this.applyBuildingEffectsToSquads()
    
    // Restore movement points
    this.restoreMovementPoints()
    
    // Process events
    this.processEvents()
    
    // Check victory conditions
    this.checkVictoryConditions()
    
    // Advance turn
    this.state.currentTurn++
    
    // Switch active player (for multiplayer)
    // For now, just cycle through factions
    const factions = [Faction.PLAYER, Faction.ENEMY]
    const currentIndex = factions.indexOf(this.state.activePlayer)
    this.state.activePlayer = factions[(currentIndex + 1) % factions.length]
    
    this.addNotification(`Turn ${this.state.currentTurn} begins`, 'info')
  }

  /**
   * Generate resources from buildings
   */
  private generateResources(): void {
    for (const tile of this.state.tiles.values()) {
      if (tile.building && tile.building.constructionProgress === undefined) {
        const generation = calculateBuildingResourceGeneration(
          tile.building.type, 
          tile.building.level
        )
        
        const faction = tile.building.faction
        const playerResources = this.state.playerResources[faction]
        
        for (const [resource, amount] of Object.entries(generation)) {
          playerResources[resource as ResourceType] = 
            (playerResources[resource as ResourceType] || 0) + amount
        }
      }
      
      // Also generate from terrain
      const terrainGeneration = getTerrainProperties(tile.terrain).resourceGeneration
      if (terrainGeneration && tile.controlledBy !== Faction.NEUTRAL) {
        const faction = tile.controlledBy
        const playerResources = this.state.playerResources[faction]
        
        for (const [resource, amount] of Object.entries(terrainGeneration)) {
          playerResources[resource as ResourceType] = 
            (playerResources[resource as ResourceType] || 0) + amount
        }
      }
    }
  }

  /**
   * Process building construction
   */
  private processConstruction(): void {
    for (const tile of this.state.tiles.values()) {
      if (tile.building && tile.building.constructionProgress !== undefined) {
        const buildingProps = getBuildingProperties(tile.building.type)
        const progressPerTurn = 100 / buildingProps.buildTime
        
        tile.building.constructionProgress += progressPerTurn
        
        if (tile.building.constructionProgress >= 100) {
          delete tile.building.constructionProgress
          this.addNotification(
            `${buildingProps.name} construction completed!`,
            'success'
          )
        }
      }
    }
  }

  /**
   * Restore movement points for all armies
   */
  private restoreMovementPoints(): void {
    for (const tile of this.state.tiles.values()) {
      if (tile.army) {
        tile.army.movementPoints = tile.army.maxMovementPoints
      }
    }
  }

  /**
   * Process strategic events
   */
  private processEvents(): void {
    // Process active events
    this.state.activeEvents = this.state.activeEvents.filter(event => {
      event.turnsActive++
      
      if (event.maxTurns && event.turnsActive >= event.maxTurns) {
        this.addNotification(`Event "${event.name}" has ended`, 'info')
        return false
      }
      
      return true
    })
    
    // Add new random events occasionally
    if (Math.random() < 0.1) { // 10% chance per turn
      this.generateRandomEvent()
    }
  }

  /**
   * Generate random strategic event
   */
  private generateRandomEvent(): void {
    const events = [
      {
        id: 'bandit_raid',
        name: 'Bandit Raid',
        description: 'Bandits have raided a settlement, stealing resources.',
        resourceChanges: { [ResourceType.GOLD]: -50, [ResourceType.FOOD]: -25 },
        turnsActive: 0,
        maxTurns: 1
      },
      {
        id: 'good_harvest',
        name: 'Good Harvest',
        description: 'A bountiful harvest increases food production.',
        resourceChanges: { [ResourceType.FOOD]: 100 },
        turnsActive: 0,
        maxTurns: 1
      },
      {
        id: 'merchant_caravan',
        name: 'Merchant Caravan',
        description: 'A merchant caravan offers trade opportunities.',
        resourceChanges: { [ResourceType.GOLD]: 75 },
        turnsActive: 0,
        maxTurns: 1
      }
    ]
    
    const event = events[Math.floor(Math.random() * events.length)]
    
    // Apply resource changes
    if (event.resourceChanges) {
      const playerResources = this.state.playerResources[Faction.PLAYER]
      for (const [resource, change] of Object.entries(event.resourceChanges)) {
        playerResources[resource as ResourceType] = 
          Math.max(0, (playerResources[resource as ResourceType] || 0) + change)
      }
    }
    
    this.state.activeEvents.push(event)
    this.addNotification(event.description, 'info')
  }

  /**
   * Check victory conditions
   */
  private checkVictoryConditions(): void {
    if (this.state.gameEnded) return
    
    for (const condition of this.state.victoryConditions) {
      switch (condition) {
        case VictoryCondition.CONQUEST:
          if (this.checkConquestVictory()) {
            this.state.gameEnded = true
            this.state.winner = Faction.PLAYER
            this.addNotification('Victory! You have conquered all enemy settlements!', 'success')
          }
          break
      }
    }
  }

  /**
   * Check conquest victory condition
   */
  private checkConquestVictory(): boolean {
    let playerSettlements = 0
    let enemySettlements = 0
    
    for (const tile of this.state.tiles.values()) {
      if (tile.building?.type === BuildingType.SETTLEMENT) {
        if (tile.building.faction === Faction.PLAYER) {
          playerSettlements++
        } else if (tile.building.faction === Faction.ENEMY) {
          enemySettlements++
        }
      }
    }
    
    return enemySettlements === 0 && playerSettlements > 0
  }

  /**
   * Add notification
   */
  private addNotification(message: string, type: 'info' | 'warning' | 'success' | 'error'): void {
    this.state.notifications.push({
      message,
      type,
      turn: this.state.currentTurn
    })
    
    // Keep only last 20 notifications
    if (this.state.notifications.length > 20) {
      this.state.notifications = this.state.notifications.slice(-20)
    }
  }

  /**
   * Get current game state
   */
  public getState(): OverworldState {
    return { ...this.state }
  }

  /**
   * Get player resources
   */
  public getPlayerResources(faction: Faction): Partial<Record<ResourceType, number>> {
    return { ...this.state.playerResources[faction] }
  }



  /**
   * Place army on map
   */
  public placeArmy(coordinate: HexCoordinate, squads: Squad[], faction: Faction): boolean {
    const tile = this.getTile(coordinate)
    if (!tile || tile.army) {
      return false
    }
    
    tile.army = {
      squads,
      faction,
      movementPoints: 3,
      maxMovementPoints: 3
    }
    
    return true
  }

  /**
   * Remove army from map
   */
  public removeArmy(coordinate: HexCoordinate): boolean {
    const tile = this.getTile(coordinate)
    if (!tile || !tile.army) {
      return false
    }
    
    delete tile.army
    return true
  }

  /**
   * Get current turn
   */
  public getCurrentTurn(): number {
    return this.state.currentTurn
  }

  /**
   * Get active player
   */
  public getActivePlayer(): Faction {
    return this.state.activePlayer
  }

  /**
   * Get recent notifications
   */
  public getNotifications(count: number = 10): Array<{
    message: string
    type: 'info' | 'warning' | 'success' | 'error'
    turn: number
  }> {
    return this.state.notifications.slice(-count)
  }

  /**
   * Get building bonuses for a squad at a specific location
   */
  public getSquadBuildingBonuses(coordinate: HexCoordinate, faction: Faction = Faction.PLAYER): SquadBuildingBonuses {
    return calculateSquadBuildingBonuses(coordinate, this.state.tiles, faction)
  }

  /**
   * Apply building effects to all squads on the map
   */
  public applyBuildingEffectsToSquads(): void {
    for (const tile of this.state.tiles.values()) {
      if (tile.army && tile.army.squads.length > 0) {
        const bonuses = this.getSquadBuildingBonuses(tile.coordinate, tile.army.faction)
        
        // Apply bonuses to each squad
        tile.army.squads.forEach(squad => {
          applyBuildingBonusesToSquad(squad, bonuses)
        })

        // Add notification if significant bonuses are active
        if (bonuses.healingPerTurn > 0 || Object.keys(bonuses.statBonuses).length > 0) {
          const buildingNames = bonuses.activeBuildings.map(b => b.buildingType).join(', ')
          this.addNotification(
            `Squad at ${hexToKey(tile.coordinate)} receives bonuses from nearby buildings: ${buildingNames}`,
            'info'
          )
        }
      }
    }
  }

  /**
   * Get all squads with their current building bonuses
   */
  public getSquadsWithBonuses(): Array<{
    coordinate: HexCoordinate
    squads: Squad[]
    bonuses: SquadBuildingBonuses
    faction: Faction
  }> {
    const result: Array<{
      coordinate: HexCoordinate
      squads: Squad[]
      bonuses: SquadBuildingBonuses
      faction: Faction
    }> = []

    for (const tile of this.state.tiles.values()) {
      if (tile.army && tile.army.squads.length > 0) {
        const bonuses = this.getSquadBuildingBonuses(tile.coordinate, tile.army.faction)
        
        result.push({
          coordinate: tile.coordinate,
          squads: tile.army.squads,
          bonuses,
          faction: tile.army.faction
        })
      }
    }

    return result
  }

  /**
   * Get all tiles controlled by a faction
   */
  public getTilesByFaction(faction: Faction): MapTile[] {
    const tiles: MapTile[] = []
    
    for (const tile of this.state.tiles.values()) {
      if (tile.controlledBy === faction) {
        tiles.push(tile)
      }
    }
    
    return tiles
  }

  /**
   * Get all buildings owned by a faction
   */
  public getBuildingsByFaction(faction: Faction): Array<{
    coordinate: HexCoordinate
    building: NonNullable<MapTile['building']>
  }> {
    const buildings: Array<{
      coordinate: HexCoordinate
      building: NonNullable<MapTile['building']>
    }> = []
    
    for (const tile of this.state.tiles.values()) {
      if (tile.building && tile.building.faction === faction) {
        buildings.push({
          coordinate: tile.coordinate,
          building: tile.building
        })
      }
    }
    
    return buildings
  }
}