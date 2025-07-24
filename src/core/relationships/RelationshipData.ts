import { 
  RelationshipConfig, 
  RelationshipType, 
  PersonalityTrait,
  AffinitySource,
  RelationshipFormationRule
} from './types'

/**
 * Configuration for all relationship types
 */
export const RELATIONSHIP_CONFIGS: Record<RelationshipType, RelationshipConfig> = {
  [RelationshipType.NEUTRAL]: {
    type: RelationshipType.NEUTRAL,
    name: 'Neutral',
    description: 'No particular bond between these units.',
    minAffinity: -10,
    maxAffinity: 10,
    bonuses: {
      name: 'No Bond',
      description: 'No special bonuses or penalties.'
    },
    color: '#64748b', // slate-500
    icon: 'minus'
  },

  [RelationshipType.FRIENDLY]: {
    type: RelationshipType.FRIENDLY,
    name: 'Friendly',
    description: 'These units get along well and work better together.',
    minAffinity: 11,
    maxAffinity: 30,
    bonuses: {
      name: 'Friendly Cooperation',
      description: '+5% accuracy when fighting near each other',
      accuracyBonus: 5,
      maxDistance: 2,
      requiresBothUnits: true
    },
    color: '#22c55e', // green-500
    icon: 'smile'
  },

  [RelationshipType.CLOSE_FRIENDS]: {
    type: RelationshipType.CLOSE_FRIENDS,
    name: 'Close Friends',
    description: 'Strong friendship forged through shared experiences.',
    minAffinity: 31,
    maxAffinity: 50,
    bonuses: {
      name: 'Trusted Ally',
      description: '+10% accuracy, +5% damage when fighting together',
      accuracyBonus: 10,
      damageBonus: 5,
      maxDistance: 3,
      requiresBothUnits: true,
      specialAbilities: [{
        id: 'encourage',
        name: 'Encourage',
        description: 'Boost ally\'s morale, removing debuffs',
        trigger: 'manual',
        effect: {
          type: 'inspire',
          target: 'ally',
          value: 10
        },
        cooldown: 3,
        usesPerBattle: 2
      }]
    },
    color: '#3b82f6', // blue-500
    icon: 'heart'
  },

  [RelationshipType.BROTHERS_IN_ARMS]: {
    type: RelationshipType.BROTHERS_IN_ARMS,
    name: 'Brothers in Arms',
    description: 'Unbreakable bond forged in the heat of battle.',
    minAffinity: 51,
    maxAffinity: 80,
    bonuses: {
      name: 'Unbreakable Bond',
      description: '+15% damage, +10% crit chance, 10% chance to block lethal damage to ally',
      damageBonus: 15,
      criticalBonus: 10,
      maxDistance: 4,
      requiresBothUnits: true,
      specialAbilities: [
        {
          id: 'protective_instinct',
          name: 'Protective Instinct',
          description: '10% chance to block lethal damage to bonded ally',
          trigger: 'on_damage',
          effect: {
            type: 'protect',
            target: 'ally',
            value: 10
          }
        },
        {
          id: 'shared_strength',
          name: 'Shared Strength',
          description: 'When one falls below 25% HP, both gain +25% damage',
          trigger: 'on_low_hp',
          effect: {
            type: 'damage_boost',
            target: 'both',
            value: 25,
            duration: 3
          }
        }
      ]
    },
    color: '#f59e0b', // amber-500
    icon: 'shield'
  },

  [RelationshipType.RIVALS]: {
    type: RelationshipType.RIVALS,
    name: 'Rivals',
    description: 'Competitive rivalry that pushes both units to excel.',
    minAffinity: -30,
    maxAffinity: -11,
    bonuses: {
      name: 'Competitive Spirit',
      description: '+10% damage when fighting near rival (trying to outdo them)',
      damageBonus: 10,
      maxDistance: 3,
      requiresBothUnits: true,
      specialAbilities: [{
        id: 'show_off',
        name: 'Show Off',
        description: 'Gain +20% crit chance for 2 turns when rival is watching',
        trigger: 'manual',
        effect: {
          type: 'damage_boost',
          target: 'self',
          value: 20,
          duration: 2
        },
        cooldown: 4,
        usesPerBattle: 1
      }]
    },
    color: '#f97316', // orange-500
    icon: 'zap'
  },

  [RelationshipType.BITTER_RIVALS]: {
    type: RelationshipType.BITTER_RIVALS,
    name: 'Bitter Rivals',
    description: 'Deep animosity that can be both motivating and destructive.',
    minAffinity: -50,
    maxAffinity: -31,
    bonuses: {
      name: 'Bitter Hatred',
      description: '+20% damage but -10% accuracy when near rival (anger affects precision)',
      damageBonus: 20,
      accuracyBonus: -10,
      maxDistance: 4,
      requiresBothUnits: true,
      specialAbilities: [
        {
          id: 'vendetta',
          name: 'Vendetta',
          description: 'If rival is defeated, gain +50% damage for rest of battle',
          trigger: 'on_ally_death',
          effect: {
            type: 'enrage',
            target: 'self',
            value: 50
          }
        },
        {
          id: 'spite',
          name: 'Spite',
          description: 'Deal +100% damage to rival specifically',
          trigger: 'passive',
          effect: {
            type: 'damage_boost',
            target: 'ally', // Target is the rival in this context
            value: 100
          }
        }
      ]
    },
    color: '#dc2626', // red-600
    icon: 'x'
  },

  [RelationshipType.ROMANTIC]: {
    type: RelationshipType.ROMANTIC,
    name: 'Romantic',
    description: 'Deep romantic love that transcends the battlefield.',
    minAffinity: 81,
    maxAffinity: 100,
    bonuses: {
      name: 'True Love',
      description: '+20% all stats when together, can revive fallen lover once per battle',
      statBonuses: { hp: 10, str: 3, mag: 3, skl: 3, arm: 3, ldr: 2 },
      maxDistance: 5,
      requiresBothUnits: false, // Love transcends death
      specialAbilities: [
        {
          id: 'true_loves_kiss',
          name: 'True Love\'s Kiss',
          description: 'Revive fallen lover with 50% HP once per battle',
          trigger: 'manual',
          effect: {
            type: 'revive',
            target: 'ally',
            value: 50
          },
          usesPerBattle: 1
        },
        {
          id: 'lovers_sacrifice',
          name: 'Lover\'s Sacrifice',
          description: 'Take all damage meant for lover',
          trigger: 'on_damage',
          effect: {
            type: 'protect',
            target: 'ally',
            value: 100
          },
          cooldown: 5
        },
        {
          id: 'heartbreak_rage',
          name: 'Heartbreak Rage',
          description: 'If lover dies, gain +100% damage and immunity to fear',
          trigger: 'on_ally_death',
          effect: {
            type: 'enrage',
            target: 'self',
            value: 100
          }
        }
      ]
    },
    color: '#ec4899', // pink-500
    icon: 'heart',
    isRare: true
  },

  [RelationshipType.MENTOR_STUDENT]: {
    type: RelationshipType.MENTOR_STUDENT,
    name: 'Mentor & Student',
    description: 'A teaching relationship where both learn and grow.',
    minAffinity: 40,
    maxAffinity: 70,
    bonuses: {
      name: 'Teaching Bond',
      description: 'Student gains +50% experience, Mentor gains +10% accuracy',
      maxDistance: 4,
      requiresBothUnits: true,
      specialAbilities: [
        {
          id: 'teach',
          name: 'Teach',
          description: 'Grant student a temporary skill boost',
          trigger: 'manual',
          effect: {
            type: 'inspire',
            target: 'ally',
            value: 15,
            duration: 4
          },
          cooldown: 5,
          usesPerBattle: 2
        },
        {
          id: 'learn',
          name: 'Learn',
          description: 'Student copies mentor\'s last successful action',
          trigger: 'passive',
          effect: {
            type: 'inspire',
            target: 'self',
            value: 10
          }
        }
      ]
    },
    color: '#8b5cf6', // violet-500
    icon: 'book'
  },

  [RelationshipType.FAMILY]: {
    type: RelationshipType.FAMILY,
    name: 'Family',
    description: 'Blood is thicker than water - family bonds run deep.',
    minAffinity: 60,
    maxAffinity: 100,
    bonuses: {
      name: 'Family Bond',
      description: '+15% all stats, +25% healing effectiveness between family members',
      statBonuses: { hp: 8, str: 2, mag: 2, skl: 2, arm: 2, ldr: 3 },
      maxDistance: 6,
      requiresBothUnits: false,
      specialAbilities: [
        {
          id: 'family_protection',
          name: 'Family Protection',
          description: 'Reduce damage to family member by 25%',
          trigger: 'on_damage',
          effect: {
            type: 'protect',
            target: 'ally',
            value: 25
          }
        },
        {
          id: 'family_healing',
          name: 'Family Healing',
          description: 'Healing spells are 50% more effective on family',
          trigger: 'passive',
          effect: {
            type: 'heal',
            target: 'ally',
            value: 50
          }
        },
        {
          id: 'family_vengeance',
          name: 'Family Vengeance',
          description: 'If family member dies, gain +75% damage and cannot be stunned',
          trigger: 'on_ally_death',
          effect: {
            type: 'enrage',
            target: 'self',
            value: 75
          }
        }
      ]
    },
    color: '#10b981', // emerald-500
    icon: 'users',
    isRare: true,
    requiresSpecialCondition: 'Must be set manually or through story events'
  }
}

