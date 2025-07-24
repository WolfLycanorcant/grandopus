import React, { useState, useRef, useEffect } from 'react'
import { 
  OverworldManager, 
  MapTile, 
  HexCoordinate, 
  TerrainType, 
  BuildingType, 
  Faction,
  ResourceType
} from '../core/overworld'
import { hexToPixel, hexToKey, pixelToHex } from '../core/overworld/HexUtils'
import { getTerrainColor } from '../core/overworld/TerrainData'
import { 
  Castle, 
  Home, 
  Church, 
  Wheat, 
  Hammer, 
  Shield, 
  Eye, 
  Mountain,
  Coins,
  Users,
  Swords
} from 'lucide-react'
import clsx from 'clsx'

interface OverworldMapProps {
  overworldManager: OverworldManager
  onTileSelected?: (tile: MapTile) => void
  onEndTurn?: () => void
}

export function OverworldMap({ overworldManager, onTileSelected, onEndTurn }: OverworldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTile, setSelectedTile] = useState<MapTile | null>(null)
  const [hoveredTile, setHoveredTile] = useState<MapTile | null>(null)
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  
  const hexSize = 30
  const state = overworldManager.getState()
  const playerResources = overworldManager.getPlayerResources(Faction.PLAYER)
  
  useEffect(() => {
    drawMap()
  }, [state, selectedTile, hoveredTile, viewOffset, scale])
  
  const drawMap = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Save context for transformations
    ctx.save()
    
    // Apply view transformations
    ctx.translate(viewOffset.x, viewOffset.y)
    ctx.scale(scale, scale)
    
    // Draw all tiles
    const tiles = overworldManager.getAllTiles()
    
    for (const tile of tiles) {
      drawHexTile(ctx, tile)
    }
    
    // Restore context
    ctx.restore()
  }
  
  const drawHexTile = (ctx: CanvasRenderingContext2D, tile: MapTile) => {
    const { x, y } = hexToPixel(tile.coordinate, hexSize)
    
    // Draw hex shape
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const hexX = x + hexSize * Math.cos(angle)
      const hexY = y + hexSize * Math.sin(angle)
      
      if (i === 0) {
        ctx.moveTo(hexX, hexY)
      } else {
        ctx.lineTo(hexX, hexY)
      }
    }
    ctx.closePath()
    
    // Fill with terrain color
    ctx.fillStyle = getTerrainColor(tile.terrain)
    ctx.fill()
    
    // Border color based on control
    let borderColor = '#666'
    let borderWidth = 1
    
    if (tile === selectedTile) {
      borderColor = '#ffff00'
      borderWidth = 3
    } else if (tile === hoveredTile) {
      borderColor = '#ffffff'
      borderWidth = 2
    } else if (tile.controlledBy === Faction.PLAYER) {
      borderColor = '#00ff00'
      borderWidth = 2
    } else if (tile.controlledBy === Faction.ENEMY) {
      borderColor = '#ff0000'
      borderWidth = 2
    }
    
    ctx.strokeStyle = borderColor
    ctx.lineWidth = borderWidth
    ctx.stroke()
    
    // Draw building icon
    if (tile.building) {
      drawBuildingIcon(ctx, x, y, tile.building.type, tile.building.faction)
    }
    
    // Draw army indicator
    if (tile.army) {
      drawArmyIndicator(ctx, x, y, tile.army.faction)
    }
    
    // Draw coordinate text (for debugging)
    if (scale > 0.8) {
      ctx.fillStyle = '#000'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${tile.coordinate.q},${tile.coordinate.r}`, x, y + 15)
    }
  }
  
  const drawBuildingIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, building: BuildingType, faction: Faction) => {
    const size = 12
    
    // Building background
    ctx.fillStyle = faction === Faction.PLAYER ? '#00ff0080' : 
                   faction === Faction.ENEMY ? '#ff000080' : '#88888880'
    ctx.fillRect(x - size/2, y - size/2, size, size)
    
    // Simple building representation
    ctx.fillStyle = '#000'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    
    let icon = '?'
    switch (building) {
      case BuildingType.SETTLEMENT: icon = '🏠'; break
      case BuildingType.CASTLE: icon = '🏰'; break
      case BuildingType.CHURCH: icon = '⛪'; break
      case BuildingType.FARM: icon = '🌾'; break
      case BuildingType.BLACKSMITH: icon = '🔨'; break
      case BuildingType.OUTPOST: icon = '🛡️'; break
      case BuildingType.TOWER: icon = '🗼'; break
      case BuildingType.MINE: icon = '⛏️'; break
      case BuildingType.LUMBER_MILL: icon = '🪓'; break
    }
    
    ctx.fillText(icon, x, y + 4)
  }
  
  const drawArmyIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number, faction: Faction) => {
    const radius = 6
    
    ctx.beginPath()
    ctx.arc(x + 15, y - 15, radius, 0, 2 * Math.PI)
    ctx.fillStyle = faction === Faction.PLAYER ? '#00ff00' : '#ff0000'
    ctx.fill()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // Army icon
    ctx.fillStyle = '#000'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('⚔️', x + 15, y - 11)
  }
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - viewOffset.x) / scale
    const y = (event.clientY - rect.top - viewOffset.y) / scale
    
    const hexCoord = pixelToHex({ x, y }, hexSize)
    const tile = overworldManager.getTile(hexCoord)
    
    if (tile) {
      setSelectedTile(tile)
      onTileSelected?.(tile)
    }
  }
  
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left - viewOffset.x) / scale
    const y = (event.clientY - rect.top - viewOffset.y) / scale
    
    const hexCoord = pixelToHex({ x, y }, hexSize)
    const tile = overworldManager.getTile(hexCoord)
    
    setHoveredTile(tile)
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
  
  const getResourceIcon = (resource: ResourceType) => {
    switch (resource) {
      case ResourceType.GOLD: return <Coins className="h-4 w-4 text-yellow-400" />
      default: return <div className="h-4 w-4 bg-gray-400 rounded" />
    }
  }
  
  return (
    <div className="flex h-full">
      {/* Map Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-slate-600 cursor-pointer"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 space-y-2">
          <button
            onClick={() => setScale(Math.min(scale * 1.2, 3))}
            className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600"
          >
            Zoom In
          </button>
          <button
            onClick={() => setScale(Math.max(scale / 1.2, 0.3))}
            className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600"
          >
            Zoom Out
          </button>
          <button
            onClick={() => { setViewOffset({ x: 0, y: 0 }); setScale(1) }}
            className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600"
          >
            Reset View
          </button>
        </div>
      </div>
      
      {/* Side Panel */}
      <div className="w-80 bg-slate-800 p-4 space-y-4 overflow-y-auto">
        {/* Game Info */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Game Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Turn:</span>
              <span className="text-white">{state.currentTurn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Player:</span>
              <span className={clsx(
                'font-medium',
                state.activePlayer === Faction.PLAYER ? 'text-green-400' : 'text-red-400'
              )}>
                {state.activePlayer === Faction.PLAYER ? 'You' : 'Enemy'}
              </span>
            </div>
          </div>
          
          <button
            onClick={onEndTurn}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            End Turn
          </button>
        </div>
        
        {/* Resources */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Resources</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(playerResources).map(([resource, amount]) => (
              <div key={resource} className="flex items-center space-x-2">
                {getResourceIcon(resource as ResourceType)}
                <span className="text-slate-400 capitalize">{resource}:</span>
                <span className="text-white font-medium">{amount}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Selected Tile Info */}
        {selectedTile && (
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Tile Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinate:</span>
                <span className="text-white">{hexToKey(selectedTile.coordinate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Terrain:</span>
                <span className="text-white capitalize">{selectedTile.terrain.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Controlled by:</span>
                <span className={clsx(
                  'font-medium capitalize',
                  selectedTile.controlledBy === Faction.PLAYER ? 'text-green-400' :
                  selectedTile.controlledBy === Faction.ENEMY ? 'text-red-400' :
                  'text-gray-400'
                )}>
                  {selectedTile.controlledBy}
                </span>
              </div>
              
              {selectedTile.building && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="flex items-center space-x-2 mb-2">
                    {getBuildingIcon(selectedTile.building.type)}
                    <span className="text-white font-medium capitalize">
                      {selectedTile.building.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">Lv.{selectedTile.building.level}</span>
                  </div>
                  
                  {selectedTile.building.constructionProgress !== undefined && (
                    <div className="mt-2">
                      <div className="text-xs text-slate-400 mb-1">Construction Progress</div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedTile.building.constructionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedTile.army && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <Swords className="h-4 w-4" />
                    <span className="text-white font-medium">Army</span>
                    <span className={clsx(
                      'text-xs px-2 py-1 rounded',
                      selectedTile.army.faction === Faction.PLAYER ? 'bg-green-600' : 'bg-red-600'
                    )}>
                      {selectedTile.army.faction}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {selectedTile.army.squads.length} squad(s)
                  </div>
                  <div className="text-xs text-slate-400">
                    Movement: {selectedTile.army.movementPoints}/{selectedTile.army.maxMovementPoints}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Recent Notifications */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Recent Events</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {overworldManager.getNotifications(5).map((notification, index) => (
              <div key={index} className={clsx(
                'text-xs p-2 rounded',
                notification.type === 'success' ? 'bg-green-900/20 text-green-300' :
                notification.type === 'warning' ? 'bg-yellow-900/20 text-yellow-300' :
                notification.type === 'error' ? 'bg-red-900/20 text-red-300' :
                'bg-blue-900/20 text-blue-300'
              )}>
                <div className="font-medium">{notification.message}</div>
                <div className="text-slate-500">Turn {notification.turn}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}