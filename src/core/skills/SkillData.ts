import { 
  SkillNode, 
  SkillTree, 
  SkillTreeType, 
  SkillNodeType, 
  SkillTrigger 
} from './types'
import { WeaponType } from '../equipment/types'

/**
 * General skill tree - available to all units
 */
export const GENERAL_SKILLS: SkillNode[] = [
  // Tier 1 - Basic improvements
  {
    id: 'vitality',
    name: 'Vitality',
    description: 'Increases maximum HP by 10.',
    flavorText: 'A healthy body houses a strong spirit.',
    treeType: SkillTreeType.GENERAL,
    nodeType: SkillNodeType.STAT_BOOST,
    tier: 1,
    prerequisites: [],
    jpCost: 20,
    levelRequirement: 1,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'stat_bonus',
      value: 10,
      statType: 'hp'
    }],
    maxRank: 3
  },
  
  {
    id: 'toughness',
    name: 'Toughness',
    description: 'Increases Armor by 2.',
    flavorText: 'Hardened by countless battles.',
    treeType: SkillTreeType.GENERAL,
    nodeType: SkillNodeType.STAT_BOOST,
    tier: 1,
    prerequisites: [],
    jpCost: 25,
    levelRequirement: 2,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'stat_bonus',
      value: 2,
      statType: 'arm'
    }],
    maxRank: 2
  },
  
  {
    id: 'focus',
    name: 'Focus',
    description: 'Increases Skill by 3.',
    flavorText: 'Precision comes from practice.',
    treeType: SkillTreeType.GENERAL,
    nodeType: SkillNodeType.STAT_BOOST,
    tier: 1,
    prerequisites: [],
    jpCost: 30,
    levelRequirement: 3,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'stat_bonus',
      value: 3,
      statType: 'skl'
    }],
    maxRank: 2
  },

  // Tier 2 - Intermediate skills
  {
    id: 'second_wind',
    name: 'Second Wind',
    description: 'Recover 25% HP when below 25% health (once per battle).',
    flavorText: 'When all seems lost, find strength within.',
    treeType: SkillTreeType.GENERAL,
    nodeType: SkillNodeType.PASSIVE,
    tier: 2,
    prerequisites: ['vitality'],
    jpCost: 50,
    levelRequirement: 5,
    trigger: SkillTrigger.ON_LOW_HP,
    effects: [{
      type: 'heal',
      percentage: 25,
      target: 'self',
      condition: 'once_per_battle'
    }],
    maxRank: 1
  },
  
  {
    id: 'battle_hardened',
    name: 'Battle Hardened',
    description: 'Reduce all damage taken by 2 (minimum 1).',
    flavorText: 'Scars tell the story of survival.',
    treeType: SkillTreeType.GENERAL,
    nodeType: SkillNodeType.PASSIVE,
    tier: 2,
    prerequisites: ['toughness'],
    jpCost: 60,
    levelRequirement: 6,
    trigger: SkillTrigger.ON_DAMAGE_TAKEN,
    effects: [{
      type: 'damage_bonus',
      value: -2,
      target: 'self'
    }],
    maxRank: 1
  },

  // Tier 3 - Advanced skills
  {
    id: 'veteran_instincts',
    name: 'Veteran Instincts',
    description: '15% chance to dodge any attack.',
    flavorText: 'Experience teaches when to duck.',
    treeType: SkillTreeType.GENERAL,
    nodeType: SkillNodeType.PASSIVE,
    tier: 3,
    prerequisites: ['focus', 'battle_hardened'],
    jpCost: 100,
    levelRequirement: 10,
    trigger: SkillTrigger.ON_DAMAGE_TAKEN,
    effects: [{
      type: 'special',
      percentage: 15,
      target: 'self',
      condition: 'dodge_chance'
    }],
    maxRank: 1
  }
]

/**
 * Combat skill tree - focused on physical combat
 */
