import { 
  UnitStats, 
  Race, 
  Archetype, 
  WeaponProficiency, 
  FormationPosition,
  StatusEffect,
  UnitExperience
} from './types';
import { WeaponType, EquipmentSlot } from '../equipment/types';
import { getRacialTraits } from './RaceData';
import { getArchetypeData, calculateStatAtLevel } from './ArchetypeData';
import { EquipmentManager } from '../equipment';
import { EmberManager } from '../equipment/EmberManager';
import { SkillManager } from '../skills/SkillManager';
import { AchievementManager } from '../achievements/AchievementManager';
import { RelationshipManager } from '../relationships/RelationshipManager';
import { PromotionManager } from './PromotionManager';
import { 
  InvalidRaceException,
  InvalidArchetypeException,
  ValidationUtils
} from '../../exceptions';

/**
 * Core Unit class representing a single unit in the game
 */
export class Unit {
  public readonly id: string;
  public name: string;
  public readonly race: Race;
  public readonly archetype: Archetype;
  
  // Core stats
  private _baseStats: UnitStats;
  private _maxStats: UnitStats;
  
  // Experience and leveling
  public experience: UnitExperience;
  
  // Combat state
  public currentHp: number;
  public statusEffects: Set<StatusEffect>;
  
  // Weapon proficiencies
  public weaponProficiencies: Map<WeaponType, WeaponProficiency>;
  
  // Equipment system
  public equipment: Map<EquipmentSlot, any>;
  public equipmentManager: EquipmentManager;
  public emberManager: EmberManager;
  
  // Skills system
  public skillManager: SkillManager;
  
  // Achievement system
  public achievementManager: AchievementManager;
  
  // Relationship system
  public relationshipManager: RelationshipManager;
  
  // Promotion system
  public promotionManager: PromotionManager;
  
  // Formation and positioning
  public formationPosition?: FormationPosition;
  
  // Skills and abilities (legacy - will be replaced by skillManager)
  public unlockedSkills: Set<string>;
  public availableJobPoints: number;
  
  // Battle system integration
  private temporaryModifiers: Map<string, any> = new Map();
  private activeStatusEffects: Array<{
    effect: StatusEffect;
    duration: number;
    type: 'buff' | 'debuff';
    name: string;
  }> = [];

  constructor(
    id: string,
    name: string,
    race: Race,
    archetype: Archetype,
    level: number = 1
  ) {
    // Validate inputs
    this.validateConstructorInputs(id, name, race, archetype, level);
    
    this.id = id;
    this.name = name;
    this.race = race;
    this.archetype = archetype;
    
    // Initialize experience
    this.experience = {
      currentLevel: level,
      currentExp: 0,
      expToNextLevel: this.calculateExpToNextLevel(level),
      jobPoints: level * 2 // Start with some job points
    };
    
    // Calculate base stats
    this._baseStats = this.calculateBaseStats();
    this._maxStats = { ...this._baseStats };
    
    // Initialize combat state
    this.currentHp = this._maxStats.hp;
    this.statusEffects = new Set();
    
    // Initialize weapon proficiencies
    this.weaponProficiencies = new Map();
    this.initializeWeaponProficiencies();
    
    // Initialize equipment
    this.equipment = new Map();
    this.equipmentManager = new EquipmentManager(this);
    this.emberManager = new EmberManager(this);
    
    // Initialize skills
    this.skillManager = new SkillManager(this);
    this.skillManager.addJobPoints(this.experience.jobPoints);
    this.unlockedSkills = new Set();
    this.availableJobPoints = this.experience.jobPoints;
    
    // Initialize achievements
    this.achievementManager = new AchievementManager(this);
    
    // Initialize relationships
    this.relationshipManager = new RelationshipManager(this);
    
    // Initialize promotions
    this.promotionManager = new PromotionManager(this);
  }

