import { Unit } from '../units';
import { DamageType, WeaponType } from '../equipment/types';
import { getRacialTraits } from '../units/RaceData';
import { DamageResult, DamageModifier, FormationCombatBonus } from './types';
import { DamageCalculationException } from '../../exceptions';

/**
 * Handles all damage calculations for combat
 */
export class DamageCalculator {

  /**
   * Calculate damage from attacker to defender using equipped weapon
   * Formula from design doc: weapon.base_damage * (1 + proficiency/100) * stat_modifier * ember/artifact_modifiers * weakness_multiplier
   */
  public static calculateDamage(
    attacker: Unit,
    defender: Unit,
    formationBonuses?: { attacker?: FormationCombatBonus; defender?: FormationCombatBonus }
  ): DamageResult {
    try {
      const modifiers: DamageModifier[] = [];

      // Get equipped weapon or use default unarmed damage
      const equippedWeapon = attacker.getEquippedWeapon();
      let baseDamage: number;
      let weaponType: WeaponType;
      let damageType: DamageType;

      if (equippedWeapon) {
        // Use equipped weapon stats
        baseDamage = attacker.getWeaponDamage(); // This includes proficiency bonuses
        weaponType = equippedWeapon.type;
        damageType = equippedWeapon.damageType;
      } else {
        // Unarmed combat - use basic stats
        const attackerStats = attacker.getCurrentStats();
        baseDamage = Math.max(1, Math.floor(attackerStats.str / 4)); // Basic unarmed damage
        weaponType = WeaponType.MACE; // Treat as bludgeoning
        damageType = DamageType.PHYSICAL;
      }

      let finalDamage = baseDamage;

      // 1. Weapon Hit Bonus (already included in getWeaponDamage, but track for display)
      if (equippedWeapon) {
        const proficiency = attacker.getWeaponProficiency(weaponType);
        const proficiencyBonus = proficiency ? proficiency.level : 0;

        if (proficiencyBonus > 0) {
          modifiers.push({
            source: 'weapon_proficiency',
            type: 'weapon_proficiency',
            value: proficiencyBonus,
            description: `${weaponType} proficiency: +${proficiencyBonus}%`
          });
        }

        // Add weapon bonuses to display
        if (equippedWeapon.hitBonus) {
          modifiers.push({
            source: 'weapon_bonus',
            type: 'weapon_bonus',
            value: equippedWeapon.hitBonus,
            description: `${equippedWeapon.name} hit bonus: +${equippedWeapon.hitBonus}%`
          });
        }
      }

      // 2. Stat Modifier (STR for physical, MAG for magic)
      const attackerStats = attacker.getCurrentStats();
      let statModifier = 1;

      if (this.isPhysicalDamage(damageType)) {
        statModifier = 1 + (attackerStats.str / 100);
        modifiers.push({
          source: 'stat_bonus',
          type: 'stat_bonus',
          value: attackerStats.str,
          description: `STR bonus: +${attackerStats.str}%`
        });
      } else if (this.isMagicalDamage(damageType)) {
        statModifier = 1 + (attackerStats.mag / 100);
        modifiers.push({
          source: 'stat_bonus',
          type: 'stat_bonus',
          value: attackerStats.mag,
          description: `MAG bonus: +${attackerStats.mag}%`
        });
      }

      finalDamage *= statModifier;

      // 3. Formation Bonuses
      if (formationBonuses?.attacker) {
        const bonus = formationBonuses.attacker;

        // Front row physical damage bonus
        if (bonus.position === 'front' && bonus.bonuses.physicalDamageBonus && this.isPhysicalDamage(damageType)) {
          const bonusValue = bonus.bonuses.physicalDamageBonus;
          finalDamage *= (1 + bonusValue / 100);
          modifiers.push({
            source: 'formation_bonus',
            type: 'formation_bonus',
            value: bonusValue,
            description: `Front row physical damage: +${bonusValue}%`
          });
        }

        // Back row ranged/magic damage bonus
        if (bonus.position === 'back' && bonus.bonuses.rangedDamageBonus && !this.isPhysicalDamage(damageType)) {
          const bonusValue = bonus.bonuses.rangedDamageBonus;
          finalDamage *= (1 + bonusValue / 100);
          modifiers.push({
            source: 'formation_bonus',
            type: 'formation_bonus',
            value: bonusValue,
            description: `Back row ranged/magic damage: +${bonusValue}%`
          });
        }
      }

      // 4. Skill Bonuses
      const skillBonuses = attacker.skillManager.getCombatBonuses()
      if (skillBonuses.damageBonus > 0) {
        finalDamage *= (1 + skillBonuses.damageBonus / 100)
        modifiers.push({
          source: 'skill_bonus',
          type: 'skill_bonus',
          value: skillBonuses.damageBonus,
          description: `Skill damage bonus: +${skillBonuses.damageBonus}%`
        })
      }

      // 5. Racial Damage Bonuses
      const attackerRace = getRacialTraits(attacker.race);
      if (attackerRace.statModifiers.str && this.isPhysicalDamage(damageType)) {
        const bonus = attackerRace.statModifiers.str;
        modifiers.push({
          source: 'racial_trait',
          type: 'racial_trait',
          value: bonus,
          description: `${attackerRace.name} racial bonus: +${bonus}% physical damage`
        });
      }

      if (attackerRace.statModifiers.mag && this.isMagicalDamage(damageType)) {
        const bonus = attackerRace.statModifiers.mag;
        modifiers.push({
          source: 'racial_trait',
          type: 'racial_trait',
          value: bonus,
          description: `${attackerRace.name} racial bonus: +${bonus}% magic damage`
        });
      }

      // 5. Apply Defender Resistances and Armor
      const defenderStats = defender.getCurrentStats();
      const defenderRace = getRacialTraits(defender.race);

      // Physical damage reduction from armor
      if (this.isPhysicalDamage(damageType)) {
        let armorReduction = defenderStats.arm;

        // Formation armor bonus
        if (formationBonuses?.defender?.position === 'front' && formationBonuses.defender.bonuses.armorBonus) {
          armorReduction += formationBonuses.defender.bonuses.armorBonus;
          modifiers.push({
            source: 'formation_bonus',
            type: 'formation_bonus',
            value: -formationBonuses.defender.bonuses.armorBonus,
            description: `Front row armor bonus: +${formationBonuses.defender.bonuses.armorBonus}% armor`
          });
        }

        // Back row physical damage reduction
        if (formationBonuses?.defender?.position === 'back' && formationBonuses.defender.bonuses.physicalDamageReduction) {
          const reduction = formationBonuses.defender.bonuses.physicalDamageReduction;
          armorReduction += reduction;
          modifiers.push({
            source: 'formation_bonus',
            type: 'formation_bonus',
            value: -reduction,
            description: `Back row physical damage reduction: +${reduction}% resistance`
          });
        }

        const armorMultiplier = Math.max(0.1, 1 - (armorReduction / 100)); // Minimum 10% damage gets through
        finalDamage *= armorMultiplier;

        if (armorReduction > 0) {
          modifiers.push({
            source: 'resistance',
            type: 'resistance',
            value: -armorReduction,
            description: `Armor resistance: -${armorReduction}%`
          });
        }
      }

      // Magic resistance
      if (this.isMagicalDamage(damageType)) {
        const magicResistance = defenderStats.mag * 0.5; // MAG provides 50% magic resistance
        const resistanceMultiplier = Math.max(0.1, 1 - (magicResistance / 100));
        finalDamage *= resistanceMultiplier;

        if (magicResistance > 0) {
          modifiers.push({
            source: 'resistance',
            type: 'resistance',
            value: -magicResistance,
            description: `Magic resistance: -${magicResistance.toFixed(1)}%`
          });
        }
      }

      // 6. Racial Immunities and Resistances
      let resistanceApplied = 0;

      if (defenderRace.immunities?.includes(damageType)) {
        finalDamage = 0;
        resistanceApplied = 100;
        modifiers.push({
          source: 'racial_trait',
          type: 'resistance',
          value: -100,
          description: `${defenderRace.name} immunity to ${damageType}`
        });
      } else if (defenderRace.resistances?.includes(damageType)) {
        const resistance = 50; // 50% resistance
        finalDamage *= (1 - resistance / 100);
        resistanceApplied = resistance;
        modifiers.push({
          source: 'racial_trait',
          type: 'resistance',
          value: -resistance,
          description: `${defenderRace.name} resistance to ${damageType}: -${resistance}%`
        });
      }

      // 7. Check for Critical Hit
      const isCritical = this.calculateCriticalHit(attacker, defender);
      if (isCritical) {
        finalDamage *= 2; // Double damage on crit
        modifiers.push({
          source: 'critical_hit',
          type: 'stat_bonus',
          value: 100,
          description: 'Critical hit: x2 damage'
        });
      }

      // 8. Apply minimum damage (at least 1 damage unless immune)
      if (finalDamage > 0 && finalDamage < 1 && resistanceApplied < 100) {
        finalDamage = 1;
      }

      // Round final damage
      finalDamage = Math.floor(finalDamage);

      return {
        baseDamage,
        finalDamage,
        damageType,
        isCritical,
        isBlocked: false, // TODO: Implement blocking
        resistanceApplied,
        modifiers
      };

    } catch (error) {
      throw new DamageCalculationException(
        `Failed to calculate damage: ${error}`,
        attacker.id,
        defender.id
      );
    }
  }

