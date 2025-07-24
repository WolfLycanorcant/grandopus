import { AIFactionManager } from './AIFactionManager'
import { AIPersonality, AIDifficulty, AIActionResult, AIEvent, AIEventType } from './types'
import { OverworldManager } from '../overworld/OverworldManager'
import { Faction, ResourceType, BuildingType, HexCoordinate } from '../overworld/types'
import { Squad, SquadFactory, SQUAD_PRESETS } from '../squads'
import { UnitFactory } from '../units'

/**
 * AI Integration - Connects AI system with game systems
 */
export class AIIntegration {
  private aiManager: AIFactionManager
  private overworldManager: OverworldManager
  private aiUpdateInterval: number | null = null

  constructor(overworldManager: OverworldManager) {
    this.aiManager = new AIFactionManager()
    this.overworldManager = overworldManager
  }

  /**
   * Initialize AI factions for the game
   */
  public initializeAIFactions(): void {
    // Initialize enemy AI faction
    this.aiManager.initializeFaction(
      Faction.ENEMY,
      AIPersonality.AGGRESSIVE,
      AIDifficulty.NORMAL
    )

    // Create starting AI armies and deploy them
    this.createAIStartingForces(Faction.ENEMY)

    // Set up periodic AI updates
    this.startAIUpdates()
  }

  /**
   * Create starting forces for AI faction
   */
  private createAIStartingForces(faction: Faction): void {
    try {
      // Create AI squads using presets
      const aiSquads = [
        SquadFactory.createFromPreset(SQUAD_PRESETS.BALANCED_STARTER, `${faction} Guard`),
        SquadFactory.createFromPreset(SQUAD_PRESETS.ELITE_KNIGHTS, `${faction} Assault`)
      ]

      // Find suitable deployment locations for AI
      const aiDeploymentSites = this.findAIDeploymentSites(faction)

      // Deploy AI squads
      aiSquads.forEach((squad, index) => {
        if (index < aiDeploymentSites.length) {
          const success = this.overworldManager.placeArmy(
            aiDeploymentSites[index],
            [squad],
            faction
          )

          if (success) {
            console.log(`AI ${faction} deployed ${squad.name} at (${aiDeploymentSites[index].q}, ${aiDeploymentSites[index].r})`)
          }
        }
      })

      // Build initial AI structures
      this.createAIStartingBuildings(faction, aiDeploymentSites)

    } catch (error) {
      console.error(`Failed to create AI starting forces for ${faction}:`, error)
    }
  }

  /**
   * Find suitable deployment sites for AI faction
   */
  private findAIDeploymentSites(faction: Faction): Array<{ q: number; r: number }> {
    const state = this.overworldManager.getState()
    const sites: Array<{ q: number; r: number }> = []

    // Look for neutral territories away from player
    state.tiles.forEach(tile => {
      if (tile.controlledBy === Faction.NEUTRAL && !tile.army) {
        // Check if it's far enough from player territories
        const nearPlayerTerritory = this.isNearFaction(tile.coordinate, Faction.PLAYER, state.tiles, 3)

        if (!nearPlayerTerritory && sites.length < 3) {
          sites.push(tile.coordinate)
        }
      }
    })

    return sites
  }

  /**
   * Create initial buildings for AI faction
   */
  private createAIStartingBuildings(faction: Faction, deploymentSites: Array<{ q: number; r: number }>): void {
    // Build a settlement near the first deployment site
    if (deploymentSites.length > 0) {
      const buildingSite = deploymentSites[0]
      const success = this.overworldManager.buildStructure(buildingSite, BuildingType.SETTLEMENT, faction)

      if (success) {
        console.log(`AI ${faction} built settlement at (${buildingSite.q}, ${buildingSite.r})`)

        // Claim the territory
        const tile = this.overworldManager.getTile(buildingSite)
        if (tile) {
          tile.controlledBy = faction
        }
      }
    }
  }

  /**
   * Check if coordinate is near a specific faction's territory
   */
  private isNearFaction(
    coordinate: { q: number; r: number },
    faction: Faction,
    tiles: Map<string, any>,
    maxDistance: number
  ): boolean {
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ]

    // BFS to check nearby tiles
    const visited = new Set<string>()
    const queue = [{ coord: coordinate, distance: 0 }]

    while (queue.length > 0) {
      const { coord, distance } = queue.shift()!
      const key = `${coord.q},${coord.r}`

      if (visited.has(key) || distance > maxDistance) continue
      visited.add(key)

      const tile = tiles.get(key)
      if (tile && tile.controlledBy === faction) {
        return true
      }

      if (distance < maxDistance) {
        for (const dir of directions) {
          queue.push({
            coord: { q: coord.q + dir.q, r: coord.r + dir.r },
            distance: distance + 1
          })
        }
      }
    }