  /**
   * Validate constructor inputs
   */
  private validateConstructorInputs(
    id: string,
    name: string,
    race: Race,
    archetype: Archetype,
    level: number
  ): void {
    ValidationUtils.validateRequired(id, 'id');
    ValidationUtils.validateRequired(name, 'name');
    ValidationUtils.validateStringLength(name, 1, 50, 'name');
    
    if (!Object.values(Race).includes(race)) {
      throw new InvalidRaceException(race, Object.values(Race));
    }
    
    if (!Object.values(Archetype).includes(archetype)) {
      throw new InvalidArchetypeException(archetype, race, Object.values(Archetype));
    }
    
    ValidationUtils.validateRange(level, 1, 99, 'level');
  }

  /**
   * Calculate base stats combining archetype and racial modifiers
   */
  private calculateBaseStats(): UnitStats {
    const racialTraits = getRacialTraits(this.race);
    
    // Start with archetype base stats at current level
    const level = this.experience.currentLevel;
    const baseStats: UnitStats = {
      hp: calculateStatAtLevel(this.archetype, 'hp', level),
      str: calculateStatAtLevel(this.archetype, 'str', level),
      mag: calculateStatAtLevel(this.archetype, 'mag', level),
      skl: calculateStatAtLevel(this.archetype, 'skl', level),
      arm: calculateStatAtLevel(this.archetype, 'arm', level),
      ldr: calculateStatAtLevel(this.archetype, 'ldr', level)
    };
    
    // Apply racial modifiers (percentage-based)
    const modifiedStats: UnitStats = { ...baseStats };
    
    if (racialTraits.statModifiers.hp) {
      modifiedStats.hp = Math.floor(baseStats.hp * (1 + racialTraits.statModifiers.hp / 100));
    }
    if (racialTraits.statModifiers.str) {
      modifiedStats.str = Math.floor(baseStats.str * (1 + racialTraits.statModifiers.str / 100));
    }
    if (racialTraits.statModifiers.mag) {
      modifiedStats.mag = Math.floor(baseStats.mag * (1 + racialTraits.statModifiers.mag / 100));
    }
    if (racialTraits.statModifiers.skl) {
      modifiedStats.skl = Math.floor(baseStats.skl * (1 + racialTraits.statModifiers.skl / 100));
    }
    if (racialTraits.statModifiers.arm) {
      modifiedStats.arm = Math.floor(baseStats.arm * (1 + racialTraits.statModifiers.arm / 100));
    }
    if (racialTraits.statModifiers.ldr) {
      modifiedStats.ldr = Math.floor(baseStats.ldr * (1 + racialTraits.statModifiers.ldr / 100));
    }
    
    return modifiedStats;
  }

  /**
   * Initialize weapon proficiencies based on archetype
   */
  private initializeWeaponProficiencies(): void {
    const archetypeData = getArchetypeData(this.archetype);
    
    // Set proficiencies for archetype weapons
    archetypeData.weaponProficiencies.forEach(weaponType => {
      this.weaponProficiencies.set(weaponType, {
        weaponType,
        level: 10, // Start with basic proficiency
        experience: 0
      });
    });
  }

  /**
   * Calculate experience needed for next level
   */
  private calculateExpToNextLevel(level: number): number {
    // Exponential growth: level^2 * 100
    return Math.floor(Math.pow(level, 2) * 100);
  }

  /**
   * Level up the unit
   */
  public levelUp(): boolean {
    if (this.experience.currentExp < this.experience.expToNextLevel) {
      return false;
    }
    
    this.experience.currentLevel++;
    this.experience.currentExp -= this.experience.expToNextLevel;
    this.experience.expToNextLevel = this.calculateExpToNextLevel(this.experience.currentLevel);
    // Award Job Points on level up
    const jpGained = 5 + Math.floor(this.experience.currentLevel / 5); // 5-25 JP per level
    this.experience.jobPoints += jpGained;
    this.availableJobPoints += jpGained;
    this.skillManager.addJobPoints(jpGained);
    
    // Recalculate stats
    this._baseStats = this.calculateBaseStats();
    this._maxStats = { ...this._baseStats };
    
    // Heal to full on level up
    this.currentHp = this._maxStats.hp;
    
    return true;
  }

