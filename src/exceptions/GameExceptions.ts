/**
 * Base Game Exception Class
 * All game-specific exceptions inherit from this
 */
export abstract class GameException extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    };
  }
}

/**
 * Squad System Exceptions
 */
export class SquadException extends GameException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, `SQUAD_${code}`, context);
  }
}

export class SquadCapacityExceededException extends SquadException {
  constructor(currentSize: number, maxSize: number, unitName?: string) {
    super(
      `Cannot add unit${unitName ? ` "${unitName}"` : ''}: Squad at capacity (${currentSize}/${maxSize})`,
      'CAPACITY_EXCEEDED',
      { currentSize, maxSize, unitName }
    );
  }
}

export class InvalidFormationException extends SquadException {
  constructor(position: string, reason: string) {
    super(
      `Invalid formation position "${position}": ${reason}`,
      'INVALID_FORMATION',
      { position, reason }
    );
  }
}

export class UnitNotFoundException extends SquadException {
  constructor(unitId: string, squadId?: string) {
    super(
      `Unit "${unitId}" not found${squadId ? ` in squad "${squadId}"` : ''}`,
      'UNIT_NOT_FOUND',
      { unitId, squadId }
    );
  }
}

/**
 * Combat System Exceptions
 */
export class CombatException extends GameException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, `COMBAT_${code}`, context);
  }
}

export class InvalidCombatStateException extends CombatException {
  constructor(currentState: string, attemptedAction: string) {
    super(
      `Cannot perform "${attemptedAction}" in combat state "${currentState}"`,
      'INVALID_STATE',
      { currentState, attemptedAction }
    );
  }
}

export class DamageCalculationException extends CombatException {
  constructor(reason: string, attackerId?: string, defenderId?: string) {
    super(
      `Damage calculation failed: ${reason}`,
      'DAMAGE_CALCULATION_FAILED',
      { reason, attackerId, defenderId }
    );
  }
}

export class WeaponProficiencyException extends CombatException {
  constructor(unitId: string, weaponType: string, proficiency: number) {
    super(
      `Invalid weapon proficiency for unit "${unitId}": ${weaponType} = ${proficiency}`,
      'INVALID_PROFICIENCY',
      { unitId, weaponType, proficiency }
    );
  }
}

/**
 * Equipment System Exceptions
 */
export class EquipmentException extends GameException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, `EQUIPMENT_${code}`, context);
  }
}

export class IncompatibleEquipmentException extends EquipmentException {
  constructor(unitRace: string, equipmentType: string, restriction: string) {
    super(
      `${unitRace} cannot equip ${equipmentType}: ${restriction}`,
      'INCOMPATIBLE_EQUIPMENT',
      { unitRace, equipmentType, restriction }
    );
  }
}

export class EmberSlotException extends EquipmentException {
  constructor(weaponId: string, availableSlots: number, requiredSlots: number) {
    super(
      `Cannot embed ember in weapon "${weaponId}": requires ${requiredSlots} slots, only ${availableSlots} available`,
      'INSUFFICIENT_EMBER_SLOTS',
      { weaponId, availableSlots, requiredSlots }
    );
  }
}

export class EquipmentSlotOccupiedException extends EquipmentException {
  constructor(slotType: string, currentItem: string, newItem: string) {
    super(
      `Equipment slot "${slotType}" already occupied by "${currentItem}", cannot equip "${newItem}"`,
      'SLOT_OCCUPIED',
      { slotType, currentItem, newItem }
    );
  }
}

/**
 * Resource & Economy Exceptions
 */
export class ResourceException extends GameException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, `RESOURCE_${code}`, context);
  }
}

export class InsufficientResourcesException extends ResourceException {
  constructor(resourceType: string, required: number, available: number) {
    super(
      `Insufficient ${resourceType}: need ${required}, have ${available}`,
      'INSUFFICIENT_RESOURCES',
      { resourceType, required, available }
    );
  }
}

