import {
  HexCoordinate,
  MapTile,
  MovementPath,
  Faction,
  OverworldBattle
} from './types'
import { Squad } from '../squads'
import { Archetype, Race } from '../units/types'
import { PathfindingSystem } from './PathfindingSystem'
import { hexToKey, hexDistance } from './HexUtils'
import { calculateMovementCost } from './TerrainData'

export interface ArmyMovementResult {
  success: boolean
  newPosition?: HexCoordinate
  remainingMovement: number
  battleTriggered?: OverworldBattle
  message: string
}

export interface MovementOrder {
  armyId: string
  from: HexCoordinate
  to: HexCoordinate
  faction: Faction
  squads: Squad[]
  movementPoints: number
}

/**
 * Advanced army movement system with pathfinding and tactical considerations
 */
export class ArmyMovementSystem {
  /**
   * Execute army movement with pathfinding
   */
  public static executeMovement(
    order: MovementOrder,
    tiles: Map<string, MapTile>
  ): ArmyMovementResult {
    const fromTile = tiles.get(hexToKey(order.from))
    const toTile = tiles.get(hexToKey(order.to))

    if (!fromTile || !toTile) {
      return {
        success: false,
        remainingMovement: order.movementPoints,
        message: 'Invalid movement: tile does not exist'
      }
    }

    // Verify army exists at source
    if (!fromTile.army || fromTile.army.faction !== order.faction) {
      return {
        success: false,
        remainingMovement: order.movementPoints,
        message: 'No army found at source location'
      }
    }

    // Find optimal path
    const path = PathfindingSystem.findPath(
      order.from,
      order.to,
      tiles,
      {
        faction: order.faction,
        maxDistance: order.movementPoints,
        avoidEnemies: false // Allow moving into combat
      }
    )

    if (!path.isValid) {
      return {
        success: false,
        remainingMovement: order.movementPoints,
        message: `Movement blocked: ${path.blockedBy}`
      }
    }

    // Check if we have enough movement points
    if (path.totalCost > order.movementPoints) {
      // Try to move as far as possible along the path
      return this.executePartialMovement(order, path, tiles)
    }

    // Check for enemy army at destination
    if (toTile.army && toTile.army.faction !== order.faction) {
      const battle: OverworldBattle = {
        location: order.to,
        attacker: {
          squads: order.squads,
          faction: order.faction
        },
        defender: {
          squads: toTile.army.squads,
          faction: toTile.army.faction
        },
        terrain: toTile.terrain,
        building: toTile.building?.type,
        isSeige: !!toTile.building
      }

      return {
        success: true,
        newPosition: order.to,
        remainingMovement: order.movementPoints - path.totalCost,
        battleTriggered: battle,
        message: `Army moved to ${hexToKey(order.to)} and engaged enemy forces`
      }
    }

    // Execute successful movement
    this.moveArmyToTile(fromTile, toTile, order.squads, order.faction)

    // Capture neutral territory
    if (toTile.controlledBy === Faction.NEUTRAL) {
      toTile.controlledBy = order.faction
    }

    return {
      success: true,
      newPosition: order.to,
      remainingMovement: order.movementPoints - path.totalCost,
      message: `Army successfully moved to ${hexToKey(order.to)}`
    }
  }

  /**
   * Execute partial movement when full path is not possible
   */
  private static executePartialMovement(
    order: MovementOrder,
    fullPath: MovementPath,
    tiles: Map<string, MapTile>
  ): ArmyMovementResult {
    let currentPos = order.from
    let remainingMovement = order.movementPoints
    let pathIndex = 1 // Skip starting position

    while (pathIndex < fullPath.tiles.length && remainingMovement > 0) {
      const nextPos = fullPath.tiles[pathIndex]
      const nextTile = tiles.get(hexToKey(nextPos))

      if (!nextTile) break

      const moveCost = calculateMovementCost(nextTile.terrain)

      if (moveCost > remainingMovement) {
        break // Can't afford this move
      }

      // Check for enemy army
      if (nextTile.army && nextTile.army.faction !== order.faction) {
        // Stop before enemy army if we can't engage
        break
      }

      currentPos = nextPos
      remainingMovement -= moveCost
      pathIndex++
    }

    if (currentPos.q === order.from.q && currentPos.r === order.from.r) {
      return {
        success: false,
        remainingMovement: order.movementPoints,
        message: 'Insufficient movement points for any progress'
      }
    }

    // Move army to furthest reachable position
    const fromTile = tiles.get(hexToKey(order.from))!
    const toTile = tiles.get(hexToKey(currentPos))!

    this.moveArmyToTile(fromTile, toTile, order.squads, order.faction)

    return {
      success: true,
      newPosition: currentPos,
      remainingMovement,
      message: `Army moved as far as possible to ${hexToKey(currentPos)}`
    }
  }

