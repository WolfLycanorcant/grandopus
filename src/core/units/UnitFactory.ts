import { Unit } from './Unit';
import { Race, Archetype } from './types';
import { getRacialTraits } from './RaceData';
import { getArchetypeData } from './ArchetypeData';
import {
    InvalidRaceException,
    InvalidArchetypeException,
    InvalidUnitNameException,
    ValidationUtils
} from '../../exceptions';

/**
 * Configuration for creating a new unit
 */
export interface UnitCreationConfig {
    name: string;
    race: Race;
    archetype: Archetype;
    level?: number;
    customStats?: Partial<import('./types').UnitStats>;
}

/**
 * Preset unit configurations for quick creation
 */
export interface UnitPreset {
    name: string;
    description: string;
    race: Race;
    archetype: Archetype;
    recommendedLevel: number;
}

/**
 * Factory class for creating units with validation and presets
 */
export class UnitFactory {
    private static unitIdCounter = 1;

    /**
     * Create a new unit with validation
     */
    public static createUnit(config: UnitCreationConfig): Unit {
        // Validate configuration
        this.validateUnitConfig(config);

        // Generate unique ID
        const id = this.generateUnitId();

        // Create unit
        const unit = new Unit(
            id,
            config.name,
            config.race,
            config.archetype,
            config.level || 1
        );

        return unit;
    }

    /**
     * Create a unit from a preset
     */
    public static createFromPreset(preset: UnitPreset, customName?: string): Unit {
        return this.createUnit({
            name: customName || preset.name,
            race: preset.race,
            archetype: preset.archetype,
            level: preset.recommendedLevel
        });
    }

    /**
     * Create a random unit
     */
    public static createRandomUnit(level: number = 1, name?: string): Unit {
        const races = Object.values(Race);
        const randomRace = races[Math.floor(Math.random() * races.length)];
        
        // Get valid archetypes for the selected race
        const validArchetypes = this.getRecommendedArchetypes(randomRace);
        const randomArchetype = validArchetypes[Math.floor(Math.random() * validArchetypes.length)];
        
        const randomName = name || this.generateRandomName(randomRace, randomArchetype);

        return this.createUnit({
            name: randomName,
            race: randomRace,
            archetype: randomArchetype,
            level
        });
    }

    /**
     * Validate unit creation configuration
     */
    private static validateUnitConfig(config: UnitCreationConfig): void {
        // Validate name
        ValidationUtils.validateRequired(config.name, 'name');
        ValidationUtils.validateStringLength(config.name, 1, 50, 'name');

        // Check for inappropriate names (basic filter)
        const inappropriateWords = ['admin', 'null', 'undefined', 'system'];
        if (inappropriateWords.some(word => config.name.toLowerCase().includes(word))) {
            throw new InvalidUnitNameException(config.name, 'contains inappropriate content');
        }

        // Validate race
        if (!Object.values(Race).includes(config.race)) {
            throw new InvalidRaceException(config.race, Object.values(Race));
        }

        // Validate archetype
        if (!Object.values(Archetype).includes(config.archetype)) {
            throw new InvalidArchetypeException(config.archetype, config.race, Object.values(Archetype));
        }

        // Validate level if provided
        if (config.level !== undefined) {
            ValidationUtils.validateRange(config.level, 1, 99, 'level');
        }

        // Validate race-archetype compatibility (optional restrictions)
        this.validateRaceArchetypeCompatibility(config.race, config.archetype);
    }

    /**
     * Validate race-archetype compatibility
     */
    private static validateRaceArchetypeCompatibility(race: Race, archetype: Archetype): void {
        // Define some logical restrictions
        const restrictions: Record<Race, Archetype[]> = {
            [Race.BEAST]: [Archetype.MAGE, Archetype.CLERIC], // Beasts can't be spellcasters
            [Race.DRAGON]: [Archetype.ROGUE], // Dragons are too large to be stealthy
            [Race.GRIFFON]: [Archetype.HEAVY_INFANTRY], // Flying creatures can't be heavy infantry
            [Race.HUMAN]: [],
            [Race.ELF]: [],
            [Race.DWARF]: [],
            [Race.ORC]: [],
            [Race.GOBLIN]: [],
            [Race.ANGEL]: [],
            [Race.DEMON]: []
        };

        // Special case: Only dwarves can be Dwarven Engineers
        if (archetype === Archetype.DWARVEN_ENGINEER && race !== Race.DWARF) {
            throw new InvalidArchetypeException(
                archetype,
                race,
                ['Only dwarves can be Dwarven Engineers']
            );
        }

        // Check other restrictions
        const restrictedArchetypes = restrictions[race] || [];
        if (restrictedArchetypes.includes(archetype)) {
            throw new InvalidArchetypeException(
                archetype,
                race,
                [`${race} cannot be ${archetype} due to racial limitations`]
            );
        }
    }

    /**
     * Generate unique unit ID
     */
    private static generateUnitId(): string {
        // Use counter, timestamp, and random component for guaranteed uniqueness
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `unit_${this.unitIdCounter++}_${timestamp}_${random}`;
    }

