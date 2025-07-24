import { 
  Achievement, 
  AchievementCategory, 
  StatisticType 
} from './types'

/**
 * Complete achievement database
 */
export const ACHIEVEMENT_DATA: Record<string, Achievement> = {
  // COMBAT ACHIEVEMENTS
  'battle_scarred': {
    id: 'battle_scarred',
    name: 'Battle-Scarred',
    description: 'A warrior marked by countless battles, hardened by pain.',
    category: AchievementCategory.COMBAT,
    requirement: {
      type: StatisticType.DAMAGE_TAKEN,
      target: 1000
    },
    reward: {
      statBonuses: { arm: 3 },
      description: '+3 ARM - Damage resistance from battle experience',
      specialAbility: 'damage_resistance_5'
    },
    rarity: 'uncommon'
  },

  'berserker': {
    id: 'berserker',
    name: 'Berserker',
    description: 'Fury incarnate, striking with devastating precision.',
    category: AchievementCategory.COMBAT,
    requirement: {
      type: StatisticType.CRITICAL_HITS,
      target: 100
    },
    reward: {
      statBonuses: { str: 2, skl: 2 },
      description: '+2 STR, +2 SKL - Critical hit mastery',
      specialAbility: 'critical_boost_10'
    },
    rarity: 'rare'
  },

  'executioner': {
    id: 'executioner',
    name: 'Executioner',
    description: 'Death follows in their wake, swift and merciless.',
    category: AchievementCategory.COMBAT,
    requirement: {
      type: StatisticType.KILLS,
      target: 50
    },
    reward: {
      statBonuses: { str: 3 },
      description: '+3 STR - Bonus damage to weakened enemies',
      specialAbility: 'execute_low_hp'
    },
    rarity: 'rare'
  },

  'guardian': {
    id: 'guardian',
    name: 'Guardian',
    description: 'An unbreakable shield protecting allies from harm.',
    category: AchievementCategory.COMBAT,
    requirement: {
      type: StatisticType.DAMAGE_BLOCKED,
      target: 500
    },
    reward: {
      statBonuses: { arm: 5 },
      description: '+5 ARM - Enhanced armor effectiveness',
      specialAbility: 'armor_boost_10'
    },
    rarity: 'uncommon'
  },

  'untouchable': {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Like smoke in the wind, attacks pass harmlessly by.',
    category: AchievementCategory.COMBAT,
    requirement: {
      type: StatisticType.ATTACKS_DODGED,
      target: 200
    },
    reward: {
      statBonuses: { skl: 4 },
      description: '+4 SKL - Enhanced evasion abilities',
      specialAbility: 'evasion_boost_15'
    },
    rarity: 'rare'
  },

  'relentless': {
    id: 'relentless',
    name: 'Relentless',
    description: 'Never stopping, never slowing, always attacking.',
    category: AchievementCategory.COMBAT,
    requirement: {
      type: StatisticType.ATTACKS_MADE,
      target: 500
    },
    reward: {
      statBonuses: { str: 2, skl: 1 },
      description: '+2 STR, +1 SKL - Attack speed bonus',
      specialAbility: 'attack_speed_5'
    },
    rarity: 'common'
  },

  // SUPPORT ACHIEVEMENTS
  'field_medic': {
    id: 'field_medic',
    name: 'Field Medic',
    description: 'A healer whose touch brings hope to the wounded.',
    category: AchievementCategory.SUPPORT,
    requirement: {
      type: StatisticType.UNITS_HEALED,
      target: 30
    },
    reward: {
      statBonuses: { mag: 3 },
      description: '+3 MAG - Healing abilities restore +25% more HP',
      specialAbility: 'healing_boost_25'
    },
    rarity: 'uncommon'
  },

  'inspiring_leader': {
    id: 'inspiring_leader',
    name: 'Inspiring Leader',
    description: 'A commander who leads by example, inspiring greatness.',
    category: AchievementCategory.SUPPORT,
    requirement: {
      type: StatisticType.BATTLES_LED,
      target: 100
    },
    reward: {
      statBonuses: { ldr: 2 },
      description: '+2 LDR - Natural leadership abilities',
      specialAbility: 'leadership_aura'
    },
    rarity: 'rare'
  },

  'mentor': {
    id: 'mentor',
    name: 'Mentor',
    description: 'A teacher who shapes the next generation of warriors.',
    category: AchievementCategory.SUPPORT,
    requirement: {
      type: StatisticType.UNITS_TRAINED,
      target: 10
    },
    reward: {
      statBonuses: { ldr: 1 },
      description: '+1 LDR - Nearby allies gain +50% experience',
      specialAbility: 'experience_aura_50'
    },
    rarity: 'rare'
  },

  'protector': {
    id: 'protector',
    name: 'Protector',
    description: 'Guardian angel who snatches allies from death\'s grasp.',
    category: AchievementCategory.SUPPORT,
    requirement: {
      type: StatisticType.ALLIES_SAVED,
      target: 25
    },
    reward: {
      statBonuses: { ldr: 2, hp: 10 },
      description: '+2 LDR, +10 HP - Can revive fallen ally once per battle',
      specialAbility: 'revive_ally'
    },
    rarity: 'epic'
  },

  'tactician': {
    id: 'tactician',
    name: 'Tactician',
    description: 'A master strategist who wins without losses.',
    category: AchievementCategory.SUPPORT,
    requirement: {
      type: StatisticType.BATTLES_WON,
      target: 50,
      condition: 'no_casualties'
    },
    reward: {
      statBonuses: { ldr: 3, skl: 2 },
      description: '+3 LDR, +2 SKL - Squad formations grant +10% bonus effects',
      specialAbility: 'formation_mastery'
    },
    rarity: 'epic'
  },

  // MASTERY ACHIEVEMENTS
  'weapon_master': {
    id: 'weapon_master',
    name: 'Weapon Master',
    description: 'Master of all weapons, deadly with any blade.',
    category: AchievementCategory.MASTERY,
    requirement: {
      type: StatisticType.WEAPONS_MASTERED,
      target: 5
    },
    reward: {
      statBonuses: { str: 3, skl: 3 },
      description: '+3 STR, +3 SKL - +20% weapon damage with all weapons',
      specialAbility: 'weapon_mastery_20'
    },
    rarity: 'epic'
  },

  'arcane_scholar': {
    id: 'arcane_scholar',
    name: 'Arcane Scholar',
    description: 'Student of the mystical arts, wielder of ancient knowledge.',
    category: AchievementCategory.MASTERY,
    requirement: {
      type: StatisticType.SPELLS_LEARNED,
      target: 25
    },
    reward: {
      statBonuses: { mag: 5, skl: 2 },
      description: '+5 MAG, +2 SKL - Magic costs reduced by 20%',
      specialAbility: 'magic_efficiency_20'
    },
    rarity: 'epic'
  },

  'survivor': {
    id: 'survivor',
    name: 'Survivor',
    description: 'Death has claimed them many times, yet they endure.',
    category: AchievementCategory.MASTERY,
    requirement: {
      type: StatisticType.LOW_HP_SURVIVALS,
      target: 50
    },
    reward: {
      statBonuses: { hp: 15, str: 1, mag: 1, skl: 1, arm: 1, ldr: 1 },
      description: '+15 HP, +1 to all other stats - Hardened by adversity',
      specialAbility: 'last_stand'
    },
    rarity: 'legendary'
  },

  'veteran': {
    id: 'veteran',
    name: 'Veteran',
    description: 'A seasoned warrior who has seen countless battles.',
    category: AchievementCategory.MASTERY,
    requirement: {
      type: StatisticType.BATTLES_SURVIVED,
      target: 200
    },
    reward: {
      statBonuses: { hp: 10, str: 2, skl: 2 },
      description: '+10 HP, +2 STR, +2 SKL - Experience bonus',
      specialAbility: 'experience_boost_25'
    },
    rarity: 'rare'
  },

  'perfectionist': {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Precision incarnate, every strike finds its mark.',
    category: AchievementCategory.MASTERY,
    requirement: {
      type: StatisticType.HIGH_ACCURACY_ATTACKS,
      target: 100
    },
    reward: {
      statBonuses: { skl: 5 },
      description: '+5 SKL - +20% accuracy with all attacks',
      specialAbility: 'accuracy_boost_20'
    },
    rarity: 'rare'
  },

  // LEGENDARY ACHIEVEMENTS
  'dragon_slayer': {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    description: 'Bane of dragons, immune to their fiery wrath.',
    category: AchievementCategory.LEGENDARY,
    requirement: {
      type: StatisticType.DRAGONS_KILLED,
      target: 5
    },
    reward: {
      statBonuses: { str: 5, mag: 3, hp: 20 },
      description: '+5 STR, +3 MAG, +20 HP - Immunity to fire damage',
      specialAbility: 'fire_immunity',
      title: 'Dragonbane'
    },
    rarity: 'legendary'
  },

  'immortal': {
    id: 'immortal',
    name: 'Immortal',
    description: 'Death itself cannot claim this eternal warrior.',
    category: AchievementCategory.LEGENDARY,
    requirement: {
      type: StatisticType.BATTLES_SURVIVED,
      target: 1000
    },
    reward: {
      statBonuses: { hp: 50, str: 5, mag: 5, skl: 5, arm: 5, ldr: 5 },
      description: '+50 HP, +5 to all stats - Cannot be reduced below 1 HP once per battle',
      specialAbility: 'death_protection',
      title: 'The Immortal'
    },
    rarity: 'legendary'
  },

  'champion': {
    id: 'champion',
    name: 'Champion',
    description: 'Undefeated legend, victor of countless battles.',
    category: AchievementCategory.LEGENDARY,
    requirement: {
      type: StatisticType.BATTLES_WON,
      target: 500
    },
    reward: {
      statBonuses: { hp: 25, str: 6, mag: 6, skl: 6, arm: 6, ldr: 6 },
      description: '+25 HP, +6 to all stats - Champion\'s might',
      specialAbility: 'champion_aura',
      title: 'Champion',
      visualEffect: 'golden_aura'
    },
    rarity: 'legendary'
  },

  'legend': {
    id: 'legend',
    name: 'Legend',
    description: 'A living legend whose deeds echo through eternity.',
    category: AchievementCategory.LEGENDARY,
    requirement: {
      type: StatisticType.KILLS, // Special: requires 10 other achievements
      target: 1000
    },
    reward: {
      statBonuses: { hp: 100, str: 10, mag: 10, skl: 10, arm: 10, ldr: 10 },
      description: '+100 HP, +10 to all stats - Legendary presence affects entire squad',
      specialAbility: 'legendary_aura',
      title: 'Living Legend',
      visualEffect: 'legendary_aura'
    },
    rarity: 'legendary',
    isHidden: true
  },

  // SPECIALIZED ACHIEVEMENTS
  'beast_whisperer': {
    id: 'beast_whisperer',
    name: 'Beast Whisperer',
    description: 'Friend to all creatures, bonded with the wild.',
    category: AchievementCategory.SPECIALIZED,
    requirement: {
      type: StatisticType.BEASTS_FOUGHT_WITH,
      target: 20
    },
    reward: {
      statBonuses: { ldr: 2 },
      description: '+2 LDR - Can field +2 additional beast units in squad',
      specialAbility: 'beast_slots_2'
    },
    rarity: 'rare'
  },

  'ember_forger': {
    id: 'ember_forger',
    name: 'Ember Forger',
    description: 'Master of ember magic, enhancer of weapons.',
    category: AchievementCategory.SPECIALIZED,
    requirement: {
      type: StatisticType.EMBERS_EMBEDDED,
      target: 100
    },
    reward: {
      statBonuses: { mag: 3, skl: 2 },
      description: '+3 MAG, +2 SKL - Can embed +1 extra ember in any weapon',
      specialAbility: 'extra_ember_slot'
    },
    rarity: 'epic'
  },

  'formation_expert': {
    id: 'formation_expert',
    name: 'Formation Expert',
    description: 'Tactical genius who has mastered every formation.',
    category: AchievementCategory.SPECIALIZED,
    requirement: {
      type: StatisticType.FORMATIONS_USED,
      target: 50 // 50 times across all formation types
    },
    reward: {
      statBonuses: { ldr: 3, skl: 2 },
      description: '+3 LDR, +2 SKL - Formations cost -1 LDR to maintain',
      specialAbility: 'formation_efficiency'
    },
    rarity: 'rare'
  },

  'treasure_hunter': {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    description: 'Fortune favors the bold seeker of rare treasures.',
    category: AchievementCategory.SPECIALIZED,
    requirement: {
      type: StatisticType.RARE_ITEMS_FOUND,
      target: 50
    },
    reward: {
      statBonuses: { skl: 3 },
      description: '+3 SKL - +20% chance to find rare loot after battles',
      specialAbility: 'treasure_finder_20'
    },
    rarity: 'uncommon'
  }
}

/**
 * Get achievement by ID
 */
export function getAchievement(achievementId: string): Achievement | null {
  return ACHIEVEMENT_DATA[achievementId] || null
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return Object.values(ACHIEVEMENT_DATA).filter(achievement => achievement.category === category)
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(rarity: string): Achievement[] {
  return Object.values(ACHIEVEMENT_DATA).filter(achievement => achievement.rarity === rarity)
}

/**
 * Get all visible achievements (non-hidden)
 */
export function getVisibleAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENT_DATA).filter(achievement => !achievement.isHidden)
}

/**
 * Get all achievements
 */
export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENT_DATA)
}

/**
 * Get prerequisite chain for an achievement
 */
export function getPrerequisiteChain(achievementId: string): Achievement[] {
  const chain: Achievement[] = []
  let current = getAchievement(achievementId)
  
  while (current && current.prerequisite) {
    const prerequisite = getAchievement(current.prerequisite)
    if (prerequisite) {
      chain.unshift(prerequisite)
      current = prerequisite
    } else {
      break
    }
  }
  
  return chain
}