/**
 * Personality traits that affect relationship formation
 */
export const PERSONALITY_TRAITS: Record<string, PersonalityTrait> = {
  charismatic: {
    id: 'charismatic',
    name: 'Charismatic',
    description: 'Naturally likeable and easy to get along with.',
    affinityModifiers: {
      [AffinitySource.BATTLE_TOGETHER]: 1.5,
      [AffinitySource.SHARED_VICTORY]: 1.3,
      [AffinitySource.TRAINING_TOGETHER]: 1.4
    },
    specialRules: {
      charismatic: true,
      fasterBonding: true
    }
  },

  loyal: {
    id: 'loyal',
    name: 'Loyal',
    description: 'Forms deep, lasting bonds that don\'t easily break.',
    affinityModifiers: {
      [AffinitySource.LIFE_SAVED]: 2.0,
      [AffinitySource.BETRAYAL]: 0.5
    },
    specialRules: {
      loyalFriend: true
    }
  },

  competitive: {
    id: 'competitive',
    name: 'Competitive',
    description: 'Thrives on rivalry and competition with others.',
    affinityModifiers: {
      [AffinitySource.COMPETITION]: 1.5,
      [AffinitySource.SHARED_VICTORY]: 0.8
    },
    specialRules: {}
  },

  loner: {
    id: 'loner',
    name: 'Loner',
    description: 'Prefers solitude and has difficulty forming bonds.',
    affinityModifiers: {
      [AffinitySource.BATTLE_TOGETHER]: 0.5,
      [AffinitySource.TRAINING_TOGETHER]: 0.3,
      [AffinitySource.HEALING_RECEIVED]: 0.7
    },
    specialRules: {
      loner: true,
      slowerBonding: true
    }
  },

  hothead: {
    id: 'hothead',
    name: 'Hothead',
    description: 'Quick to anger and holds grudges for a long time.',
    affinityModifiers: {
      [AffinitySource.PERSONALITY_CLASH]: 2.0,
      [AffinitySource.BETRAYAL]: 1.5,
      [AffinitySource.COMPETITION]: 1.3
    },
    specialRules: {
      holdGrudges: true
    }
  },

  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Natural teacher who enjoys helping others grow.',
    affinityModifiers: {
      [AffinitySource.TRAINING_TOGETHER]: 2.0,
      [AffinitySource.CLASS_SYNERGY]: 1.5
    },
    specialRules: {
      fasterBonding: true
    }
  },

  protective: {
    id: 'protective',
    name: 'Protective',
    description: 'Instinctively protects and cares for allies.',
    affinityModifiers: {
      [AffinitySource.LIFE_SAVED]: 1.8,
      [AffinitySource.HEALING_RECEIVED]: 1.4,
      [AffinitySource.SACRIFICE]: 2.0
    },
    specialRules: {
      loyalFriend: true
    }
  },

  pragmatic: {
    id: 'pragmatic',
    name: 'Pragmatic',
    description: 'Focuses on results over emotions in relationships.',
    affinityModifiers: {
      [AffinitySource.SHARED_VICTORY]: 1.5,
      [AffinitySource.FORMATION_SYNERGY]: 1.3,
      [AffinitySource.PERSONALITY_CLASH]: 0.5
    },
    specialRules: {}
  }
}