    /**
     * Generate a random name based on race and archetype
     */
    private static generateRandomName(race: Race, archetype: Archetype): string {
        const raceNames: Record<Race, string[]> = {
            [Race.HUMAN]: ['Marcus', 'Elena', 'Thomas', 'Sarah', 'David', 'Maria'],
            [Race.ELF]: ['Aelindra', 'Thalorin', 'Silviana', 'Erevan', 'Lyralei', 'Varian'],
            [Race.DWARF]: ['Thorin', 'Daina', 'Balin', 'Nori', 'Gimli', 'Dwalin'],
            [Race.ORC]: ['Grok', 'Ursa', 'Thok', 'Grenda', 'Morg', 'Ulga'],
            [Race.GOBLIN]: ['Snik', 'Grix', 'Zap', 'Nix', 'Pip', 'Krik'],
            [Race.ANGEL]: ['Seraphiel', 'Auriel', 'Gabriel', 'Raphael', 'Uriel', 'Michael'],
            [Race.DEMON]: ['Bael', 'Lilith', 'Malphas', 'Vex', 'Zagan', 'Paimon'],
            [Race.BEAST]: ['Fang', 'Claw', 'Storm', 'Shadow', 'Thunder', 'Blaze'],
            [Race.DRAGON]: ['Pyraxis', 'Frostmaw', 'Stormwing', 'Shadowflame', 'Goldscale', 'Ironhide'],
            [Race.GRIFFON]: ['Skytalon', 'Windcrest', 'Stormfeather', 'Goldbeak', 'Swiftclaw', 'Cloudwing']
        };

        const names = raceNames[race] || ['Unknown'];
        return names[Math.floor(Math.random() * names.length)];
    }

    /**
     * Get recommended archetypes for a race
     */
    public static getRecommendedArchetypes(race: Race): Archetype[] {
        const recommendations: Record<Race, Archetype[]> = {
            [Race.HUMAN]: [Archetype.KNIGHT, Archetype.LIGHT_INFANTRY, Archetype.ARCHER],
            [Race.ELF]: [Archetype.ARCHER, Archetype.MAGE, Archetype.ROGUE],
            [Race.DWARF]: [Archetype.HEAVY_INFANTRY, Archetype.DWARVEN_ENGINEER, Archetype.CLERIC],
            [Race.ORC]: [Archetype.HEAVY_INFANTRY, Archetype.LIGHT_INFANTRY],
            [Race.GOBLIN]: [Archetype.ROGUE, Archetype.ARCHER, Archetype.LIGHT_INFANTRY],
            [Race.ANGEL]: [Archetype.CLERIC, Archetype.KNIGHT, Archetype.MAGE],
            [Race.DEMON]: [Archetype.MAGE, Archetype.ROGUE, Archetype.HEAVY_INFANTRY],
            [Race.BEAST]: [Archetype.HEAVY_INFANTRY, Archetype.LIGHT_INFANTRY],
            [Race.DRAGON]: [Archetype.MAGE, Archetype.HEAVY_INFANTRY],
            [Race.GRIFFON]: [Archetype.ARCHER, Archetype.LIGHT_INFANTRY, Archetype.ROGUE]
        };

        return recommendations[race] || Object.values(Archetype);
    }

    /**
     * Create a balanced starter squad
     */
    public static createStarterSquad(): Unit[] {
        const starterUnits = [
            // Tank
            this.createUnit({
                name: 'Marcus',
                race: Race.HUMAN,
                archetype: Archetype.HEAVY_INFANTRY,
                level: 1
            }),

            // Damage dealer
            this.createUnit({
                name: 'Aelindra',
                race: Race.ELF,
                archetype: Archetype.ARCHER,
                level: 1
            }),

            // Support
            this.createUnit({
                name: 'Daina',
                race: Race.DWARF,
                archetype: Archetype.CLERIC,
                level: 1
            }),

            // Versatile fighter
            this.createUnit({
                name: 'Elena',
                race: Race.HUMAN,
                archetype: Archetype.LIGHT_INFANTRY,
                level: 1
            })
        ];

        return starterUnits;
    }

    /**
     * Get unit creation statistics
     */
    public static getCreationStats(): { totalUnitsCreated: number } {
        return {
            totalUnitsCreated: this.unitIdCounter - 1
        };
    }

    /**
     * Reset unit ID counter (for testing)
     */
    public static resetIdCounter(): void {
        this.unitIdCounter = 1;
    }
}

/**
 * Predefined unit presets for common unit types
 */
export const UNIT_PRESETS: Record<string, UnitPreset> = {
    HUMAN_KNIGHT: {
        name: 'Sir Marcus',
        description: 'A noble human knight with strong leadership',
        race: Race.HUMAN,
        archetype: Archetype.KNIGHT,
        recommendedLevel: 5
    },

    ELF_ARCHER: {
        name: 'Aelindra Swiftarrow',
        description: 'An elven archer with deadly precision',
        race: Race.ELF,
        archetype: Archetype.ARCHER,
        recommendedLevel: 3
    },

    DWARF_ENGINEER: {
        name: 'Thorin Ironforge',
        description: 'A dwarven master of siege warfare',
        race: Race.DWARF,
        archetype: Archetype.DWARVEN_ENGINEER,
        recommendedLevel: 8
    },

    DRAGON_MAGE: {
        name: 'Pyraxis the Ancient',
        description: 'An ancient dragon with devastating magical power',
        race: Race.DRAGON,
        archetype: Archetype.MAGE,
        recommendedLevel: 15
    },

    BEAST_TAMER: {
        name: 'Kael Beastmaster',
        description: 'A human who commands the loyalty of wild beasts',
        race: Race.HUMAN,
        archetype: Archetype.BEAST_TAMER,
        recommendedLevel: 6
    }
};