  /**
   * Calculate critical hit chance
   */
  private static calculateCriticalHit(attacker: Unit, defender: Unit): boolean {
    const attackerStats = attacker.getCurrentStats();
    const defenderStats = defender.getCurrentStats();

    // Base crit chance from skill difference
    const skillDifference = attackerStats.skl - defenderStats.skl;
    const baseCritChance = Math.max(5, Math.min(25, 5 + skillDifference)); // 5-25% base crit

    // Skill bonuses
    let critChance = baseCritChance;
    const skillBonuses = attacker.skillManager.getCombatBonuses();
    critChance += skillBonuses.criticalBonus;

    // Racial bonuses (e.g., Beast Primal Fury)
    const attackerRace = getRacialTraits(attacker.race);

    if (attackerRace.specialAbilities.includes('Primal Fury') &&
      attacker.currentHp < attacker.getMaxStats().hp * 0.5) {
      critChance += 20; // +20% crit when below 50% HP
    }

    // Roll for crit
    return Math.random() * 100 < critChance;
  }

  /**
   * Check if damage type is physical
   */
  private static isPhysicalDamage(damageType: DamageType): boolean {
    return damageType === DamageType.PHYSICAL;
  }

  /**
   * Check if damage type is magical
   */
  private static isMagicalDamage(damageType: DamageType): boolean {
    return [
      DamageType.FIRE,
      DamageType.ICE,
      DamageType.LIGHTNING,
      DamageType.HOLY,
      DamageType.DARK
    ].includes(damageType);
  }

