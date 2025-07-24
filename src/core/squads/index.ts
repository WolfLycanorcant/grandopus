/**
 * Squad system exports
 * Central export point for all squad-related functionality
 */

// Core types
export * from './types';

// Core classes
export { Squad } from './Squad';
export { SquadFactory, SQUAD_PRESETS, COMMON_ARTIFACTS, COMMON_DRILLS } from './SquadFactory';
export type { SquadCreationConfig, SquadPreset } from './SquadFactory';