export const COMBAT_SKILLS: SkillNode[] = [
  // Tier 1
  {
    id: 'power_attack',
    name: 'Power Attack',
    description: 'Increases physical damage by 15%.',
    flavorText: 'Put your whole body behind the blow.',
    treeType: SkillTreeType.COMBAT,
    nodeType: SkillNodeType.PASSIVE,
    tier: 1,
    prerequisites: [],
    jpCost: 35,
    levelRequirement: 2,
    trigger: SkillTrigger.ON_ATTACK,
    effects: [{
      type: 'damage_bonus',
      percentage: 15,
      condition: 'physical_damage'
    }],
    maxRank: 2
  },
  
  {
    id: 'critical_strike',
    name: 'Critical Strike',
    description: 'Increases critical hit chance by 10%.',
    flavorText: 'Find the weak spots in their defense.',
    treeType: SkillTreeType.COMBAT,
    nodeType: SkillNodeType.PASSIVE,
    tier: 1,
    prerequisites: [],
    jpCost: 40,
    levelRequirement: 3,
    trigger: SkillTrigger.ON_ATTACK,
    effects: [{
      type: 'special',
      percentage: 10,
      condition: 'crit_chance'
    }],
    maxRank: 2
  },

  // Tier 2
  {
    id: 'berserker_rage',
    name: 'Berserker Rage',
    description: 'When below 50% HP, gain +25% damage and +10% crit chance.',
    flavorText: 'Pain fuels the fury within.',
    treeType: SkillTreeType.COMBAT,
    nodeType: SkillNodeType.PASSIVE,
    tier: 2,
    prerequisites: ['power_attack'],
    jpCost: 75,
    levelRequirement: 7,
    trigger: SkillTrigger.ON_LOW_HP,
    effects: [
      {
        type: 'damage_bonus',
        percentage: 25,
        condition: 'low_hp'
      },
      {
        type: 'special',
        percentage: 10,
        condition: 'crit_chance_low_hp'
      }
    ],
    maxRank: 1
  },
  
  {
    id: 'deadly_precision',
    name: 'Deadly Precision',
    description: 'Critical hits deal 50% more damage.',
    flavorText: 'Strike true, strike hard.',
    treeType: SkillTreeType.COMBAT,
    nodeType: SkillNodeType.PASSIVE,
    tier: 2,
    prerequisites: ['critical_strike'],
    jpCost: 80,
    levelRequirement: 8,
    trigger: SkillTrigger.ON_CRIT,
    effects: [{
      type: 'damage_bonus',
      percentage: 50,
      condition: 'critical_damage'
    }],
    maxRank: 1
  },

  // Tier 3 - Capstone
  {
    id: 'weapon_master',
    name: 'Weapon Master',
    description: 'All weapon proficiencies gain experience 50% faster.',
    flavorText: 'Master of all weapons, slave to none.',
    treeType: SkillTreeType.COMBAT,
    nodeType: SkillNodeType.PASSIVE,
    tier: 3,
    prerequisites: ['berserker_rage', 'deadly_precision'],
    jpCost: 150,
    levelRequirement: 12,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'special',
      percentage: 50,
      condition: 'proficiency_gain'
    }],
    maxRank: 1,
    isCapstone: true
  }
]

/**
 * Magic skill tree - for spellcasters
 */
