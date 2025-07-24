import React, { useRef, useState, useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'
import OverworldCanvas, { OverworldCanvasHandle } from '../components/OverworldCanvas'
import { BuildingType, ResourceType, HexCoordinate } from '../core/overworld'
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
  ArrowLeft,
  RotateCcw,
  Play,
  Settings,
  Map
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function Overworld3DPage() {
  const canvasRef = useRef<OverworldCanvasHandle>(null)
  const [selectedTile, setSelectedTile] = useState<HexCoordinate | null>(null)
  const [showBuildMenu, setShowBuildMenu] = useState(false)
  const [cameraMode, setCameraMode] = useState<'overview' | 'close' | 'follow'>('overview')
  const [showSettings, setShowSettings] = useState(false)

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

  // Update 3D map when overworld changes
  useEffect(() => {
    if (overworldManager && canvasRef.current) {
      canvasRef.current.updateMap(overworldManager)
    }
  }, [overworldManager, currentTurn])

  // Play resource generation animation on turn end
  useEffect(() => {
    if (canvasRef.current && currentTurn > 1) {
      canvasRef.current.playResourceGeneration()
    }
  }, [currentTurn])

  const handleEndTurn = () => {
    endTurn()
    
    // Play turn end effects
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.playResourceGeneration()
      }
    }, 500)
  }

  const handleBuildStructure = (buildingType: BuildingType) => {
    if (!selectedTile) return
    
    buildStructure(selectedTile, buildingType)
    setShowBuildMenu(false)
    
    // Play construction animation
    setTimeout(() => {
      if (canvasRef.current && selectedTile) {
        canvasRef.current.showBuildingConstruction(selectedTile, buildingType)
      }
    }, 100)
  }

  const handleTileClick = (coordinate: HexCoordinate) => {
    // Highlight previous tile
    if (selectedTile && canvasRef.current) {
      canvasRef.current.highlightTile(selectedTile, false)
    }
    
    // Highlight new tile
    setSelectedTile(coordinate)
    if (canvasRef.current) {
      canvasRef.current.highlightTile(coordinate, true)
    }
    
    setShowBuildMenu(false)
  }

  const handleCameraMode = (mode: 'overview' | 'close' | 'follow') => {
    setCameraMode(mode)
    
    if (canvasRef.current) {
      switch (mode) {
        case 'overview':
          canvasRef.current.setCameraPosition(
            new (window as any).pc.Vec3(0, 25, 20),
            new (window as any).pc.Vec3(0, 0, 0)
          )
          break
        case 'close':
          canvasRef.current.setCameraPosition(
            new (window as any).pc.Vec3(0, 15, 10),
            new (window as any).pc.Vec3(0, 0, 0)
          )
          break
        case 'follow':
          if (selectedTile) {
            const worldPos = hexToWorldPosition(selectedTile)
            canvasRef.current.setCameraPosition(
              new (window as any).pc.Vec3(worldPos.x, worldPos.y + 10, worldPos.z + 8),
              new (window as any).pc.Vec3(worldPos.x, worldPos.y, worldPos.z)
            )
          }
          break
      }
    }
  }

  const hexToWorldPosition = (coordinate: HexCoordinate) => {
    const size = 2
    const x = size * (3/2 * coordinate.q)
    const z = size * (Math.sqrt(3)/2 * coordinate.q + Math.sqrt(3) * coordinate.r)
    return { x, y: 0, z }
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
    BuildingType.CHURCH
  ]

  if (!overworldManager) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Initializing 3D strategic map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 3D Overworld Canvas */}
      <OverworldCanvas ref={canvasRef} />

      {/* Top UI Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/overworld" 
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to 2D Map</span>
            </Link>
            
            <div className="text-white">
              <h1 className="text-xl font-bold">3D Strategic Overworld</h1>
              <p className="text-sm text-slate-400">Turn {currentTurn} • Command your empire</p>
            </div>
          </div>

          {/* Resource Display */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-slate-300">Gold:</span>
              <span className="text-yellow-400 font-medium">{playerResources[ResourceType.GOLD]}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
              <span className="text-slate-300">Wood:</span>
              <span className="text-amber-400 font-medium">{playerResources[ResourceType.WOOD]}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-slate-300">Stone:</span>
              <span className="text-gray-400 font-medium">{playerResources[ResourceType.STONE]}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300">Steel:</span>
              <span className="text-blue-400 font-medium">{playerResources[ResourceType.STEEL]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute top-20 right-4 z-20 bg-slate-800/90 rounded-lg p-3">
        <h3 className="text-white text-sm font-medium mb-2 flex items-center">
          <Map className="h-4 w-4 mr-2" />
          Camera
        </h3>
        <div className="space-y-2">
          {(['overview', 'close', 'follow'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleCameraMode(mode)}
              className={`w-full px-3 py-1 text-sm rounded transition-colors ${
                cameraMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Build Menu */}
      {showBuildMenu && selectedTile && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-slate-800/95 rounded-lg p-4 min-w-80">
          <h3 className="text-white font-medium mb-3">Select Building to Construct</h3>
          <div className="grid grid-cols-2 gap-3">
            {buildableBuildings.map(building => (
              <button
                key={building}
                onClick={() => handleBuildStructure(building)}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded transition-colors"
              >
                {getBuildingIcon(building)}
                <span className="text-sm">{building.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowBuildMenu(false)}
            className="mt-3 w-full bg-slate-600 hover:bg-slate-500 text-white py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-slate-800/90 rounded-lg p-4 flex items-center space-x-4">
          <button
            onClick={handleEndTurn}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Play className="h-5 w-5" />
            <span>End Turn</span>
          </button>

          {selectedTile && (
            <>
              <button
                onClick={() => setShowBuildMenu(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Build</span>
              </button>

              <button
                onClick={() => {
                  if (selectedTile) {
                    upgradeBuilding(selectedTile)
                  }
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowUp className="h-4 w-4" />
                <span>Upgrade</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Squad Deployment Panel */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-800/90 rounded-lg p-4 max-w-xs">
        <h3 className="text-white font-medium mb-3">Available Squads</h3>
        {squads.length === 0 ? (
          <p className="text-slate-400 text-sm">No squads available for deployment</p>
        ) : (
          <div className="space-y-2">
            {squads.slice(0, 3).map(squad => (
              <div key={squad.id} className="flex items-center justify-between bg-slate-700 rounded p-2">
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
                  disabled={!selectedTile}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs transition-colors"
                >
                  Deploy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute top-20 left-4 z-20 bg-slate-800/90 rounded-lg p-4 max-w-sm">
        <h3 className="text-white font-medium mb-2">3D Controls</h3>
        <div className="text-sm text-slate-300 space-y-1">
          <p>• Click tiles to select them</p>
          <p>• Use camera controls to change view</p>
          <p>• Build structures on selected tiles</p>
          <p>• Deploy squads to strategic locations</p>
          <p>• End turn to generate resources</p>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-medium">3D Overworld Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Graphics Quality
                </label>
                <select className="w-full bg-slate-700 text-white rounded px-3 py-2">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Building Effects</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Auto-Follow Selected Tile</span>
                <input type="checkbox" className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Show Resource Animations</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 right-4 z-20 bg-red-900/90 text-red-300 p-4 rounded-lg max-w-sm">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}