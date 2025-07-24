import { Unit, FormationPosition } from '../units';
import { Squad } from '../squads';
import { DamageCalculator } from './DamageCalculator';
import { 
  BattleState, 
  BattlePhase, 
  BattleLogEntry, 
  BattleResult, 
  VictoryCondition,
  InitiativeResult,
  FormationCombatBonus,
  BattleConfig,
  BattleStatistics
} from './types';
import { WeaponType, DamageType } from '../equipment/types';
import {
  InvalidCombatStateException,
  ValidationUtils
} from '../../exceptions';

/**
 * Core battle engine implementing Ogre Battle style combat
 */
export class BattleEngine {
  private battleState: BattleState;
  private config: BattleConfig;
  
  constructor(
    attackingSquad: Squad,
    defendingSquad: Squad,
    config: Partial<BattleConfig> = {}
  ) {
    // Validate squads
    this.validateSquads(attackingSquad, defendingSquad);
    
    // Set default config
    this.config = {
      maxRounds: 10,
      allowRetreat: true,
      ...config
    };
    
    // Initialize battle state
    this.battleState = {
      id: this.generateBattleId(),
      phase: BattlePhase.SETUP,
      currentRound: 0,
      maxRounds: this.config.maxRounds,
      attackingSquad,
      defendingSquad,
      battleLog: [],
      isComplete: false
    };
    
    this.logEvent('info', 'Battle initialized', {
      attacker: attackingSquad.name,
      defender: defendingSquad.name
    });
  }
  
  /**
   * Execute the complete battle
   */
  public executeBattle(): BattleResult {
    try {
      // Setup phase
      this.setupBattle();
      
      // Main battle loop
      while (!this.battleState.isComplete && this.battleState.currentRound < this.config.maxRounds) {
        this.executeRound();
      }
      
      // Resolution phase
      return this.resolveBattle();
      
    } catch (error) {
      this.logEvent('info', `Battle error: ${error}`, { error: error.toString() });
      throw error;
    }
  }
  
  /**
   * Setup battle (calculate initiative, apply pre-battle effects)
   */
  private setupBattle(): void {
    this.battleState.phase = BattlePhase.SETUP;
    this.logEvent('info', 'Battle setup phase');
    
    // Apply formation bonuses
    this.applyFormationBonuses();
    
    // Log squad compositions
    this.logSquadComposition(this.battleState.attackingSquad, 'Attacking');
    this.logSquadComposition(this.battleState.defendingSquad, 'Defending');
    
    this.battleState.phase = BattlePhase.INITIATIVE;
  }
  
  /**
   * Execute a single battle round
   */
  private executeRound(): void {
    this.battleState.currentRound++;
    this.logEvent('info', `=== Round ${this.battleState.currentRound} ===`);
    
    // Calculate initiative for this round
    const attackerInitiative = this.calculateSquadInitiative(this.battleState.attackingSquad);
    const defenderInitiative = this.calculateSquadInitiative(this.battleState.defendingSquad);
    
    this.logEvent('info', `Initiative - Attacker: ${attackerInitiative}, Defender: ${defenderInitiative}`);
    
    // Determine who goes first (higher initiative attacks first)
    if (attackerInitiative >= defenderInitiative) {
      this.executeAttackPhase(this.battleState.attackingSquad, this.battleState.defendingSquad);
      if (!this.checkBattleEnd()) {
        this.executeCounterPhase(this.battleState.defendingSquad, this.battleState.attackingSquad);
      }
    } else {
      this.executeAttackPhase(this.battleState.defendingSquad, this.battleState.attackingSquad);
      if (!this.checkBattleEnd()) {
        this.executeCounterPhase(this.battleState.attackingSquad, this.battleState.defendingSquad);
      }
    }
    
    // Check for battle end conditions
    this.checkBattleEnd();
  }
  
