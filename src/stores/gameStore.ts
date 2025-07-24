import { create } from 'zustand'
import { Unit, UnitFactory } from '../core/units'
import { Squad, SquadFactory, SQUAD_PRESETS } from '../core/squads'
import { BattleEngine, BattleResult, BattleLogEntry } from '../core/battle'

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