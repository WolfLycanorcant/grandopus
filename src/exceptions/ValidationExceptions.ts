import { GameException } from './GameExceptions';

/**
 * Validation-specific exceptions for input validation and data integrity
 */
export class ValidationException extends GameException {
  public readonly field?: string;
  public readonly value?: any;
  public readonly constraint?: string;

  constructor(
    message: string, 
    code: string, 
    field?: string, 
    value?: any, 
    constraint?: string,
    context?: Record<string, any>
  ) {
    super(message, `VALIDATION_${code}`, { field, value, constraint, ...context });
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
}

/**
 * Unit validation exceptions
 */
export class InvalidUnitStatsException extends ValidationException {
  constructor(field: string, value: number, min?: number, max?: number) {
    const constraint = min !== undefined && max !== undefined 
      ? `must be between ${min} and ${max}`
      : min !== undefined 
        ? `must be at least ${min}`
        : max !== undefined 
          ? `must be at most ${max}`
          : 'invalid value';
    
    super(
      `Invalid unit stat "${field}": ${value} ${constraint}`,
      'INVALID_UNIT_STATS',
      field,
      value,
      constraint
    );
  }
}

export class InvalidUnitNameException extends ValidationException {
  constructor(name: string, reason: string) {
    super(
      `Invalid unit name "${name}": ${reason}`,
      'INVALID_UNIT_NAME',
      'name',
      name,
      reason
    );
  }
}

export class InvalidRaceException extends ValidationException {
  constructor(race: string, validRaces: string[]) {
    super(
      `Invalid race "${race}". Valid races: ${validRaces.join(', ')}`,
      'INVALID_RACE',
      'race',
      race,
      `must be one of: ${validRaces.join(', ')}`
    );
  }
}

export class InvalidArchetypeException extends ValidationException {
  constructor(archetype: string, race: string, validArchetypes: string[]) {
    super(
      `Invalid archetype "${archetype}" for race "${race}". Valid archetypes: ${validArchetypes.join(', ')}`,
      'INVALID_ARCHETYPE',
      'archetype',
      archetype,
      `must be one of: ${validArchetypes.join(', ')} for race ${race}`
    );
  }
}

/**
 * Squad validation exceptions
 */
export class InvalidSquadSizeException extends ValidationException {
  constructor(size: number, minSize: number, maxSize: number) {
    super(
      `Invalid squad size: ${size}. Must be between ${minSize} and ${maxSize}`,
      'INVALID_SQUAD_SIZE',
      'size',
      size,
      `must be between ${minSize} and ${maxSize}`
    );
  }
}

export class InvalidFormationPositionException extends ValidationException {
  constructor(position: string, validPositions: string[]) {
    super(
      `Invalid formation position "${position}". Valid positions: ${validPositions.join(', ')}`,
      'INVALID_FORMATION_POSITION',
      'position',
      position,
      `must be one of: ${validPositions.join(', ')}`
    );
  }
}

export class DuplicateUnitException extends ValidationException {
  constructor(unitId: string, squadId: string) {
    super(
      `Unit "${unitId}" already exists in squad "${squadId}"`,
      'DUPLICATE_UNIT',
      'unitId',
      unitId,
      'must be unique within squad',
      { squadId }
    );
  }
}

/**
 * Equipment validation exceptions
 */
export class InvalidEquipmentSlotException extends ValidationException {
  constructor(slot: string, validSlots: string[]) {
    super(
      `Invalid equipment slot "${slot}". Valid slots: ${validSlots.join(', ')}`,
      'INVALID_EQUIPMENT_SLOT',
      'slot',
      slot,
      `must be one of: ${validSlots.join(', ')}`
    );
  }
}

export class InvalidWeaponTypeException extends ValidationException {
  constructor(weaponType: string, validTypes: string[]) {
    super(
      `Invalid weapon type "${weaponType}". Valid types: ${validTypes.join(', ')}`,
      'INVALID_WEAPON_TYPE',
      'weaponType',
      weaponType,
      `must be one of: ${validTypes.join(', ')}`
    );
  }
}

export class InvalidDamageTypeException extends ValidationException {
  constructor(damageType: string, validTypes: string[]) {
    super(
      `Invalid damage type "${damageType}". Valid types: ${validTypes.join(', ')}`,
      'INVALID_DAMAGE_TYPE',
      'damageType',
      damageType,
      `must be one of: ${validTypes.join(', ')}`
    );
  }
}

export class InvalidProficiencyException extends ValidationException {
  constructor(proficiency: number, weaponType: string) {
    super(
      `Invalid proficiency value ${proficiency} for weapon type "${weaponType}". Must be between 0 and 100`,
      'INVALID_PROFICIENCY',
      'proficiency',
      proficiency,
      'must be between 0 and 100',
      { weaponType }
    );
  }
}

export class InvalidEmberSlotCountException extends ValidationException {
  constructor(slotCount: number, weaponId: string) {
    super(
      `Invalid ember slot count ${slotCount} for weapon "${weaponId}". Must be between 0 and 3`,
      'INVALID_EMBER_SLOT_COUNT',
      'slotCount',
      slotCount,
      'must be between 0 and 3',
      { weaponId }
    );
  }
}

/**
 * Resource validation exceptions
 */
export class InvalidResourceAmountException extends ValidationException {
  constructor(resourceType: string, amount: number) {
    super(
      `Invalid resource amount for "${resourceType}": ${amount}. Must be non-negative`,
      'INVALID_RESOURCE_AMOUNT',
      'amount',
      amount,
      'must be non-negative',
      { resourceType }
    );
  }
}

export class InvalidResourceTypeException extends ValidationException {
  constructor(resourceType: string, validTypes: string[]) {
    super(
      `Invalid resource type "${resourceType}". Valid types: ${validTypes.join(', ')}`,
      'INVALID_RESOURCE_TYPE',
      'resourceType',
      resourceType,
      `must be one of: ${validTypes.join(', ')}`
    );
  }
}

/**
 * Strategic layer validation exceptions
 */
export class InvalidTerrainTypeException extends ValidationException {
  constructor(terrainType: string, validTypes: string[]) {
    super(
      `Invalid terrain type "${terrainType}". Valid types: ${validTypes.join(', ')}`,
      'INVALID_TERRAIN_TYPE',
      'terrainType',
      terrainType,
      `must be one of: ${validTypes.join(', ')}`
    );
  }
}

export class InvalidBuildingTypeException extends ValidationException {
  constructor(buildingType: string, validTypes: string[]) {
    super(
      `Invalid building type "${buildingType}". Valid types: ${validTypes.join(', ')}`,
      'INVALID_BUILDING_TYPE',
      'buildingType',
      buildingType,
      `must be one of: ${validTypes.join(', ')}`
    );
  }
}

export class InvalidCoordinatesException extends ValidationException {
  constructor(x: number, y: number, mapWidth: number, mapHeight: number) {
    super(
      `Invalid coordinates (${x}, ${y}). Must be within map bounds (0-${mapWidth-1}, 0-${mapHeight-1})`,
      'INVALID_COORDINATES',
      'coordinates',
      { x, y },
      `must be within bounds (0-${mapWidth-1}, 0-${mapHeight-1})`,
      { mapWidth, mapHeight }
    );
  }
}

/**
 * Skill tree validation exceptions
 */
export class InvalidSkillNodeException extends ValidationException {
  constructor(nodeId: string, skillTree: string) {
    super(
      `Invalid skill node "${nodeId}" in skill tree "${skillTree}"`,
      'INVALID_SKILL_NODE',
      'nodeId',
      nodeId,
      'node does not exist in skill tree',
      { skillTree }
    );
  }
}

export class SkillPrerequisiteException extends ValidationException {
  constructor(skillId: string, missingPrerequisites: string[]) {
    super(
      `Cannot unlock skill "${skillId}": missing prerequisites ${missingPrerequisites.join(', ')}`,
      'SKILL_PREREQUISITE_NOT_MET',
      'skillId',
      skillId,
      `requires prerequisites: ${missingPrerequisites.join(', ')}`,
      { missingPrerequisites }
    );
  }
}

export class InsufficientJobPointsException extends ValidationException {
  constructor(required: number, available: number, skillId: string) {
    super(
      `Insufficient Job Points to unlock skill "${skillId}": need ${required}, have ${available}`,
      'INSUFFICIENT_JOB_POINTS',
      'jobPoints',
      available,
      `need at least ${required}`,
      { required, skillId }
    );
  }
}

/**
 * Combat validation exceptions
 */
export class InvalidCombatActionException extends ValidationException {
  constructor(action: string, validActions: string[], currentState: string) {
    super(
      `Invalid combat action "${action}" in state "${currentState}". Valid actions: ${validActions.join(', ')}`,
      'INVALID_COMBAT_ACTION',
      'action',
      action,
      `must be one of: ${validActions.join(', ')} in state ${currentState}`,
      { validActions, currentState }
    );
  }
}

export class InvalidTargetException extends ValidationException {
  constructor(targetId: string, reason: string) {
    super(
      `Invalid target "${targetId}": ${reason}`,
      'INVALID_TARGET',
      'targetId',
      targetId,
      reason
    );
  }
}

/**
 * Data format validation exceptions
 */
export class InvalidSaveDataException extends ValidationException {
  constructor(field: string, expectedType: string, actualType: string) {
    super(
      `Invalid save data format: field "${field}" expected ${expectedType}, got ${actualType}`,
      'INVALID_SAVE_DATA',
      field,
      actualType,
      `must be of type ${expectedType}`
    );
  }
}

export class SaveDataVersionMismatchException extends ValidationException {
  constructor(saveVersion: string, gameVersion: string) {
    super(
      `Save data version mismatch: save version ${saveVersion}, game version ${gameVersion}`,
      'SAVE_VERSION_MISMATCH',
      'version',
      saveVersion,
      `must be compatible with game version ${gameVersion}`,
      { gameVersion }
    );
  }
}

/**
 * Configuration validation exceptions
 */
export class InvalidConfigurationException extends ValidationException {
  constructor(configKey: string, value: any, expectedFormat: string) {
    super(
      `Invalid configuration for "${configKey}": ${value}. Expected format: ${expectedFormat}`,
      'INVALID_CONFIGURATION',
      configKey,
      value,
      expectedFormat
    );
  }
}

/**
 * Utility functions for common validations
 */
export class ValidationUtils {
  static validateRange(value: number, min: number, max: number, fieldName: string): void {
    if (value < min || value > max) {
      throw new InvalidUnitStatsException(fieldName, value, min, max);
    }
  }

