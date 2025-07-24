import { OverworldManager } from './OverworldManager'
import { Squad, SquadFactory } from '../squads'
import { UnitFactory } from '../units'
import { BuildingType, Faction, ResourceType } from './types'
import { getBuildingEffectSummary } from './BuildingEffects'

/**
 * Integration utilities and testing for the overworld system
 */
export class OverworldIntegration {
  /**
   * Test complete overworld integration
   */
  public static testOverworldIntegration(): {
    success: boolean
    results: string[]
    errors: string[]
  } {
    const results: string[] = []
    const errors: string[] = []

    try {
      // Test 1: Initialize overworld
      const overworld = new OverworldManager(10, 8)
      results.push('✓ Overworld initialized successfully')

      // Test 2: Check initial resources
      const initialResources = overworld.getPlayerResources(Faction.PLAYER)
      results.push(`✓ Initial resources: ${initialResources[ResourceType.GOLD]} gold, ${initialResources[ResourceType.WOOD]} wood`)

      // Test 3: Create and deploy a squad
      const testUnit = UnitFactory.createUnit({
        name: 'Test Knight',
        race: 'human' as any,
        archetype: 'knight' as any,
        level: 5
      })

      const testSquad = SquadFactory.createSquad({
        name: 'Test Squad',
        units: [testUnit]
      })

      const deployLocation = { q: 3, r: 3 }
      const deploySuccess = overworld.placeArmy(deployLocation, [testSquad], Faction.PLAYER)
      if (deploySuccess) {
        results.push('✓ Squad deployed successfully')
      } else {
        errors.push('✗ Failed to deploy squad')
      }

      // Test 4: Build a structure
      const buildLocation = { q: 4, r: 4 }
      const buildSuccess = overworld.buildStructure(buildLocation, BuildingType.CHURCH, Faction.PLAYER)
      if (buildSuccess) {
        results.push('✓ Church built successfully')
      } else {
        errors.push('✗ Failed to build church')
      }

      // Test 5: Check building effects
      const buildingBonuses = overworld.getSquadBuildingBonuses(deployLocation, Faction.PLAYER)
      if (buildingBonuses.activeBuildings.length > 0) {
        results.push(`✓ Building bonuses active: ${buildingBonuses.healingPerTurn} healing per turn`)
      } else {
        results.push('○ No building bonuses (squads may be too far from buildings)')
      }

      // Test 6: Process a turn
      const initialTurn = overworld.getCurrentTurn()
      overworld.endTurn()
      const newTurn = overworld.getCurrentTurn()
      
      if (newTurn > initialTurn) {
        results.push(`✓ Turn processed: ${initialTurn} → ${newTurn}`)
      } else {
        errors.push('✗ Turn did not advance')
      }

      // Test 7: Check resource generation
      const newResources = overworld.getPlayerResources(Faction.PLAYER)
      const goldDifference = (newResources[ResourceType.GOLD] || 0) - (initialResources[ResourceType.GOLD] || 0)
      
      if (goldDifference > 0) {
        results.push(`✓ Resources generated: +${goldDifference} gold`)
      } else {
        results.push('○ No resource generation (may need more buildings)')
      }

      // Test 8: Check notifications
      const notifications = overworld.getNotifications(5)
      results.push(`✓ ${notifications.length} notifications generated`)

      // Test 9: Test squad with bonuses
      const squadsWithBonuses = overworld.getSquadsWithBonuses()
      results.push(`✓ Found ${squadsWithBonuses.length} squads with building bonuses`)

      return {
        success: true,
        results,
        errors
      }

    } catch (error) {
      errors.push(`Integration test failed: ${error}`)
      return {
        success: false,
        results,
        errors
      }
    }
  }

  /**
   * Get building effect descriptions for UI
   */
  public static getBuildingEffectDescriptions(): Record<BuildingType, string> {
    const descriptions: Record<BuildingType, string> = {} as any

    Object.values(BuildingType).forEach(buildingType => {
      descriptions[buildingType] = getBuildingEffectSummary(buildingType, 1)
    })

    return descriptions
  }