  /**
   * Add experience to the unit
   */
  public addExperience(exp: number): boolean {
    ValidationUtils.validateNonNegative(exp, 'experience');
    
    this.experience.currentExp += exp;
    
    // Check for level up
    let leveledUp = false;
    while (this.experience.currentExp >= this.experience.expToNextLevel && this.experience.currentLevel < 99) {
      this.levelUp();
      leveledUp = true;
    }
    
    return leveledUp;
  }

  /**
   * Get current effective stats (including equipment, buffs, etc.)
   */
  public getCurrentStats(): UnitStats {
    // Start with base stats
    const stats = { ...this._baseStats };
    
    // Add equipment bonuses
    const equipmentStats = this.equipmentManager.calculateEquipmentStats();
    if (equipmentStats.totalStatBonuses) {
      stats.hp += equipmentStats.totalStatBonuses.hp || 0;
      stats.str += equipmentStats.totalStatBonuses.str || 0;
      stats.mag += equipmentStats.totalStatBonuses.mag || 0;
      stats.skl += equipmentStats.totalStatBonuses.skl || 0;
      stats.arm += equipmentStats.totalStatBonuses.arm || 0;
      stats.ldr += equipmentStats.totalStatBonuses.ldr || 0;
    }
    
    // Add armor value to ARM stat
    stats.arm += equipmentStats.totalArmorValue;
    
    // Add skill bonuses
    const skillBonuses = this.skillManager.getSkillStatBonuses();
    stats.hp += skillBonuses.hp || 0;
    stats.str += skillBonuses.str || 0;
    stats.mag += skillBonuses.mag || 0;
    stats.skl += skillBonuses.skl || 0;
    stats.arm += skillBonuses.arm || 0;
    stats.ldr += skillBonuses.ldr || 0;
    
    // Add achievement bonuses
    const achievementBonuses = this.achievementManager.getAchievementStatBonuses();
    stats.hp += achievementBonuses.hp || 0;
    stats.str += achievementBonuses.str || 0;
    stats.mag += achievementBonuses.mag || 0;
    stats.skl += achievementBonuses.skl || 0;
    stats.arm += achievementBonuses.arm || 0;
    stats.ldr += achievementBonuses.ldr || 0;
    
    // Add relationship bonuses
    const relationshipBonuses = this.relationshipManager.getRelationshipStatBonuses();
    stats.hp += relationshipBonuses.hp || 0;
    stats.str += relationshipBonuses.str || 0;
    stats.mag += relationshipBonuses.mag || 0;
    stats.skl += relationshipBonuses.skl || 0;
    stats.arm += relationshipBonuses.arm || 0;
    stats.ldr += relationshipBonuses.ldr || 0;
    
    // Add promotion bonuses
    const promotionBonuses = this.promotionManager.getPromotionStatBonuses();
    stats.hp += promotionBonuses.hp || 0;
    stats.str += promotionBonuses.str || 0;
    stats.mag += promotionBonuses.mag || 0;
    stats.skl += promotionBonuses.skl || 0;
    stats.arm += promotionBonuses.arm || 0;
    stats.ldr += promotionBonuses.ldr || 0;
    
    // TODO: Add status effect modifiers
    
    return stats;
  }

  /**
   * Get maximum stats
   */
  public getMaxStats(): UnitStats {
    return { ...this._maxStats };
  }

  /**
   * Get base stats (without equipment)
   */
  public getBaseStats(): UnitStats {
    return { ...this._baseStats };
  }

  /**
   * Check if unit is alive
   */
  public isAlive(): boolean {
    return this.currentHp > 0;
  }

  /**
   * Check if unit is at full health
   */
  public isAtFullHealth(): boolean {
    return this.currentHp >= this._maxStats.hp;
  }

  /**
   * Heal the unit
   */
  public heal(amount: number): number {
    ValidationUtils.validateNonNegative(amount, 'heal amount');
    
    const oldHp = this.currentHp;
    this.currentHp = Math.min(this.currentHp + amount, this._maxStats.hp);
    
    return this.currentHp - oldHp; // Return actual amount healed
  }

