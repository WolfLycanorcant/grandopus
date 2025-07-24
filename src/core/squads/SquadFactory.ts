import { Squad } from './Squad';
import { Unit, UnitFactory, Race, Archetype } from '../units';
import { SquadArtifact, SquadDrill } from './types';
import { ValidationUtils } from '../../exceptions';

/**
 * Configuration for creating a new squad
 */
export interface SquadCreationConfig {
  name: string;
  gameProgressLevel?: number;
  initialUnits?: Unit[];
  autoBalance?: boolean;
}

/**
 * Preset squad configurations
 */
export interface SquadPreset {
  name: string;
  description: string;
  gameProgressLevel: number;
  unitConfigs: Array<{
    name: string;
    race: Race;
    archetype: Archetype;
    level: number;
  }>;
  recommendedArtifacts?: string[];
}

/**
 * Factory class for creating squads with validation and presets
 */
export class SquadFactory {
  private static squadIdCounter = 1;

  /**
   * Create a new squad with validation
   */
  public static createSquad(config: SquadCreationConfig): Squad {
    // Validate configuration
    this.validateSquadConfig(config);
    
    // Generate unique ID
    const id = this.generateSquadId();
    
    // Create squad
    const squad = new Squad(
      id,
      config.name,
      config.gameProgressLevel || 1
    );
    
    // Add initial units if provided
    if (config.initialUnits) {
      for (const unit of config.initialUnits) {
        try {
          squad.addUnit(unit);
        } catch (error) {
          console.warn(`Failed to add unit ${unit.name} to squad: ${error}`);
        }
      }
    }
    
    // Auto-balance squad if requested
    if (config.autoBalance && config.initialUnits) {
      this.autoBalanceSquad(squad);
    }
    
    return squad;
  }

  /**
   * Create a squad from a preset
   */
  public static createFromPreset(preset: SquadPreset, customName?: string): Squad {
    // Create units from preset configuration
    const units = preset.unitConfigs.map(unitConfig =>
      UnitFactory.createUnit({
        name: unitConfig.name,
        race: unitConfig.race,
        archetype: unitConfig.archetype,
        level: unitConfig.level
      })
    );
    
    return this.createSquad({
      name: customName || preset.name,
      gameProgressLevel: preset.gameProgressLevel,
      initialUnits: units,
      autoBalance: true
    });
  }

  /**
   * Create a random squad
   */
  public static createRandomSquad(
    gameProgressLevel: number = 1,
    squadSize: number = 4,
    name?: string
  ): Squad {
    ValidationUtils.validateRange(gameProgressLevel, 1, 5, 'game progress level');
    ValidationUtils.validateRange(squadSize, 1, 12, 'squad size');
    
    const randomName = name || this.generateRandomSquadName();
    const units: Unit[] = [];
    
    // Create random units
    for (let i = 0; i < squadSize; i++) {
      const level = Math.max(1, gameProgressLevel + Math.floor(Math.random() * 3) - 1);
      units.push(UnitFactory.createRandomUnit(level));
    }
    
    return this.createSquad({
      name: randomName,
      gameProgressLevel,
      initialUnits: units,
      autoBalance: true
    });
  }

  /**
   * Create a balanced starter squad
   */
  public static createStarterSquad(name: string = 'Starter Squad'): Squad {
    const starterUnits = UnitFactory.createStarterSquad();
    
    return this.createSquad({
      name,
      gameProgressLevel: 1,
      initialUnits: starterUnits,
      autoBalance: true
    });
  }

  /**
   * Validate squad creation configuration
   */
  private static validateSquadConfig(config: SquadCreationConfig): void {
    ValidationUtils.validateRequired(config.name, 'squad name');
    ValidationUtils.validateStringLength(config.name, 1, 50, 'squad name');
    
    if (config.gameProgressLevel !== undefined) {
      ValidationUtils.validateRange(config.gameProgressLevel, 1, 5, 'game progress level');
    }
    
    if (config.initialUnits) {
      if (config.initialUnits.length > 12) {
        throw new Error('Cannot create squad with more than 12 units');
      }
      
      // Check for duplicate units
      const unitIds = config.initialUnits.map(unit => unit.id);
      const uniqueIds = new Set(unitIds);
      if (unitIds.length !== uniqueIds.size) {
        throw new Error('Cannot create squad with duplicate units');
      }
    }
  }

