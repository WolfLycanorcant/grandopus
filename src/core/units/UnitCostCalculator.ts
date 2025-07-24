import { BASIC_RECRUITABLE_UNITS } from '../recruitment/RecruitmentData';
import { Unit } from './Unit';
import { isCreatureRace, Archetype } from './types';

export interface UnitCreationCost {
  gold: number;
  baseRecruitmentCost: number;
  customCreationMultiplier: number;
  totalCost: number;
}

export class UnitCostCalculator {
  private static readonly CUSTOM_CREATION_MULTIPLIER = 2.0;
  private static readonly DEFAULT_BASE_COST = 100; // Fallback cost for units not in recruitment data

  /**
   * Calculate the cost to create a custom unit based on recruitment data
   */
  public static calculateUnitCreationCost(
    race: string,
    archetype: string,
    level: number = 1
  ): UnitCreationCost {
    // Find matching recruitable unit
    const recruitableUnit = BASIC_RECRUITABLE_UNITS.find(
      unit => unit.race.toLowerCase() === race.toLowerCase() && 
              unit.archetype.toLowerCase() === archetype.toLowerCase()
    );

    let baseRecruitmentCost = this.DEFAULT_BASE_COST;
    
    if (recruitableUnit) {
      baseRecruitmentCost = recruitableUnit.cost.gold;
    } else {
      // Calculate estimated cost based on race/archetype rarity
      baseRecruitmentCost = this.estimateCostByRaceArchetype(race, archetype);
    }

    // Apply level scaling (each level above 1 increases cost by 20%)
    const levelMultiplier = 1 + ((level - 1) * 0.2);
    const levelAdjustedCost = Math.floor(baseRecruitmentCost * levelMultiplier);

    // Double the cost for custom creation
    const totalCost = Math.floor(levelAdjustedCost * this.CUSTOM_CREATION_MULTIPLIER);

    return {
      gold: totalCost,
      baseRecruitmentCost: levelAdjustedCost,
      customCreationMultiplier: this.CUSTOM_CREATION_MULTIPLIER,
      totalCost
    };
  }

  /**
   * Estimate cost based on race and archetype characteristics
   */
  private static estimateCostByRaceArchetype(race: string, archetype: string): number {
    const raceMultipliers: Record<string, number> = {
      'human': 1.0,
      'elf': 1.2,
      'dwarf': 1.1,
      'orc': 0.9,
      'goblin': 0.7,
      'troll': 1.3,
      'undead': 1.4,
      'demon': 1.6,
      'beast': 1.8,    // Powerful creatures
      'dragon': 3.0,   // Most expensive creatures
      'griffon': 2.2   // Flying creatures
    };

    const archetypeMultipliers: Record<string, number> = {
      'warrior': 1.0,
      'archer': 1.1,
      'mage': 1.3,
      'cleric': 1.2,
      'rogue': 1.1,
      'paladin': 1.4,
      'ranger': 1.2,
      'necromancer': 1.5,
      'berserker': 1.1,
      'guardian': 1.3,
      'creature': 1.0  // Creatures don't have class modifiers, just base creature cost
    };

    const raceMultiplier = raceMultipliers[race.toLowerCase()] || 1.0;
    
    // For creature races, ignore archetype multiplier since they don't have traditional classes
    const archetypeMultiplier = this.isCreatureArchetype(race, archetype) ? 1.0 : 
      (archetypeMultipliers[archetype.toLowerCase()] || 1.0);

    return Math.floor(this.DEFAULT_BASE_COST * raceMultiplier * archetypeMultiplier);
  }

  /**
   * Check if this is a creature race that should ignore archetype modifiers
   */
  private static isCreatureArchetype(race: string, archetype: string): boolean {
    const creatureRaces = ['beast', 'dragon', 'griffon'];
    return creatureRaces.includes(race.toLowerCase()) || archetype.toLowerCase() === 'creature';
  }

  /**
   * Check if player has enough resources to create a unit
   */
  public static canAffordUnit(
    playerGold: number,
    race: string,
    archetype: string,
    level: number = 1
  ): { canAfford: boolean; cost: UnitCreationCost; shortfall: number } {
    const cost = this.calculateUnitCreationCost(race, archetype, level);
    const canAfford = playerGold >= cost.totalCost;
    const shortfall = canAfford ? 0 : cost.totalCost - playerGold;

    return {
      canAfford,
      cost,
      shortfall
    };
  }

  /**
   * Get a breakdown of costs for display purposes
   */
  public static getCostBreakdown(
    race: string,
    archetype: string,
    level: number = 1
  ): {
    baseCost: number;
    levelAdjustment: number;
    customCreationFee: number;
    totalCost: number;
    breakdown: string[];
  } {
    const cost = this.calculateUnitCreationCost(race, archetype, level);
    const baseCost = cost.baseRecruitmentCost / (1 + ((level - 1) * 0.2));
    const levelAdjustment = cost.baseRecruitmentCost - baseCost;
    const customCreationFee = cost.totalCost - cost.baseRecruitmentCost;

    const breakdown = [
      `Base recruitment cost: ${Math.floor(baseCost)} gold`,
      ...(level > 1 ? [`Level ${level} adjustment: +${Math.floor(levelAdjustment)} gold`] : []),
      `Custom creation fee (2x): +${customCreationFee} gold`,
      `Total cost: ${cost.totalCost} gold`
    ];

    return {
      baseCost: Math.floor(baseCost),
      levelAdjustment: Math.floor(levelAdjustment),
      customCreationFee,
      totalCost: cost.totalCost,
      breakdown
    };
  }

  /**
   * Calculate refund amount if a unit is deleted (50% of creation cost)
   */
  public static calculateRefund(unit: Unit): number {
    const cost = this.calculateUnitCreationCost(
      unit.race,
      unit.archetype,
      unit.experience?.currentLevel || 1
    );
    return Math.floor(cost.totalCost * 0.5);
  }
}