  /**
   * Damage the unit
   */
  public takeDamage(amount: number): number {
    ValidationUtils.validateNonNegative(amount, 'damage amount');
    
    const oldHp = this.currentHp;
    this.currentHp = Math.max(this.currentHp - amount, 0);
    
    return oldHp - this.currentHp; // Return actual damage taken
  }

  /**
   * Get weapon proficiency for a weapon type
   */
  public getWeaponProficiency(weaponType: WeaponType): WeaponProficiency | null {
    return this.weaponProficiencies.get(weaponType) || null;
  }

  /**
   * Increase weapon proficiency
   */
  public increaseWeaponProficiency(weaponType: WeaponType, experience: number): boolean {
    ValidationUtils.validateNonNegative(experience, 'weapon experience');
    
    let proficiency = this.weaponProficiencies.get(weaponType);
    
    if (!proficiency) {
      // Create new proficiency if it doesn't exist
      proficiency = {
        weaponType,
        level: 0,
        experience: 0
      };
      this.weaponProficiencies.set(weaponType, proficiency);
    }
    
    proficiency.experience += experience;
    
    // Check for level up (every 100 experience = 1 level, max 100)
    let leveledUp = false;
    while (proficiency.experience >= 100 && proficiency.level < 100) {
      proficiency.level++;
      proficiency.experience -= 100;
      leveledUp = true;
    }
    
    return leveledUp;
  }

  /**
   * Add status effect
   */
  public addStatusEffect(effect: StatusEffect): void {
    this.statusEffects.add(effect);
  }

  /**
   * Remove status effect
   */
  public removeStatusEffect(effect: StatusEffect): boolean {
    return this.statusEffects.delete(effect);
  }

  /**
   * Check if unit has status effect
   */
  public hasStatusEffect(effect: StatusEffect): boolean {
    return this.statusEffects.has(effect);
  }

  /**
   * Get slot cost for squad capacity
   */
  public getSlotCost(): number {
    return getRacialTraits(this.race).slotCost.slots;
  }

  /**
   * Get racial abilities
   */
  public getRacialAbilities(): string[] {
    return getRacialTraits(this.race).specialAbilities;
  }

  /**
   * Get class abilities
   */
  public getClassAbilities(): string[] {
    return getArchetypeData(this.archetype).classAbilities;
  }

  /**
   * Get all abilities (racial + class + unlocked skills)
   */
  public getAllAbilities(): string[] {
    return [
      ...this.getRacialAbilities(),
      ...this.getClassAbilities(),
      ...Array.from(this.unlockedSkills)
    ];
  }

  /**
   * Equipment-related methods
   */
  public equipItem(itemId: string, slot: EquipmentSlot): boolean {
    return this.equipmentManager.equipItem(itemId, slot);
  }

  public unequipItem(slot: EquipmentSlot): boolean {
    return this.equipmentManager.unequipItem(slot);
  }

  public getEquippedItem(slot: EquipmentSlot): any {
    return this.equipmentManager.getEquippedItem(slot);
  }

  public getEquippedWeapon(): any {
    return this.equipmentManager.getEquippedWeapon();
  }

  public hasWeaponEquipped(): boolean {
    return this.equipmentManager.hasWeaponEquipped();
  }

  public getWeaponDamage(): number {
    return this.equipmentManager.getWeaponDamageBonus();
  }

  public getWeaponHitBonus(): number {
    return this.equipmentManager.getWeaponHitBonus();
  }

  public getWeaponCritBonus(): number {
    return this.equipmentManager.getWeaponCritBonus();
  }

  public getEquipmentSummary(): string {
    return this.equipmentManager.getEquipmentSummary();
  }

  /**
   * Get unit summary for display
   */
  public getSummary(): string {
    const racialTraits = getRacialTraits(this.race);
    const archetypeData = getArchetypeData(this.archetype);
    
    return `${this.name} (Lv.${this.experience.currentLevel} ${racialTraits.name} ${archetypeData.name})`;
  }

  /**
   * Battle System Integration Methods
   */

  /**
   * Add temporary modifier for battle effects
   */
  public addTemporaryModifier(id: string, modifier: any): void {
    this.temporaryModifiers.set(id, modifier)
  }

