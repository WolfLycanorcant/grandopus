import { BattleEngine } from './BattleEngine'
import { BattleResult, BattleTurn, BattleConfiguration, BattleState, BattleCallbacks } from './types'
import { Squad } from '../squads'
import { Unit, Archetype, Race } from '../units'
import { EquipmentSlot } from '../equipment/types'

/**
 * Battle Manager - Coordinates battles between the game systems
 */
export class BattleManager {
  private battleEngine: BattleEngine
  private currentBattle: BattleState | null = null
  private battleCallbacks: BattleCallbacks = {}

  constructor() {
    this.battleEngine = new BattleEngine()
  }

  /**
   * Start a new battle between two squads
   */
  public startBattle(
    attackingSquad: Squad,
    defendingSquad: Squad,
    config?: BattleConfiguration
  ): BattleState {
    // Prepare squads for battle
    this.prepareBattle(attackingSquad, defendingSquad)

    // Initialize battle
    this.currentBattle = this.battleEngine.initializeBattle(attackingSquad, defendingSquad)

    // Apply environmental effects if configured
    if (config) {
      this.applyEnvironmentalEffects(config)
    }

    // Notify battle started
    this.battleCallbacks.onBattleStart?.(this.currentBattle)

    return this.currentBattle
  }

  /**
   * Execute the next turn in the current battle
   */
  public executeNextTurn(): BattleTurn | null {
    if (!this.currentBattle) {
      console.warn('No active battle to execute turn')
      return null
    }

    const turn = this.battleEngine.executeNextAction()

    if (turn) {
      // Notify turn executed
      this.battleCallbacks.onTurnExecuted?.(turn)

      // Check if battle is complete
      if (this.currentBattle.isComplete) {
        this.endBattle()
      }
    }

    return turn
  }

  /**
   * Execute the entire battle automatically
   */
  public async executeBattleAuto(delayMs: number = 1000): Promise<BattleResult | null> {
    if (!this.currentBattle) {
      console.warn('No active battle to execute')
      return null
    }

    while (!this.currentBattle.isComplete) {
      const turn = this.executeNextTurn()

      if (turn && delayMs > 0) {
        // Add delay for visualization
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }

    return this.battleEngine.getBattleResult()
  }

  /**
   * Get the current battle state
   */
  public getCurrentBattle(): BattleState | null {
    return this.currentBattle
  }

  /**
   * Get battle result if battle is complete
   */
  public getBattleResult(): BattleResult | null {
    return this.battleEngine.getBattleResult()
  }

  /**
   * Set battle event callbacks
   */
  public setBattleCallbacks(callbacks: Partial<BattleCallbacks>): void {
    this.battleCallbacks = { ...this.battleCallbacks, ...callbacks }
  }

  /**
   * Prepare squads for battle (heal, reset states, etc.)
   */
  private prepareBattle(attackingSquad: Squad, defendingSquad: Squad): void {
    // Reset combat states
    attackingSquad.combatState.isInCombat = true
    defendingSquad.combatState.isInCombat = true

    // Reset unit action states
    const allUnits = [...attackingSquad.getUnits(), ...defendingSquad.getUnits()]
    allUnits.forEach(unit => {
      // Clear any temporary combat effects
      unit.clearTemporaryEffects?.()

      // Ensure units have valid HP
      if (unit.currentHp <= 0) {
        unit.currentHp = 1 // Minimum HP for battle
      }
    })
  }

  /**
   * Apply environmental effects to the battle
   */
  private applyEnvironmentalEffects(config: BattleConfiguration): void {
    if (!this.currentBattle) return

    const allUnits = [
      ...this.currentBattle.attackingSquad.getUnits(),
      ...this.currentBattle.defendingSquad.getUnits()
    ]

    // Apply weather effects
    switch (config.weather) {
      case 'rain':
        // Reduce accuracy for ranged attacks
        allUnits.forEach(unit => {
          if (unit.archetype === Archetype.ARCHER) {
            unit.addTemporaryModifier?.('weather_rain', { accuracy: -10 })
          }
        })
        break

      case 'snow':
        // Reduce movement and increase mana costs
        allUnits.forEach(unit => {
          unit.addTemporaryModifier?.('weather_snow', { movement: -1, manaCost: 1.2 })
        })
        break

      case 'fog':
        // Reduce accuracy for all units
        allUnits.forEach(unit => {
          unit.addTemporaryModifier?.('weather_fog', { accuracy: -15 })
        })
        break
    }

    // Apply terrain effects
    switch (config.environment) {
      case 'forest':
        // Bonus for elves, penalty for large units
        allUnits.forEach(unit => {
          if (unit.race === Race.ELF) {
            unit.addTemporaryModifier?.('terrain_forest_elf', { evasion: 10 })
          }
          if (unit.getSlotCost() > 1) {
            unit.addTemporaryModifier?.('terrain_forest_large', { movement: -1 })
          }
        })
        break

      case 'desert':
        // Heat effects
        allUnits.forEach(unit => {
          const bodyArmor = unit.equipment.get(EquipmentSlot.BODY)
          if (bodyArmor?.material === 'heavy_armor') {
            unit.addTemporaryModifier?.('terrain_desert_heat', { stamina: -10 })
          }
        })
        break
    }
  }

  /**
   * End the current battle and process results
   */
  private endBattle(): void {
    if (!this.currentBattle) return

    const result = this.battleEngine.getBattleResult()

    if (result) {
      // Process battle aftermath
      this.processBattleAftermath(result)

      // Notify battle ended
      this.battleCallbacks.onBattleEnd?.(result)
    }

    // Clean up battle state
    this.currentBattle.attackingSquad.combatState.isInCombat = false
    this.currentBattle.defendingSquad.combatState.isInCombat = false

    this.currentBattle = null
  }

  /**
   * Process battle aftermath (experience, casualties, etc.)
   */
  private processBattleAftermath(result: BattleResult): void {
    // Award experience to survivors
    const survivors = result.winner.getUnits().filter(unit => unit.currentHp > 0)
    survivors.forEach(unit => {
      unit.gainExperience(result.experienceGained)
    })

    // Handle casualties
    result.casualties.attacking.forEach(unit => {
      this.handleUnitDeath(unit)
    })
    result.casualties.defending.forEach(unit => {
      this.handleUnitDeath(unit)
    })

    // Update squad experience
    result.winner.experience.battlesWon++
    result.winner.experience.totalBattles++
    result.loser.experience.battlesLost++
    result.loser.experience.totalBattles++

    // Squad cohesion changes
    if (result.casualties.attacking.length === 0 && result.winner === result.loser) {
      // Perfect victory
      result.winner.experience.squadCohesion += 10
    } else if (result.casualties.attacking.length > result.winner.getUnits().length / 2) {
      // Pyrrhic victory
      result.winner.experience.squadCohesion -= 5
    }
  }

  /**
   * Handle unit death
   */
  private handleUnitDeath(unit: Unit): void {
    // Mark unit as dead
    unit.currentHp = 0

    // Could implement permadeath, injury system, etc.
    // For now, units can be revived after battle

    console.log(`${unit.name} has fallen in battle`)
  }

  /**
   * Reset the battle manager
   */
  public reset(): void {
    this.battleEngine.reset()
    this.currentBattle = null
    this.battleCallbacks = {}
  }
}

