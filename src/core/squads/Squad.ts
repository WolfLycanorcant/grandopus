import { Unit, FormationPosition } from '../units';
import {
    SquadFormation,
    SquadCapacity,
    SquadStats,
    SquadArtifact,
    SquadDrill,
    SquadCombatState,
    SquadPosition,
    SquadExperience,
    FormationBonuses
} from './types';
import {
    SquadCapacityExceededException,
    InvalidFormationException,
    UnitNotFoundException,
    DuplicateUnitException,
    ValidationUtils
} from '../../exceptions';

/**
 * Squad class representing a group of units with formation and leadership
 */
export class Squad {
    public readonly id: string;
    public name: string;

    // Core squad composition
    private _formation: SquadFormation;
    private _units: Map<string, Unit>;
    private _leader?: Unit;

    // Squad progression and state
    public experience: SquadExperience;
    public position: SquadPosition;
    public combatState: SquadCombatState;

    // Customization
    public artifacts: SquadArtifact[];
    public drills: SquadDrill[];

    // Game progression factors
    public gameProgressLevel: number; // Affects base capacity (1-5)

    // Formation bonuses (from design document)
    private static readonly FORMATION_BONUSES: FormationBonuses = {
        frontRow: {
            armorBonus: 10,           // +10% armor
            physicalDamageBonus: 5    // +5% physical damage
        },
        backRow: {
            rangedDamageBonus: 15,    // +15% ranged/magic damage
            physicalDamageReduction: 10 // -10% physical damage taken
        }
    };

    constructor(id: string, name: string, gameProgressLevel: number = 1) {
        ValidationUtils.validateRequired(id, 'squad id');
        ValidationUtils.validateRequired(name, 'squad name');
        ValidationUtils.validateStringLength(name, 1, 50, 'squad name');
        ValidationUtils.validateRange(gameProgressLevel, 1, 5, 'game progress level');

        this.id = id;
        this.name = name;
        this.gameProgressLevel = gameProgressLevel;

        // Initialize formation
        this._formation = {};
        this._units = new Map();

        // Initialize progression
        this.experience = {
            battlesWon: 0,
            battlesLost: 0,
            totalBattles: 0,
            squadCohesion: 50, // Start at neutral
            veteranBonus: 0
        };

        // Initialize position
        this.position = {
            x: 0,
            y: 0,
            facing: 'north',
            movementPoints: 0,
            maxMovementPoints: 3
        };

        // Initialize combat state
        this.combatState = {
            isInCombat: false,
            currentInitiative: 0,
            hasActed: false,
            combatModifiers: []
        };

        // Initialize customization
        this.artifacts = [];
        this.drills = [];
    }

    /**
     * Calculate squad capacity based on leadership and game progress
     */
    public getCapacity(): SquadCapacity {
        // Base capacity scales with game progress (3-9 units)
        const baseCapacity = Math.min(3 + (this.gameProgressLevel - 1) * 2, 9);

        // Leadership bonus: Max Size = Base + (Leader_LDR // 10)
        const leadershipBonus = this._leader
            ? Math.floor(this._leader.getCurrentStats().ldr / 10)
            : 0;

        // Calculate total capacity (capped at 12)
        const totalCapacity = Math.min(baseCapacity + leadershipBonus, 12);

        // Calculate current used slots
        const currentUsedSlots = Array.from(this._units.values())
            .reduce((total, unit) => total + unit.getSlotCost(), 0);

        return {
            baseCapacity,
            leadershipBonus,
            maxCapacity: 12,
            currentUsedSlots,
            availableSlots: totalCapacity - currentUsedSlots
        };
    }

    /**
     * Add a unit to the squad
     */
    public addUnit(unit: Unit, position?: FormationPosition): boolean {
        // Check if unit already exists
        if (this._units.has(unit.id)) {
            throw new DuplicateUnitException(unit.id, this.id);
        }

        // Calculate potential capacity with this unit as potential leader
        const currentCapacity = this.getCapacity();
        const unitSlotCost = unit.getSlotCost();
        
        // Determine who would be the leader after adding this unit
        const potentialLeader = (!this._leader || 
            (this._leader.getCurrentStats().ldr < unit.getCurrentStats().ldr)) 
            ? unit : this._leader;
        
        // Calculate capacity with potential leader
        const baseCapacity = Math.min(3 + (this.gameProgressLevel - 1) * 2, 9);
        const leadershipBonus = Math.floor(potentialLeader.getCurrentStats().ldr / 10);
        const totalCapacityWithNewLeader = Math.min(baseCapacity + leadershipBonus, 12);
        
        // Check if adding this unit would exceed capacity
        const slotsAfterAdding = currentCapacity.currentUsedSlots + unitSlotCost;

        // Debug logging (remove in production)
        if (process.env.NODE_ENV === 'development') {
            console.log(`Adding unit ${unit.name}:`, {
                currentUsedSlots: currentCapacity.currentUsedSlots,
                currentAvailableSlots: currentCapacity.availableSlots,
                unitSlotCost,
                currentLeader: this._leader?.name || 'none',
                currentLeaderLdr: this._leader?.getCurrentStats().ldr || 0,
                potentialLeader: potentialLeader.name,
                potentialLeaderLdr: potentialLeader.getCurrentStats().ldr,
                baseCapacity,
                leadershipBonus,
                totalCapacityWithNewLeader,
                slotsAfterAdding
            });
        }

        if (slotsAfterAdding > totalCapacityWithNewLeader) {
            throw new SquadCapacityExceededException(
                slotsAfterAdding,
                totalCapacityWithNewLeader,
                unit.name
            );
        }

        // Add unit to collection
        this._units.set(unit.id, unit);

        // Set as leader if first unit or if no leader and unit has high leadership
        if (!this._leader ||
            (this._leader.getCurrentStats().ldr < unit.getCurrentStats().ldr)) {
            this._leader = unit;
        }

        // Place in formation
        if (position) {
            this.setUnitPosition(unit.id, position);
        } else {
            this.autoPositionUnit(unit);
        }

        return true;
    }

