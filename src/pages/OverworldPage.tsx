import React, { useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import { StrategicOverworldMap } from '../components/StrategicOverworldMap'
import { SquadMovementPanel } from '../components/SquadMovementPanel'
import { AIOverviewPanel } from '../components/AIStatusPanel'
import { AITestPanel } from '../components/AITestPanel'
import { AIActivityFeed, AIActivityIndicator } from '../components/AIActivityFeed'
import {
  HexCoordinate,
  MapTile,
  BuildingType,
  ResourceType,
  Faction
} from '../core/overworld'
import { OverworldIntegration } from '../core/overworld/OverworldIntegration'
import {
  Home,
  Castle,
  Church,
  Wheat,
  Hammer,
  Shield,
  Eye,
  Mountain,
  Plus,
  ArrowUp,
  Play,
  Settings,
  Map,
  Users,
  Coins,
  Info,
  Target,
  Zap,
  Globe
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function OverworldPage() {
  const [selectedTile, setSelectedTile] = useState<HexCoordinate | null>(null)
  const [selectedTileData, setSelectedTileData] = useState<MapTile | null>(null)
  const [showBuildMenu, setShowBuildMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showStrategicOverview, setShowStrategicOverview] = useState(false)
  const [mapMode, setMapMode] = useState<'normal' | 'resources' | 'influence'>('normal')

  const {
    overworldManager,
    playerResources,
    currentTurn,
    squads,
    initializeOverworld,
    deploySquad,
    buildStructure,
    upgradeBuilding,
    endTurn,
    error
  } = useGameStore()

  // Initialize overworld if not already done
  useEffect(() => {
    if (!overworldManager) {
      initializeOverworld()
    }
  }, [overworldManager, initializeOverworld])

  const handleTileSelect = (coordinate: HexCoordinate, tile: MapTile | null) => {
    setSelectedTile(coordinate)
    setSelectedTileData(tile)
    setShowBuildMenu(false)
  }

  const handleBuildStructure = (buildingType: BuildingType) => {
    if (!selectedTile) return

    buildStructure(selectedTile, buildingType)
    setShowBuildMenu(false)
  }

  const handleEndTurn = () => {
    endTurn()
  }

  const getBuildingIcon = (building: BuildingType) => {
    switch (building) {
      case BuildingType.SETTLEMENT: return <Home className="h-4 w-4" />
      case BuildingType.CASTLE: return <Castle className="h-4 w-4" />
      case BuildingType.CHURCH: return <Church className="h-4 w-4" />
      case BuildingType.FARM: return <Wheat className="h-4 w-4" />
      case BuildingType.BLACKSMITH: return <Hammer className="h-4 w-4" />
      case BuildingType.OUTPOST: return <Shield className="h-4 w-4" />
      case BuildingType.TOWER: return <Eye className="h-4 w-4" />
      case BuildingType.MINE: return <Mountain className="h-4 w-4" />
      default: return <Home className="h-4 w-4" />
    }
  }

  const buildableBuildings = [
    BuildingType.SETTLEMENT,
    BuildingType.FARM,
    BuildingType.BLACKSMITH,
    BuildingType.OUTPOST,
    BuildingType.TOWER,
    BuildingType.CHURCH,
    BuildingType.MINE
  ]

  const getStrategicOverview = () => {
    if (!overworldManager) return null
    return OverworldIntegration.getStrategicOverview(overworldManager, Faction.PLAYER)
  }

  const strategicOverview = getStrategicOverview()

  if (!overworldManager) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Initializing strategic overworld...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* AI Activity Indicator */}
      <AIActivityIndicator />
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Home
            </Link>

            <div>
              <h1 className="text-2xl font-bold">Strategic Overworld</h1>
              <p className="text-slate-400">Turn {currentTurn} • Manage your empire</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/overworld-3d"
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>3D View</span>
            </Link>

            <button
              onClick={() => setShowStrategicOverview(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Info className="h-4 w-4" />
              <span>Overview</span>
            </button>
          </div>
        </div>

        {/* Resource Display */}
        <div className="flex items-center space-x-6 mt-4">
          {Object.entries(playerResources).map(([resource, amount]) => (
            <div key={resource} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getResourceColorClass(resource as ResourceType)}`}></div>
              <span className="text-slate-300 capitalize">{resource}:</span>
              <span className="text-white font-medium">{amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Main Map Area */}
        <div className="flex-1 p-4">
          {/* Map Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Map Mode:</span>
              {(['normal', 'resources', 'influence'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${mapMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={handleEndTurn}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>End Turn</span>
            </button>
          </div>

          {/* Strategic Map */}
          <StrategicOverworldMap
            onTileSelect={handleTileSelect}
            selectedTile={selectedTile}
            showGrid={true}
            showResources={mapMode === 'resources'}
            showInfluence={mapMode === 'influence'}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 space-y-4">
          {/* Selected Tile Info */}
          {selectedTileData ? (
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium mb-3">Selected Tile</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="ml-2">({selectedTile?.q}, {selectedTile?.r})</span>
                </div>
                <div>
                  <span className="text-slate-400">Terrain:</span>
                  <span className="ml-2 capitalize">{selectedTileData.terrain}</span>
                </div>
                <div>
                  <span className="text-slate-400">Controlled by:</span>
                  <span className="ml-2 capitalize">{selectedTileData.controlledBy}</span>
                </div>

                {selectedTileData.building && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Building</span>
                      {selectedTileData.building.faction === Faction.PLAYER && (
                        <button
                          onClick={() => selectedTile && upgradeBuilding(selectedTile)}
                          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          <ArrowUp className="h-3 w-3" />
                          <span>Upgrade</span>
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div>
                        <span className="text-slate-400">Type:</span>
                        <span className="ml-2 capitalize">{selectedTileData.building.type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Level:</span>
                        <span className="ml-2">{selectedTileData.building.level}</span>
                      </div>
                      {selectedTileData.building.constructionProgress !== undefined && (
                        <div>
                          <span className="text-slate-400">Construction:</span>
                          <span className="ml-2">{Math.round(selectedTileData.building.constructionProgress)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTileData.army && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <span className="font-medium">Army</span>
                    <div className="space-y-1 mt-2">
                      <div>
                        <span className="text-slate-400">Squads:</span>
                        <span className="ml-2">{selectedTileData.army.squads.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Faction:</span>
                        <span className="ml-2 capitalize">{selectedTileData.army.faction}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Movement:</span>
                        <span className="ml-2">{selectedTileData.army.movementPoints}/{selectedTileData.army.maxMovementPoints}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedTileData.controlledBy === Faction.PLAYER && (
                <div className="mt-4 space-y-2">
                  {!selectedTileData.building && (
                    <button
                      onClick={() => setShowBuildMenu(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Build Structure</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-700 rounded-lg p-4 text-center text-slate-400">
              Click on a tile to view details
            </div>
          )}

          {/* Squad Movement Panel */}
          <SquadMovementPanel
            selectedTile={selectedTile}
            onTileSelect={(coordinate) => {
              const tile = overworldManager?.getTile(coordinate) || null
              handleTileSelect(coordinate, tile)
            }}
            onMovementComplete={(from, to) => {
              // Refresh tile data after movement
              if (selectedTile) {
                const updatedTile = overworldManager?.getTile(selectedTile)
                setSelectedTileData(updatedTile || null)
              }
            }}
          />

          {/* Squad Deployment */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="font-medium mb-3">Available Squads</h3>
            {squads.length === 0 ? (
              <p className="text-slate-400 text-sm">No squads available for deployment</p>
            ) : (
              <div className="space-y-2">
                {squads.slice(0, 5).map(squad => (
                  <div key={squad.id} className="flex items-center justify-between bg-slate-600 rounded p-2">
                    <div>
                      <div className="text-white text-sm font-medium">{squad.name}</div>
                      <div className="text-slate-400 text-xs">{squad.getUnits().length} units</div>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedTile) {
                          deploySquad(squad.id, selectedTile)
                        }
                      }}
                      disabled={!selectedTile || selectedTileData?.army !== undefined}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs transition-colors"
                    >
                      Deploy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Overview Panel */}
          <AIOverviewPanel />

          {/* AI Activity Feed */}
          <AIActivityFeed />

          {/* AI Test Panel (Development) */}
          <AITestPanel />

          {/* Quick Stats */}
          {strategicOverview && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="font-medium mb-3">Empire Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Territory:</span>
                  <span>{strategicOverview.territory} tiles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Buildings:</span>
                  <span>{strategicOverview.buildings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Armies:</span>
                  <span>{strategicOverview.armies}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Build Menu Modal */}
      {showBuildMenu && selectedTile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-medium mb-4">Select Building to Construct</h3>
            <div className="grid grid-cols-2 gap-3">
              {buildableBuildings.map(building => (
                <button
                  key={building}
                  onClick={() => handleBuildStructure(building)}
                  className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded transition-colors"
                >
                  {getBuildingIcon(building)}
                  <span className="text-sm capitalize">{building.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBuildMenu(false)}
              className="mt-4 w-full bg-slate-600 hover:bg-slate-500 text-white py-2 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Strategic Overview Modal */}
      {showStrategicOverview && strategicOverview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-medium">Strategic Overview</h3>
              <button
                onClick={() => setShowStrategicOverview(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-green-400 font-medium mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {strategicOverview.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-slate-300">• {strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-red-400 font-medium mb-2">Weaknesses</h4>
                <ul className="space-y-1">
                  {strategicOverview.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-slate-300">• {weakness}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-blue-400 font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {strategicOverview.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-slate-300">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 z-20 bg-red-900/90 text-red-300 p-4 rounded-lg max-w-sm">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

function getResourceColorClass(resource: ResourceType): string {
  switch (resource) {
    case ResourceType.GOLD: return 'bg-yellow-400'
    case ResourceType.WOOD: return 'bg-amber-600'
    case ResourceType.STONE: return 'bg-gray-400'
    case ResourceType.STEEL: return 'bg-blue-400'
    case ResourceType.FOOD: return 'bg-green-400'
    case ResourceType.MANA_CRYSTALS: return 'bg-purple-400'
    case ResourceType.HORSES: return 'bg-amber-700'
    default: return 'bg-gray-400'
  }
}