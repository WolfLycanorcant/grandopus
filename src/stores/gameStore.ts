import { create } from 'zustand'
import { Unit, UnitFactory } from '../core/units'
import { UnitCostCalculator } from '../core/units/UnitCostCalculator'
import { Squad, SquadFactory, SQUAD_PRESETS } from '../core/squads'
import { BattleManager, BattleResult, BattleTurn, BattleState } from '../core/battle'
import { OverworldManager, HexCoordinate, BuildingType, Faction, ResourceType } from '../core/overworld'
import { SaveManager, GameSaveData, SaveSlotInfo } from '../core/save'

interface GameState {
  // Units
  units: Unit[]
  selectedUnit: Unit | null

  // Squads
  squads: Squad[]
  selectedSquad: Squad | null

  // Battle
  battleManager: BattleManager | null
  currentBattle: BattleState | null
  battleResult: BattleResult | null
  battleLog: BattleTurn[]

  // Overworld
  overworldManager: OverworldManager | null
  playerResources: Record<ResourceType, number>
  currentTurn: number

  // UI State
  isLoading: boolean
  error: string | null
}

interface GameActions {
  // Unit actions
  createUnit: (config: Parameters<typeof UnitFactory.createUnit>[0]) => Promise<{ success: boolean; unit?: Unit; error?: string }>
  createRandomUnit: (level?: number) => Promise<{ success: boolean; unit?: Unit; error?: string }>
  addUnit: (unit: Unit) => void
  selectUnit: (unit: Unit | null) => void
  deleteUnit: (unitId: string) => void
  
  // Unit cost utilities
  getUnitCreationCost: (race: string, archetype: string, level?: number) => ReturnType<typeof UnitCostCalculator.calculateUnitCreationCost>
  canAffordUnit: (race: string, archetype: string, level?: number) => ReturnType<typeof UnitCostCalculator.canAffordUnit>

  // Squad actions
  createSquad: (config: Parameters<typeof SquadFactory.createSquad>[0]) => void
  createSquadFromPreset: (presetKey: keyof typeof SQUAD_PRESETS, customName?: string) => void
  selectSquad: (squad: Squad | null) => void
  deleteSquad: (squadId: string) => void
  addUnitToSquad: (squadId: string, unit: Unit) => void
  removeUnitFromSquad: (squadId: string, unitId: string) => void

  // Battle actions
  startBattle: (attackingSquad: Squad, defendingSquad: Squad) => void
  executeBattle: () => void
  clearBattle: () => void

  // Overworld actions
  initializeOverworld: () => void
  deploySquad: (squadId: string, coordinate: HexCoordinate) => void
  recallSquad: (coordinate: HexCoordinate) => void
  buildStructure: (coordinate: HexCoordinate, buildingType: BuildingType) => void
  upgradeBuilding: (coordinate: HexCoordinate) => void
  endTurn: () => void
  moveArmy: (from: HexCoordinate, to: HexCoordinate) => void

  // Promotion actions
  promoteUnit: (unitId: string, advancedArchetype: string, resourcesUsed: Record<ResourceType, number>) => void

  // Save/Load actions
  saveGame: (slotId: string) => boolean
  loadGame: (slotId: string) => boolean
  autoSave: () => boolean
  getSaveSlots: () => SaveSlotInfo[]
  deleteSave: (slotId: string) => boolean
  exportSave: (slotId: string) => boolean
  importSave: (file: File, targetSlotId: string) => Promise<boolean>

  // Resource actions
  deductGold: (amount: number) => void

  // Utility actions
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  initializeGame: () => void
}