  /**
   * Execute attack phase for a squad
   */
  private executeAttackPhase(attackingSquad: Squad, defendingSquad: Squad): void {
    this.battleState.phase = BattlePhase.ATTACK;
    this.logEvent('info', `${attackingSquad.name} attacks!`);
    
    // Get attacking units in formation order (front row first)
    const attackers = [
      ...attackingSquad.getFrontRowUnits(),
      ...attackingSquad.getBackRowUnits()
    ].filter(unit => unit.isAlive());
    
    // Each attacker attacks
    for (const attacker of attackers) {
      if (!attacker.isAlive()) continue;
      
      // Select target
      const target = this.selectTarget(defendingSquad);
      if (!target) break; // No valid targets
      
      // Execute attack
      this.executeAttack(attacker, target, attackingSquad, defendingSquad);
      
      // Check if defending squad is eliminated
      if (this.isSquadEliminated(defendingSquad)) {
        break;
      }
    }
  }
  
  /**
   * Execute counter-attack phase
   */
  private executeCounterPhase(counterSquad: Squad, originalAttacker: Squad): void {
    this.battleState.phase = BattlePhase.COUNTER;
    this.logEvent('info', `${counterSquad.name} counter-attacks!`);
    
    // Counter-attacks work the same as regular attacks
    this.executeAttackPhase(counterSquad, originalAttacker);
  }
  
  /**
   * Execute a single attack between two units
   */
  private executeAttack(attacker: Unit, target: Unit, attackingSquad: Squad, defendingSquad: Squad): void {
    // Determine weapon and damage type
    const weaponType = this.selectWeaponType(attacker);
    const damageType = DamageCalculator.getWeaponDamageType(weaponType);
    const baseDamage = DamageCalculator.getBaseWeaponDamage(weaponType, attacker.experience.currentLevel);
    
    // Get formation bonuses
    const attackerBonus = this.getFormationBonus(attacker, attackingSquad);
    const defenderBonus = this.getFormationBonus(target, defendingSquad);
    
    // Calculate damage
    const damageResult = DamageCalculator.calculateDamage(
      attacker,
      target,
      weaponType,
      baseDamage,
      damageType,
      {
        attacker: attackerBonus,
        defender: defenderBonus
      }
    );
    
    // Apply damage
    const actualDamage = target.takeDamage(damageResult.finalDamage);
    
    // Log the attack
    const critText = damageResult.isCritical ? ' (CRITICAL!)' : '';
    this.logEvent('attack', 
      `${attacker.name} attacks ${target.name} with ${weaponType} for ${actualDamage} ${damageType} damage${critText}`,
      {
        attacker: attacker.id,
        target: target.id,
        weapon: weaponType,
        baseDamage: damageResult.baseDamage,
        finalDamage: actualDamage,
        damageType,
        isCritical: damageResult.isCritical,
        modifiers: damageResult.modifiers
      },
      attacker,
      target,
      actualDamage
    );
    
    // Check if target is defeated
    if (!target.isAlive()) {
      this.logEvent('info', `${target.name} has been defeated!`, {
        defeatedUnit: target.id
      });
      
      // Award experience to attacker
      attacker.addExperience(target.experience.currentLevel * 10);
    }
    
    // Increase weapon proficiency
    attacker.increaseWeaponProficiency(weaponType, 5);
  }
  
  /**
   * Select the best weapon type for a unit to use
   */
  private selectWeaponType(unit: Unit): WeaponType {
    // Get all weapon proficiencies
    const proficiencies = Array.from(unit.weaponProficiencies.entries());
    
    if (proficiencies.length === 0) {
      // Default to basic weapon based on archetype
      const stats = unit.getCurrentStats();
      return stats.mag > stats.str ? WeaponType.STAFF : WeaponType.SWORD;
    }
    
    // Select weapon with highest proficiency
    const bestWeapon = proficiencies.reduce((best, [weaponType, proficiency]) => {
      if (!best || proficiency.level > best[1].level) {
        return [weaponType, proficiency];
      }
      return best;
    });
    
    return bestWeapon[0];
  }
  
  /**
   * Select target for attack (prioritize front row, then back row)
   */
  private selectTarget(defendingSquad: Squad): Unit | null {
    // Prioritize front row targets
    const frontRow = defendingSquad.getFrontRowUnits().filter(unit => unit.isAlive());
    if (frontRow.length > 0) {
      // Target lowest HP unit in front row
      return frontRow.reduce((lowest, unit) => 
        unit.currentHp < lowest.currentHp ? unit : lowest
      );
    }
    
    // Fall back to back row
    const backRow = defendingSquad.getBackRowUnits().filter(unit => unit.isAlive());
    if (backRow.length > 0) {
      return backRow.reduce((lowest, unit) => 
        unit.currentHp < lowest.currentHp ? unit : lowest
      );
    }
    
    return null; // No valid targets
  }
  