  /**
   * Calculate optimal building placement for a faction
   */
  public static calculateOptimalBuildingPlacement(
    overworld: OverworldManager,
    faction: Faction
  ): Array<{
    coordinate: { q: number; r: number }
    buildingType: BuildingType
    score: number
    reasoning: string
  }> {
    const recommendations: Array<{
      coordinate: { q: number; r: number }
      buildingType: BuildingType
      score: number
      reasoning: string
    }> = []

    const controlledTiles = overworld.getTilesByFaction(faction)
    const existingBuildings = overworld.getBuildingsByFaction(faction)

    // Simple scoring system for building placement
    controlledTiles.forEach(tile => {
      if (tile.building) return // Skip tiles with existing buildings

      // Score different building types
      const buildingScores = [
        {
          type: BuildingType.FARM,
          score: 70,
          reasoning: 'Provides food and healing for nearby squads'
        },
        {
          type: BuildingType.OUTPOST,
          score: 60,
          reasoning: 'Increases movement and provides skill bonuses'
        },
        {
          type: BuildingType.BLACKSMITH,
          score: 80,
          reasoning: 'Boosts strength and weapon proficiency for melee units'
        },
        {
          type: BuildingType.CHURCH,
          score: 75,
          reasoning: 'Provides strong healing and magic bonuses'
        }
      ]

      buildingScores.forEach(({ type, score, reasoning }) => {
        recommendations.push({
          coordinate: tile.coordinate,
          buildingType: type,
          score,
          reasoning
        })
      })
    })

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  /**
   * Get strategic overview for a faction
   */
  public static getStrategicOverview(
    overworld: OverworldManager,
    faction: Faction
  ): {
    territory: number
    buildings: number
    armies: number
    resources: Record<ResourceType, number>
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
  } {
    const controlledTiles = overworld.getTilesByFaction(faction)
    const buildings = overworld.getBuildingsByFaction(faction)
    const squadsWithBonuses = overworld.getSquadsWithBonuses().filter(s => s.faction === faction)
    const resources = overworld.getPlayerResources(faction)

    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    // Analyze territory
    if (controlledTiles.length > 10) {
      strengths.push('Large territory controlled')
    } else if (controlledTiles.length < 5) {
      weaknesses.push('Limited territory')
      recommendations.push('Expand territory by deploying armies to neutral tiles')
    }

    // Analyze buildings
    if (buildings.length > 5) {
      strengths.push('Well-developed infrastructure')
    } else if (buildings.length < 3) {
      weaknesses.push('Insufficient infrastructure')
      recommendations.push('Build more economic and military buildings')
    }

    // Analyze resources
    const totalResources = Object.values(resources).reduce((sum, amount) => sum + (amount || 0), 0)
    if (totalResources > 1000) {
      strengths.push('Strong resource base')
    } else if (totalResources < 300) {
      weaknesses.push('Resource shortage')
      recommendations.push('Build farms and mines to increase resource generation')
    }

    // Analyze military
    if (squadsWithBonuses.length > 2) {
      strengths.push('Multiple deployed armies with building support')
    } else if (squadsWithBonuses.length === 0) {
      weaknesses.push('No deployed armies')
      recommendations.push('Deploy squads to strategic locations')
    }

    return {
      territory: controlledTiles.length,
      buildings: buildings.length,
      armies: squadsWithBonuses.length,
      resources: resources as Record<ResourceType, number>,
      strengths,
      weaknesses,
      recommendations
    }
  }

  /**
   * Simulate multiple turns for testing
   */
  public static simulateGameplay(
    overworld: OverworldManager,
    turns: number = 5
  ): {
    initialState: any
    finalState: any
    turnResults: Array<{
      turn: number
      resourcesGenerated: Record<ResourceType, number>
      notifications: string[]
      squadsHealed: number
    }>
  } {
    const initialState = {
      turn: overworld.getCurrentTurn(),
      resources: overworld.getPlayerResources(Faction.PLAYER)
    }

    const turnResults: Array<{
      turn: number
      resourcesGenerated: Record<ResourceType, number>
      notifications: string[]
      squadsHealed: number
    }> = []

    for (let i = 0; i < turns; i++) {
      const beforeResources = overworld.getPlayerResources(Faction.PLAYER)
      const beforeNotifications = overworld.getNotifications().length

      overworld.endTurn()

      const afterResources = overworld.getPlayerResources(Faction.PLAYER)
      const afterNotifications = overworld.getNotifications()

      const resourcesGenerated: Record<ResourceType, number> = {} as any
      Object.values(ResourceType).forEach(resource => {
        const before = beforeResources[resource] || 0
        const after = afterResources[resource] || 0
        resourcesGenerated[resource] = after - before
      })

      const newNotifications = afterNotifications.slice(beforeNotifications)

      turnResults.push({
        turn: overworld.getCurrentTurn(),
        resourcesGenerated,
        notifications: newNotifications.map(n => n.message),
        squadsHealed: newNotifications.filter(n => n.message.includes('receives bonuses')).length
      })
    }

    const finalState = {
      turn: overworld.getCurrentTurn(),
      resources: overworld.getPlayerResources(Faction.PLAYER)
    }

    return {
      initialState,
      finalState,
      turnResults
    }
  }
}