  /**
   * Remove temporary modifier
   */
  public removeTemporaryModifier(id: string): boolean {
    return this.temporaryModifiers.delete(id)
  }

  /**
   * Clear all temporary effects
   */
  public clearTemporaryEffects(): void {
    this.temporaryModifiers.clear()
    this.activeStatusEffects = []
  }

  /**
   * Get active status effects for battle system
   */
  public getActiveStatusEffects(): Array<{
    effect: StatusEffect;
    duration: number;
    type: 'buff' | 'debuff';
    name: string;
  }> {
    return [...this.activeStatusEffects];
  }

  /**
   * Add status effect for battle system
   */
  public addBattleStatusEffect(effect: StatusEffect, duration: number = 3, type: 'buff' | 'debuff' = 'debuff', name?: string): void {
    this.activeStatusEffects.push({
      effect,
      duration,
      type,
      name: name || effect.toString()
    });
  }

  /**
   * Remove expired status effects
   */
  public removeExpiredStatusEffects(): void {
    this.activeStatusEffects = this.activeStatusEffects.filter(statusEffect => statusEffect.duration > 0);
  }

  /**
   * Get weapon proficiency level as number
   */
  public getWeaponProficiencyLevel(weaponType: WeaponType): number {
    const proficiency = this.weaponProficiencies.get(weaponType)
    return proficiency ? proficiency.level : 0
  }

  /**
   * Gain experience from battle
   */
  public gainExperience(exp: number): boolean {
    return this.addExperience(exp)
  }

  /**
   * Get weapon proficiency as percentage for battle calculations
   */
  public getWeaponProficiencyPercentage(weaponType: WeaponType): number {
    const proficiency = this.weaponProficiencies.get(weaponType)
    return proficiency ? proficiency.level : 0
  }

  /**
   * Check if unit can act in battle
   */
  public canAct(): boolean {
    return this.isAlive() && !this.hasDisablingStatusEffect()
  }

  /**
   * Check if unit has disabling status effects
   */
  private hasDisablingStatusEffect(): boolean {
    return this.activeStatusEffects.some(statusEffect => 
      statusEffect.type === 'debuff' && 
      (statusEffect.name === 'stun' || statusEffect.name === 'sleep' || statusEffect.name === 'paralysis')
    );
  }

  /**
   * Get battle display info
   */
  public getBattleInfo(): {
    name: string
    level: number
    hp: number
    maxHp: number
    race: string
    archetype: string
    statusEffects: string[]
  } {
    return {
      name: this.name,
      level: this.experience.currentLevel,
      hp: this.currentHp,
      maxHp: this.getCurrentStats().hp,
      race: this.race,
      archetype: this.archetype,
      statusEffects: this.activeStatusEffects.map(statusEffect => statusEffect.name)
    }
  }

  /**
   * Serialize unit to JSON
   */
  public toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      race: this.race,
      archetype: this.archetype,
      experience: this.experience,
      currentHp: this.currentHp,
      statusEffects: Array.from(this.statusEffects),
      weaponProficiencies: Array.from(this.weaponProficiencies.entries()),
      formationPosition: this.formationPosition,
      unlockedSkills: Array.from(this.unlockedSkills),
      availableJobPoints: this.availableJobPoints
    };
  }

  /**
   * Create unit from JSON data
   */
  public static fromJSON(data: any): Unit {
    const unit = new Unit(
      data.id,
      data.name,
      data.race,
      data.archetype,
      data.experience.currentLevel
    );
    
    // Restore state
    unit.experience = data.experience;
    unit.currentHp = data.currentHp;
    unit.statusEffects = new Set(data.statusEffects);
    unit.weaponProficiencies = new Map(data.weaponProficiencies);
    unit.formationPosition = data.formationPosition;
    unit.unlockedSkills = new Set(data.unlockedSkills);
    unit.availableJobPoints = data.availableJobPoints;
    
    // Recalculate stats
    unit._baseStats = unit.calculateBaseStats();
    unit._maxStats = { ...unit._baseStats };
    
    return unit;
  }
}