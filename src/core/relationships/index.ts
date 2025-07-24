// Relationship System Exports
export * from './types'
export * from './RelationshipData'
export * from './RelationshipManager'
export * from './RelationshipIntegration'

// Re-export commonly used types for convenience
export type {
  UnitRelationship,
  UnitRelationships,
  RelationshipBonus,
  RelationshipNotification,
  PersonalityTrait,
  AffinityInteraction,
  SquadRelationships,
  RelationshipEvent
} from './types'

export {
  RelationshipType,
  AffinitySource
} from './types'