  /**
   * Move army from one tile to another
   */
  private static moveArmyToTile(
    fromTile: MapTile,
    toTile: MapTile,
    squads: Squad[],
    faction: Faction
  ): void {
    // Remove army from source
    delete fromTile.army

    // Add army to destination
    toTile.army = {
      squads,
      faction,
      movementPoints: 0, // Will be set by caller
      maxMovementPoints: 3 // Default, should be calculated based on army composition
    }
  }

  /**
   * Get all valid movement destinations for an army
   */
  public static getValidMovementDestinations(
    armyPosition: HexCoordinate,
    movementPoints: number,
    tiles: Map<string, MapTile>,
    faction: Faction
  ): Array<{
    coordinate: HexCoordinate
    movementCost: number
    canEngage: boolean
    tacticalValue: number
  }> {
    try {
      const reachableTiles = PathfindingSystem.findReachableTiles(
        armyPosition,
        movementPoints,
        tiles,
        { faction, avoidEnemies: false }
      )

      return reachableTiles
        .filter(reachable => {
          return reachable && 
                 reachable.coordinate && 
                 typeof reachable.coordinate.q === 'number' && 
                 typeof reachable.coordinate.r === 'number'
        })
        .map(reachable => {
          const tile = tiles.get(hexToKey(reachable.coordinate))
          if (!tile) {
            console.warn(`Tile not found for coordinate: ${hexToKey(reachable.coordinate)}`)
            return null
          }
          
          const canEngage = !!(tile.army && tile.army.faction !== faction)

          // Calculate tactical value
          let tacticalValue = 0

          // Strategic buildings are valuable
          if (tile.building) {
            tacticalValue += 30
          }

          // Controlling territory is valuable
          if (tile.controlledBy === Faction.NEUTRAL) {
            tacticalValue += 10
          } else if (tile.controlledBy !== faction) {
            tacticalValue += 20 // Taking enemy territory
          }

          // Terrain advantages
          if (tile.terrain === 'hills' || tile.terrain === 'mountains') {
            tacticalValue += 15
          }

          // Enemy armies are high priority targets
          if (canEngage) {
            tacticalValue += 50
          }

          return {
            coordinate: reachable.coordinate,
            movementCost: reachable.cost,
            canEngage,
            tacticalValue
          }
        })
        .filter(result => result !== null) // Remove null results
        .sort((a, b) => b.tacticalValue - a.tacticalValue)
    } catch (error) {
      console.error('Error in getValidMovementDestinations:', error)
      return []
    }
  }

  /**
   * Calculate army movement range based on composition
   */
  public static calculateArmyMovementRange(squads: Squad[]): number {
    if (squads.length === 0) return 0

    // Base movement is 3, modified by army composition
    let baseMovement = 3
    let totalUnits = 0
    let cavalryUnits = 0
    let heavyUnits = 0

    for (const squad of squads) {
      const units = squad.getUnits()
      totalUnits += units.length

      for (const unit of units) {
        // Count cavalry for movement bonus (Knights and flying races)
        if (unit.archetype === Archetype.KNIGHT || unit.race === Race.GRIFFON) {
          cavalryUnits++
        }

        // Count heavy units for movement penalty
        if (unit.archetype === Archetype.KNIGHT ||
          unit.archetype === Archetype.HEAVY_INFANTRY) {
          heavyUnits++
        }
      }
    }

    // Cavalry increases movement
    const cavalryRatio = cavalryUnits / totalUnits
    if (cavalryRatio >= 0.5) {
      baseMovement += 2 // Fast army
    } else if (cavalryRatio >= 0.25) {
      baseMovement += 1 // Mixed army
    }

    // Heavy units decrease movement
    const heavyRatio = heavyUnits / totalUnits
    if (heavyRatio >= 0.5) {
      baseMovement -= 1 // Slow army
    }

    return Math.max(1, baseMovement)
  }