  static validateNonNegative(value: number, fieldName: string): void {
    if (value < 0) {
      throw new ValidationException(
        `${fieldName} must be non-negative, got ${value}`,
        'NEGATIVE_VALUE',
        fieldName,
        value,
        'must be non-negative'
      );
    }
  }

  static validateStringLength(value: string, minLength: number, maxLength: number, fieldName: string): void {
    if (value.length < minLength || value.length > maxLength) {
      throw new ValidationException(
        `${fieldName} length must be between ${minLength} and ${maxLength}, got ${value.length}`,
        'INVALID_STRING_LENGTH',
        fieldName,
        value,
        `length must be between ${minLength} and ${maxLength}`
      );
    }
  }

  static validateEnum<T>(value: T, validValues: T[], fieldName: string): void {
    if (!validValues.includes(value)) {
      throw new ValidationException(
        `Invalid ${fieldName}: ${value}. Valid values: ${validValues.join(', ')}`,
        'INVALID_ENUM_VALUE',
        fieldName,
        value,
        `must be one of: ${validValues.join(', ')}`
      );
    }
  }

  static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationException(
        `${fieldName} is required`,
        'REQUIRED_FIELD_MISSING',
        fieldName,
        value,
        'is required'
      );
    }
  }

  static validateUniqueArray<T>(array: T[], fieldName: string): void {
    const seen = new Set();
    for (const item of array) {
      if (seen.has(item)) {
        throw new ValidationException(
          `Duplicate value in ${fieldName}: ${item}`,
          'DUPLICATE_VALUE',
          fieldName,
          item,
          'must be unique'
        );
      }
      seen.add(item);
    }
  }
}