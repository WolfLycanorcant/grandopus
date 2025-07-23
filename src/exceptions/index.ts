/**
 * Exception system exports
 * Central export point for all exception-related functionality
 */

// Core exception classes
export * from './GameExceptions';
export * from './ValidationExceptions';

// Error handling system
export { GameErrorHandler, ErrorSeverity, ErrorStrategy } from './ErrorHandler';

import { GameErrorHandler } from './ErrorHandler';
// Import base classes for internal use
import { GameException } from './GameExceptions';
import { ValidationException } from './ValidationExceptions';

// Convenience re-exports for commonly used exceptions
export {
  // Squad exceptions
  SquadCapacityExceededException,
  InvalidFormationException,
  UnitNotFoundException,
  
  // Combat exceptions
  InvalidCombatStateException,
  DamageCalculationException,
  WeaponProficiencyException,
  
  // Equipment exceptions
  IncompatibleEquipmentException,
  EmberSlotException,
  EquipmentSlotOccupiedException,
  
  // Resource exceptions
  InsufficientResourcesException,
  InvalidPromotionException,
  
  // Strategic exceptions
  InvalidTerrainMovementException,
  BuildingConstructionException,
  SiegeEquipmentException,
  
  // Data exceptions
  SaveGameException,
  LoadGameException,
  DataCorruptionException,
  
  // Rendering exceptions
  WebGLException,
  TextureLoadException,
  GPUMemoryException,
  
  // Network exceptions
  APIException,
  ConnectionTimeoutException
} from './GameExceptions';

export {
  // Validation exceptions
  InvalidUnitStatsException,
  InvalidUnitNameException,
  InvalidRaceException,
  InvalidArchetypeException,
  InvalidSquadSizeException,
  InvalidFormationPositionException,
  DuplicateUnitException,
  InvalidEquipmentSlotException,
  InvalidWeaponTypeException,
  InvalidDamageTypeException,
  InvalidProficiencyException,
  InvalidEmberSlotCountException,
  InvalidResourceAmountException,
  InvalidResourceTypeException,
  InvalidTerrainTypeException,
  InvalidBuildingTypeException,
  InvalidCoordinatesException,
  InvalidSkillNodeException,
  SkillPrerequisiteException,
  InsufficientJobPointsException,
  InvalidCombatActionException,
  InvalidTargetException,
  InvalidSaveDataException,
  SaveDataVersionMismatchException,
  InvalidConfigurationException,
  
  // Validation utilities
  ValidationUtils
} from './ValidationExceptions';

/**
 * Global error handler instance
 * Use this for consistent error handling throughout the application
 */
export const errorHandler = GameErrorHandler.getInstance();

/**
 * Utility function to handle errors consistently
 * @param error - The error to handle
 * @param context - Additional context information
 */
export function handleError(error: Error, context?: Record<string, any>): void {
  if (error instanceof GameException) {
    errorHandler.handleError(error);
  } else {
    errorHandler.handleUnexpectedError(error, context);
  }
}

/**
 * Decorator for automatic error handling in class methods
 * @param target - The target class
 * @param propertyKey - The method name
 * @param descriptor - The method descriptor
 */
export function HandleErrors(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    try {
      const result = originalMethod.apply(this, args);
      
      // Handle async methods
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          handleError(error, {
            className: target.constructor.name,
            methodName: propertyKey,
            arguments: args
          });
          throw error; // Re-throw after handling
        });
      }
      
      return result;
    } catch (error) {
      handleError(error as Error, {
        className: target.constructor.name,
        methodName: propertyKey,
        arguments: args
      });
      throw error; // Re-throw after handling
    }
  };

  return descriptor;
}

/**
 * Type guard to check if an error is a GameException
 * @param error - The error to check
 * @returns True if the error is a GameException
 */
export function isGameException(error: any): error is GameException {
  return error instanceof GameException;
}

/**
 * Type guard to check if an error is a ValidationException
 * @param error - The error to check
 * @returns True if the error is a ValidationException
 */
export function isValidationException(error: any): error is ValidationException {
  return error instanceof ValidationException;
}

/**
 * Create a standardized error context object
 * @param additionalContext - Additional context to include
 * @returns Standardized context object
 */
export function createErrorContext(additionalContext?: Record<string, any>): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    ...additionalContext
  };
}