import {
  AIPersonality,
  AIDifficulty,
  AIDecisionType,
  AIDecision,
  AIFactionState,
  AIEvaluationCriteria,
  AIBehaviorConfig,
  AIActionResult,
  AIIntelligenceReport,
  AIEvent,
  AIEventType
} from './types'
import {
  HexCoordinate,
  MapTile,
  Faction,
  BuildingType,
  ResourceType,
  OverworldState
} from '../overworld/types'
import { ArmyMovementSystem } from '../overworld/ArmyMovementSystem'
import { PathfindingSystem } from '../overworld/PathfindingSystem'
import { hexToKey, hexDistance } from '../overworld/HexUtils'
import { Squad } from '../squads'

/**
 * AI Faction Manager - Controls computer-controlled factions
 */
export class AIFactionManager {
  private factionStates: Map<Faction, AIFactionState> = new Map()
  private behaviorConfigs: Map<Faction, AIBehaviorConfig> = new Map()
  private eventQueue: AIEvent[] = []
  private intelligenceReports: Map<Faction, AIIntelligenceReport> = new Map()

  /**
   * Initialize AI faction with personality and difficulty
   */
  public initializeFaction(
    faction: Faction,
    personality: AIPersonality,
    difficulty: AIDifficulty
  ): void {
    const behaviorConfig = this.createBehaviorConfig(personality, difficulty)
    const factionState = this.createInitialFactionState(faction, personality, difficulty)

    this.behaviorConfigs.set(faction, behaviorConfig)
    this.factionStates.set(faction, factionState)
  }

  /**
   * Execute AI turn for a faction
   */
  public executeTurn(
    faction: Faction,
    overworldState: OverworldState,
    playerResources: Record<ResourceType, number>
  ): AIActionResult[] {
    const factionState = this.factionStates.get(faction)
    const behaviorConfig = this.behaviorConfigs.get(faction)

    if (!factionState || !behaviorConfig) {
      throw new Error(`AI faction ${faction} not initialized`)
    }

    // Update intelligence and assess situation
    this.updateIntelligence(faction, overworldState)
    this.processEvents(faction, overworldState)

    // Generate turn plan
    const decisions = this.generateTurnPlan(faction, overworldState, behaviorConfig)
    
    // Execute decisions in priority order
    const results: AIActionResult[] = []
    for (const decision of decisions.slice(0, 3)) { // Limit to 3 actions per turn
      const result = this.executeDecision(faction, decision, overworldState)
      results.push(result)
      
      // Update faction state based on result
      this.updateFactionStateFromResult(faction, result)
    }

    // Update long-term planning
    this.updateLongTermPlanning(faction, overworldState)

    return results
  }

  /**
   * Create behavior configuration based on personality and difficulty
   */
  private createBehaviorConfig(
    personality: AIPersonality,
    difficulty: AIDifficulty
  ): AIBehaviorConfig {
    const baseConfig: AIBehaviorConfig = {
      personality,
      difficulty,
      aggressionWeight: 0.5,
      economicWeight: 0.5,
      defensiveWeight: 0.5,
      expansionWeight: 0.5,
      attackThreshold: 1.2,
      retreatThreshold: 0.3,
      buildingPriorityThreshold: 0.6,
      planningHorizon: 3,
      reactionTime: 1,
      riskTolerance: 0.5,
      conservatism: 0.5
    }

    // Adjust based on personality
    switch (personality) {
      case AIPersonality.AGGRESSIVE:
        baseConfig.aggressionWeight = 0.8
        baseConfig.expansionWeight = 0.7
        baseConfig.attackThreshold = 1.0
        baseConfig.riskTolerance = 0.8
        break

      case AIPersonality.DEFENSIVE:
        baseConfig.defensiveWeight = 0.8
        baseConfig.attackThreshold = 1.5
        baseConfig.conservatism = 0.8
        baseConfig.riskTolerance = 0.3
        break

      case AIPersonality.ECONOMIC:
        baseConfig.economicWeight = 0.8
        baseConfig.buildingPriorityThreshold = 0.4
        baseConfig.attackThreshold = 1.8
        baseConfig.conservatism = 0.7
        break

      case AIPersonality.BALANCED:
        // Use base values
        break

      case AIPersonality.OPPORTUNISTIC:
        baseConfig.riskTolerance = 0.6
        baseConfig.reactionTime = 0
        baseConfig.planningHorizon = 2
        break
    }

    // Adjust based on difficulty
    const difficultyMultiplier = {
      [AIDifficulty.EASY]: 0.7,
      [AIDifficulty.NORMAL]: 1.0,
      [AIDifficulty.HARD]: 1.3,
      [AIDifficulty.EXPERT]: 1.6
    }[difficulty]

    baseConfig.planningHorizon = Math.round(baseConfig.planningHorizon * difficultyMultiplier)
    baseConfig.attackThreshold /= difficultyMultiplier
    
    return baseConfig
  }