  /**
   * Auto-balance squad formation for optimal positioning
   */
  private static autoBalanceSquad(squad: Squad): void {
    const units = squad.getUnits();
    
    // Sort units by role preference
    const tanks = units.filter(unit => this.isTankRole(unit));
    const damage = units.filter(unit => this.isDamageRole(unit));
    const support = units.filter(unit => this.isSupportRole(unit));
    
    // Clear current formation
    units.forEach(unit => {
      if (unit.formationPosition) {
        // Remove and re-add to reset positions
        const unitId = unit.id;
        const removedUnit = squad.removeUnit(unitId);
        squad.addUnit(removedUnit);
      }
    });
  }

  /**
   * Check if unit is a tank role
   */
  private static isTankRole(unit: Unit): boolean {
    const stats = unit.getCurrentStats();
    return stats.arm >= stats.skl && stats.hp > stats.mag;
  }

  /**
   * Check if unit is a damage role
   */
  private static isDamageRole(unit: Unit): boolean {
    const stats = unit.getCurrentStats();
    return stats.str > stats.arm || stats.mag > stats.arm;
  }

  /**
   * Check if unit is a support role
   */
  private static isSupportRole(unit: Unit): boolean {
    const stats = unit.getCurrentStats();
    return stats.ldr > 10 || stats.mag > stats.str;
  }

  /**
   * Generate unique squad ID
   */
  private static generateSquadId(): string {
    return `squad_${this.squadIdCounter++}_${Date.now()}`;
  }