  /**
   * Plan multi-turn movement strategy
   */
  public static planMultiTurnMovement(
    start: HexCoordinate,
    goal: HexCoordinate,
    movementPerTurn: number,
    tiles: Map<string, MapTile>,
    faction: Faction,
    maxTurns: number = 10
  ): Array<{
    turn: number
    position: HexCoordinate
    movementCost: number
    actions: string[]
  }> {
    const plan: Array<{
      turn: number
      position: HexCoordinate
      movementCost: number
      actions: string[]
    }> = []

    let currentPos = start
    let turn = 1

    while (turn <= maxTurns) {
      const distance = hexDistance(currentPos, goal)
      if (distance === 0) {
        break // Reached goal
      }

      // Find best position we can reach this turn
      const reachable = PathfindingSystem.findReachableTiles(
        currentPos,
        movementPerTurn,
        tiles,
        { faction, avoidEnemies: true }
      )

      // Find the reachable tile closest to goal
      let bestMove = reachable[0]
      let bestDistance = Infinity

      for (const tile of reachable) {
        const distanceToGoal = hexDistance(tile.coordinate, goal)
        if (distanceToGoal < bestDistance) {
          bestDistance = distanceToGoal
          bestMove = tile
        }
      }

      if (!bestMove) {
        // No valid moves, path is blocked
        plan.push({
          turn,
          position: currentPos,
          movementCost: 0,
          actions: ['Path blocked - consider alternative route']
        })
        break
      }

      const actions: string[] = []
      const tile = tiles.get(hexToKey(bestMove.coordinate))

      if (tile) {
        if (tile.controlledBy === Faction.NEUTRAL) {
          actions.push('Capture neutral territory')
        }

        if (tile.building && tile.building.faction !== faction) {
          actions.push(`Capture ${tile.building.type}`)
        }

        if (tile.army && tile.army.faction !== faction) {
          actions.push('Engage enemy army')
        }
      }

      plan.push({
        turn,
        position: bestMove.coordinate,
        movementCost: bestMove.cost,
        actions
      })

      currentPos = bestMove.coordinate
      turn++
    }

    return plan
  }

  /**
   * Analyze strategic movement options
   */
  public static analyzeStrategicOptions(
    armyPosition: HexCoordinate,
    movementPoints: number,
    tiles: Map<string, MapTile>,
    faction: Faction
  ): {
    offensiveTargets: Array<{ coordinate: HexCoordinate; priority: number; reason: string }>
    defensivePositions: Array<{ coordinate: HexCoordinate; value: number; reason: string }>
    economicTargets: Array<{ coordinate: HexCoordinate; value: number; reason: string }>
  } {
    const destinations = this.getValidMovementDestinations(
      armyPosition,
      movementPoints,
      tiles,
      faction
    )

    const offensiveTargets: Array<{ coordinate: HexCoordinate; priority: number; reason: string }> = []
    const defensivePositions: Array<{ coordinate: HexCoordinate; value: number; reason: string }> = []
    const economicTargets: Array<{ coordinate: HexCoordinate; value: number; reason: string }> = []

    for (const dest of destinations) {
      const tile = tiles.get(hexToKey(dest.coordinate))!

      // Offensive targets
      if (dest.canEngage) {
        offensiveTargets.push({
          coordinate: dest.coordinate,
          priority: 100 - dest.movementCost,
          reason: 'Enemy army present'
        })
      }

      if (tile.building && tile.building.faction !== faction) {
        offensiveTargets.push({
          coordinate: dest.coordinate,
          priority: 80 - dest.movementCost,
          reason: `Enemy ${tile.building.type}`
        })
      }

      // Defensive positions
      if (tile.terrain === 'hills' || tile.terrain === 'mountains') {
        defensivePositions.push({
          coordinate: dest.coordinate,
          value: 70,
          reason: 'High ground advantage'
        })
      }

      if (tile.building && tile.building.faction === faction) {
        defensivePositions.push({
          coordinate: dest.coordinate,
          value: 60,
          reason: 'Friendly fortification'
        })
      }

      // Economic targets
      if (tile.controlledBy === Faction.NEUTRAL) {
        economicTargets.push({
          coordinate: dest.coordinate,
          value: 40,
          reason: 'Unclaimed territory'
        })
      }

      if (tile.building?.type === 'mine' || tile.building?.type === 'farm') {
        economicTargets.push({
          coordinate: dest.coordinate,
          value: 50,
          reason: `Resource building: ${tile.building.type}`
        })
      }
    }

    return {
      offensiveTargets: offensiveTargets.sort((a, b) => b.priority - a.priority),
      defensivePositions: defensivePositions.sort((a, b) => b.value - a.value),
      economicTargets: economicTargets.sort((a, b) => b.value - a.value)
    }
  }
}