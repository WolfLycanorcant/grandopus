import { Unit } from '../units'
import { Squad } from '../squads'
import { OverworldManager } from '../overworld'

/**
 * Save Manager - Handles game state persistence
 */
export class SaveManager {
  private static readonly SAVE_KEY_PREFIX = 'grand_opus_save_'
  private static readonly MAX_SAVE_SLOTS = 10
  private static readonly AUTO_SAVE_SLOT = 'auto'

  /**
   * Save game state to a specific slot
   */
  public static saveGame(slotId: string, gameState: GameSaveData): boolean {
    try {
      const saveData: SaveFile = {
        version: '1.0.0',
        timestamp: Date.now(),
        slotId,
        gameState,
        metadata: {
          playerName: 'Player',
          currentTurn: gameState.currentTurn,
          totalPlayTime: 0,
          unitsCount: gameState.units.length,
          squadsCount: gameState.squads.length
        }
      }

      const serializedData = JSON.stringify(saveData, null, 2)
      const saveKey = this.SAVE_KEY_PREFIX + slotId
      
      localStorage.setItem(saveKey, serializedData)
      
      // Update save slot metadata
      this.updateSaveSlotMetadata(slotId, saveData.metadata)
      
      console.log(`Game saved to slot ${slotId}`)
      return true
    } catch (error) {
      console.error('Failed to save game:', error)
      return false
    }
  }

  /**
   * Load game state from a specific slot
   */
  public static loadGame(slotId: string): GameSaveData | null {
    try {
      const saveKey = this.SAVE_KEY_PREFIX + slotId
      const serializedData = localStorage.getItem(saveKey)
      
      if (!serializedData) {
        console.warn(`No save data found for slot ${slotId}`)
        return null
      }

      const saveFile: SaveFile = JSON.parse(serializedData)
      
      // Validate save file version
      if (!this.isCompatibleVersion(saveFile.version)) {
        console.error(`Incompatible save file version: ${saveFile.version}`)
        return null
      }

      console.log(`Game loaded from slot ${slotId}`)
      return saveFile.gameState
    } catch (error) {
      console.error('Failed to load game:', error)
      return null
    }
  }

  /**
   * Auto-save the current game state
   */
  public static autoSave(gameState: GameSaveData): boolean {
    return this.saveGame(this.AUTO_SAVE_SLOT, gameState)
  }

  /**
   * Load auto-save data
   */
  public static loadAutoSave(): GameSaveData | null {
    return this.loadGame(this.AUTO_SAVE_SLOT)
  }

