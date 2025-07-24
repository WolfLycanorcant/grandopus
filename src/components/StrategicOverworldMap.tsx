import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { 
  HexCoordinate, 
  MapTile, 
  BuildingType, 
  TerrainType, 
  Faction, 
  ResourceType 
} from '../core/overworld'
import { 
  hexToPixel, 
  pixelToHex, 
  getHexNeighbors, 
  hexDistance,
  hexToKey 
} from '../core/overworld/HexUtils'
import { getTerrainColor } from '../core/overworld/TerrainData'
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
  Swords,
  Users,
  Coins,
  Info
} from 'lucide-react'

interface StrategicOverworldMapProps {
  onTileSelect?: (coordinate: HexCoordinate, tile: MapTile | null) => void
  selectedTile?: HexCoordinate | null
  showGrid?: boolean
  showResources?: boolean
  showInfluence?: boolean
}

export function StrategicOverworldMap({ 
  onTileSelect, 
  selectedTile, 
  showGrid = true,
  showResources = false,
  showInfluence = false 
}: StrategicOverworldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredTile, setHoveredTile] = useState<HexCoordinate | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  const { overworldManager } = useGameStore()

  const hexSize = 30
  const canvasWidth = 1200
  const canvasHeight = 800

  useEffect(() => {
    if (overworldManager) {
      drawMap()
    }
  }, [overworldManager, zoom, pan, selectedTile, hoveredTile, showGrid, showResources, showInfluence])

  const drawMap = () => {
    const canvas = canvasRef.current
    if (!canvas || !overworldManager) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    
    // Save context for transformations
    ctx.save()
    
    // Apply zoom and pan
    ctx.translate(canvasWidth / 2 + pan.x, canvasHeight / 2 + pan.y)
    ctx.scale(zoom, zoom)

    const state = overworldManager.getState()
    
    // Draw tiles
    state.tiles.forEach((tile, key) => {
      drawHexTile(ctx, tile)
    })

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, state.tiles)
    }

    // Draw influence zones if enabled
    if (showInfluence) {
      drawInfluenceZones(ctx, state.tiles)
    }

    // Draw resource indicators if enabled
    if (showResources) {
      drawResourceIndicators(ctx, state.tiles)
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

    // Add faction border
    if (tile.controlledBy !== Faction.NEUTRAL) {
      ctx.strokeStyle = getFactionColor(tile.controlledBy)
      ctx.lineWidth = 3
      ctx.stroke()
    }

    // Highlight selected tile
    if (selectedTile && 
        selectedTile.q === tile.coordinate.q && 
        selectedTile.r === tile.coordinate.r) {
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 4
      ctx.stroke()
    }

    // Highlight hovered tile
    if (hoveredTile && 
        hoveredTile.q === tile.coordinate.q && 
        hoveredTile.r === tile.coordinate.r) {
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw building
    if (tile.building) {
      drawBuilding(ctx, x, y, tile.building)
    }

    // Draw army
    if (tile.army) {
      drawArmy(ctx, x, y, tile.army.squads.length, tile.army.faction)
    }

    // Draw coordinate text (for debugging)
    if (zoom > 0.8) {
      ctx.fillStyle = '#000000'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${tile.coordinate.q},${tile.coordinate.r}`, x, y + 15)
    }
  }

  const drawBuilding = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    building: NonNullable<MapTile['building']>
  ) => {
    const size = 12 + (building.level * 3)
    
    // Building shape based on type
    ctx.fillStyle = getBuildingColor(building.type, building.faction)
    
    switch (building.type) {
      case BuildingType.CASTLE:
        // Draw castle as square with towers
        ctx.fillRect(x - size/2, y - size/2, size, size)
        ctx.fillRect(x - size/2 - 2, y - size/2 - 2, 4, 8)
        ctx.fillRect(x + size/2 - 2, y - size/2 - 2, 4, 8)
        break
      
      case BuildingType.CHURCH:
        // Draw church as cross
        ctx.fillRect(x - size/2, y - 2, size, 4)
        ctx.fillRect(x - 2, y - size/2, 4, size)
        break
      
      case BuildingType.FARM:
        // Draw farm as circle
        ctx.beginPath()
        ctx.arc(x, y, size/2, 0, Math.PI * 2)
        ctx.fill()
        break
      
      default:
        // Default building as square
        ctx.fillRect(x - size/2, y - size/2, size, size)
        break
    }

    // Construction progress indicator
    if (building.constructionProgress !== undefined) {
      const progress = building.constructionProgress / 100
      ctx.strokeStyle = '#00FF00'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y - size/2 - 5, 3, 0, Math.PI * 2 * progress)
      ctx.stroke()
    }
  }

  const drawArmy = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    squadCount: number, 
    faction: Faction
  ) => {
    const armySize = 8
    
    // Draw army indicator
    ctx.fillStyle = getFactionColor(faction)
    ctx.beginPath()
    ctx.arc(x + hexSize * 0.6, y - hexSize * 0.6, armySize, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw squad count
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(squadCount.toString(), x + hexSize * 0.6, y - hexSize * 0.6 + 3)
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, tiles: Map<string, MapTile>) => {
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1
    
    tiles.forEach(tile => {
      const { x, y } = hexToPixel(tile.coordinate, hexSize)
      
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
      ctx.stroke()
    })
  }

  const drawInfluenceZones = (ctx: CanvasRenderingContext2D, tiles: Map<string, MapTile>) => {
    // Draw influence gradients around faction territories
    tiles.forEach(tile => {
      if (tile.controlledBy !== Faction.NEUTRAL) {
        const { x, y } = hexToPixel(tile.coordinate, hexSize)
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, hexSize * 2)
        const factionColor = getFactionColor(tile.controlledBy)
        gradient.addColorStop(0, factionColor + '40') // 25% opacity
        gradient.addColorStop(1, factionColor + '00') // 0% opacity
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, hexSize * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  const drawResourceIndicators = (ctx: CanvasRenderingContext2D, tiles: Map<string, MapTile>) => {
    tiles.forEach(tile => {
      if (tile.building) {
        const { x, y } = hexToPixel(tile.coordinate, hexSize)
        
        // Draw resource generation icons
        const resources = Object.keys(tile.building.type === BuildingType.FARM ? 
          { food: 1 } : { gold: 1 })
        
        resources.forEach((resource, index) => {
          const iconX = x + (index - resources.length/2) * 8
          const iconY = y + hexSize * 0.8
          
          ctx.fillStyle = getResourceColor(resource as ResourceType)
          ctx.beginPath()
          ctx.arc(iconX, iconY, 3, 0, Math.PI * 2)
          ctx.fill()
        })
      }
    })
  }

  const getFactionColor = (faction: Faction): string => {
    switch (faction) {
      case Faction.PLAYER: return '#4A90E2'
      case Faction.ENEMY: return '#E24A4A'
      case Faction.ALLIED: return '#4AE24A'
      default: return '#888888'
    }
  }

  const getBuildingColor = (buildingType: BuildingType, faction: Faction): string => {
    const baseColor = getFactionColor(faction)
    
    switch (buildingType) {
      case BuildingType.CASTLE: return '#8B4513'
      case BuildingType.CHURCH: return '#FFFFFF'
      case BuildingType.FARM: return '#90EE90'
      case BuildingType.BLACKSMITH: return '#696969'
      default: return baseColor
    }
  }

  const getResourceColor = (resource: ResourceType): string => {
    switch (resource) {
      case ResourceType.GOLD: return '#FFD700'
      case ResourceType.WOOD: return '#8B4513'
      case ResourceType.STONE: return '#808080'
      case ResourceType.STEEL: return '#C0C0C0'
      case ResourceType.FOOD: return '#90EE90'
      case ResourceType.MANA_CRYSTALS: return '#9370DB'
      case ResourceType.HORSES: return '#8B4513'
      default: return '#FFFFFF'
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      setLastMousePos({ x: e.clientX, y: e.clientY })
    } else {
      // Handle tile hovering
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect && overworldManager) {
        const mouseX = e.clientX - rect.left - canvasWidth / 2 - pan.x
        const mouseY = e.clientY - rect.top - canvasHeight / 2 - pan.y
        
        const hexCoord = pixelToHex({ x: mouseX / zoom, y: mouseY / zoom }, hexSize)
        const tile = overworldManager.getTile(hexCoord)
        
        if (tile) {
          setHoveredTile(hexCoord)
        } else {
          setHoveredTile(null)
        }
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!overworldManager || isDragging) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left - canvasWidth / 2 - pan.x
      const mouseY = e.clientY - rect.top - canvasHeight / 2 - pan.y
      
      const hexCoord = pixelToHex({ x: mouseX / zoom, y: mouseY / zoom }, hexSize)
      const tile = overworldManager.getTile(hexCoord)
      
      if (onTileSelect) {
        onTileSelect(hexCoord, tile)
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.3, Math.min(3, prev * zoomFactor)))
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-slate-600 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-slate-800/90 rounded-lg p-3 space-y-2">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="block w-full bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
        >
          Zoom In
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.3, prev * 0.8))}
          className="block w-full bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
        >
          Zoom Out
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
          className="block w-full bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
        >
          Reset View
        </button>
      </div>

      {/* Tile Info Panel */}
      {hoveredTile && overworldManager && (
        <TileInfoPanel 
          coordinate={hoveredTile}
          tile={overworldManager.getTile(hoveredTile)}
        />
      )}
    </div>
  )
}

interface TileInfoPanelProps {
  coordinate: HexCoordinate
  tile: MapTile | null
}

function TileInfoPanel({ coordinate, tile }: TileInfoPanelProps) {
  if (!tile) return null

  return (
    <div className="absolute bottom-4 left-4 bg-slate-800/95 rounded-lg p-4 min-w-64 text-sm">
      <div className="text-white font-medium mb-2">
        Tile ({coordinate.q}, {coordinate.r})
      </div>
      
      <div className="space-y-1 text-slate-300">
        <div>Terrain: {tile.terrain}</div>
        <div>Controlled by: {tile.controlledBy}</div>
        
        {tile.building && (
          <div className="mt-2">
            <div className="text-white font-medium">Building:</div>
            <div>{tile.building.type} (Level {tile.building.level})</div>
            {tile.building.constructionProgress !== undefined && (
              <div>Construction: {Math.round(tile.building.constructionProgress)}%</div>
            )}
          </div>
        )}
        
        {tile.army && (
          <div className="mt-2">
            <div className="text-white font-medium">Army:</div>
            <div>{tile.army.squads.length} squads ({tile.army.faction})</div>
            <div>Movement: {tile.army.movementPoints}/{tile.army.maxMovementPoints}</div>
          </div>
        )}
      </div>
    </div>
  )
}