  /**
   * Generate a random squad name
   */
  private static generateRandomSquadName(): string {
    const adjectives = [
      'Iron', 'Golden', 'Shadow', 'Storm', 'Fire', 'Ice', 'Thunder', 'Swift',
      'Brave', 'Noble', 'Wild', 'Ancient', 'Mystic', 'Sacred', 'Dark', 'Bright'
    ];
    
    const nouns = [
      'Hawks', 'Wolves', 'Lions', 'Eagles', 'Dragons', 'Phoenix', 'Griffons',
      'Blades', 'Shields', 'Spears', 'Arrows', 'Hammers', 'Guards', 'Legion',
      'Company', 'Battalion', 'Regiment', 'Order', 'Brotherhood', 'Alliance'
    ];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective} ${noun}`;
  }

  /**
   * Get squad creation statistics
   */
  public static getCreationStats(): { totalSquadsCreated: number } {
    return {
      totalSquadsCreated: this.squadIdCounter - 1
    };
  }

  /**
   * Reset squad ID counter (for testing)
   */
  public static resetIdCounter(): void {
    this.squadIdCounter = 1;
  }
}

/**
 * Predefined squad presets for different playstyles
 */
export const SQUAD_PRESETS: Record<string, SquadPreset> = {
  BALANCED_STARTER: {
    name: 'Balanced Company',
    description: 'A well-rounded squad suitable for new commanders',
    gameProgressLevel: 1,
    unitConfigs: [
      { name: 'Marcus', race: Race.HUMAN, archetype: Archetype.HEAVY_INFANTRY, level: 1 },
      { name: 'Aelindra', race: Race.ELF, archetype: Archetype.ARCHER, level: 1 },
      { name: 'Daina', race: Race.DWARF, archetype: Archetype.CLERIC, level: 1 },
      { name: 'Elena', race: Race.HUMAN, archetype: Archetype.LIGHT_INFANTRY, level: 1 }
    ]
  },

  ELITE_KNIGHTS: {
    name: 'Order of the Golden Lance',
    description: 'Elite human knights with strong leadership',
    gameProgressLevel: 3,
    unitConfigs: [
      { name: 'Sir Gareth', race: Race.HUMAN, archetype: Archetype.KNIGHT, level: 8 },
      { name: 'Sir Lancelot', race: Race.HUMAN, archetype: Archetype.KNIGHT, level: 7 },
      { name: 'Brother Marcus', race: Race.HUMAN, archetype: Archetype.CLERIC, level: 6 },
      { name: 'Squire Thomas', race: Race.HUMAN, archetype: Archetype.LIGHT_INFANTRY, level: 5 },
      { name: 'Archer William', race: Race.HUMAN, archetype: Archetype.ARCHER, level: 5 }
    ],
    recommendedArtifacts: ['Banner of Unity', 'Sacred Relic']
  },

  BEAST_PACK: {
    name: 'Primal Warband',
    description: 'Beast tamer leading a pack of wild creatures',
    gameProgressLevel: 4,
    unitConfigs: [
      { name: 'Kael Beastmaster', race: Race.HUMAN, archetype: Archetype.BEAST_TAMER, level: 10 },
      { name: 'Fang', race: Race.BEAST, archetype: Archetype.HEAVY_INFANTRY, level: 8 },
      { name: 'Claw', race: Race.BEAST, archetype: Archetype.LIGHT_INFANTRY, level: 8 },
      { name: 'Storm', race: Race.GRIFFON, archetype: Archetype.ARCHER, level: 7 }
    ],
    recommendedArtifacts: ['Beast Bond Totem', 'Primal Essence']
  },

  ARCANE_CIRCLE: {
    name: 'Circle of the Eternal Flame',
    description: 'Powerful mages and their magical allies',
    gameProgressLevel: 4,
    unitConfigs: [
      { name: 'Archmage Pyraxis', race: Race.DRAGON, archetype: Archetype.MAGE, level: 12 },
      { name: 'Seraphiel', race: Race.ANGEL, archetype: Archetype.CLERIC, level: 9 },
      { name: 'Silviana', race: Race.ELF, archetype: Archetype.MAGE, level: 8 },
      { name: 'Vex', race: Race.DEMON, archetype: Archetype.MAGE, level: 8 }
    ],
    recommendedArtifacts: ['Orb of Power', 'Mana Resonance Crystal']
  },

  DWARVEN_ENGINEERS: {
    name: 'Ironforge Battalion',
    description: 'Dwarven engineers with siege equipment mastery',
    gameProgressLevel: 5,
    unitConfigs: [
      { name: 'Master Thorin', race: Race.DWARF, archetype: Archetype.DWARVEN_ENGINEER, level: 15 },
      { name: 'Engineer Balin', race: Race.DWARF, archetype: Archetype.DWARVEN_ENGINEER, level: 12 },
      { name: 'Defender Gimli', race: Race.DWARF, archetype: Archetype.HEAVY_INFANTRY, level: 10 },
      { name: 'Cleric Daina', race: Race.DWARF, archetype: Archetype.CLERIC, level: 9 },
      { name: 'Crossbow Nori', race: Race.DWARF, archetype: Archetype.ARCHER, level: 8 }
    ],
    recommendedArtifacts: ['Master Tools', 'Siege Engine Plans', 'Dwarven Resilience']
  }
};

/**
 * Common squad artifacts
 */
export const COMMON_ARTIFACTS: Record<string, SquadArtifact> = {
  BANNER_OF_UNITY: {
    id: 'banner_of_unity',
    name: 'Banner of Unity',
    description: 'A rallying banner that boosts squad morale and damage',
    effects: [
      {
        type: 'damage_bonus',
        target: 'all',
        value: 10,
        description: '+10% damage to all squad members'
      }
    ]
  },

  DRAGONS_SCALE: {
    id: 'dragons_scale',
    name: "Dragon's Scale",
    description: 'Ancient dragon scale providing fire protection',
    effects: [
      {
        type: 'resistance',
        target: 'all',
        value: 25,
        description: '25% fire damage reduction'
      }
    ],
    requiredLeadership: 15
  },

  ORB_OF_POWER: {
    id: 'orb_of_power',
    name: 'Orb of Power',
    description: 'Mystical orb that amplifies magical abilities',
    effects: [
      {
        type: 'stat_bonus',
        target: 'all',
        value: 20,
        description: '+20% magic damage'
      }
    ],
    requiredLeadership: 12
  }
};

/**
 * Common squad drills
 */
export const COMMON_DRILLS: Record<string, SquadDrill> = {
  PHALANX_FORMATION: {
    id: 'phalanx_formation',
    name: 'Phalanx Formation',
    description: 'Disciplined formation training for front-row fighters',
    requirements: {
      minLevel: 5,
      trainingTime: 100,
      cost: { gold: 500 }
    },
    effects: [
      {
        type: 'formation_bonus',
        description: '+15% armor bonus for front row units',
        value: 15
      }
    ]
  },

  ARCANE_RESONANCE: {
    id: 'arcane_resonance',
    name: 'Arcane Resonance',
    description: 'Magical synchronization training for spellcasters',
    requirements: {
      minLevel: 8,
      trainingTime: 200,
      cost: { mana_crystal: 10 }
    },
    effects: [
      {
        type: 'combat_bonus',
        description: '+25% magic damage when multiple mages are present',
        value: 25
      }
    ]
  }
};