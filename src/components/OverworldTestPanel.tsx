import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { OverworldIntegration } from '../core/overworld/OverworldIntegration'
import { PathfindingSystem } from '../core/overworld/PathfindingSystem'
import { ArmyMovementSystem } from '../core/overworld/ArmyMovementSystem'
import { StrategicAI } from '../core/overworld/StrategicAI'
import { 
  Faction, 
  BuildingType, 
  ResourceType,
  HexCoordinate 
} from '../core/overworld'
import { 
  Play, 
  MapPin, 
  Building, 
  Zap, 
  Target,
  Brain,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

export function OverworldTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('integration')

  const { 
    overworldManager, 
    initializeOverworld,
    playerResources 
  } = useGameStore()

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const runIntegrationTest = async () => {
    setIsRunning(true)
    addResult('Starting overworld integration test...')

    try {
      if (!overworldManager) {
        addResult('Initializing overworld manager...')
        await initializeOverworld()
      }

      const testResult = OverworldIntegration.testOverworldIntegration()
      
      if (testResult.success) {
        addResult('✅ Integration test passed!')
        testResult.results.forEach(result => addResult(result))
      } else {
        addResult('❌ Integration test failed!')
        testResult.errors.forEach(error => addResult(error))
      }

    } catch (error) {
      addResult(`❌ Test error: ${error}`)
    }

    setIsRunning(false)
  }

  const runPathfindingTest = async () => {
    setIsRunning(true)
    addResult('Starting pathfinding system test...')

    try {
      if (!overworldManager) {
        addResult('Overworld not initialized')
        setIsRunning(false)
        return
      }

      const state = overworldManager.getState()
      const tiles = Array.from(state.tiles.values())
      
      if (tiles.length < 2) {
        addResult('❌ Not enough tiles for pathfinding test')
        setIsRunning(false)
        return
      }

      const start: HexCoordinate = tiles[0].coordinate
      const goal: HexCoordinate = tiles[Math.min(10, tiles.length - 1)].coordinate

      addResult(`Testing path from (${start.q},${start.r}) to (${goal.q},${goal.r})`)

      const path = PathfindingSystem.findPath(
        start,
        goal,
        state.tiles,
        { faction: Faction.PLAYER, avoidEnemies: false }
      )

      if (path.isValid) {
        addResult(`✅ Path found! Length: ${path.tiles.length}, Cost: ${path.totalCost}`)
        addResult(`Path: ${path.tiles.map(t => `(${t.q},${t.r})`).join(' → ')}`)
      } else {
        addResult(`❌ No path found: ${path.blockedBy}`)
      }

      // Test reachable tiles
      const reachable = PathfindingSystem.findReachableTiles(
        start,
        5,
        state.tiles,
        { faction: Faction.PLAYER }
      )

      addResult(`✅ Found ${reachable.length} reachable tiles within 5 movement`)

    } catch (error) {
      addResult(`❌ Pathfinding test error: ${error}`)
    }

    setIsRunning(false)
  }

  const runMovementTest = async () => {
    setIsRunning(true)
    addResult('Starting army movement system test...')

    try {
      if (!overworldManager) {
        addResult('Overworld not initialized')
        setIsRunning(false)
        return
      }

      const state = overworldManager.getState()
      const armyTiles = Array.from(state.tiles.values()).filter(tile => tile.army)

      if (armyTiles.length === 0) {
        addResult('❌ No armies found for movement test')
        setIsRunning(false)
        return
      }

      const armyTile = armyTiles[0]
      addResult(`Testing movement for army at (${armyTile.coordinate.q},${armyTile.coordinate.r})`)

      // Calculate movement range
      const movementRange = ArmyMovementSystem.calculateArmyMovementRange(armyTile.army!.squads)
      addResult(`✅ Army movement range: ${movementRange}`)

      // Get valid destinations
      const destinations = ArmyMovementSystem.getValidMovementDestinations(
        armyTile.coordinate,
        movementRange,
        state.tiles,
        armyTile.army!.faction
      )

      addResult(`✅ Found ${destinations.length} valid movement destinations`)

      if (destinations.length > 0) {
        const topDestination = destinations[0]
        addResult(`Top destination: (${topDestination.coordinate.q},${topDestination.coordinate.r}) - Value: ${topDestination.tacticalValue}`)
      }

      // Analyze strategic options
      const strategicOptions = ArmyMovementSystem.analyzeStrategicOptions(
        armyTile.coordinate,
        movementRange,
        state.tiles,
        armyTile.army!.faction
      )

      addResult(`✅ Strategic analysis complete:`)
      addResult(`  - Offensive targets: ${strategicOptions.offensiveTargets.length}`)
      addResult(`  - Defensive positions: ${strategicOptions.defensivePositions.length}`)
      addResult(`  - Economic targets: ${strategicOptions.economicTargets.length}`)

    } catch (error) {
      addResult(`❌ Movement test error: ${error}`)
    }

    setIsRunning(false)
  }

  const runAITest = async () => {
    setIsRunning(true)
    addResult('Starting strategic AI test...')

    try {
      if (!overworldManager) {
        addResult('Overworld not initialized')
        setIsRunning(false)
        return
      }

      // Create AI for enemy faction
      const ai = new StrategicAI(Faction.ENEMY, overworldManager, {
        aggressiveness: 0.7,
        expansionism: 0.6,
        economicFocus: 0.5,
        defensiveness: 0.4
      })

      addResult('✅ AI initialized with personality profile')

      // Generate decisions
      const decisions = ai.makeStrategicDecisions()
      addResult(`✅ AI generated ${decisions.length} strategic decisions`)

      decisions.slice(0, 5).forEach((decision, index) => {
        addResult(`${index + 1}. ${decision.type} (Priority: ${Math.round(decision.priority)}) - ${decision.reasoning}`)
      })

      if (decisions.length > 0) {
        addResult('Executing top AI decision...')
        ai.executeDecisions([decisions[0]])
        addResult('✅ AI decision executed')
      }

    } catch (error) {
      addResult(`❌ AI test error: ${error}`)
    }

    setIsRunning(false)
  }

  const runSimulationTest = async () => {
    setIsRunning(true)
    addResult('Starting multi-turn simulation...')

    try {
      if (!overworldManager) {
        addResult('Overworld not initialized')
        setIsRunning(false)
        return
      }

      const simulation = OverworldIntegration.simulateGameplay(overworldManager, 3)
      
      addResult(`✅ Simulation complete: ${simulation.turnResults.length} turns`)
      addResult(`Initial state: Turn ${simulation.initialState.turn}`)
      addResult(`Final state: Turn ${simulation.finalState.turn}`)

      simulation.turnResults.forEach((turn, index) => {
        addResult(`Turn ${turn.turn}:`)
        
        const resourceChanges = Object.entries(turn.resourcesGenerated)
          .filter(([_, amount]) => amount !== 0)
          .map(([resource, amount]) => `${resource}: ${amount > 0 ? '+' : ''}${amount}`)
          .join(', ')
        
        if (resourceChanges) {
          addResult(`  Resources: ${resourceChanges}`)
        }
        
        if (turn.notifications.length > 0) {
          addResult(`  Events: ${turn.notifications.length} notifications`)
        }
      })

    } catch (error) {
      addResult(`❌ Simulation test error: ${error}`)
    }

    setIsRunning(false)
  }

  const runStrategicOverviewTest = async () => {
    setIsRunning(true)
    addResult('Testing strategic overview analysis...')

    try {
      if (!overworldManager) {
        addResult('Overworld not initialized')
        setIsRunning(false)
        return
      }

      const overview = OverworldIntegration.getStrategicOverview(overworldManager, Faction.PLAYER)
      
      addResult('✅ Strategic overview generated:')
      addResult(`Territory: ${overview.territory} tiles`)
      addResult(`Buildings: ${overview.buildings}`)
      addResult(`Armies: ${overview.armies}`)
      
      addResult('Strengths:')
      overview.strengths.forEach(strength => addResult(`  + ${strength}`))
      
      addResult('Weaknesses:')
      overview.weaknesses.forEach(weakness => addResult(`  - ${weakness}`))
      
      addResult('Recommendations:')
      overview.recommendations.forEach(rec => addResult(`  → ${rec}`))

      // Test building placement recommendations
      const buildingRecs = OverworldIntegration.calculateOptimalBuildingPlacement(
        overworldManager,
        Faction.PLAYER
      )

      addResult(`✅ Found ${buildingRecs.length} building placement recommendations`)
      buildingRecs.slice(0, 3).forEach((rec, index) => {
        addResult(`${index + 1}. ${rec.buildingType} at (${rec.coordinate.q},${rec.coordinate.r}) - Score: ${rec.score}`)
      })

    } catch (error) {
      addResult(`❌ Strategic overview test error: ${error}`)
    }

    setIsRunning(false)
  }

  const runSelectedTest = () => {
    switch (selectedTest) {
      case 'integration':
        runIntegrationTest()
        break
      case 'pathfinding':
        runPathfindingTest()
        break
      case 'movement':
        runMovementTest()
        break
      case 'ai':
        runAITest()
        break
      case 'simulation':
        runSimulationTest()
        break
      case 'overview':
        runStrategicOverviewTest()
        break
    }
  }

  const testOptions = [
    { id: 'integration', name: 'Integration Test', icon: CheckCircle },
    { id: 'pathfinding', name: 'Pathfinding', icon: MapPin },
    { id: 'movement', name: 'Army Movement', icon: Target },
    { id: 'ai', name: 'Strategic AI', icon: Brain },
    { id: 'simulation', name: 'Multi-turn Sim', icon: Play },
    { id: 'overview', name: 'Strategic Overview', icon: Info }
  ]

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Overworld System Tests
        </h2>
      </div>
      
      <div className="card-body space-y-4">
        {/* Test Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Test:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {testOptions.map(option => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedTest(option.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
                    selectedTest === option.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-2">
          <button
            onClick={runSelectedTest}
            disabled={isRunning}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            <span>{isRunning ? 'Running...' : 'Run Test'}</span>
          </button>

          <button
            onClick={clearResults}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>

        {/* Current Status */}
        {overworldManager && (
          <div className="bg-slate-700 rounded-lg p-3">
            <h3 className="font-medium text-white mb-2">Current Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Turn:</span>
                <span className="ml-2 text-white">{overworldManager.getCurrentTurn()}</span>
              </div>
              <div>
                <span className="text-slate-400">Active Player:</span>
                <span className="ml-2 text-white capitalize">{overworldManager.getActivePlayer()}</span>
              </div>
              <div>
                <span className="text-slate-400">Player Tiles:</span>
                <span className="ml-2 text-white">{overworldManager.getTilesByFaction(Faction.PLAYER).length}</span>
              </div>
              <div>
                <span className="text-slate-400">Player Buildings:</span>
                <span className="ml-2 text-white">{overworldManager.getBuildingsByFaction(Faction.PLAYER).length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="font-medium text-white mb-2">Test Results</h3>
          {testResults.length === 0 ? (
            <p className="text-slate-400 text-sm">No test results yet. Run a test to see output.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-xs font-mono ${
                    result.includes('✅') ? 'text-green-400' :
                    result.includes('❌') ? 'text-red-400' :
                    result.includes('→') ? 'text-blue-400' :
                    'text-slate-300'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-slate-600 pt-4">
          <h3 className="font-medium text-white mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (overworldManager) {
                  overworldManager.endTurn()
                  addResult('⏭️ Turn advanced')
                }
              }}
              className="btn-secondary text-sm"
              disabled={!overworldManager}
            >
              End Turn
            </button>
            
            <button
              onClick={() => {
                if (overworldManager) {
                  const tiles = overworldManager.getTilesByFaction(Faction.PLAYER)
                  if (tiles.length > 0) {
                    const success = overworldManager.buildStructure(
                      tiles[0].coordinate,
                      BuildingType.FARM,
                      Faction.PLAYER
                    )
                    addResult(success ? '🏗️ Farm built' : '❌ Build failed')
                  }
                }
              }}
              className="btn-secondary text-sm"
              disabled={!overworldManager}
            >
              Build Farm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}