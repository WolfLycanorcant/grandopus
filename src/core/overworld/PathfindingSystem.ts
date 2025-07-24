import {
  HexCoordinate,
  MovementPath,
  PathfindingOptions,
  MapTile,
  Faction
} from './types'
import {
  hexDistance,
  getHexNeighbors,
  hexToKey
} from './HexUtils'
import { calculateMovementCost, isTerrainPassable } from './TerrainData'

/**
 * A* pathfinding implementation for hex grids
 */
export class PathfindingSystem {
  /**
   * Find optimal path between two hexes
   */
  public static findPath(
    start: HexCoordinate,
    goal: HexCoordinate,
    tiles: Map<string, MapTile>,
    options: PathfindingOptions
  ): MovementPath {
    const openSet = new Set<string>()
    const closedSet = new Set<string>()
    const cameFrom = new Map<string, string>()
    const gScore = new Map<string, number>()
    const fScore = new Map<string, number>()

    const startKey = hexToKey(start)
    const goalKey = hexToKey(goal)

    openSet.add(startKey)
    gScore.set(startKey, 0)
    fScore.set(startKey, hexDistance(start, goal))

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let current = ''
      let lowestF = Infinity

      for (const node of openSet) {
        const f = fScore.get(node) || Infinity
        if (f < lowestF) {
          lowestF = f
          current = node
        }
      }

      if (current === goalKey) {
        // Path found, reconstruct it
        return this.reconstructPath(cameFrom, current, tiles)
      }

      openSet.delete(current)
      closedSet.add(current)

      const currentCoord = this.keyToCoordinate(current)
      const neighbors = getHexNeighbors(currentCoord)

      for (const neighbor of neighbors) {
        const neighborKey = hexToKey(neighbor)

        if (closedSet.has(neighborKey)) {
          continue
        }

        const tile = tiles.get(neighborKey)
        if (!tile) {
          continue // Tile doesn't exist
        }

        // Check if movement is valid
        const movementCheck = this.isMovementValid(tile, options)
        if (!movementCheck.valid) {
          continue
        }

        const movementCost = movementCheck.cost
        const tentativeG = (gScore.get(current) || 0) + movementCost

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey)
        } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
          continue
        }

        cameFrom.set(neighborKey, current)
        gScore.set(neighborKey, tentativeG)
        fScore.set(neighborKey, tentativeG + hexDistance(neighbor, goal))

        // Check distance limit
        if (options.maxDistance && tentativeG > options.maxDistance) {
          continue
        }
      }
    }

    // No path found
    return {
      tiles: [],
      totalCost: 0,
      isValid: false,
      blockedBy: 'No valid path found'
    }
  }

  /**
   * Find all reachable tiles within movement range
   */
  public static findReachableTiles(
    start: HexCoordinate,
    maxMovement: number,
    tiles: Map<string, MapTile>,
    options: PathfindingOptions
  ): Array<{ coordinate: HexCoordinate; cost: number }> {
    const reachable: Array<{ coordinate: HexCoordinate; cost: number }> = []
    const visited = new Set<string>()
    const queue: Array<{ coord: HexCoordinate; cost: number }> = [
      { coord: start, cost: 0 }
    ]

    while (queue.length > 0) {
      const current = queue.shift()!
      const currentKey = hexToKey(current.coord)

      if (visited.has(currentKey)) {
        continue
      }

      visited.add(currentKey)

      if (current.cost <= maxMovement) {
        reachable.push({ coordinate: current.coord, cost: current.cost })
      }

      if (current.cost >= maxMovement) {
        continue
      }

      const neighbors = getHexNeighbors(current.coord)

      for (const neighbor of neighbors) {
        const neighborKey = hexToKey(neighbor)

        if (visited.has(neighborKey)) {
          continue
        }

        const tile = tiles.get(neighborKey)
        if (!tile) {
          continue
        }

        const movementCheck = this.isMovementValid(tile, options)
        if (!movementCheck.valid) {
          continue
        }

        const newCost = current.cost + movementCheck.cost

        if (newCost <= maxMovement) {
          queue.push({ coord: neighbor, cost: newCost })
        }
      }
    }

    return reachable.filter(r => !(r.coordinate.q === start.q && r.coordinate.r === start.r))
  }

  /**
   * Check if movement to a tile is valid
   */
  private static isMovementValid(
    tile: MapTile,
    options: PathfindingOptions
  ): { valid: boolean; cost: number; reason?: string } {
    // Check terrain passability
    if (!isTerrainPassable(tile.terrain, options.requiresSpecialMovement || [])) {
      return {
        valid: false,
        cost: 0,
        reason: `Terrain ${tile.terrain} is not passable`
      }
    }

    // Check for enemy armies
    if (options.avoidEnemies && tile.army && tile.army.faction !== options.faction) {
      return {
        valid: false,
        cost: 0,
        reason: 'Enemy army blocks movement'
      }
    }

    // Calculate movement cost
    const cost = calculateMovementCost(tile.terrain, options.requiresSpecialMovement || [])

    return { valid: true, cost }
  }

  /**
   * Reconstruct path from A* algorithm
   */
  private static reconstructPath(
    cameFrom: Map<string, string>,
    current: string,
    tiles: Map<string, MapTile>
  ): MovementPath {
    const path: HexCoordinate[] = []
    let totalCost = 0
    let currentKey = current

    while (currentKey) {
      const coord = this.keyToCoordinate(currentKey)
      path.unshift(coord)

      const tile = tiles.get(currentKey)
      if (tile && path.length > 1) {
        totalCost += calculateMovementCost(tile.terrain)
      }

      currentKey = cameFrom.get(currentKey) || ''
    }

    return {
      tiles: path,
      totalCost,
      isValid: true
    }
  }

  /**
   * Convert string key back to coordinate
   */
  private static keyToCoordinate(key: string): HexCoordinate {
    const [q, r] = key.split(',').map(Number)
    return { q, r }
  }

  /**
   * Calculate movement cost for entire path
   */
  public static calculatePathCost(
    path: HexCoordinate[],
    tiles: Map<string, MapTile>,
    specialMovement: string[] = []
  ): number {
    let totalCost = 0

    for (let i = 1; i < path.length; i++) {
      const tile = tiles.get(hexToKey(path[i]))
      if (tile) {
        totalCost += calculateMovementCost(tile.terrain, specialMovement)
      }
    }

    return totalCost
  }

  /**
   * Find shortest path between multiple waypoints
   */
  public static findMultiWaypointPath(
    waypoints: HexCoordinate[],
    tiles: Map<string, MapTile>,
    options: PathfindingOptions
  ): MovementPath {
    if (waypoints.length < 2) {
      return {
        tiles: waypoints,
        totalCost: 0,
        isValid: waypoints.length === 1,
        blockedBy: waypoints.length === 0 ? 'No waypoints provided' : undefined
      }
    }

    const fullPath: HexCoordinate[] = []
    let totalCost = 0

    for (let i = 0; i < waypoints.length - 1; i++) {
      const segmentPath = this.findPath(waypoints[i], waypoints[i + 1], tiles, options)

      if (!segmentPath.isValid) {
        return {
          tiles: [],
          totalCost: 0,
          isValid: false,
          blockedBy: `Path blocked between waypoint ${i} and ${i + 1}: ${segmentPath.blockedBy}`
        }
      }

      // Add segment to full path (avoid duplicating waypoints)
      if (i === 0) {
        fullPath.push(...segmentPath.tiles)
      } else {
        fullPath.push(...segmentPath.tiles.slice(1))
      }

      totalCost += segmentPath.totalCost
    }

    return {
      tiles: fullPath,
      totalCost,
      isValid: true
    }
  }

  /**
   * Find tactical positions around a target
   */
  public static findTacticalPositions(
    target: HexCoordinate,
    range: number,
    tiles: Map<string, MapTile>,
    options: PathfindingOptions
  ): Array<{
    coordinate: HexCoordinate
    tacticalValue: number
    canReach: boolean
    movementCost: number
  }> {
    const positions: Array<{
      coordinate: HexCoordinate
      tacticalValue: number
      canReach: boolean
      movementCost: number
    }> = []

    // Get all neighbors within range
    const neighbors = getHexNeighbors(target)

    for (const neighbor of neighbors) {
      const tile = tiles.get(hexToKey(neighbor))
      if (!tile) continue

      // Calculate tactical value based on terrain and position
      let tacticalValue = 0

      // Higher ground gives advantage
      if (tile.terrain === 'hills' || tile.terrain === 'mountains') {
        tacticalValue += 20
      }

      // Cover provides defensive bonus
      if (tile.terrain === 'forest') {
        tacticalValue += 15
      }

      // Buildings provide strategic value
      if (tile.building) {
        tacticalValue += 25
      }

      // Avoid enemy-controlled territory
      if (tile.controlledBy !== options.faction && tile.controlledBy !== Faction.NEUTRAL) {
        tacticalValue -= 30
      }

      // Check if position is reachable
      const movementCheck = this.isMovementValid(tile, options)

      positions.push({
        coordinate: neighbor,
        tacticalValue,
        canReach: movementCheck.valid,
        movementCost: movementCheck.cost
      })
    }

    // Sort by tactical value
    return positions.sort((a, b) => b.tacticalValue - a.tacticalValue)
  }

  /**
   * Calculate zone of control for an army
   */
  public static calculateZoneOfControl(
    armyPosition: HexCoordinate,
    movementRange: number,
    tiles: Map<string, MapTile>,
    faction: Faction
  ): Set<string> {
    const zoneOfControl = new Set<string>()

    const reachableTiles = this.findReachableTiles(
      armyPosition,
      movementRange,
      tiles,
      { faction, avoidEnemies: false }
    )

    for (const reachable of reachableTiles) {
      // Add the tile itself
      zoneOfControl.add(hexToKey(reachable.coordinate))

      // Add adjacent tiles (threatened squares)
      const neighbors = getHexNeighbors(reachable.coordinate)
      for (const neighbor of neighbors) {
        if (tiles.has(hexToKey(neighbor))) {
          zoneOfControl.add(hexToKey(neighbor))
        }
      }
    }

    return zoneOfControl
  }
}