export const MAGIC_SKILLS: SkillNode[] = [
  // Tier 1
  {
    id: 'mana_pool',
    name: 'Expanded Mana Pool',
    description: 'Increases Magic by 4.',
    flavorText: 'The mind expands to hold more power.',
    treeType: SkillTreeType.MAGIC,
    nodeType: SkillNodeType.STAT_BOOST,
    tier: 1,
    prerequisites: [],
    jpCost: 30,
    levelRequirement: 2,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'stat_bonus',
      value: 4,
      statType: 'mag'
    }],
    maxRank: 3
  },
  
  {
    id: 'spell_power',
    name: 'Spell Power',
    description: 'Increases magic damage by 20%.',
    flavorText: 'Channel the raw forces of creation.',
    treeType: SkillTreeType.MAGIC,
    nodeType: SkillNodeType.PASSIVE,
    tier: 1,
    prerequisites: [],
    jpCost: 40,
    levelRequirement: 3,
    trigger: SkillTrigger.ON_ATTACK,
    effects: [{
      type: 'damage_bonus',
      percentage: 20,
      condition: 'magic_damage'
    }],
    maxRank: 2
  },

  // Tier 2
  {
    id: 'elemental_mastery',
    name: 'Elemental Mastery',
    description: 'Fire, Ice, and Lightning spells deal 25% more damage.',
    flavorText: 'Command the primal elements.',
    treeType: SkillTreeType.MAGIC,
    nodeType: SkillNodeType.PASSIVE,
    tier: 2,
    prerequisites: ['spell_power'],
    jpCost: 70,
    levelRequirement: 6,
    trigger: SkillTrigger.ON_ATTACK,
    effects: [{
      type: 'damage_bonus',
      percentage: 25,
      condition: 'elemental_damage'
    }],
    maxRank: 1
  },
  
  {
    id: 'mage_armor',
    name: 'Mage Armor',
    description: 'Gain magic resistance equal to 50% of Magic stat.',
    flavorText: 'Magic protects those who wield it.',
    treeType: SkillTreeType.MAGIC,
    nodeType: SkillNodeType.PASSIVE,
    tier: 2,
    prerequisites: ['mana_pool'],
    jpCost: 65,
    levelRequirement: 5,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'special',
      percentage: 50,
      condition: 'magic_resistance_from_mag'
    }],
    maxRank: 1
  },

  // Tier 3 - Capstone
  {
    id: 'archmage',
    name: 'Archmage',
    description: 'All spells have 20% chance to not consume a turn.',
    flavorText: 'Magic flows through you like a river.',
    treeType: SkillTreeType.MAGIC,
    nodeType: SkillNodeType.PASSIVE,
    tier: 3,
    prerequisites: ['elemental_mastery', 'mage_armor'],
    jpCost: 200,
    levelRequirement: 15,
    trigger: SkillTrigger.ON_ATTACK,
    effects: [{
      type: 'special',
      percentage: 20,
      condition: 'free_action'
    }],
    maxRank: 1,
    isCapstone: true
  }
]

/**
 * Tactics skill tree - for leaders and formation specialists
 */