    return false
  }

  /**
   * Start periodic AI updates
   */
  private startAIUpdates(): void {
    // Update AI every 2 seconds (can be adjusted)
    this.aiUpdateInterval = window.setInterval(() => {
      this.updateAI()
    }, 2000)
  }

  /**
   * Stop AI updates
   */
  public stopAIUpdates(): void {
    if (this.aiUpdateInterval) {
      clearInterval(this.aiUpdateInterval)
      this.aiUpdateInterval = null
    }
  }

  /**
   * Update AI factions
   */
  private updateAI(): void {
    const state = this.overworldManager.getState()

    // Only update AI on AI turns or periodically
    if (state.activePlayer !== Faction.PLAYER) {
      this.executeAITurn(Faction.ENEMY)
    }
  }

  /**
   * Execute AI turn for a faction
   */
  public executeAITurn(faction: Faction): void {
    try {
      const state = this.overworldManager.getState()
      const partialResources = this.overworldManager.getPlayerResources(faction)

      // Convert partial resources to complete record with defaults
      const playerResources: Record<ResourceType, number> = {
        [ResourceType.GOLD]: partialResources[ResourceType.GOLD] || 0,
        [ResourceType.WOOD]: partialResources[ResourceType.WOOD] || 0,
        [ResourceType.STONE]: partialResources[ResourceType.STONE] || 0,
        [ResourceType.STEEL]: partialResources[ResourceType.STEEL] || 0,
        [ResourceType.FOOD]: partialResources[ResourceType.FOOD] || 0,
        [ResourceType.MANA_CRYSTALS]: partialResources[ResourceType.MANA_CRYSTALS] || 0,
        [ResourceType.HORSES]: partialResources[ResourceType.HORSES] || 0
      }

      // Execute AI decisions
      const results = this.aiManager.executeTurn(faction, state, playerResources)

      // Apply AI decisions to the game world
      this.applyAIResults(faction, results)

      // Log AI actions for debugging
      results.forEach(result => {
        if (result.success) {
          console.log(`AI Action: ${result.message}`)
        } else {
          console.warn(`AI Action Failed: ${result.message}`)
        }
      })

    } catch (error) {
      console.error(`AI turn execution failed for ${faction}:`, error)
    }
  }

  /**
   * Apply AI action results to the game world
   */
  private applyAIResults(faction: Faction, results: AIActionResult[]): void {
    for (const result of results) {
      if (!result.success) continue

      try {
        switch (result.action.type) {
          case 'build_structure':
            this.applyBuildStructure(faction, result)
            break

          case 'move_army':
            this.applyMoveArmy(faction, result)
            break

          case 'attack_target':
            this.applyAttackTarget(faction, result)
            break

          case 'expand_territory':
            this.applyExpandTerritory(faction, result)
            break

          case 'defend_position':
            this.applyDefendPosition(faction, result)
            break
        }
      } catch (error) {
        console.error(`Failed to apply AI result for ${result.action.type}:`, error)
      }
    }
  }

  /**
   * Apply building construction result
   */
  private applyBuildStructure(faction: Faction, result: AIActionResult): void {
    if (!result.action.target || !result.action.buildingType) return

    const success = this.overworldManager.buildStructure(
      result.action.target,
      result.action.buildingType,
      faction
    )

    if (success) {
      // Deduct resources (would need to integrate with AI resource management)
      console.log(`AI ${faction} successfully built ${result.action.buildingType}`)
    }
  }

  /**
   * Apply army movement result
   */
  private applyMoveArmy(faction: Faction, result: AIActionResult): void {
    if (!result.action.target || !result.action.armyId) return

    const state = this.overworldManager.getState()

    // Find the army by scanning tiles for the faction's armies
    let sourceCoordinate: HexCoordinate | null = null
    let armySquads: Squad[] = []

    state.tiles.forEach((tile, key) => {
      if (tile.army && tile.army.faction === faction) {
        // For now, move the first army we find (could be improved with better army tracking)
        if (!sourceCoordinate) {
          const coord = tile.coordinate
          sourceCoordinate = { q: coord.q, r: coord.r }
          armySquads = tile.army.squads
        }
      }
    })

    if (sourceCoordinate && armySquads.length > 0) {
      // Use the actual movement system
      const success = this.overworldManager.moveArmy(sourceCoordinate, result.action.target, faction)

      if (success) {
        const source = sourceCoordinate as HexCoordinate
        const target = result.action.target as HexCoordinate
        console.log(`AI ${faction} moved army from (${source.q}, ${source.r}) to (${target.q}, ${target.r})`)

        // Trigger player event if moving near player territory
        this.handlePlayerAction('army_moved', result.action.target, {
          faction,
          armySize: armySquads.length
        })
      } else {
        const target = result.action.target as HexCoordinate
        console.log(`AI ${faction} failed to move army to (${target.q}, ${target.r})`)
      }
    }
  }

  /**
   * Apply attack target result
   */
  private applyAttackTarget(faction: Faction, result: AIActionResult): void {
    if (!result.action.target) return

    const state = this.overworldManager.getState()
    const targetTile = this.overworldManager.getTile(result.action.target)

    if (!targetTile || !targetTile.army) {
      const target = result.action.target as HexCoordinate
      console.log(`AI ${faction} attack target not found at (${target.q}, ${target.r})`)
      return
    }

    // Find AI army to attack with
    let attackerCoordinate: HexCoordinate | null = null
    let attackerSquads: Squad[] = []

    state.tiles.forEach((tile, key) => {
      if (tile.army && tile.army.faction === faction) {
        // Find closest army to target
        if (!attackerCoordinate) {
          const coord = tile.coordinate
          attackerCoordinate = { q: coord.q, r: coord.r }
          attackerSquads = tile.army.squads
        }
      }
    })

    if (attackerCoordinate && attackerSquads.length > 0) {
      // Move AI army to attack position first
      const moveSuccess = this.overworldManager.moveArmy(attackerCoordinate, result.action.target, faction)

      if (moveSuccess) {
        const attacker = attackerCoordinate as HexCoordinate
        const target = result.action.target as HexCoordinate
        console.log(`AI ${faction} initiated attack from (${attacker.q}, ${attacker.r}) to (${target.q}, ${target.r})`)

        // This would trigger the battle system
        // For now, we'll create a battle event that the game can handle
        this.triggerAIBattle(faction, attackerSquads, targetTile.army.squads, targetTile.army.faction, result.action.target)
      }
    }

    // Generate attack event for AI system
    this.aiManager.addEvent({
      type: AIEventType.TERRITORY_ATTACKED,
      turn: this.overworldManager.getCurrentTurn(),
      location: result.action.target,
      faction: faction,
      severity: 70,
      data: { attackType: 'direct_assault' }
    })
  }

  /**
   * Apply territory expansion result
   */
  private applyExpandTerritory(faction: Faction, result: AIActionResult): void {
    if (!result.action.target) return

    const tile = this.overworldManager.getTile(result.action.target)
    if (tile && tile.controlledBy === Faction.NEUTRAL) {
      tile.controlledBy = faction
      console.log(`AI ${faction} expanded into territory at (${result.action.target.q}, ${result.action.target.r})`)
    }
  }

  /**
   * Apply defensive positioning result
   */
  private applyDefendPosition(faction: Faction, result: AIActionResult): void {
    if (!result.action.target) return

    // This would position armies defensively
    console.log(`AI ${faction} positioned defenses at (${result.action.target.q}, ${result.action.target.r})`)
  }

  /**
   * Handle player actions that might trigger AI events
   */
  public handlePlayerAction(actionType: string, location?: { q: number; r: number }, data?: any): void {
    switch (actionType) {
      case 'army_moved':
        if (location) {
          this.aiManager.addEvent({
            type: AIEventType.ENEMY_ARMY_SPOTTED,
            turn: this.overworldManager.getCurrentTurn(),
            location,
            faction: Faction.PLAYER,
            severity: 50,
            data: data || {}
          })
        }
        break

      case 'territory_captured':
        if (location) {
          this.aiManager.addEvent({
            type: AIEventType.TERRITORY_ATTACKED,
            turn: this.overworldManager.getCurrentTurn(),
            location,
            faction: Faction.PLAYER,
            severity: 60,
            data: data || {}
          })
        }
        break

      case 'building_constructed':
        if (location) {
          this.aiManager.addEvent({
            type: AIEventType.STRATEGIC_POSITION_AVAILABLE,
            turn: this.overworldManager.getCurrentTurn(),
            location,
            faction: Faction.PLAYER,
            severity: 40,
            data: data || {}
          })
        }
        break
    }
  }

  /**
   * Get AI faction status for UI display
   */
  public getAIStatus(faction: Faction): {
    personality: string
    difficulty: string
    threatLevel: number
    territoryCount: number
    armyCount: number
    lastAction: string
  } | null {
    const factionState = this.aiManager.getFactionState(faction)
    if (!factionState) return null

    const state = this.overworldManager.getState()
    let territoryCount = 0
    let armyCount = 0

    state.tiles.forEach(tile => {
      if (tile.controlledBy === faction) territoryCount++
      if (tile.army && tile.army.faction === faction) armyCount++
    })

    const playerThreat = factionState.threatAssessment.get(Faction.PLAYER) || 0

    return {
      personality: factionState.personality,
      difficulty: factionState.difficulty,
      threatLevel: Math.min(100, playerThreat),
      territoryCount,
      armyCount,
      lastAction: factionState.currentTurnPlan[0]?.reasoning || 'Planning...'
    }
  }

  /**
   * Force AI to take immediate action (for testing)
   */
  public forceAIAction(faction: Faction): void {
    this.executeAITurn(faction)
  }

  /**
   * Reset AI system
   */
  public reset(): void {
    this.stopAIUpdates()
    // Would reset AI faction states
  }

  /**
   * Trigger a battle between AI and target forces
   */
  private triggerAIBattle(
    attackerFaction: Faction,
    attackerSquads: Squad[],
    defenderSquads: Squad[],
    defenderFaction: Faction,
    battleLocation: { q: number; r: number }
  ): void {
    console.log(`Battle initiated at (${battleLocation.q}, ${battleLocation.r}): ${attackerFaction} vs ${defenderFaction}`)

    // For now, we'll simulate the battle outcome
    // In a full implementation, this would integrate with the BattleEngine
    const attackerStrength = this.calculateSquadStrength(attackerSquads)
    const defenderStrength = this.calculateSquadStrength(defenderSquads)

    const attackerWins = attackerStrength > defenderStrength * 0.8 // Slight defender advantage

    if (attackerWins) {
      console.log(`AI ${attackerFaction} victory! Captured territory at (${battleLocation.q}, ${battleLocation.r})`)

      // AI captures the territory
      const tile = this.overworldManager.getTile(battleLocation)
      if (tile) {
        tile.controlledBy = attackerFaction
        tile.army = {
          squads: attackerSquads,
          faction: attackerFaction,
          movementPoints: 0,
          maxMovementPoints: 3
        }
      }

      // Generate victory event
      this.aiManager.addEvent({
        type: AIEventType.ENEMY_WEAKNESS_DETECTED,
        turn: this.overworldManager.getCurrentTurn(),
        location: battleLocation,
        faction: defenderFaction,
        severity: 80,
        data: { battleResult: 'victory', capturedTerritory: true }
      })
    } else {
      console.log(`AI ${attackerFaction} defeated at (${battleLocation.q}, ${battleLocation.r})`)

      // Defender keeps territory, attacker retreats
      // In a real implementation, we'd handle casualties and retreats
    }
  }

  /**
   * Calculate total strength of squads for battle simulation
   */
  private calculateSquadStrength(squads: Squad[]): number {
    return squads.reduce((total, squad) => {
      const units = squad.getUnits()
      return total + units.reduce((squadTotal, unit) => {
        const stats = unit.getCurrentStats()
        return squadTotal + stats.hp + stats.str + stats.mag + stats.skl
      }, 0)
    }, 0)
  }

  /**
   * Enhanced AI resource management
   */
  public updateAIResources(faction: Faction): void {
    const state = this.overworldManager.getState()
    const factionState = this.aiManager.getFactionState(faction)

    if (!factionState) return

    // Count AI buildings for resource generation
    let resourceIncome = { gold: 0, wood: 0, stone: 0, steel: 0, food: 0 }

    state.tiles.forEach(tile => {
      if (tile.controlledBy === faction && tile.building) {
        // Simple resource generation based on building type
        switch (tile.building.type) {
          case BuildingType.SETTLEMENT:
            resourceIncome.gold += 10 * tile.building.level
            resourceIncome.food += 5 * tile.building.level
            break
          case BuildingType.FARM:
            resourceIncome.food += 15 * tile.building.level
            break
          case BuildingType.MINE:
            resourceIncome.stone += 10 * tile.building.level
            resourceIncome.steel += 5 * tile.building.level
            break
          case BuildingType.LUMBER_MILL:
            resourceIncome.wood += 12 * tile.building.level
            break
        }
      }
    })

    // Update AI resource priorities based on current situation
    if (resourceIncome.food < 20) {
      factionState.resourcePriorities[ResourceType.FOOD] = 90
    }
    if (resourceIncome.gold < 30) {
      factionState.resourcePriorities[ResourceType.GOLD] = 85
    }
    if (resourceIncome.steel < 15) {
      factionState.resourcePriorities[ResourceType.STEEL] = 80
    }
  }

  /**
   * AI turn-based updates (called when player ends turn)
   */
  public onTurnEnd(): void {
    // Update AI resources
    this.updateAIResources(Faction.ENEMY)

    // Reset AI army movement points
    const state = this.overworldManager.getState()
    state.tiles.forEach(tile => {
      if (tile.army && tile.army.faction === Faction.ENEMY) {
        tile.army.movementPoints = tile.army.maxMovementPoints
      }
    })

    // Execute AI turn
    this.executeAITurn(Faction.ENEMY)
  }

  /**
   * Get AI manager for advanced operations
   */
  public getAIManager(): AIFactionManager {
    return this.aiManager
  }
}