type GameStore = GameState & GameActions

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  units: [],
  selectedUnit: null,
  squads: [],
  selectedSquad: null,
  battleManager: null,
  currentBattle: null,
  battleResult: null,
  battleLog: [],
  overworldManager: null,
  playerResources: {
    [ResourceType.GOLD]: 1000, // Increased starting gold for unit creation
    [ResourceType.WOOD]: 100,
    [ResourceType.STONE]: 50,
    [ResourceType.STEEL]: 25,
    [ResourceType.FOOD]: 200,
    [ResourceType.MANA_CRYSTALS]: 10,
    [ResourceType.HORSES]: 5
  },
  currentTurn: 1,
  isLoading: false,
  error: null,

  // Unit actions
  createUnit: async (config) => {
    try {
      const state = get()
      const { race, archetype, level = 1 } = config
      
      // Calculate cost
      const affordabilityCheck = UnitCostCalculator.canAffordUnit(
        state.playerResources[ResourceType.GOLD] || 0,
        race,
        archetype,
        level
      )

      if (!affordabilityCheck.canAfford) {
        const error = `Insufficient gold! Need ${affordabilityCheck.shortfall} more gold to create this unit.`
        set({ error })
        return { success: false, error }
      }

      // Create the unit
      const unit = UnitFactory.createUnit(config)
      
      // Deduct gold
      const newGold = (state.playerResources[ResourceType.GOLD] || 0) - affordabilityCheck.cost.totalCost
      
      set((state) => ({
        units: [...state.units, unit],
        selectedUnit: unit,
        playerResources: {
          ...state.playerResources,
          [ResourceType.GOLD]: newGold
        },
        error: null
      }))

      return { success: true, unit }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create unit'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  createRandomUnit: async (level = 1) => {
    try {
      // Generate a random unit configuration first to calculate cost
      const races = ['Human', 'Elf', 'Dwarf', 'Orc', 'Goblin']
      const archetypes = ['Warrior', 'Archer', 'Mage', 'Cleric', 'Rogue']
      
      const randomRace = races[Math.floor(Math.random() * races.length)]
      const randomArchetype = archetypes[Math.floor(Math.random() * archetypes.length)]
      
      const state = get()
      
      // Calculate cost
      const affordabilityCheck = UnitCostCalculator.canAffordUnit(
        state.playerResources[ResourceType.GOLD] || 0,
        randomRace,
        randomArchetype,
        level
      )

      if (!affordabilityCheck.canAfford) {
        const error = `Insufficient gold! Need ${affordabilityCheck.shortfall} more gold to create a random unit.`
        set({ error })
        return { success: false, error }
      }

      // Create the unit
      const unit = UnitFactory.createRandomUnit(level)
      
      // Deduct gold
      const newGold = (state.playerResources[ResourceType.GOLD] || 0) - affordabilityCheck.cost.totalCost
      
      set((state) => ({
        units: [...state.units, unit],
        selectedUnit: unit,
        playerResources: {
          ...state.playerResources,
          [ResourceType.GOLD]: newGold
        },
        error: null
      }))

      return { success: true, unit }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create random unit'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  addUnit: (unit) => {
    try {
      set((state) => ({
        units: [...state.units, unit],
        error: null
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add unit' })
    }
  },

  selectUnit: (unit) => {
    set({ selectedUnit: unit })
  },

  deleteUnit: (unitId) => {
    set((state) => ({
      units: state.units.filter(unit => unit.id !== unitId),
      selectedUnit: state.selectedUnit?.id === unitId ? null : state.selectedUnit
    }))
  },

  // Unit cost utilities
  getUnitCreationCost: (race, archetype, level = 1) => {
    return UnitCostCalculator.calculateUnitCreationCost(race, archetype, level)
  },

  canAffordUnit: (race, archetype, level = 1) => {
    const state = get()
    return UnitCostCalculator.canAffordUnit(
      state.playerResources[ResourceType.GOLD] || 0,
      race,
      archetype,
      level
    )
  },

  // Squad actions
  createSquad: (config) => {
    try {
      const squad = SquadFactory.createSquad(config)
      set((state) => ({
        squads: [...state.squads, squad],
        selectedSquad: squad,
        error: null
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create squad' })
    }
  },

  createSquadFromPreset: (presetKey, customName) => {
    try {
      const preset = SQUAD_PRESETS[presetKey]
      const squad = SquadFactory.createFromPreset(preset, customName)
      set((state) => ({
        squads: [...state.squads, squad],
        selectedSquad: squad,
        error: null
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create squad from preset' })
    }
  },

  selectSquad: (squad) => {
    set({ selectedSquad: squad })
  },

  deleteSquad: (squadId) => {
    set((state) => ({
      squads: state.squads.filter(squad => squad.id !== squadId),
      selectedSquad: state.selectedSquad?.id === squadId ? null : state.selectedSquad
    }))
  },

  addUnitToSquad: (squadId, unit) => {
    try {
      const state = get()
      const squad = state.squads.find(s => s.id === squadId)
      if (!squad) {
        throw new Error('Squad not found')
      }

      squad.addUnit(unit)

      set((state) => ({
        squads: state.squads.map(s => s.id === squadId ? squad : s),
        error: null
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add unit to squad' })
    }
  },

  removeUnitFromSquad: (squadId, unitId) => {
    try {
      const state = get()
      const squad = state.squads.find(s => s.id === squadId)
      if (!squad) {
        throw new Error('Squad not found')
      }

      const removedUnit = squad.removeUnit(unitId)

      set((state) => ({
        squads: state.squads.map(s => s.id === squadId ? squad : s),
        units: [...state.units, removedUnit], // Add back to available units
        error: null
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove unit from squad' })
    }
  },

  // Battle actions
  startBattle: (attackingSquad, defendingSquad) => {
    try {
      const state = get()
      
      // Initialize battle manager if not exists
      let battleManager = state.battleManager
      if (!battleManager) {
        battleManager = new BattleManager()
      }

      // Start the battle
      const battleState = battleManager.startBattle(attackingSquad, defendingSquad)
      
      set({
        battleManager,
        currentBattle: battleState,
        battleResult: null,
        battleLog: [],
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to start battle' })
    }
  },

  executeBattle: async () => {
    try {
      const { battleManager } = get()
      if (!battleManager) {
        throw new Error('No battle manager available')
      }

      // Execute battle automatically with 1 second delays for visualization
      const result = await battleManager.executeBattleAuto(1000)
      
      if (result) {
        set({
          battleResult: result,
          currentBattle: null,
          error: null
        })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Battle execution failed' })
    }
  },

  clearBattle: () => {
    const { battleManager } = get()
    if (battleManager) {
      battleManager.reset()
    }
    
    set({
      currentBattle: null,
      battleResult: null,
      battleLog: []
    })
  },

  // Overworld actions
  initializeOverworld: () => {
    try {
      const overworldManager = new OverworldManager(20, 15)
      const partialResources = overworldManager.getPlayerResources(Faction.PLAYER)

      // Ensure all resource types have values
      const playerResources: Record<ResourceType, number> = {
        [ResourceType.GOLD]: partialResources[ResourceType.GOLD] || 0,
        [ResourceType.WOOD]: partialResources[ResourceType.WOOD] || 0,
        [ResourceType.STONE]: partialResources[ResourceType.STONE] || 0,
        [ResourceType.STEEL]: partialResources[ResourceType.STEEL] || 0,
        [ResourceType.FOOD]: partialResources[ResourceType.FOOD] || 0,
        [ResourceType.MANA_CRYSTALS]: partialResources[ResourceType.MANA_CRYSTALS] || 0,
        [ResourceType.HORSES]: partialResources[ResourceType.HORSES] || 0
      }

      set({
        overworldManager,
        playerResources,
        currentTurn: overworldManager.getCurrentTurn(),
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to initialize overworld' })
    }
  },

  deploySquad: (squadId, coordinate) => {
    try {
      const state = get()
      const { overworldManager, squads } = state

      if (!overworldManager) {
        throw new Error('Overworld not initialized')
      }

      const squad = squads.find(s => s.id === squadId)
      if (!squad) {
        throw new Error('Squad not found')
      }

      const success = overworldManager.placeArmy(coordinate, [squad], Faction.PLAYER)
      if (!success) {
        throw new Error('Cannot deploy squad to this location')
      }

      set({
        squads: squads.filter(s => s.id !== squadId), // Remove from available squads
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to deploy squad' })
    }
  },

  recallSquad: (coordinate) => {
    try {
      const state = get()
      const { overworldManager, squads } = state

      if (!overworldManager) {
        throw new Error('Overworld not initialized')
      }

      const tile = overworldManager.getTile(coordinate)
      if (!tile?.army || tile.army.faction !== Faction.PLAYER) {
        throw new Error('No player army at this location')
      }

      const recalledSquads = tile.army.squads
      overworldManager.removeArmy(coordinate)

      set({
        squads: [...squads, ...recalledSquads], // Add back to available squads
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to recall squad' })
    }
  },

  buildStructure: (coordinate, buildingType) => {
    try {
      const state = get()
      const { overworldManager } = state

      if (!overworldManager) {
        throw new Error('Overworld not initialized')
      }

      const success = overworldManager.buildStructure(coordinate, buildingType, Faction.PLAYER)
      if (!success) {
        throw new Error('Cannot build structure at this location')
      }

      const partialResources = overworldManager.getPlayerResources(Faction.PLAYER)

      // Ensure all resource types have values
      const updatedResources: Record<ResourceType, number> = {
        [ResourceType.GOLD]: partialResources[ResourceType.GOLD] || 0,
        [ResourceType.WOOD]: partialResources[ResourceType.WOOD] || 0,
        [ResourceType.STONE]: partialResources[ResourceType.STONE] || 0,
        [ResourceType.STEEL]: partialResources[ResourceType.STEEL] || 0,
        [ResourceType.FOOD]: partialResources[ResourceType.FOOD] || 0,
        [ResourceType.MANA_CRYSTALS]: partialResources[ResourceType.MANA_CRYSTALS] || 0,
        [ResourceType.HORSES]: partialResources[ResourceType.HORSES] || 0
      }

      set({
        playerResources: updatedResources,
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to build structure' })
    }
  },

  upgradeBuilding: (coordinate) => {
    try {
      const state = get()
      const { overworldManager } = state

      if (!overworldManager) {
        throw new Error('Overworld not initialized')
      }

      const success = overworldManager.upgradeBuilding(coordinate, Faction.PLAYER)
      if (!success) {
        throw new Error('Cannot upgrade building at this location')
      }

      const partialResources = overworldManager.getPlayerResources(Faction.PLAYER)

      // Ensure all resource types have values
      const updatedResources: Record<ResourceType, number> = {
        [ResourceType.GOLD]: partialResources[ResourceType.GOLD] || 0,
        [ResourceType.WOOD]: partialResources[ResourceType.WOOD] || 0,
        [ResourceType.STONE]: partialResources[ResourceType.STONE] || 0,
        [ResourceType.STEEL]: partialResources[ResourceType.STEEL] || 0,
        [ResourceType.FOOD]: partialResources[ResourceType.FOOD] || 0,
        [ResourceType.MANA_CRYSTALS]: partialResources[ResourceType.MANA_CRYSTALS] || 0,
        [ResourceType.HORSES]: partialResources[ResourceType.HORSES] || 0
      }

      set({
        playerResources: updatedResources,
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to upgrade building' })
    }
  },

  endTurn: () => {
    try {
      const state = get()
      const { overworldManager } = state

      if (!overworldManager) {
        throw new Error('Overworld not initialized')
      }

      overworldManager.endTurn()
      
      // Execute AI turn after player ends their turn
      if (overworldManager.aiIntegration) {
        overworldManager.aiIntegration.onTurnEnd()
      }
      
      const partialResources = overworldManager.getPlayerResources(Faction.PLAYER)

      // Ensure all resource types have values
      const updatedResources: Record<ResourceType, number> = {
        [ResourceType.GOLD]: partialResources[ResourceType.GOLD] || 0,
        [ResourceType.WOOD]: partialResources[ResourceType.WOOD] || 0,
        [ResourceType.STONE]: partialResources[ResourceType.STONE] || 0,
        [ResourceType.STEEL]: partialResources[ResourceType.STEEL] || 0,
        [ResourceType.FOOD]: partialResources[ResourceType.FOOD] || 0,
        [ResourceType.MANA_CRYSTALS]: partialResources[ResourceType.MANA_CRYSTALS] || 0,
        [ResourceType.HORSES]: partialResources[ResourceType.HORSES] || 0
      }

      set({
        playerResources: updatedResources,
        currentTurn: overworldManager.getCurrentTurn(),
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to end turn' })
    }
  },

  moveArmy: (from, to) => {
    try {
      const state = get()
      const { overworldManager } = state

      if (!overworldManager) {
        throw new Error('Overworld not initialized')
      }

      const success = overworldManager.moveArmy(from, to, Faction.PLAYER)
      if (!success) {
        throw new Error('Cannot move army to this location')
      }

      set({ error: null })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to move army' })
    }
  },

  // Promotion actions
  promoteUnit: (unitId, advancedArchetype, resourcesUsed) => {
    try {
      const state = get()
      const { units, squads, playerResources } = state

      // Find the unit in units or squads
      let targetUnit: Unit | null = null
      targetUnit = units.find(u => u.id === unitId) || null

      if (!targetUnit) {
        // Check in squads
        for (const squad of squads) {
          const squadUnit = squad.getUnits().find(u => u.id === unitId)
          if (squadUnit) {
            targetUnit = squadUnit
            break
          }
        }
      }

      if (!targetUnit) {
        throw new Error('Unit not found')
      }

      // Deduct resources
      const updatedResources = { ...playerResources }
      Object.entries(resourcesUsed).forEach(([resource, amount]) => {
        const resourceType = resource as ResourceType
        if ((updatedResources[resourceType] || 0) < amount) {
          throw new Error(`Insufficient ${resourceType}`)
        }
        updatedResources[resourceType] = (updatedResources[resourceType] || 0) - amount
      })

      // Update resources in overworld if available
      if (state.overworldManager) {
        Object.entries(resourcesUsed).forEach(([resource, amount]) => {
          const resourceType = resource as ResourceType
          const currentAmount = state.overworldManager!.getPlayerResources(Faction.PLAYER)[resourceType] || 0
          // This would need a method to deduct resources from the overworld manager
          // For now, we'll just update the local state
        })
      }

      set({
        playerResources: updatedResources,
        error: null
      })

      console.log(`Unit ${targetUnit.name} promoted to ${advancedArchetype}!`)

    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to promote unit' })
    }
  },

  // Utility actions
  setError: (error) => {
    set({ error })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  // Save/Load actions
  saveGame: (slotId) => {
    try {
      const state = get()
      
      const gameData: GameSaveData = {
        units: state.units.map(unit => unit.toJSON()),
        squads: state.squads.map(squad => squad.toJSON()),
        currentTurn: state.currentTurn,
        playerResources: state.playerResources,
        overworldState: state.overworldManager?.getState(),
        settings: {
          difficulty: 'normal',
          autoSave: true,
          soundEnabled: true,
          musicEnabled: true
        },
        statistics: {
          battlesWon: 0,
          battlesLost: 0,
          unitsCreated: state.units.length,
          squadsCreated: state.squads.length,
          totalPlayTime: 0
        }
      }

      const success = SaveManager.saveGame(slotId, gameData)
      
      if (success) {
        set({ error: null })
      } else {
        set({ error: 'Failed to save game' })
      }
      
      return success
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save game' })
      return false
    }
  },

  loadGame: (slotId) => {
    try {
      set({ isLoading: true })
      
      const gameData = SaveManager.loadGame(slotId)
      
      if (!gameData) {
        set({ 
          error: 'Failed to load game - save data not found',
          isLoading: false 
        })
        return false
      }

      // Reconstruct units from saved data
      const units = gameData.units.map(unitData => {
        // This would need a proper deserialization method
        return UnitFactory.createUnit({
          name: unitData.name,
          race: unitData.race,
          archetype: unitData.archetype,
          level: unitData.experience?.currentLevel || 1
        })
      })

      // Reconstruct squads from saved data
      const squads = gameData.squads.map(squadData => {
        return SquadFactory.createSquad({
          name: squadData.name,
          gameProgressLevel: 1
        })
      })

      // Initialize overworld if state exists
      let overworldManager = null
      if (gameData.overworldState) {
        overworldManager = new OverworldManager(20, 15)
        // Would need to restore overworld state here
      }

      set({
        units,
        squads,
        currentTurn: gameData.currentTurn,
        playerResources: gameData.playerResources,
        overworldManager,
        selectedUnit: null,
        selectedSquad: squads[0] || null,
        isLoading: false,
        error: null
      })

      return true
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load game',
        isLoading: false
      })
      return false
    }
  },

  autoSave: () => {
    const state = get()
    
    const gameData: GameSaveData = {
      units: state.units.map(unit => unit.toJSON()),
      squads: state.squads.map(squad => squad.toJSON()),
      currentTurn: state.currentTurn,
      playerResources: state.playerResources,
      overworldState: state.overworldManager?.getState(),
      settings: {
        difficulty: 'normal',
        autoSave: true,
        soundEnabled: true,
        musicEnabled: true
      },
      statistics: {
        battlesWon: 0,
        battlesLost: 0,
        unitsCreated: state.units.length,
        squadsCreated: state.squads.length,
        totalPlayTime: 0
      }
    }

    return SaveManager.autoSave(gameData)
  },

  getSaveSlots: () => {
    return SaveManager.getSaveSlots()
  },

  deleteSave: (slotId) => {
    return SaveManager.deleteSave(slotId)
  },

  exportSave: (slotId) => {
    return SaveManager.exportSave(slotId)
  },

  importSave: async (file, targetSlotId) => {
    return await SaveManager.importSave(file, targetSlotId)
  },

  // Resource actions
  deductGold: (amount) => {
    try {
      const state = get()
      const currentGold = state.playerResources[ResourceType.GOLD] || 0
      
      if (currentGold < amount) {
        throw new Error(`Insufficient gold! Have ${currentGold}, need ${amount}`)
      }
      
      const newGold = currentGold - amount
      
      set((state) => ({
        playerResources: {
          ...state.playerResources,
          [ResourceType.GOLD]: newGold
        },
        error: null
      }))
      
      console.log(`💸 Deducted ${amount} gold. Remaining: ${newGold}`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deduct gold'
      set({ error: errorMessage })
      throw error
    }
  },

  initializeGame: () => {
    try {
      set({ isLoading: true })

      // Try to load auto-save first
      const autoSaveData = SaveManager.loadAutoSave()
      
      if (autoSaveData) {
        // Load from auto-save
        const success = get().loadGame('auto')
        if (success) {
          console.log('Game loaded from auto-save')
          return
        }
      }

      // Create new game with starter content
      const starterUnits = [
        UnitFactory.createRandomUnit(1),
        UnitFactory.createRandomUnit(1),
        UnitFactory.createRandomUnit(2),
        UnitFactory.createRandomUnit(2),
        UnitFactory.createRandomUnit(3),
      ]

      const starterSquads = [
        SquadFactory.createFromPreset(SQUAD_PRESETS.BALANCED_STARTER, 'Player Squad'),
        SquadFactory.createFromPreset(SQUAD_PRESETS.ELITE_KNIGHTS, 'AI Squad')
      ]

      set({
        units: starterUnits,
        squads: starterSquads,
        selectedSquad: starterSquads[0],
        isLoading: false,
        error: null
      })

      // Auto-save the initial game state
      setTimeout(() => {
        get().autoSave()
      }, 1000)

    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize game',
        isLoading: false
      })
    }
  }
}))