    /**
     * Remove a unit from the squad
     */
    public removeUnit(unitId: string): Unit {
        const unit = this._units.get(unitId);
        if (!unit) {
            throw new UnitNotFoundException(unitId, this.id);
        }

        // Remove from units
        this._units.delete(unitId);

        // Remove from formation
        this.removeUnitFromFormation(unitId);

        // Update leader if necessary
        if (this._leader?.id === unitId) {
            this._leader = this.findBestLeader();
        }

        return unit;
    }

    /**
     * Set unit position in formation
     */
    public setUnitPosition(unitId: string, position: FormationPosition): void {
        const unit = this._units.get(unitId);
        if (!unit) {
            throw new UnitNotFoundException(unitId, this.id);
        }

        // Validate position
        this.validateFormationPosition(position);

        // Remove unit from current position
        this.removeUnitFromFormation(unitId);

        // Check if position is occupied
        const currentOccupant = this.getUnitAtPosition(position);
        if (currentOccupant) {
            throw new InvalidFormationException(
                position,
                `Position already occupied by ${currentOccupant.name}`
            );
        }

        // Set new position
        this._formation[position] = unit;
        unit.formationPosition = position;
    }

    /**
     * Get unit at specific formation position
     */
    public getUnitAtPosition(position: FormationPosition): Unit | undefined {
        return this._formation[position];
    }

    /**
     * Auto-position a unit in the best available spot
     */
    private autoPositionUnit(unit: Unit): void {
        // Determine preferred row based on archetype
        const stats = unit.getCurrentStats();
        const preferFrontRow = stats.arm > stats.skl; // Tanky units prefer front

        const positions: FormationPosition[] = preferFrontRow
            ? [FormationPosition.FRONT_CENTER, FormationPosition.FRONT_LEFT, FormationPosition.FRONT_RIGHT, FormationPosition.BACK_CENTER, FormationPosition.BACK_LEFT, FormationPosition.BACK_RIGHT]
            : [FormationPosition.BACK_CENTER, FormationPosition.BACK_LEFT, FormationPosition.BACK_RIGHT, FormationPosition.FRONT_CENTER, FormationPosition.FRONT_LEFT, FormationPosition.FRONT_RIGHT];

        for (const position of positions) {
            if (!this._formation[position]) {
                this._formation[position] = unit;
                unit.formationPosition = position;
                return;
            }
        }

        // If no position available, throw error
        throw new InvalidFormationException('auto', 'No available formation positions');
    }

    /**
     * Remove unit from formation
     */
    private removeUnitFromFormation(unitId: string): void {
        for (const [position, unit] of Object.entries(this._formation)) {
            if (unit?.id === unitId) {
                delete this._formation[position as FormationPosition];
                unit.formationPosition = undefined;
                break;
            }
        }
    }

    /**
     * Validate formation position
     */
    private validateFormationPosition(position: FormationPosition): void {
        const validPositions: FormationPosition[] = [
            FormationPosition.FRONT_LEFT, FormationPosition.FRONT_CENTER, FormationPosition.FRONT_RIGHT,
            FormationPosition.BACK_LEFT, FormationPosition.BACK_CENTER, FormationPosition.BACK_RIGHT
        ];

        if (!validPositions.includes(position)) {
            throw new InvalidFormationException(position, 'Invalid formation position');
        }
    }

    /**
     * Find the best leader based on leadership stat
     */
    private findBestLeader(): Unit | undefined {
        let bestLeader: Unit | undefined;
        let highestLeadership = 0;

        for (const unit of this._units.values()) {
            const leadership = unit.getCurrentStats().ldr;
            if (leadership > highestLeadership) {
                highestLeadership = leadership;
                bestLeader = unit;
            }
        }

        return bestLeader;
    }

    /**
     * Get all units in the squad
     */
    public getUnits(): Unit[] {
        return Array.from(this._units.values());
    }

    /**
     * Get units by formation row
     */
    public getFrontRowUnits(): Unit[] {
        return [
            this._formation[FormationPosition.FRONT_LEFT],
            this._formation[FormationPosition.FRONT_CENTER],
            this._formation[FormationPosition.FRONT_RIGHT]
        ].filter(unit => unit !== undefined) as Unit[];
    }

