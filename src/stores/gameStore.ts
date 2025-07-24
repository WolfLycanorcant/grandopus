import { create } from 'zustand'
import { Unit, UnitFactory } from '../core/units'
import { Squad, SquadFactory, SQUAD_PRESETS } from '../core/squads'
import { BattleEngine, BattleResult, BattleLogEntry } from '../core/battle'
import { OverworldManager, HexCoordinate, BuildingType, Faction, ResourceType } from '../core/overworld'

interface GameState {
  // Units
  units: Unit[]
  selectedUnit: Unit | null

  // Squads
  squads: Squad[]
  selectedSquad: Squad | null

  // Battle
  currentBattle: BattleEngine | null
  battleResult: BattleResult | null
  battleLog: BattleLogEntry[]

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
  createUnit: (config: Parameters<typeof UnitFactory.createUnit>[0]) => void
  createRandomUnit: (level?: number) => void
  selectUnit: (unit: Unit | null) => void
  deleteUnit: (unitId: string) => void

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
  currentBattle: null,
  battleResult: null,
  battleLog: [],
  overworldManager: null,
  playerResources: {
    [ResourceType.GOLD]: 500,
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
  createUnit: (config) => {
    try {
      const unit = UnitFactory.createUnit(config)
      set((state) => ({
        units: [...state.units, unit],
        selectedUnit: unit,
        error: null
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create unit' })
    }
  },

  createRandomUnit: (level = 1) => {
    try {
      const unit = UnitFactory.createRandomUnit(level)
      set((state) => ({
        units: [...state.units, unit],
        selectedUnit: unit,
        error: null
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create random unit' })
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
      const battle = new BattleEngine(attackingSquad, defendingSquad)
      set({
        currentBattle: battle,
        battleResult: null,
        battleLog: [],
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to start battle' })
    }
  },

  executeBattle: () => {
    try {
      const { currentBattle } = get()
      if (!currentBattle) {
        throw new Error('No battle in progress')
      }

      const result = currentBattle.executeBattle()
      const log = currentBattle.getBattleLog()

      set({
        battleResult: result,
        battleLog: log,
        currentBattle: null,
        error: null
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Battle execution failed' })
    }
  },

  clearBattle: () => {
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

  initializeGame: () => {
    try {
      set({ isLoading: true })

      // Create some starter units
      const starterUnits = [
        UnitFactory.createRandomUnit(1),
        UnitFactory.createRandomUnit(1),
        UnitFactory.createRandomUnit(2),
        UnitFactory.createRandomUnit(2),
        UnitFactory.createRandomUnit(3),
      ]

      // Create some preset squads
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
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize game',
        isLoading: false
      })
    }
  }
}))