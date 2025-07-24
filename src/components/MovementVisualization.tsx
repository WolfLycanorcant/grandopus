import React, { useEffect, useRef } from 'react'
import { 
  HexCoordinate, 
  MapTile, 
  Faction 
} from '../core/overworld'
import { ArmyMovementSystem } from '../core/overworld/ArmyMovementSystem'
import { PathfindingSystem } from '../core/overworld/PathfindingSystem'
import { hexToPixel, hexToKey } from '../core/overworld/HexUtils'

interface MovementVisualizationProps {
  tiles: Map<string, MapTile>
  selectedArmy?: { coordinate: HexCoordinate; tile: MapTile } | null
  hoveredDestination?: HexCoordinate | null
  hexSize: number
  zoom: number
  pan: { x: number; y: number }
  canvasWidth: number
  canvasHeight: number
}

export function MovementVisualization({
  tiles,
  selectedArmy,
  hoveredDestination,
  hexSize,
  zoom,
  pan,
  canvasWidth,
  canvasHeight
}: MovementVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    drawMovementOverlay()
  }, [selectedArmy, hoveredDestination, tiles, zoom, pan])

  const drawMovementOverlay = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    if (!selectedArmy?.tile.army) return

    // Save context for transformations
    ctx.save()
    
    // Apply zoom and pan
    ctx.translate(canvasWidth / 2 + pan.x, canvasHeight / 2 + pan.y)
    ctx.scale(zoom, zoom)

    // Get valid movement destinations
    const validDestinations = ArmyMovementSystem.getValidMovementDestinations(
      selectedArmy.coordinate,
      selectedArmy.tile.army.movementPoints,
      tiles,
      Faction.PLAYER
    )

    // Draw movement range
    drawMovementRange(ctx, validDestinations)

    // Draw path to hovered destination
    if (hoveredDestination) {
      drawMovementPath(ctx, selectedArmy.coordinate, hoveredDestination)
    }

    // Restore context
    ctx.restore()
  }

  const drawMovementRange = (
    ctx: CanvasRenderingContext2D,
    destinations: Array<{
      coordinate: HexCoordinate
      movementCost: number
      canEngage: boolean
      tacticalValue: number
    }>
  ) => {
    destinations.forEach(dest => {
      const { x, y } = hexToPixel(dest.coordinate, hexSize)
      
      // Draw movement range indicator
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

      // Color based on movement cost and tactical value
      let fillColor: string
      let strokeColor: string

      if (dest.canEngage) {
        // Combat target - red
        fillColor = 'rgba(239, 68, 68, 0.3)'
        strokeColor = 'rgba(239, 68, 68, 0.8)'
      } else if (dest.tacticalValue > 50) {
        // High value target - yellow
        fillColor = 'rgba(251, 191, 36, 0.3)'
        strokeColor = 'rgba(251, 191, 36, 0.8)'
      } else if (dest.movementCost <= 1) {
        // Easy movement - green
        fillColor = 'rgba(34, 197, 94, 0.3)'
        strokeColor = 'rgba(34, 197, 94, 0.8)'
      } else {
        // Normal movement - blue
        fillColor = 'rgba(59, 130, 246, 0.3)'
        strokeColor = 'rgba(59, 130, 246, 0.8)'
      }

      ctx.fillStyle = fillColor
      ctx.fill()
      
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw movement cost indicator
      if (zoom > 0.7) {
        ctx.fillStyle = strokeColor
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(dest.movementCost.toString(), x, y - 5)
      }

      // Draw tactical indicators
      if (dest.canEngage && zoom > 0.5) {
        drawCombatIndicator(ctx, x, y + 10)
      }
      
      if (dest.tacticalValue > 50 && !dest.canEngage && zoom > 0.5) {
        drawValueIndicator(ctx, x, y + 10)
      }
    })
  }

  const drawMovementPath = (
    ctx: CanvasRenderingContext2D,
    from: HexCoordinate,
    to: HexCoordinate
  ) => {
    if (!selectedArmy?.tile.army) return

    const path = PathfindingSystem.findPath(
      from,
      to,
      tiles,
      {
        faction: Faction.PLAYER,
        maxDistance: selectedArmy.tile.army.movementPoints,
        avoidEnemies: false
      }
    )

    if (!path.isValid || path.tiles.length < 2) return

    // Draw path line
    ctx.strokeStyle = path.isValid ? 'rgba(255, 255, 255, 0.8)' : 'rgba(239, 68, 68, 0.8)'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])
    
    ctx.beginPath()
    
    for (let i = 0; i < path.tiles.length; i++) {
      const { x, y } = hexToPixel(path.tiles[i], hexSize)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()
    ctx.setLineDash([]) // Reset line dash

    // Draw path waypoints
    path.tiles.forEach((coord, index) => {
      if (index === 0 || index === path.tiles.length - 1) return // Skip start and end
      
      const { x, y } = hexToPixel(coord, hexSize)
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw destination marker
    const destPos = hexToPixel(to, hexSize)
    drawDestinationMarker(ctx, destPos.x, destPos.y, path.isValid)

    // Draw path info
    if (zoom > 0.6) {
      drawPathInfo(ctx, destPos.x, destPos.y + hexSize + 15, path)
    }
  }

  const drawCombatIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 1
    
    // Draw crossed swords icon (simplified)
    ctx.beginPath()
    ctx.moveTo(x - 4, y - 4)
    ctx.lineTo(x + 4, y + 4)
    ctx.moveTo(x + 4, y - 4)
    ctx.lineTo(x - 4, y + 4)
    ctx.stroke()
  }

  const drawValueIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.9)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 1
    
    // Draw star icon (simplified)
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  const drawDestinationMarker = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    isValid: boolean
  ) => {
    const color = isValid ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'
    
    ctx.fillStyle = color
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    
    // Draw target marker
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // Draw inner circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawPathInfo = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    path: { totalCost: number; isValid: boolean; blockedBy?: string }
  ) => {
    const text = path.isValid 
      ? `Cost: ${path.totalCost}` 
      : `Blocked: ${path.blockedBy || 'Unknown'}`
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(x - 30, y - 8, 60, 16)
    
    ctx.fillStyle = path.isValid ? 'rgba(255, 255, 255, 0.9)' : 'rgba(239, 68, 68, 0.9)'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, x, y + 3)
  }

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  )
}

// Hook for managing movement state
export function useMovementState() {
  const [selectedArmy, setSelectedArmy] = React.useState<{
    coordinate: HexCoordinate
    tile: MapTile
  } | null>(null)
  
  const [hoveredDestination, setHoveredDestination] = React.useState<HexCoordinate | null>(null)
  const [movementMode, setMovementMode] = React.useState<'idle' | 'selecting' | 'planning'>('idle')

  const selectArmy = (coordinate: HexCoordinate, tile: MapTile) => {
    if (tile.army && tile.army.faction === Faction.PLAYER) {
      setSelectedArmy({ coordinate, tile })
      setMovementMode('selecting')
    } else {
      clearSelection()
    }
  }

  const clearSelection = () => {
    setSelectedArmy(null)
    setHoveredDestination(null)
    setMovementMode('idle')
  }

  const hoverDestination = (coordinate: HexCoordinate | null) => {
    if (movementMode === 'selecting') {
      setHoveredDestination(coordinate)
    }
  }

  return {
    selectedArmy,
    hoveredDestination,
    movementMode,
    selectArmy,
    clearSelection,
    hoverDestination
  }
}