    public getBackRowUnits(): Unit[] {
        return [
            this._formation[FormationPosition.BACK_LEFT],
            this._formation[FormationPosition.BACK_CENTER],
            this._formation[FormationPosition.BACK_RIGHT]
        ].filter(unit => unit !== undefined) as Unit[];
    }

    /**
     * Get squad leader
     */
    public getLeader(): Unit | undefined {
        return this._leader;
    }

    /**
     * Set squad leader manually
     */
    public setLeader(unitId: string): void {
        const unit = this._units.get(unitId);
        if (!unit) {
            throw new UnitNotFoundException(unitId, this.id);
        }

        this._leader = unit;
    }

    /**
     * Calculate squad statistics
     */
    public getStats(): SquadStats {
        const units = this.getUnits();

        if (units.length === 0) {
            return {
                totalHp: 0,
                averageLevel: 0,
                totalSlots: 0,
                frontRowCount: 0,
                backRowCount: 0,
                leadershipValue: 0,
                combatPower: 0
            };
        }

        const totalHp = units.reduce((sum, unit) => sum + unit.getCurrentStats().hp, 0);
        const averageLevel = units.reduce((sum, unit) => sum + unit.experience.currentLevel, 0) / units.length;
        const totalSlots = units.reduce((sum, unit) => sum + unit.getSlotCost(), 0);
        const frontRowCount = this.getFrontRowUnits().length;
        const backRowCount = this.getBackRowUnits().length;
        const leadershipValue = this._leader?.getCurrentStats().ldr || 0;

        // Calculate combat power (simplified formula)
        const combatPower = units.reduce((power, unit) => {
            const stats = unit.getCurrentStats();
            return power + (stats.hp + stats.str + stats.mag + stats.skl) * unit.experience.currentLevel;
        }, 0);

        return {
            totalHp,
            averageLevel: Math.round(averageLevel * 10) / 10,
            totalSlots,
            frontRowCount,
            backRowCount,
            leadershipValue,
            combatPower
        };
    }

    /**
     * Get formation bonuses for display
     */
    public static getFormationBonuses(): FormationBonuses {
        return Squad.FORMATION_BONUSES;
    }

    /**
     * Check if squad is at capacity
     */
    public isAtCapacity(): boolean {
        const capacity = this.getCapacity();
        return capacity.availableSlots <= 0;
    }

    /**
     * Check if squad is valid for combat
     */
    public isValidForCombat(): boolean {
        return this._units.size > 0 && this.getUnits().some(unit => unit.isAlive());
    }

    /**
     * Get squad summary for display
     */
    public getSummary(): string {
        const stats = this.getStats();
        const capacity = this.getCapacity();

        return `${this.name} (${this._units.size} units, ${capacity.currentUsedSlots}/${capacity.availableSlots + capacity.currentUsedSlots} slots, Lv.${stats.averageLevel})`;
    }

    /**
     * Add artifact to squad
     */
    public addArtifact(artifact: SquadArtifact): boolean {
        if (this.artifacts.length >= 3) {
            return false; // Max 3 artifacts per squad
        }

        // Check leadership requirement
        if (artifact.requiredLeadership &&
            (!this._leader || this._leader.getCurrentStats().ldr < artifact.requiredLeadership)) {
            return false;
        }

        this.artifacts.push(artifact);
        return true;
    }

    /**
     * Remove artifact from squad
     */
    public removeArtifact(artifactId: string): boolean {
        const index = this.artifacts.findIndex(artifact => artifact.id === artifactId);
        if (index === -1) {
            return false;
        }

        this.artifacts.splice(index, 1);
        return true;
    }

    /**
     * Add drill to squad
     */
    public addDrill(drill: SquadDrill): boolean {
        // Check if squad meets requirements
        const stats = this.getStats();
        if (stats.averageLevel < drill.requirements.minLevel) {
            return false;
        }

        this.drills.push(drill);
        return true;
    }

    /**
     * Serialize squad to JSON
     */
    public toJSON(): any {
        return {
            id: this.id,
            name: this.name,
            gameProgressLevel: this.gameProgressLevel,
            units: Array.from(this._units.values()).map(unit => unit.toJSON()),
            leaderId: this._leader?.id,
            formation: this._formation,
            experience: this.experience,
            position: this.position,
            artifacts: this.artifacts,
            drills: this.drills
        };
    }

    /**
     * Create squad from JSON data
     */
    public static fromJSON(data: any): Squad {
        const squad = new Squad(data.id, data.name, data.gameProgressLevel);

        // Restore units
        for (const unitData of data.units) {
            const unit = Unit.fromJSON(unitData);
            squad._units.set(unit.id, unit);
        }

        // Restore leader
        if (data.leaderId) {
            squad._leader = squad._units.get(data.leaderId);
        }

        // Restore formation
        squad._formation = data.formation || {};

        // Restore other properties
        squad.experience = data.experience;
        squad.position = data.position;
        squad.artifacts = data.artifacts || [];
        squad.drills = data.drills || [];

        return squad;
    }
}