  /**
   * Get all available save slots with metadata
   */
  public static getSaveSlots(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = []
    
    for (let i = 0; i < this.MAX_SAVE_SLOTS; i++) {
      const slotId = i.toString()
      const saveKey = this.SAVE_KEY_PREFIX + slotId
      const serializedData = localStorage.getItem(saveKey)
      
      if (serializedData) {
        try {
          const saveFile: SaveFile = JSON.parse(serializedData)
          slots.push({
            slotId,
            isEmpty: false,
            metadata: saveFile.metadata,
            timestamp: saveFile.timestamp
          })
        } catch (error) {
          // Corrupted save file
          slots.push({
            slotId,
            isEmpty: false,
            metadata: null,
            timestamp: 0,
            isCorrupted: true
          })
        }
      } else {
        slots.push({
          slotId,
          isEmpty: true,
          metadata: null,
          timestamp: 0
        })
      }
    }

    // Add auto-save slot
    const autoSaveData = localStorage.getItem(this.SAVE_KEY_PREFIX + this.AUTO_SAVE_SLOT)
    if (autoSaveData) {
      try {
        const saveFile: SaveFile = JSON.parse(autoSaveData)
        slots.unshift({
          slotId: this.AUTO_SAVE_SLOT,
          isEmpty: false,
          metadata: saveFile.metadata,
          timestamp: saveFile.timestamp,
          isAutoSave: true
        })
      } catch (error) {
        slots.unshift({
          slotId: this.AUTO_SAVE_SLOT,
          isEmpty: false,
          metadata: null,
          timestamp: 0,
          isCorrupted: true,
          isAutoSave: true
        })
      }
    }

    return slots.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Delete a save slot
   */
  public static deleteSave(slotId: string): boolean {
    try {
      const saveKey = this.SAVE_KEY_PREFIX + slotId
      localStorage.removeItem(saveKey)
      
      // Remove from metadata
      this.removeSaveSlotMetadata(slotId)
      
      console.log(`Save slot ${slotId} deleted`)
      return true
    } catch (error) {
      console.error('Failed to delete save:', error)
      return false
    }
  }

  /**
   * Export save data as downloadable file
   */
  public static exportSave(slotId: string): boolean {
    try {
      const saveKey = this.SAVE_KEY_PREFIX + slotId
      const serializedData = localStorage.getItem(saveKey)
      
      if (!serializedData) {
        console.error(`No save data found for slot ${slotId}`)
        return false
      }

      const blob = new Blob([serializedData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `grand_opus_save_${slotId}_${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      console.log(`Save exported for slot ${slotId}`)
      return true
    } catch (error) {
      console.error('Failed to export save:', error)
      return false
    }
  }

  /**
   * Import save data from file
   */
  public static async importSave(file: File, targetSlotId: string): Promise<boolean> {
    try {
      const text = await file.text()
      const saveFile: SaveFile = JSON.parse(text)
      
      // Validate save file
      if (!this.isValidSaveFile(saveFile)) {
        console.error('Invalid save file format')
        return false
      }

      if (!this.isCompatibleVersion(saveFile.version)) {
        console.error(`Incompatible save file version: ${saveFile.version}`)
        return false
      }

      // Save to target slot
      const saveKey = this.SAVE_KEY_PREFIX + targetSlotId
      localStorage.setItem(saveKey, text)
      
      // Update metadata
      this.updateSaveSlotMetadata(targetSlotId, saveFile.metadata)
      
      console.log(`Save imported to slot ${targetSlotId}`)
      return true
    } catch (error) {
      console.error('Failed to import save:', error)
      return false
    }
  }

  /**
   * Get total storage usage
   */
  public static getStorageUsage(): { used: number; total: number; percentage: number } {
    let totalSize = 0
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.SAVE_KEY_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += value.length
        }
      }
    }

    // Estimate total available storage (5MB typical limit)
    const estimatedTotal = 5 * 1024 * 1024 // 5MB in bytes
    const percentage = (totalSize / estimatedTotal) * 100

    return {
      used: totalSize,
      total: estimatedTotal,
      percentage: Math.min(percentage, 100)
    }
  }

  /**
   * Clear all save data
   */
  public static clearAllSaves(): boolean {
    try {
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.SAVE_KEY_PREFIX)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      // Clear metadata
      localStorage.removeItem('grand_opus_save_metadata')
      
      console.log('All save data cleared')
      return true
    } catch (error) {
      console.error('Failed to clear save data:', error)
      return false
    }
  }

  /**
   * Check if save file version is compatible
   */
  private static isCompatibleVersion(version: string): boolean {
    // For now, only accept exact version match
    // In future, implement version migration
    return version === '1.0.0'
  }

  /**
   * Validate save file structure
   */
  private static isValidSaveFile(saveFile: any): saveFile is SaveFile {
    return (
      saveFile &&
      typeof saveFile.version === 'string' &&
      typeof saveFile.timestamp === 'number' &&
      typeof saveFile.slotId === 'string' &&
      saveFile.gameState &&
      saveFile.metadata
    )
  }

  /**
   * Update save slot metadata
   */
  private static updateSaveSlotMetadata(slotId: string, metadata: SaveMetadata): void {
    try {
      const metadataKey = 'grand_opus_save_metadata'
      const existingMetadata = JSON.parse(localStorage.getItem(metadataKey) || '{}')
      
      existingMetadata[slotId] = metadata
      
      localStorage.setItem(metadataKey, JSON.stringify(existingMetadata))
    } catch (error) {
      console.error('Failed to update save metadata:', error)
    }
  }

  /**
   * Remove save slot metadata
   */
  private static removeSaveSlotMetadata(slotId: string): void {
    try {
      const metadataKey = 'grand_opus_save_metadata'
      const existingMetadata = JSON.parse(localStorage.getItem(metadataKey) || '{}')
      
      delete existingMetadata[slotId]
      
      localStorage.setItem(metadataKey, JSON.stringify(existingMetadata))
    } catch (error) {
      console.error('Failed to remove save metadata:', error)
    }
  }
}

/**
 * Game save data structure
 */
export interface GameSaveData {
  // Core game state
  units: any[] // Serialized units
  squads: any[] // Serialized squads
  currentTurn: number
  playerResources: Record<string, number>
  
  // Overworld state
  overworldState?: any
  
  // Game settings
  settings: {
    difficulty: string
    autoSave: boolean
    soundEnabled: boolean
    musicEnabled: boolean
  }
  
  // Statistics
  statistics: {
    battlesWon: number
    battlesLost: number
    unitsCreated: number
    squadsCreated: number
    totalPlayTime: number
  }
}

/**
 * Save file structure
 */
export interface SaveFile {
  version: string
  timestamp: number
  slotId: string
  gameState: GameSaveData
  metadata: SaveMetadata
}

/**
 * Save metadata for UI display
 */
export interface SaveMetadata {
  playerName: string
  currentTurn: number
  totalPlayTime: number
  unitsCount: number
  squadsCount: number
}

/**
 * Save slot information
 */
export interface SaveSlotInfo {
  slotId: string
  isEmpty: boolean
  metadata: SaveMetadata | null
  timestamp: number
  isCorrupted?: boolean
  isAutoSave?: boolean
}