/**
 * Rules for relationship formation based on unit characteristics
 */
export const RELATIONSHIP_FORMATION_RULES: RelationshipFormationRule[] = [
  {
    id: 'racial_harmony',
    name: 'Racial Harmony',
    description: 'Some races naturally get along better than others.',
    conditions: {
      raceCompatibility: {
        'human-elf': 10,
        'human-dwarf': 5,
        'elf-dwarf': -5,
        'angel-demon': -20,
        'orc-goblin': 15,
        'beast-dragon': 10,
        'human-angel': 8,
        'dwarf-dragon': -3
      }
    },
    affinityModifier: 1.0
  },

  {
    id: 'class_synergy',
    name: 'Class Synergy',
    description: 'Certain classes work better together.',
    conditions: {
      classCompatibility: {
        'knight-cleric': 15,
        'mage-archer': 10,
        'rogue-light_infantry': 8,
        'heavy_infantry-cleric': 12,
        'mage-mage': -5, // Too much ego
        'knight-knight': -3, // Competition for leadership
        'beast_tamer-beast_tamer': 20 // Shared understanding
      }
    },
    affinityModifier: 1.0
  },

  {
    id: 'level_gap',
    name: 'Experience Gap',
    description: 'Large level differences can create mentor-student or rivalry dynamics.',
    conditions: {
      levelDifference: {
        max: 10,
        penalty: -2 // -2 affinity per level difference over 5
      }
    },
    affinityModifier: 1.0
  },

  {
    id: 'personality_compatibility',
    name: 'Personality Compatibility',
    description: 'Personality traits affect how well units get along.',
    conditions: {
      personalityCompatibility: {
        'charismatic-loner': -5,
        'competitive-competitive': -8,
        'loyal-hothead': 5,
        'mentor-any': 8,
        'protective-any': 5,
        'loner-loner': -10 // Two loners don't connect
      }
    },
    affinityModifier: 1.0
  }
]

/**
 * Get relationship config by type
 */
export function getRelationshipConfig(type: RelationshipType): RelationshipConfig {
  return RELATIONSHIP_CONFIGS[type]
}

/**
 * Get personality trait by ID
 */
export function getPersonalityTrait(traitId: string): PersonalityTrait | null {
  return PERSONALITY_TRAITS[traitId] || null
}

/**
 * Determine relationship type based on affinity points
 */
export function getRelationshipTypeFromAffinity(affinity: number): RelationshipType {
  for (const config of Object.values(RELATIONSHIP_CONFIGS)) {
    if (affinity >= config.minAffinity && affinity <= config.maxAffinity) {
      return config.type
    }
  }
  return RelationshipType.NEUTRAL
}

/**
 * Get all available personality traits
 */
export function getAllPersonalityTraits(): PersonalityTrait[] {
  return Object.values(PERSONALITY_TRAITS)
}

/**
 * Get formation rules
 */
export function getFormationRules(): RelationshipFormationRule[] {
  return RELATIONSHIP_FORMATION_RULES
}