  /**
   * Create initial faction state
   */
  private createInitialFactionState(
    faction: Faction,
    personality: AIPersonality,
    difficulty: AIDifficulty
  ): AIFactionState {
    return {
      faction,
      personality,
      difficulty,
      knownEnemyPositions: new Map(),
      threatAssessment: new Map(),
      territoryValue: new Map(),
      resourcePriorities: {
        [ResourceType.GOLD]: 70,
        [ResourceType.WOOD]: 60,
        [ResourceType.STONE]: 50,
        [ResourceType.STEEL]: 80,
        [ResourceType.FOOD]: 65,
        [ResourceType.MANA_CRYSTALS]: 40,
        [ResourceType.HORSES]: 30
      },
      buildingQueue: [],
      armyObjectives: new Map(),
      defensivePositions: [],
      expansionTargets: [],
      relations: new Map(),
      tradeAgreements: new Map(),
      currentTurnPlan: [],
      longTermGoals: [
        { goal: 'Establish economic base', priority: 80 },
        { goal: 'Secure borders', priority: 70 },
        { goal: 'Expand territory', priority: 60 }
      ]
    }
  }

  /**
   * Update intelligence about the game state
   */
  private updateIntelligence(faction: Faction, overworldState: OverworldState): void {
    const factionState = this.factionStates.get(faction)!
    
    // Scan for enemy armies and update known positions
    overworldState.tiles.forEach((tile, key) => {
      if (tile.army && tile.army.faction !== faction) {
        const strength = this.calculateArmyStrength(tile.army.squads)
        factionState.knownEnemyPositions.set(key, {
          coordinate: tile.coordinate,
          lastSeen: overworldState.currentTurn,
          strength
        })
      }
    })

    // Update threat assessment
    this.updateThreatAssessment(faction, overworldState)
    
    // Update territory values
    this.updateTerritoryValues(faction, overworldState)
    
    // Generate intelligence report
    this.generateIntelligenceReport(faction, overworldState)
  }