export class InvalidPromotionException extends ResourceException {
  constructor(unitId: string, fromClass: string, toClass: string, reason: string) {
    super(
      `Cannot promote unit "${unitId}" from ${fromClass} to ${toClass}: ${reason}`,
      'INVALID_PROMOTION',
      { unitId, fromClass, toClass, reason }
    );
  }
}

/**
 * Strategic Layer Exceptions
 */
export class StrategicException extends GameException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, `STRATEGIC_${code}`, context);
  }
}

export class InvalidTerrainMovementException extends StrategicException {
  constructor(terrainType: string, unitType: string, requirement?: string) {
    super(
      `Cannot move ${unitType} through ${terrainType}${requirement ? `: requires ${requirement}` : ''}`,
      'INVALID_TERRAIN_MOVEMENT',
      { terrainType, unitType, requirement }
    );
  }
}

export class BuildingConstructionException extends StrategicException {
  constructor(buildingType: string, location: string, reason: string) {
    super(
      `Cannot construct ${buildingType} at ${location}: ${reason}`,
      'CONSTRUCTION_FAILED',
      { buildingType, location, reason }
    );
  }
}

export class SiegeEquipmentException extends StrategicException {
  constructor(equipmentType: string, reason: string, engineerCount?: number) {
    super(
      `Cannot deploy ${equipmentType}: ${reason}`,
      'SIEGE_DEPLOYMENT_FAILED',
      { equipmentType, reason, engineerCount }
    );
  }
}

/**
 * Data & Persistence Exceptions
 */
export class DataException extends GameException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, `DATA_${code}`, context);
  }
}

export class SaveGameException extends DataException {
  constructor(reason: string, saveSlot?: string) {
    super(
      `Failed to save game${saveSlot ? ` to slot "${saveSlot}"` : ''}: ${reason}`,
      'SAVE_FAILED',
      { reason, saveSlot }
    );
  }
}

export class LoadGameException extends DataException {
  constructor(reason: string, saveSlot?: string) {
    super(
      `Failed to load game${saveSlot ? ` from slot "${saveSlot}"` : ''}: ${reason}`,
      'LOAD_FAILED',
      { reason, saveSlot }
    );
  }
}

export class DataCorruptionException extends DataException {
  constructor(dataType: string, corruptionDetails: string) {
    super(
      `Data corruption detected in ${dataType}: ${corruptionDetails}`,
      'DATA_CORRUPTED',
      { dataType, corruptionDetails }
    );
  }
}

/**
 * Graphics & Rendering Exceptions
 */
export class RenderingException extends GameException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, `RENDER_${code}`, context);
  }
}

export class WebGLException extends RenderingException {
  constructor(reason: string, contextType?: string) {
    super(
      `WebGL error: ${reason}`,
      'WEBGL_ERROR',
      { reason, contextType }
    );
  }
}

export class TextureLoadException extends RenderingException {
  constructor(texturePath: string, reason: string) {
    super(
      `Failed to load texture "${texturePath}": ${reason}`,
      'TEXTURE_LOAD_FAILED',
      { texturePath, reason }
    );
  }
}

export class GPUMemoryException extends RenderingException {
  constructor(operation: string, memoryUsed: number, memoryLimit: number) {
    super(
      `GPU memory exceeded during ${operation}: ${memoryUsed}MB used, ${memoryLimit}MB limit`,
      'GPU_MEMORY_EXCEEDED',
      { operation, memoryUsed, memoryLimit }
    );
  }
}

/**
 * Network & API Exceptions (for multiplayer/backend features)
 */
export class NetworkException extends GameException {
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message, `NETWORK_${code}`, context);
  }
}

export class APIException extends NetworkException {
  constructor(endpoint: string, status: number, response?: string) {
    super(
      `API request failed: ${endpoint} returned ${status}`,
      'API_REQUEST_FAILED',
      { endpoint, status, response }
    );
  }
}

export class ConnectionTimeoutException extends NetworkException {
  constructor(operation: string, timeout: number) {
    super(
      `Connection timeout during ${operation} (${timeout}ms)`,
      'CONNECTION_TIMEOUT',
      { operation, timeout }
    );
  }
}