export const TACTICS_SKILLS: SkillNode[] = [
  // Tier 1
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'Increases Leadership by 3.',
    flavorText: 'Others look to you for guidance.',
    treeType: SkillTreeType.TACTICS,
    nodeType: SkillNodeType.STAT_BOOST,
    tier: 1,
    prerequisites: [],
    jpCost: 35,
    levelRequirement: 3,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'stat_bonus',
      value: 3,
      statType: 'ldr'
    }],
    maxRank: 3
  },
  
  {
    id: 'formation_fighter',
    name: 'Formation Fighter',
    description: 'Adjacent allies gain +5% damage.',
    flavorText: 'Strength in unity, power in formation.',
    treeType: SkillTreeType.TACTICS,
    nodeType: SkillNodeType.FORMATION,
    tier: 1,
    prerequisites: [],
    jpCost: 45,
    levelRequirement: 4,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'damage_bonus',
      percentage: 5,
      target: 'allies',
      condition: 'adjacent'
    }],
    maxRank: 1
  },

  // Tier 2
  {
    id: 'rally',
    name: 'Rally',
    description: 'At battle start, all allies gain +10% damage for 3 turns.',
    flavorText: 'Your words inspire courage in others.',
    treeType: SkillTreeType.TACTICS,
    nodeType: SkillNodeType.ACTIVE,
    tier: 2,
    prerequisites: ['leadership'],
    jpCost: 80,
    levelRequirement: 7,
    trigger: SkillTrigger.BATTLE_START,
    effects: [{
      type: 'damage_bonus',
      percentage: 10,
      target: 'allies',
      duration: 3
    }],
    maxRank: 1
  },
  
  {
    id: 'phalanx_formation',
    name: 'Phalanx Formation',
    description: 'Front row units gain +15% armor when adjacent to each other.',
    flavorText: 'Shields locked, spears ready.',
    treeType: SkillTreeType.TACTICS,
    nodeType: SkillNodeType.FORMATION,
    tier: 2,
    prerequisites: ['formation_fighter'],
    jpCost: 90,
    levelRequirement: 8,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'stat_bonus',
      percentage: 15,
      statType: 'arm',
      condition: 'front_row_adjacent'
    }],
    maxRank: 1
  },

  // Tier 3 - Capstone
  {
    id: 'grand_strategist',
    name: 'Grand Strategist',
    description: 'Squad gains +1 action per turn (can act twice).',
    flavorText: 'See the battlefield as a chess board.',
    treeType: SkillTreeType.TACTICS,
    nodeType: SkillNodeType.PASSIVE,
    tier: 3,
    prerequisites: ['rally', 'phalanx_formation'],
    jpCost: 250,
    levelRequirement: 18,
    trigger: SkillTrigger.PASSIVE,
    effects: [{
      type: 'special',
      value: 1,
      condition: 'extra_action'
    }],
    maxRank: 1,
    isCapstone: true
  }
]

/**
 * All skill trees
 */
export const SKILL_TREES: SkillTree[] = [
  {
    type: SkillTreeType.GENERAL,
    name: 'General Skills',
    description: 'Universal skills available to all units',
    nodes: GENERAL_SKILLS,
    maxTier: 3
  },
  {
    type: SkillTreeType.COMBAT,
    name: 'Combat Mastery',
    description: 'Physical combat and weapon skills',
    nodes: COMBAT_SKILLS,
    maxTier: 3
  },
  {
    type: SkillTreeType.MAGIC,
    name: 'Arcane Arts',
    description: 'Magic and spellcasting abilities',
    nodes: MAGIC_SKILLS,
    maxTier: 3
  },
  {
    type: SkillTreeType.TACTICS,
    name: 'Tactical Command',
    description: 'Leadership and formation abilities',
    nodes: TACTICS_SKILLS,
    maxTier: 3
  }
]

/**
 * Get skill by ID
 */
export function getSkill(skillId: string): SkillNode | null {
  for (const tree of SKILL_TREES) {
    const skill = tree.nodes.find(node => node.id === skillId)
    if (skill) return skill
  }
  return null
}

/**
 * Get skills by tree type
 */
export function getSkillsByTree(treeType: SkillTreeType): SkillNode[] {
  const tree = SKILL_TREES.find(t => t.type === treeType)
  return tree ? tree.nodes : []
}

/**
 * Get skills by tier
 */
export function getSkillsByTier(treeType: SkillTreeType, tier: number): SkillNode[] {
  return getSkillsByTree(treeType).filter(skill => skill.tier === tier)
}

/**
 * Get prerequisite skills for a skill
 */
export function getPrerequisites(skillId: string): SkillNode[] {
  const skill = getSkill(skillId)
  if (!skill) return []
  
  return skill.prerequisites.map(prereqId => getSkill(prereqId)).filter(Boolean) as SkillNode[]
}

/**
 * Get skills that require this skill as prerequisite
 */
export function getDependentSkills(skillId: string): SkillNode[] {
  const dependents: SkillNode[] = []
  
  for (const tree of SKILL_TREES) {
    for (const skill of tree.nodes) {
      if (skill.prerequisites.includes(skillId)) {
        dependents.push(skill)
      }
    }
  }
  
  return dependents
}