import { Unit } from '../units'
import { Squad } from '../squads'
import { EquipmentSlot } from '../equipment/types'
import { BattleResult, BattlePhase, BattleTurn, CombatAction, DamageResult, BattleState } from './types'
import { calculateDamage, applyStatusEffects, checkVictoryConditions } from './BattleCalculations'

/**
 * Core Battle Engine - Executes turn-based tactical combat
 */
export class BattleEngine {
  private currentBattle: BattleState | null = null
  private battleLog: string[] = []

  /**
   * Initialize a new battle between two squads
   */
  public initializeBattle(attackingSquad: Squad, defendingSquad: Squad): BattleState {
    this.battleLog = []

    const battle: BattleState = {
      id: `battle_${Date.now()}`,
      attackingSquad,
      defendingSquad,
      currentPhase: BattlePhase.INITIATIVE,
      currentTurn: 1,
      turnOrder: [],
      activeUnitIndex: 0,
      isComplete: false,
      winner: null,
      battleLog: []
    }

    // Calculate initiative order
    battle.turnOrder = this.calculateInitiativeOrder(attackingSquad, defendingSquad)
    battle.currentPhase = BattlePhase.COMBAT

    this.currentBattle = battle
    this.log(`Battle initiated: ${attackingSquad.name} vs ${defendingSquad.name}`)

    return battle
  }

  /**
   * Execute the next combat action in the battle
   */
  public executeNextAction(): BattleTurn | null {
    if (!this.currentBattle || this.currentBattle.isComplete) {
      return null
    }

    const battle = this.currentBattle
    const activeUnit = battle.turnOrder[battle.activeUnitIndex]

    if (!activeUnit || activeUnit.currentHp <= 0) {
      // Skip dead units
      this.advanceToNextUnit()
      return this.executeNextAction()
    }

    // Determine action based on unit AI or player input
    const action = this.determineUnitAction(activeUnit, battle)
    const result = this.executeAction(action, battle)

    // Create turn result
    const turn: BattleTurn = {
      turnNumber: battle.currentTurn,
      activeUnit,
      action,
      result,
      battleState: { ...battle }
    }

    // Check for battle end conditions
    this.checkBattleEnd(battle)

    // Advance to next unit
    this.advanceToNextUnit()

    return turn
  }

  /**
   * Calculate initiative order for all units
   */
  private calculateInitiativeOrder(attackingSquad: Squad, defendingSquad: Squad): Unit[] {
    const allUnits: Unit[] = [
      ...attackingSquad.getUnits(),
      ...defendingSquad.getUnits()
    ]

    // Sort by initiative (SKL + random factor)
    return allUnits
      .filter(unit => unit.currentHp > 0)
      .sort((a, b) => {
        const aInitiative = a.getCurrentStats().skl + Math.random() * 10
        const bInitiative = b.getCurrentStats().skl + Math.random() * 10
        return bInitiative - aInitiative
      })
  }

  /**
   * Determine what action a unit should take
   */
  private determineUnitAction(unit: Unit, battle: BattleState): CombatAction {
    const isAttacker = battle.attackingSquad.getUnits().includes(unit)
    const enemySquad = isAttacker ? battle.defendingSquad : battle.attackingSquad
    const enemyUnits = enemySquad.getUnits().filter(u => u.currentHp > 0)

    if (enemyUnits.length === 0) {
      return { type: 'wait', actor: unit }
    }

    // Simple AI: Attack the weakest enemy
    const target = enemyUnits.reduce((weakest, current) =>
      current.currentHp < weakest.currentHp ? current : weakest
    )

    return {
      type: 'attack',
      actor: unit,
      target,
      weapon: unit.equipment.get(EquipmentSlot.WEAPON)
    }
  }

  /**
   * Execute a combat action and return the result
   */
  private executeAction(action: CombatAction, battle: BattleState): DamageResult | null {
    switch (action.type) {
      case 'attack':
        if (!action.target) return null
        return this.executeAttack(action.actor, action.target, battle)

      case 'cast_spell':
        if (!action.target || !action.spell) return null
        return this.executeCastSpell(action.actor, action.target, action.spell, battle)

      case 'use_item':
        if (!action.item) return null
        return this.executeUseItem(action.actor, action.item, battle)

      case 'wait':
        this.log(`${action.actor.name} waits`)
        return null

      default:
        return null
    }
  }