  /**
   * Generate turn plan based on current situation
   */
  private generateTurnPlan(
    faction: Faction,
    overworldState: OverworldState,
    behaviorConfig: AIBehaviorConfig
  ): AIDecision[] {
    const decisions: AIDecision[] = []
    const factionState = this.factionStates.get(faction)!
    const criteria = this.evaluateCurrentSituation(faction, overworldState)

    // Economic decisions
    if (criteria.resourceIncome < 50) {
      decisions.push(...this.generateEconomicDecisions(faction, overworldState, criteria))
    }

    // Military decisions
    if (criteria.enemyThreat > 60 || behaviorConfig.aggressionWeight > 0.6) {
      decisions.push(...this.generateMilitaryDecisions(faction, overworldState, criteria))
    }

    // Expansion decisions
    if (criteria.territoryControl < 40 && behaviorConfig.expansionWeight > 0.5) {
      decisions.push(...this.generateExpansionDecisions(faction, overworldState, criteria))
    }

    // Defensive decisions
    if (criteria.defensivePosition < 50 || behaviorConfig.defensiveWeight > 0.6) {
      decisions.push(...this.generateDefensiveDecisions(faction, overworldState, criteria))
    }

    // Sort by priority and return top decisions
    return decisions.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Generate economic decisions (building, resource management)
   */
  private generateEconomicDecisions(
    faction: Faction,
    overworldState: OverworldState,
    criteria: AIEvaluationCriteria
  ): AIDecision[] {
    const decisions: AIDecision[] = []
    const factionState = this.factionStates.get(faction)!

    // Find suitable locations for economic buildings
    const suitableLocations = this.findSuitableBuildingLocations(faction, overworldState)

    // Prioritize farms if food is low
    if (criteria.resourceIncome < 30) {
      const farmLocation = suitableLocations.find(loc => 
        overworldState.tiles.get(hexToKey(loc))?.terrain === 'plains'
      )
      
      if (farmLocation) {
        decisions.push({
          type: AIDecisionType.BUILD_STRUCTURE,
          priority: 85,
          target: farmLocation,
          buildingType: BuildingType.FARM,
          reasoning: 'Low food production requires immediate farm construction',
          expectedOutcome: 'Increase food income by 3 per turn',
          resourceCost: { [ResourceType.WOOD]: 50, [ResourceType.GOLD]: 100 }
        })
      }
    }

    // Build mines for resource generation
    const mineLocation = suitableLocations.find(loc => 
      overworldState.tiles.get(hexToKey(loc))?.terrain === 'mountains'
    )
    
    if (mineLocation && criteria.resourceReserves < 200) {
      decisions.push({
        type: AIDecisionType.BUILD_STRUCTURE,
        priority: 70,
        target: mineLocation,
        buildingType: BuildingType.MINE,
        reasoning: 'Need additional resource generation for expansion',
        expectedOutcome: 'Increase stone and steel income',
        resourceCost: { [ResourceType.WOOD]: 75, [ResourceType.GOLD]: 150 }
      })
    }

    return decisions
  }

  /**
   * Generate military decisions (recruitment, attacks, positioning)
   */
  private generateMilitaryDecisions(
    faction: Faction,
    overworldState: OverworldState,
    criteria: AIEvaluationCriteria
  ): AIDecision[] {
    const decisions: AIDecision[] = []
    const factionState = this.factionStates.get(faction)!

    // Find enemy targets
    const enemyTargets = this.identifyEnemyTargets(faction, overworldState)
    
    for (const target of enemyTargets.slice(0, 2)) { // Limit to 2 targets
      const ourArmies = this.findNearbyArmies(faction, target.coordinate, overworldState)
      const enemyStrength = target.strength
      const ourStrength = ourArmies.reduce((sum, army) => sum + army.strength, 0)

      if (ourStrength > enemyStrength * 1.2) { // Only attack if we have advantage
        const closestArmy = ourArmies.reduce((closest, army) => 
          hexDistance(army.coordinate, target.coordinate) < hexDistance(closest.coordinate, target.coordinate) 
            ? army : closest
        )

        decisions.push({
          type: AIDecisionType.ATTACK_TARGET,
          priority: 80,
          target: target.coordinate,
          armyId: closestArmy.id,
          reasoning: `Enemy army detected with ${enemyStrength} strength, we have ${ourStrength}`,
          expectedOutcome: 'Eliminate enemy threat and capture territory',
          turnDelay: Math.ceil(hexDistance(closestArmy.coordinate, target.coordinate) / 3)
        })
      }
    }

    return decisions
  }

  /**
   * Generate expansion decisions (territory acquisition)
   */
  private generateExpansionDecisions(
    faction: Faction,
    overworldState: OverworldState,
    criteria: AIEvaluationCriteria
  ): AIDecision[] {
    const decisions: AIDecision[] = []
    const factionState = this.factionStates.get(faction)!

    // Find neutral territories to expand into
    const expansionTargets = this.findExpansionTargets(faction, overworldState)

    for (const target of expansionTargets.slice(0, 3)) {
      const nearbyArmies = this.findNearbyArmies(faction, target.coordinate, overworldState)
      
      if (nearbyArmies.length > 0) {
        const closestArmy = nearbyArmies[0]
        
        decisions.push({
          type: AIDecisionType.EXPAND_TERRITORY,
          priority: 60,
          target: target.coordinate,
          armyId: closestArmy.id,
          reasoning: `Valuable neutral territory with strategic value ${target.value}`,
          expectedOutcome: 'Expand territorial control and resource access',
          turnDelay: Math.ceil(hexDistance(closestArmy.coordinate, target.coordinate) / 3)
        })
      }
    }

    return decisions
  }

  /**
   * Generate defensive decisions (fortification, positioning)
   */
  private generateDefensiveDecisions(
    faction: Faction,
    overworldState: OverworldState,
    criteria: AIEvaluationCriteria
  ): AIDecision[] {
    const decisions: AIDecision[] = []

    // Find vulnerable positions that need defense
    const vulnerablePositions = this.findVulnerablePositions(faction, overworldState)

    for (const position of vulnerablePositions.slice(0, 2)) {
      // Check if we can build defensive structures
      const tile = overworldState.tiles.get(hexToKey(position))
      if (tile && tile.controlledBy === faction && !tile.building) {
        decisions.push({
          type: AIDecisionType.BUILD_STRUCTURE,
          priority: 75,
          target: position,
          buildingType: BuildingType.OUTPOST,
          reasoning: 'Vulnerable border position needs defensive fortification',
          expectedOutcome: 'Improve defensive capabilities and early warning',
          resourceCost: { [ResourceType.STONE]: 100, [ResourceType.GOLD]: 150 }
        })
      }

      // Position armies defensively
      const nearbyArmies = this.findNearbyArmies(faction, position, overworldState)
      if (nearbyArmies.length > 0) {
        decisions.push({
          type: AIDecisionType.DEFEND_POSITION,
          priority: 65,
          target: position,
          armyId: nearbyArmies[0].id,
          reasoning: 'Strategic position requires defensive presence',
          expectedOutcome: 'Secure important territory and deter attacks'
        })
      }
    }

    return decisions
  }

  /**
   * Execute a specific AI decision
   */
  private executeDecision(
    faction: Faction,
    decision: AIDecision,
    overworldState: OverworldState
  ): AIActionResult {
    try {
      switch (decision.type) {
        case AIDecisionType.BUILD_STRUCTURE:
          return this.executeBuildStructure(faction, decision, overworldState)
        
        case AIDecisionType.MOVE_ARMY:
          return this.executeMoveArmy(faction, decision, overworldState)
        
        case AIDecisionType.ATTACK_TARGET:
          return this.executeAttackTarget(faction, decision, overworldState)
        
        case AIDecisionType.EXPAND_TERRITORY:
          return this.executeExpandTerritory(faction, decision, overworldState)
        
        case AIDecisionType.DEFEND_POSITION:
          return this.executeDefendPosition(faction, decision, overworldState)
        
        default:
          return {
            success: false,
            action: decision,
            actualOutcome: 'Decision type not implemented',
            message: `AI decision ${decision.type} not yet implemented`
          }
      }
    } catch (error) {
      return {
        success: false,
        action: decision,
        actualOutcome: 'Execution failed',
        message: `Failed to execute ${decision.type}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Execute building construction decision
   */
  private executeBuildStructure(
    faction: Faction,
    decision: AIDecision,
    overworldState: OverworldState
  ): AIActionResult {
    if (!decision.target || !decision.buildingType) {
      return {
        success: false,
        action: decision,
        actualOutcome: 'Missing target or building type',
        message: 'Cannot build structure without target location and building type'
      }
    }

    const tile = overworldState.tiles.get(hexToKey(decision.target))
    if (!tile || tile.controlledBy !== faction || tile.building) {
      return {
        success: false,
        action: decision,
        actualOutcome: 'Invalid build location',
        message: 'Cannot build at specified location'
      }
    }

    // This would integrate with the actual building system
    // For now, we'll simulate the action
    return {
      success: true,
      action: decision,
      actualOutcome: `${decision.buildingType} construction initiated`,
      resourcesSpent: decision.resourceCost,
      strategicValue: 50,
      message: `AI ${faction} began constructing ${decision.buildingType} at (${decision.target.q}, ${decision.target.r})`
    }
  }

  /**
   * Execute army movement decision
   */
  private executeMoveArmy(
    faction: Faction,
    decision: AIDecision,
    overworldState: OverworldState
  ): AIActionResult {
    if (!decision.target || !decision.armyId) {
      return {
        success: false,
        action: decision,
        actualOutcome: 'Missing target or army ID',
        message: 'Cannot move army without target and army identifier'
      }
    }

    // This would integrate with the actual movement system
    return {
      success: true,
      action: decision,
      actualOutcome: `Army ${decision.armyId} moved toward target`,
      strategicValue: 30,
      message: `AI ${faction} moved army ${decision.armyId} toward (${decision.target.q}, ${decision.target.r})`
    }
  }

  /**
   * Execute attack target decision
   */
  private executeAttackTarget(
    faction: Faction,
    decision: AIDecision,
    overworldState: OverworldState
  ): AIActionResult {
    // This would integrate with the battle system
    return {
      success: true,
      action: decision,
      actualOutcome: 'Attack initiated against enemy forces',
      strategicValue: 70,
      message: `AI ${faction} launched attack on enemy position at (${decision.target?.q}, ${decision.target?.r})`
    }
  }

  /**
   * Execute territory expansion decision
   */
  private executeExpandTerritory(
    faction: Faction,
    decision: AIDecision,
    overworldState: OverworldState
  ): AIActionResult {
    return {
      success: true,
      action: decision,
      actualOutcome: 'Territory expansion in progress',
      strategicValue: 40,
      message: `AI ${faction} expanding into neutral territory at (${decision.target?.q}, ${decision.target?.r})`
    }
  }

  /**
   * Execute defensive positioning decision
   */
  private executeDefendPosition(
    faction: Faction,
    decision: AIDecision,
    overworldState: OverworldState
  ): AIActionResult {
    return {
      success: true,
      action: decision,
      actualOutcome: 'Defensive position established',
      strategicValue: 35,
      message: `AI ${faction} positioned army defensively at (${decision.target?.q}, ${decision.target?.r})`
    }
  }

  // Helper methods for AI decision making
  private calculateArmyStrength(squads: Squad[]): number {
    return squads.reduce((total, squad) => {
      const units = squad.getUnits()
      return total + units.reduce((squadTotal, unit) => {
        return squadTotal + unit.getCurrentStats().hp + unit.getCurrentStats().str + unit.getCurrentStats().mag
      }, 0)
    }, 0)
  }

  private updateThreatAssessment(faction: Faction, overworldState: OverworldState): void {
    const factionState = this.factionStates.get(faction)!
    
    // Reset threat levels
    factionState.threatAssessment.clear()
    
    // Assess each faction's threat level
    overworldState.tiles.forEach(tile => {
      if (tile.army && tile.army.faction !== faction) {
        const currentThreat = factionState.threatAssessment.get(tile.army.faction) || 0
        const armyStrength = this.calculateArmyStrength(tile.army.squads)
        factionState.threatAssessment.set(tile.army.faction, currentThreat + armyStrength)
      }
    })
  }

  private updateTerritoryValues(faction: Faction, overworldState: OverworldState): void {
    const factionState = this.factionStates.get(faction)!
    
    overworldState.tiles.forEach((tile, key) => {
      let value = 10 // Base value
      
      // Terrain bonuses
      if (tile.terrain === 'mountains') value += 20 // Good for mines
      if (tile.terrain === 'plains') value += 15 // Good for farms
      if (tile.terrain === 'hills') value += 10 // Defensive bonus
      
      // Building bonuses
      if (tile.building) value += 30
      
      // Strategic position bonuses
      const neighbors = this.getNeighborTiles(tile.coordinate, overworldState)
      const friendlyNeighbors = neighbors.filter(n => n.controlledBy === faction).length
      const enemyNeighbors = neighbors.filter(n => n.controlledBy !== faction && n.controlledBy !== Faction.NEUTRAL).length
      
      value += friendlyNeighbors * 5
      value += enemyNeighbors * 10 // Border territories are more valuable
      
      factionState.territoryValue.set(key, value)
    })
  }

  private evaluateCurrentSituation(faction: Faction, overworldState: OverworldState): AIEvaluationCriteria {
    const factionState = this.factionStates.get(faction)!
    
    // Count faction assets
    let militaryStrength = 0
    let territoryCount = 0
    let buildingCount = 0
    
    overworldState.tiles.forEach(tile => {
      if (tile.controlledBy === faction) {
        territoryCount++
        if (tile.building) buildingCount++
      }
      if (tile.army && tile.army.faction === faction) {
        militaryStrength += this.calculateArmyStrength(tile.army.squads)
      }
    })
    
    const totalThreat = Array.from(factionState.threatAssessment.values()).reduce((sum, threat) => sum + threat, 0)
    
    return {
      militaryStrength: Math.min(100, militaryStrength / 10),
      enemyThreat: Math.min(100, totalThreat / 10),
      defensivePosition: Math.min(100, buildingCount * 10),
      resourceIncome: Math.min(100, buildingCount * 15),
      resourceReserves: 50, // Would need actual resource data
      economicGrowth: Math.min(100, buildingCount * 5),
      territoryControl: Math.min(100, territoryCount * 5),
      strategicPositions: Math.min(100, buildingCount * 8),
      diplomaticSituation: 50, // Neutral starting point
      timeUrgency: 30,
      opportunityWindow: 60,
      riskAssessment: Math.min(100, totalThreat / 5)
    }
  }

  private findSuitableBuildingLocations(faction: Faction, overworldState: OverworldState): HexCoordinate[] {
    const locations: HexCoordinate[] = []
    
    overworldState.tiles.forEach(tile => {
      if (tile.controlledBy === faction && !tile.building && !tile.army) {
        locations.push(tile.coordinate)
      }
    })
    
    return locations
  }

  private identifyEnemyTargets(faction: Faction, overworldState: OverworldState): Array<{ coordinate: HexCoordinate; strength: number }> {
    const targets: Array<{ coordinate: HexCoordinate; strength: number }> = []
    
    overworldState.tiles.forEach(tile => {
      if (tile.army && tile.army.faction !== faction) {
        targets.push({
          coordinate: tile.coordinate,
          strength: this.calculateArmyStrength(tile.army.squads)
        })
      }
    })
    
    return targets.sort((a, b) => a.strength - b.strength) // Weakest first
  }

  private findNearbyArmies(faction: Faction, target: HexCoordinate, overworldState: OverworldState): Array<{ id: string; coordinate: HexCoordinate; strength: number }> {
    const armies: Array<{ id: string; coordinate: HexCoordinate; strength: number }> = []
    
    overworldState.tiles.forEach(tile => {
      if (tile.army && tile.army.faction === faction) {
        const distance = hexDistance(tile.coordinate, target)
        if (distance <= 5) { // Within 5 hexes
          armies.push({
            id: `army_${hexToKey(tile.coordinate)}`,
            coordinate: tile.coordinate,
            strength: this.calculateArmyStrength(tile.army.squads)
          })
        }
      }
    })
    
    return armies.sort((a, b) => hexDistance(a.coordinate, target) - hexDistance(b.coordinate, target))
  }

  private findExpansionTargets(faction: Faction, overworldState: OverworldState): Array<{ coordinate: HexCoordinate; value: number }> {
    const factionState = this.factionStates.get(faction)!
    const targets: Array<{ coordinate: HexCoordinate; value: number }> = []
    
    overworldState.tiles.forEach((tile, key) => {
      if (tile.controlledBy === Faction.NEUTRAL) {
        const value = factionState.territoryValue.get(key) || 0
        targets.push({ coordinate: tile.coordinate, value })
      }
    })
    
    return targets.sort((a, b) => b.value - a.value)
  }

  private findVulnerablePositions(faction: Faction, overworldState: OverworldState): HexCoordinate[] {
    const vulnerable: HexCoordinate[] = []
    
    overworldState.tiles.forEach(tile => {
      if (tile.controlledBy === faction) {
        const neighbors = this.getNeighborTiles(tile.coordinate, overworldState)
        const hasEnemyNeighbor = neighbors.some(n => 
          n.controlledBy !== faction && n.controlledBy !== Faction.NEUTRAL
        )
        
        if (hasEnemyNeighbor && !tile.building) {
          vulnerable.push(tile.coordinate)
        }
      }
    })
    
    return vulnerable
  }

  private getNeighborTiles(coordinate: HexCoordinate, overworldState: OverworldState): MapTile[] {
    const neighbors: MapTile[] = []
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ]
    
    for (const dir of directions) {
      const neighborCoord = { q: coordinate.q + dir.q, r: coordinate.r + dir.r }
      const tile = overworldState.tiles.get(hexToKey(neighborCoord))
      if (tile) neighbors.push(tile)
    }
    
    return neighbors
  }

  private processEvents(faction: Faction, overworldState: OverworldState): void {
    // Process queued events for reactive behavior
    const relevantEvents = this.eventQueue.filter(event => 
      event.faction === faction || !event.faction
    )
    
    for (const event of relevantEvents) {
      this.handleAIEvent(faction, event, overworldState)
    }
    
    // Clean up expired events
    this.eventQueue = this.eventQueue.filter(event => 
      !event.expiresAt || event.expiresAt > overworldState.currentTurn
    )
  }

  private handleAIEvent(faction: Faction, event: AIEvent, overworldState: OverworldState): void {
    const factionState = this.factionStates.get(faction)!
    
    switch (event.type) {
      case AIEventType.ENEMY_ARMY_SPOTTED:
        if (event.location) {
          factionState.knownEnemyPositions.set(hexToKey(event.location), {
            coordinate: event.location,
            lastSeen: overworldState.currentTurn,
            strength: event.data.strength || 50
          })
        }
        break
        
      case AIEventType.TERRITORY_ATTACKED:
        // Increase defensive priority for attacked areas
        if (event.location) {
          const currentValue = factionState.territoryValue.get(hexToKey(event.location)) || 0
          factionState.territoryValue.set(hexToKey(event.location), currentValue + 20)
        }
        break
    }
  }

  private generateIntelligenceReport(faction: Faction, overworldState: OverworldState): void {
    // Generate comprehensive intelligence report
    // This would be used for debugging and player intelligence gathering
  }

  private updateFactionStateFromResult(faction: Faction, result: AIActionResult): void {
    const factionState = this.factionStates.get(faction)!
    
    if (result.success && result.strategicValue) {
      // Update long-term goals based on successful actions
      if (result.action.type === AIDecisionType.BUILD_STRUCTURE) {
        const economicGoal = factionState.longTermGoals.find(g => g.goal.includes('economic'))
        if (economicGoal) economicGoal.priority = Math.max(0, economicGoal.priority - 10)
      }
    }
  }

  private updateLongTermPlanning(faction: Faction, overworldState: OverworldState): void {
    const factionState = this.factionStates.get(faction)!
    
    // Adjust long-term goals based on current situation
    const criteria = this.evaluateCurrentSituation(faction, overworldState)
    
    if (criteria.enemyThreat > 70) {
      // Prioritize defense when under threat
      const defenseGoal = factionState.longTermGoals.find(g => g.goal.includes('borders'))
      if (defenseGoal) defenseGoal.priority = Math.min(100, defenseGoal.priority + 20)
    }
    
    if (criteria.resourceIncome < 30) {
      // Prioritize economy when resources are low
      const economicGoal = factionState.longTermGoals.find(g => g.goal.includes('economic'))
      if (economicGoal) economicGoal.priority = Math.min(100, economicGoal.priority + 15)
    }
  }

  /**
   * Add event to AI event queue for reactive behavior
   */
  public addEvent(event: AIEvent): void {
    this.eventQueue.push(event)
  }

  /**
   * Get current faction state (for debugging/UI)
   */
  public getFactionState(faction: Faction): AIFactionState | undefined {
    return this.factionStates.get(faction)
  }

  /**
   * Get intelligence report for faction
   */
  public getIntelligenceReport(faction: Faction): AIIntelligenceReport | undefined {
    return this.intelligenceReports.get(faction)
  }
}