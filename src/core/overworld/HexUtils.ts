import { HexCoordinate } from './types'

/**
 * Hex grid utilities for axial coordinate system
 * Based on Red Blob Games hex grid guide
 */

/**
 * Convert hex coordinate to string key for maps
 */
export function hexToKey(hex: HexCoordinate): string {
  return `${hex.q},${hex.r}`
}

/**
 * Convert string key back to hex coordinate
 */
export function keyToHex(key: string): HexCoordinate {
  const [q, r] = key.split(',').map(Number)
  return { q, r }
}

/**
 * Calculate distance between two hex coordinates
 */
export function hexDistance(a: HexCoordinate, b: HexCoordinate): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2
}

/**
 * Get all neighbors of a hex coordinate
 */
export function getHexNeighbors(hex: HexCoordinate): HexCoordinate[] {
  const directions = [
    { q: 1, r: 0 },   // East
    { q: 1, r: -1 },  // Northeast
    { q: 0, r: -1 },  // Northwest
    { q: -1, r: 0 },  // West
    { q: -1, r: 1 },  // Southwest
    { q: 0, r: 1 }    // Southeast
  ]
  
  return directions.map(dir => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r
  }))
}

/**
 * Get neighbor in a specific direction (0-5)
 */
export function getHexNeighbor(hex: HexCoordinate, direction: number): HexCoordinate {
  const directions = [
    { q: 1, r: 0 },   // 0: East
    { q: 1, r: -1 },  // 1: Northeast
    { q: 0, r: -1 },  // 2: Northwest
    { q: -1, r: 0 },  // 3: West
    { q: -1, r: 1 },  // 4: Southwest
    { q: 0, r: 1 }    // 5: Southeast
  ]
  
  const dir = directions[direction % 6]
  return {
    q: hex.q + dir.q,
    r: hex.r + dir.r
  }
}

/**
 * Get all hexes within a certain range
 */
export function getHexesInRange(center: HexCoordinate, range: number): HexCoordinate[] {
  const results: HexCoordinate[] = []
  
  for (let q = -range; q <= range; q++) {
    const r1 = Math.max(-range, -q - range)
    const r2 = Math.min(range, -q + range)
    
    for (let r = r1; r <= r2; r++) {
      results.push({
        q: center.q + q,
        r: center.r + r
      })
    }
  }
  
  return results
}

/**
 * Get hexes in a ring at specific distance
 */
export function getHexRing(center: HexCoordinate, radius: number): HexCoordinate[] {
  if (radius === 0) {
    return [center]
  }
  
  const results: HexCoordinate[] = []
  let hex = {
    q: center.q + radius,
    r: center.r - radius
  }
  
  // Walk around the ring
  for (let direction = 0; direction < 6; direction++) {
    for (let step = 0; step < radius; step++) {
      results.push({ ...hex })
      hex = getHexNeighbor(hex, direction)
    }
  }
  
  return results
}

/**
 * Convert hex coordinate to pixel position
 */
export function hexToPixel(hex: HexCoordinate, size: number): { x: number; y: number } {
  const x = size * (3/2 * hex.q)
  const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r)
  return { x, y }
}

/**
 * Convert pixel position to hex coordinate
 */
export function pixelToHex(point: { x: number; y: number }, size: number): HexCoordinate {
  const q = (2/3 * point.x) / size
  const r = (-1/3 * point.x + Math.sqrt(3)/3 * point.y) / size
  return hexRound({ q, r })
}

/**
 * Round fractional hex coordinates to nearest hex
 */
export function hexRound(hex: { q: number; r: number }): HexCoordinate {
  const s = -hex.q - hex.r
  
  let rq = Math.round(hex.q)
  let rr = Math.round(hex.r)
  let rs = Math.round(s)
  
  const qDiff = Math.abs(rq - hex.q)
  const rDiff = Math.abs(rr - hex.r)
  const sDiff = Math.abs(rs - s)
  
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs
  } else if (rDiff > sDiff) {
    rr = -rq - rs
  }
  
  return { q: rq, r: rr }
}

/**
 * Linear interpolation between two hex coordinates
 */
export function hexLerp(a: HexCoordinate, b: HexCoordinate, t: number): { q: number; r: number } {
  return {
    q: a.q * (1 - t) + b.q * t,
    r: a.r * (1 - t) + b.r * t
  }
}

/**
 * Get line of hexes between two coordinates
 */
export function hexLineDraw(a: HexCoordinate, b: HexCoordinate): HexCoordinate[] {
  const distance = hexDistance(a, b)
  const results: HexCoordinate[] = []
  
  for (let i = 0; i <= distance; i++) {
    const t = distance === 0 ? 0 : i / distance
    const lerped = hexLerp(a, b, t)
    results.push(hexRound(lerped))
  }
  
  return results
}

/**
 * Check if hex coordinate is valid within map bounds
 */
export function isHexInBounds(hex: HexCoordinate, mapWidth: number, mapHeight: number): boolean {
  // Convert to offset coordinates for bounds checking
  const col = hex.q + Math.floor((hex.r + (hex.r & 1)) / 2)
  const row = hex.r
  
  return col >= 0 && col < mapWidth && row >= 0 && row < mapHeight
}

/**
 * Convert axial coordinates to offset coordinates (for rectangular grids)
 */
export function axialToOffset(hex: HexCoordinate): { col: number; row: number } {
  const col = hex.q + Math.floor((hex.r + (hex.r & 1)) / 2)
  const row = hex.r
  return { col, row }
}

/**
 * Convert offset coordinates to axial coordinates
 */
export function offsetToAxial(col: number, row: number): HexCoordinate {
  const q = col - Math.floor((row + (row & 1)) / 2)
  const r = row
  return { q, r }
}

/**
 * Generate spiral pattern of hexes (useful for map generation)
 */
export function hexSpiral(center: HexCoordinate, maxRadius: number): HexCoordinate[] {
  const results: HexCoordinate[] = [center]
  
  for (let radius = 1; radius <= maxRadius; radius++) {
    results.push(...getHexRing(center, radius))
  }
  
  return results
}

/**
 * Get hex coordinates for a rectangular map
 */
export function generateRectangularHexMap(width: number, height: number): HexCoordinate[] {
  const hexes: HexCoordinate[] = []
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      hexes.push(offsetToAxial(col, row))
    }
  }
  
  return hexes
}

/**
 * Calculate hex area (useful for territory calculations)
 */
export function calculateHexArea(hexes: HexCoordinate[]): number {
  return hexes.length
}

/**
 * Find center of mass for a group of hexes
 */
export function findHexCenterOfMass(hexes: HexCoordinate[]): HexCoordinate {
  if (hexes.length === 0) {
    return { q: 0, r: 0 }
  }
  
  const totalQ = hexes.reduce((sum, hex) => sum + hex.q, 0)
  const totalR = hexes.reduce((sum, hex) => sum + hex.r, 0)
  
  return hexRound({
    q: totalQ / hexes.length,
    r: totalR / hexes.length
  })
}