  /**
   * Get formation bonus for a unit
   */
  private getFormationBonus(unit: Unit, squad: Squad): FormationCombatBonus | undefined {
    if (!unit.formationPosition) return undefined;
    
    const isFrontRow = [
      FormationPosition.FRONT_LEFT,
      FormationPosition.FRONT_CENTER,
      FormationPosition.FRONT_RIGHT
    ].includes(unit.formationPosition);
    
    const formationBonuses = Squad.getFormationBonuses();
    
    return {
      unit,
      position: isFrontRow ? 'front' : 'back',
      bonuses: isFrontRow ? formationBonuses.frontRow : formationBonuses.backRow
    };
  }
  
  /**
   * Calculate squad initiative (average of all living units)
   */
  private calculateSquadInitiative(squad: Squad): number {
    const livingUnits = squad.getUnits().filter(unit => unit.isAlive());
    
    if (livingUnits.length === 0) return 0;
    
    const totalInitiative = livingUnits.reduce((total, unit) => {
      const stats = unit.getCurrentStats();
      return total + (stats.skl + stats.str); // Speed = SKL + STR (simplified)
    }, 0);
    
    return Math.floor(totalInitiative / livingUnits.length);
  }
  
  /**
   * Check if battle should end
   */
  private checkBattleEnd(): boolean {
    // Check for elimination
    if (this.isSquadEliminated(this.battleState.attackingSquad)) {
      this.battleState.winner = this.battleState.defendingSquad;
      this.battleState.isComplete = true;
      return true;
    }
    
    if (this.isSquadEliminated(this.battleState.defendingSquad)) {
      this.battleState.winner = this.battleState.attackingSquad;
      this.battleState.isComplete = true;
      return true;
    }
    
    // Check for round limit
    if (this.battleState.currentRound >= this.config.maxRounds) {
      // Determine winner by remaining HP
      const attackerHp = this.getSquadTotalHp(this.battleState.attackingSquad);
      const defenderHp = this.getSquadTotalHp(this.battleState.defendingSquad);
      
      this.battleState.winner = attackerHp > defenderHp 
        ? this.battleState.attackingSquad 
        : this.battleState.defendingSquad;
      this.battleState.isComplete = true;
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if a squad is eliminated (all units defeated)
   */
  private isSquadEliminated(squad: Squad): boolean {
    return squad.getUnits().every(unit => !unit.isAlive());
  }
  
  /**
   * Get total HP of all living units in squad
   */
  private getSquadTotalHp(squad: Squad): number {
    return squad.getUnits()
      .filter(unit => unit.isAlive())
      .reduce((total, unit) => total + unit.currentHp, 0);
  }
  
  /**
   * Resolve battle and create result
   */
  private resolveBattle(): BattleResult {
    this.battleState.phase = BattlePhase.RESOLUTION;
    
    if (!this.battleState.winner) {
      throw new InvalidCombatStateException('resolution', 'determine winner');
    }
    
    const winner = this.battleState.winner;
    const loser = winner === this.battleState.attackingSquad 
      ? this.battleState.defendingSquad 
      : this.battleState.attackingSquad;
    
    // Determine victory condition
    let victoryCondition = VictoryCondition.ELIMINATION;
    if (this.battleState.currentRound >= this.config.maxRounds) {
      victoryCondition = VictoryCondition.TIMEOUT;
    }
    
    // Calculate casualties
    const winnerCasualties = winner.getUnits().filter(unit => !unit.isAlive());
    const loserCasualties = loser.getUnits().filter(unit => !unit.isAlive());
    
    // Calculate experience rewards
    const baseExp = loser.getStats().averageLevel * 20;
    const winnerExp = Math.floor(baseExp * (1 + loserCasualties.length * 0.1));
    const loserExp = Math.floor(baseExp * 0.3); // Consolation experience
    
    // Award experience to surviving units
    winner.getUnits().filter(unit => unit.isAlive()).forEach(unit => {
      unit.addExperience(winnerExp);
    });
    
    loser.getUnits().filter(unit => unit.isAlive()).forEach(unit => {
      unit.addExperience(loserExp);
    });
    
    // Update squad experience
    if (winner === this.battleState.attackingSquad) {
      winner.experience.battlesWon++;
    } else {
      winner.experience.battlesWon++;
    }
    loser.experience.battlesLost++;
    
    winner.experience.totalBattles++;
    loser.experience.totalBattles++;
    
    // Calculate statistics
    const statistics = this.calculateBattleStatistics();
    
    this.logEvent('info', `Battle complete! ${winner.name} wins by ${victoryCondition}`, {
      winner: winner.id,
      loser: loser.id,
      rounds: this.battleState.currentRound,
      victoryCondition
    });
    
    this.battleState.phase = BattlePhase.COMPLETE;
    
    return {
      winner,
      loser,
      victoryCondition,
      rounds: this.battleState.currentRound,
      casualties: {
        winner: winnerCasualties,
        loser: loserCasualties
      },
      experience: {
        winner: winnerExp,
        loser: loserExp
      },
      statistics
    };
  }
  
  /**
   * Calculate detailed battle statistics
   */
  private calculateBattleStatistics(): BattleStatistics {
    const stats: BattleStatistics = {
      totalDamageDealt: {},
      totalDamageTaken: {},
      totalHealing: {},
      criticalHits: {},
      accuracyRate: {},
      abilitiesUsed: {}
    };
    
    // Analyze battle log for statistics
    for (const entry of this.battleState.battleLog) {
      if (entry.type === 'attack' && entry.attacker && entry.target && entry.damage) {
        // Damage dealt
        const attackerId = entry.attacker.id;
        stats.totalDamageDealt[attackerId] = (stats.totalDamageDealt[attackerId] || 0) + entry.damage;
        
        // Damage taken
        const targetId = entry.target.id;
        stats.totalDamageTaken[targetId] = (stats.totalDamageTaken[targetId] || 0) + entry.damage;
        
        // Critical hits
        if (entry.details?.isCritical) {
          stats.criticalHits[attackerId] = (stats.criticalHits[attackerId] || 0) + 1;
        }
      }
    }
    
    return stats;
  }
  
  /**
   * Apply formation bonuses to squads
   */
  private applyFormationBonuses(): void {
    this.logEvent('info', 'Applying formation bonuses');
    
    // Formation bonuses are applied during damage calculation
    // This method could be used for pre-battle formation effects
  }
  
  /**
   * Log squad composition
   */
  private logSquadComposition(squad: Squad, label: string): void {
    const units = squad.getUnits();
    const composition = units.map(unit => 
      `${unit.name} (Lv.${unit.experience.currentLevel} ${unit.race} ${unit.archetype}, ${unit.currentHp}/${unit.getMaxStats().hp} HP)`
    ).join(', ');
    
    this.logEvent('info', `${label} Squad: ${composition}`);
  }
  
  /**
   * Validate squads before battle
   */
  private validateSquads(attackingSquad: Squad, defendingSquad: Squad): void {
    if (!attackingSquad.isValidForCombat()) {
      throw new InvalidCombatStateException('setup', 'start battle with invalid attacking squad');
    }
    
    if (!defendingSquad.isValidForCombat()) {
      throw new InvalidCombatStateException('setup', 'start battle with invalid defending squad');
    }
  }
  
  /**
   * Generate unique battle ID
   */
  private generateBattleId(): string {
    return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Log battle event
   */
  private logEvent(
    type: BattleLogEntry['type'], 
    message: string, 
    details?: Record<string, any>,
    attacker?: Unit,
    target?: Unit,
    damage?: number,
    healing?: number
  ): void {
    const entry: BattleLogEntry = {
      round: this.battleState.currentRound,
      phase: this.battleState.phase,
      timestamp: new Date(),
      type,
      message,
      attacker,
      target,
      damage,
      healing,
      details
    };
    
    this.battleState.battleLog.push(entry);
  }
  
  /**
   * Get current battle state (for external monitoring)
   */
  public getBattleState(): Readonly<BattleState> {
    return { ...this.battleState };
  }
  
  /**
   * Get battle log
   */
  public getBattleLog(): BattleLogEntry[] {
    return [...this.battleState.battleLog];
  }
}