  /**
   * Get weapon damage type based on weapon type
   */
  public static getWeaponDamageType(weaponType: WeaponType): DamageType {
    const weaponDamageMap: Record<WeaponType, DamageType> = {
      [WeaponType.SWORD]: DamageType.PHYSICAL,
      [WeaponType.AXE]: DamageType.PHYSICAL,
      [WeaponType.SPEAR]: DamageType.PHYSICAL,
      [WeaponType.BOW]: DamageType.PHYSICAL,
      [WeaponType.CROSSBOW]: DamageType.PHYSICAL,
      [WeaponType.DAGGER]: DamageType.PHYSICAL,
      [WeaponType.MACE]: DamageType.PHYSICAL,
      [WeaponType.HAMMER]: DamageType.PHYSICAL,
      [WeaponType.STAFF]: DamageType.FIRE, // Default magic damage
      [WeaponType.WAND]: DamageType.LIGHTNING   // Default magic damage
    };

    return weaponDamageMap[weaponType] || DamageType.PHYSICAL;
  }

  /**
   * Get base weapon damage based on weapon type and unit level
   */
  public static getBaseWeaponDamage(weaponType: WeaponType, unitLevel: number): number {
    const baseDamageMap: Record<WeaponType, number> = {
      [WeaponType.SWORD]: 25,
      [WeaponType.AXE]: 30,
      [WeaponType.SPEAR]: 22,
      [WeaponType.BOW]: 20,
      [WeaponType.CROSSBOW]: 28,
      [WeaponType.DAGGER]: 15,
      [WeaponType.MACE]: 28,
      [WeaponType.HAMMER]: 35,
      [WeaponType.STAFF]: 18,
      [WeaponType.WAND]: 15
    };

    const baseDamage = baseDamageMap[weaponType] || 20;

    // Scale with unit level
    return Math.floor(baseDamage * (1 + (unitLevel - 1) * 0.1));
  }
}