  /**
   * Execute an attack action
   */
  private executeAttack(attacker: Unit, target: Unit, battle: BattleState): DamageResult {
    const damage = calculateDamage(attacker, target)
    const actualDamage = Math.min(damage.totalDamage, target.currentHp)

    // Apply damage
    target.currentHp -= actualDamage

    // Log the attack
    this.log(`${attacker.name} attacks ${target.name} for ${actualDamage} damage`)

    if (target.currentHp <= 0) {
      this.log(`${target.name} is defeated!`)
      target.currentHp = 0
    }

    return {
      ...damage,
      actualDamage,
      targetDefeated: target.currentHp <= 0
    }
  }

  /**
   * Execute a spell casting action
   */
  private executeCastSpell(caster: Unit, target: Unit, spell: any, battle: BattleState): DamageResult {
    // Placeholder for spell system
    const damage = Math.floor(caster.getCurrentStats().mag * 1.5)
    const actualDamage = Math.min(damage, target.currentHp)

    target.currentHp -= actualDamage
    this.log(`${caster.name} casts ${spell.name} on ${target.name} for ${actualDamage} damage`)

    return {
      baseDamage: damage,
      totalDamage: damage,
      actualDamage,
      damageType: 'magical',
      isCritical: false,
      targetDefeated: target.currentHp <= 0
    }
  }

  /**
   * Execute an item use action
   */
  private executeUseItem(user: Unit, item: any, battle: BattleState): DamageResult | null {
    // Placeholder for item system
    this.log(`${user.name} uses ${item.name}`)
    return null
  }

  /**
   * Check if the battle should end
   */
  private checkBattleEnd(battle: BattleState): void {
    const attackingAlive = battle.attackingSquad.getUnits().some(u => u.currentHp > 0)
    const defendingAlive = battle.defendingSquad.getUnits().some(u => u.currentHp > 0)

    if (!attackingAlive) {
      battle.isComplete = true
      battle.winner = battle.defendingSquad
      this.log(`${battle.defendingSquad.name} wins the battle!`)
    } else if (!defendingAlive) {
      battle.isComplete = true
      battle.winner = battle.attackingSquad
      this.log(`${battle.attackingSquad.name} wins the battle!`)
    }
  }

  /**
   * Advance to the next unit in turn order
   */
  private advanceToNextUnit(): void {
    if (!this.currentBattle) return

    this.currentBattle.activeUnitIndex++

    if (this.currentBattle.activeUnitIndex >= this.currentBattle.turnOrder.length) {
      // New round
      this.currentBattle.activeUnitIndex = 0
      this.currentBattle.currentTurn++
      this.log(`--- Turn ${this.currentBattle.currentTurn} ---`)
    }
  }

  /**
   * Get the current battle state
   */
  public getCurrentBattle(): BattleState | null {
    return this.currentBattle
  }

  /**
   * Get battle results
   */
  public getBattleResult(): BattleResult | null {
    if (!this.currentBattle || !this.currentBattle.isComplete) {
      return null
    }

    const battle = this.currentBattle
    return {
      winner: battle.winner!,
      loser: battle.winner === battle.attackingSquad ? battle.defendingSquad : battle.attackingSquad,
      turnsElapsed: battle.currentTurn,
      battleLog: [...this.battleLog],
      casualties: this.calculateCasualties(battle),
      experienceGained: this.calculateExperienceGained(battle)
    }
  }

  /**
   * Calculate casualties from the battle
   */
  private calculateCasualties(battle: BattleState): { attacking: Unit[], defending: Unit[] } {
    return {
      attacking: battle.attackingSquad.getUnits().filter(u => u.currentHp <= 0),
      defending: battle.defendingSquad.getUnits().filter(u => u.currentHp <= 0)
    }
  }

  /**
   * Calculate experience gained from the battle
   */
  private calculateExperienceGained(battle: BattleState): number {
    const basExp = 100
    const turnBonus = Math.max(0, 50 - battle.currentTurn * 2) // Bonus for quick victories
    return basExp + turnBonus
  }

  /**
   * Add entry to battle log
   */
  private log(message: string): void {
    this.battleLog.push(message)
    if (this.currentBattle) {
      this.currentBattle.battleLog.push(message)
    }
    console.log(`[Battle] ${message}`)
  }

  /**
   * Reset the battle engine
   */
  public reset(): void {
    this.currentBattle = null
    this.battleLog = []
  }
}