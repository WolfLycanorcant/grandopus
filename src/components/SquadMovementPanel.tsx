import React, { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { 
  HexCoordinate, 
  MapTile, 
  Faction,
  MovementPath
} from '../core/overworld'
import { ArmyMovementSystem, MovementOrder } from '../core/overworld/ArmyMovementSystem'
import { PathfindingSystem } from '../core/overworld/PathfindingSystem'
import { hexToKey, hexDistance } from '../core/overworld/HexUtils'
import { 
  Move, 
  Target, 
  Shield, 
  Swords, 
  Eye, 
  MapPin,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'

interface SquadMovementPanelProps {
  selectedTile: HexCoordinate | null
  onTileSelect: (coordinate: HexCoordinate) => void
  onMovementComplete?: (from: HexCoordinate, to: HexCoordinate) => void
}

interface MovementPlan {
  from: HexCoordinate
  to: HexCoordinate
  path: MovementPath
  movementCost: number
  canEngage: boolean
  tacticalAnalysis: {
    offensiveTargets: Array<{ coordinate: HexCoordinate; priority: number; reason: string }>
    defensivePositions: Array<{ coordinate: HexCoordinate; value: number; reason: string }>
    economicTargets: Array<{ coordinate: HexCoordinate; value: number; reason: string }>
  }
}

export function SquadMovementPanel({ 
  selectedTile, 
  onTileSelect, 
  onMovementComplete 
}: SquadMovementPanelProps) {
  const { overworldManager, moveArmy, setError } = useGameStore()
  const [movementMode, setMovementMode] = useState<'select' | 'planning' | 'executing'>('select')
  const [sourceArmy, setSourceArmy] = useState<{ coordinate: HexCoordinate; tile: MapTile } | null>(null)
  const [movementPlan, setMovementPlan] = useState<MovementPlan | null>(null)
  const [validDestinations, setValidDestinations] = useState<Array<{
    coordinate: HexCoordinate
    movementCost: number
    canEngage: boolean
    tacticalValue: number
  }>>([])
  const [isExecuting, setIsExecuting] = useState(false)

  // Reset when tile selection changes
  useEffect(() => {
    if (selectedTile && overworldManager) {
      const tile = overworldManager.getTile(selectedTile)
      
      if (tile?.army && tile.army.faction === Faction.PLAYER) {
        // Player army selected - enter movement mode
        setSourceArmy({ coordinate: selectedTile, tile })
        setMovementMode('planning')
        calculateValidDestinations(selectedTile, tile)
      } else if (sourceArmy && movementMode === 'planning') {
        // Destination selected while in planning mode
        planMovement(sourceArmy.coordinate, selectedTile)
      } else {
        // Reset selection
        resetMovementState()
      }
    }
  }, [selectedTile, overworldManager])

  const calculateValidDestinations = (armyPosition: HexCoordinate, armyTile: MapTile) => {
    if (!overworldManager || !armyTile.army) return

    const state = overworldManager.getState()
    const movementPoints = armyTile.army.movementPoints

    const destinations = ArmyMovementSystem.getValidMovementDestinations(
      armyPosition,
      movementPoints,
      state.tiles,
      Faction.PLAYER
    )

    setValidDestinations(destinations)
  }

  const planMovement = (from: HexCoordinate, to: HexCoordinate) => {
    if (!overworldManager || !sourceArmy) return

    const state = overworldManager.getState()
    const fromTile = state.tiles.get(hexToKey(from))
    const toTile = state.tiles.get(hexToKey(to))

    if (!fromTile?.army || !toTile) {
      setError('Invalid movement selection')
      return
    }

    // Calculate path
    const path = PathfindingSystem.findPath(
      from,
      to,
      state.tiles,
      {
        faction: Faction.PLAYER,
        maxDistance: fromTile.army.movementPoints,
        avoidEnemies: false
      }
    )

    // Get tactical analysis
    const tacticalAnalysis = ArmyMovementSystem.analyzeStrategicOptions(
      from,
      fromTile.army.movementPoints,
      state.tiles,
      Faction.PLAYER
    )

    const canEngage = !!(toTile.army && toTile.army.faction !== Faction.PLAYER)

    const plan: MovementPlan = {
      from,
      to,
      path,
      movementCost: path.totalCost,
      canEngage,
      tacticalAnalysis
    }

    setMovementPlan(plan)
  }

  const executeMovement = async () => {
    if (!movementPlan || !sourceArmy || !overworldManager) return

    setIsExecuting(true)
    
    try {
      const fromTile = overworldManager.getTile(movementPlan.from)
      if (!fromTile?.army) {
        throw new Error('No army at source location')
      }

      const movementOrder: MovementOrder = {
        armyId: `army_${hexToKey(movementPlan.from)}`,
        from: movementPlan.from,
        to: movementPlan.to,
        faction: Faction.PLAYER,
        squads: fromTile.army.squads,
        movementPoints: fromTile.army.movementPoints
      }

      const result = ArmyMovementSystem.executeMovement(
        movementOrder,
        overworldManager.getState().tiles
      )

      if (result.success) {
        // Update the game store
        moveArmy(movementPlan.from, movementPlan.to)
        
        if (onMovementComplete) {
          onMovementComplete(movementPlan.from, movementPlan.to)
        }

        // Handle battle if triggered
        if (result.battleTriggered) {
          // TODO: Integrate with battle system
          console.log('Battle triggered!', result.battleTriggered)
        }

        resetMovementState()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Movement failed')
    } finally {
      setIsExecuting(false)
    }
  }

  const resetMovementState = () => {
    setMovementMode('select')
    setSourceArmy(null)
    setMovementPlan(null)
    setValidDestinations([])
  }

  const cancelMovement = () => {
    resetMovementState()
  }

  if (!overworldManager) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-center">
          Initialize overworld to use movement system
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-white font-medium">
        <Move className="w-5 h-5" />
        Squad Movement
      </div>

      {movementMode === 'select' && (
        <div className="text-slate-300 text-sm">
          Select a squad on the map to begin movement planning
        </div>
      )}

      {movementMode === 'planning' && sourceArmy && (
        <div className="space-y-4">
          <div className="bg-slate-700 rounded p-3">
            <div className="text-white font-medium mb-2">Selected Army</div>
            <div className="text-sm text-slate-300 space-y-1">
              <div>Position: ({sourceArmy.coordinate.q}, {sourceArmy.coordinate.r})</div>
              <div>Squads: {sourceArmy.tile.army?.squads.length || 0}</div>
              <div>Movement Points: {sourceArmy.tile.army?.movementPoints || 0}</div>
            </div>
          </div>

          {validDestinations.length > 0 && (
            <div className="bg-slate-700 rounded p-3">
              <div className="text-white font-medium mb-2">Valid Destinations</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {validDestinations.slice(0, 5).map((dest, index) => (
                  <button
                    key={`${dest.coordinate.q},${dest.coordinate.r}`}
                    onClick={() => onTileSelect(dest.coordinate)}
                    className="w-full text-left text-sm bg-slate-600 hover:bg-slate-500 rounded p-2 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span>({dest.coordinate.q}, {dest.coordinate.r})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Cost: {dest.movementCost}</span>
                        {dest.canEngage && <Swords className="w-3 h-3 text-red-400" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {movementPlan && (
            <MovementPlanDisplay 
              plan={movementPlan}
              onExecute={executeMovement}
              onCancel={cancelMovement}
              isExecuting={isExecuting}
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={cancelMovement}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface MovementPlanDisplayProps {
  plan: MovementPlan
  onExecute: () => void
  onCancel: () => void
  isExecuting: boolean
}

function MovementPlanDisplay({ plan, onExecute, onCancel, isExecuting }: MovementPlanDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tactical' | 'path'>('overview')

  return (
    <div className="bg-slate-700 rounded p-3 space-y-3">
      <div className="text-white font-medium">Movement Plan</div>
      
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800 rounded p-1">
        {[
          { key: 'overview', label: 'Overview', icon: Eye },
          { key: 'tactical', label: 'Tactical', icon: Target },
          { key: 'path', label: 'Path', icon: MapPin }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              activeTab === key 
                ? 'bg-slate-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">From:</span>
            <span className="text-white">({plan.from.q}, {plan.from.r})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">To:</span>
            <span className="text-white">({plan.to.q}, {plan.to.r})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Distance:</span>
            <span className="text-white">{hexDistance(plan.from, plan.to)} hexes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Movement Cost:</span>
            <span className="text-white">{plan.movementCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Path Valid:</span>
            <span className={plan.path.isValid ? 'text-green-400' : 'text-red-400'}>
              {plan.path.isValid ? 'Yes' : 'No'}
            </span>
          </div>
          {plan.canEngage && (
            <div className="flex items-center gap-2 text-red-400">
              <Swords className="w-4 h-4" />
              <span>Combat Expected</span>
            </div>
          )}
          {!plan.path.isValid && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>{plan.path.blockedBy}</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tactical' && (
        <div className="space-y-3 text-sm">
          {plan.tacticalAnalysis.offensiveTargets.length > 0 && (
            <div>
              <div className="text-red-400 font-medium mb-1">Offensive Targets</div>
              {plan.tacticalAnalysis.offensiveTargets.slice(0, 3).map((target, index) => (
                <div key={index} className="text-slate-300 text-xs">
                  ({target.coordinate.q}, {target.coordinate.r}) - {target.reason}
                </div>
              ))}
            </div>
          )}

          {plan.tacticalAnalysis.defensivePositions.length > 0 && (
            <div>
              <div className="text-blue-400 font-medium mb-1">Defensive Positions</div>
              {plan.tacticalAnalysis.defensivePositions.slice(0, 3).map((pos, index) => (
                <div key={index} className="text-slate-300 text-xs">
                  ({pos.coordinate.q}, {pos.coordinate.r}) - {pos.reason}
                </div>
              ))}
            </div>
          )}

          {plan.tacticalAnalysis.economicTargets.length > 0 && (
            <div>
              <div className="text-yellow-400 font-medium mb-1">Economic Targets</div>
              {plan.tacticalAnalysis.economicTargets.slice(0, 3).map((target, index) => (
                <div key={index} className="text-slate-300 text-xs">
                  ({target.coordinate.q}, {target.coordinate.r}) - {target.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'path' && (
        <div className="space-y-2 text-sm">
          <div className="text-slate-400">Movement Path:</div>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {plan.path.tiles.map((coord, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">{index + 1}.</span>
                <span className="text-white">({coord.q}, {coord.r})</span>
                {index < plan.path.tiles.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-slate-600">
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded text-sm transition-colors"
          disabled={isExecuting}
        >
          Cancel
        </button>
        <button
          onClick={onExecute}
          disabled={!plan.path.isValid || isExecuting}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isExecuting ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Moving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Execute
            </>
          )}
        </button>
      </div>
    </div>
  )
}