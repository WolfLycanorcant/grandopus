import { Unit } from './Unit'
import { Archetype, UnitStats } from './types'
import { ResourceType } from '../overworld/types'

/**
 * Advanced classes that units can promote to
 */
export enum AdvancedArchetype {
  // Heavy Infantry promotions
  PALADIN = 'paladin',
  BERSERKER = 'berserker',
  GUARDIAN = 'guardian',
  
  // Light Infantry promotions
  RANGER = 'ranger',
  DUELIST = 'duelist',
  SCOUT = 'scout',
  
  // Archer promotions
  SNIPER = 'sniper',
  HUNTER = 'hunter',
  MARKSMAN = 'marksman',
  
  // Mage promotions
  ARCHMAGE = 'archmage',
  BATTLE_MAGE = 'battle_mage',
  ELEMENTALIST = 'elementalist',
  
  // Cleric promotions
  HIGH_PRIEST = 'high_priest',
  TEMPLAR = 'templar',
  ORACLE = 'oracle',
  
  // Knight promotions
  CHAMPION = 'champion',
  CRUSADER = 'crusader',
  WARLORD = 'warlord',
  
  // Rogue promotions
  ASSASSIN = 'assassin',
  SHADOW_DANCER = 'shadow_dancer',
  TRICKSTER = 'trickster',
  
  // Beast Tamer promotions
  BEAST_MASTER = 'beast_master',
  DRUID = 'druid',
  PACK_LEADER = 'pack_leader',
  
  // Dwarven Engineer promotions
  MASTER_ENGINEER = 'master_engineer',
  SIEGE_MASTER = 'siege_master',
  ARTIFICER = 'artificer'
}

/**
 * Promotion requirements
 */
export interface PromotionRequirement {
  level: number
  resources: Partial<Record<ResourceType, number>>
  equipment?: string[]
  achievements?: string[]
  skills?: string[]
  battles?: number
  specialConditions?: string[]
}

/**
 * Promotion path definition
 */
export interface PromotionPath {
  fromArchetype: Archetype
  toArchetype: AdvancedArchetype
  name: string
  description: string
  requirements: PromotionRequirement
  statBonuses: Partial<UnitStats>
  newAbilities: string[]
  levelCapIncrease: number
  specialEffects?: string[]
}

/**
 * All available promotion paths
 */
export const PROMOTION_PATHS: PromotionPath[] = [
  // Heavy Infantry Promotions
  {
    fromArchetype: Archetype.HEAVY_INFANTRY,
    toArchetype: AdvancedArchetype.PALADIN,
    name: 'Paladin',
    description: 'Holy warrior combining martial prowess with divine magic',
    requirements: {
      level: 15,
      resources: {
        [ResourceType.STEEL]: 100,
        [ResourceType.MANA_CRYSTALS]: 50,
        [ResourceType.GOLD]: 500
      },
      equipment: ['Blessed Armor', 'Holy Symbol'],
      achievements: ['Guardian', 'Protector'],
      battles: 25
    },
    statBonuses: {
      hp: 20,
      str: 8,
      mag: 12,
      arm: 10,
      ldr: 15
    },
    newAbilities: ['Divine Strike', 'Healing Light', 'Aura of Protection'],
    levelCapIncrease: 20,
    specialEffects: ['Immunity to fear', 'Heals nearby allies each turn']
  },

  {
    fromArchetype: Archetype.HEAVY_INFANTRY,
    toArchetype: AdvancedArchetype.BERSERKER,
    name: 'Berserker',
    description: 'Fierce warrior who channels rage into devastating attacks',
    requirements: {
      level: 12,
      resources: {
        [ResourceType.STEEL]: 75,
        [ResourceType.FOOD]: 100,
        [ResourceType.GOLD]: 300
      },
      achievements: ['Berserker'],
      battles: 20,
      specialConditions: ['Must have survived battle at <10% HP']
    },
    statBonuses: {
      hp: 15,
      str: 15,
      skl: 5,
      arm: -5 // Trade armor for offense
    },
    newAbilities: ['Berserker Rage', 'Reckless Attack', 'Intimidate'],
    levelCapIncrease: 15,
    specialEffects: ['Damage increases as HP decreases', 'Cannot be healed during rage']
  },

  {
    fromArchetype: Archetype.HEAVY_INFANTRY,
    toArchetype: AdvancedArchetype.GUARDIAN,
    name: 'Guardian',
    description: 'Ultimate defensive specialist protecting allies',
    requirements: {
      level: 18,
      resources: {
        [ResourceType.STEEL]: 150,
        [ResourceType.STONE]: 100,
        [ResourceType.GOLD]: 400
      },
      achievements: ['Battle-Scarred', 'Protector'],
      skills: ['Shield Wall', 'Taunt'],
      battles: 30
    },
    statBonuses: {
      hp: 25,
      str: 5,
      arm: 20,
      ldr: 10
    },
    newAbilities: ['Fortress Stance', 'Shield Bash', 'Rallying Cry'],
    levelCapIncrease: 25,
    specialEffects: ['Can protect multiple allies', 'Damage reduction stacks with armor']
  },

  // Mage Promotions
  {
    fromArchetype: Archetype.MAGE,
    toArchetype: AdvancedArchetype.ARCHMAGE,
    name: 'Archmage',
    description: 'Master of all magical arts with immense power',
    requirements: {
      level: 20,
      resources: {
        [ResourceType.MANA_CRYSTALS]: 200,
        [ResourceType.GOLD]: 1000,
        [ResourceType.WOOD]: 50
      },
      achievements: ['Arcane Scholar'],
      skills: ['Fireball', 'Ice Shard', 'Lightning Bolt'],
      battles: 35,
      specialConditions: ['Must have learned 15+ spells']
    },
    statBonuses: {
      hp: 10,
      mag: 25,
      skl: 10,
      ldr: 8
    },
    newAbilities: ['Meteor', 'Time Stop', 'Mana Shield', 'Spell Mastery'],
    levelCapIncrease: 30,
    specialEffects: ['Can cast two spells per turn', 'Spell costs reduced by 50%']
  },

  {
    fromArchetype: Archetype.MAGE,
    toArchetype: AdvancedArchetype.BATTLE_MAGE,
    name: 'Battle Mage',
    description: 'Warrior-mage combining magic with martial combat',
    requirements: {
      level: 15,
      resources: {
        [ResourceType.MANA_CRYSTALS]: 100,
        [ResourceType.STEEL]: 75,
        [ResourceType.GOLD]: 600
      },
      equipment: ['Enchanted Weapon'],
      battles: 25
    },
    statBonuses: {
      hp: 15,
      str: 10,
      mag: 15,
      skl: 8,
      arm: 5
    },
    newAbilities: ['Spell Sword', 'Magic Weapon', 'Combat Casting'],
    levelCapIncrease: 20,
    specialEffects: ['Can cast spells in melee', 'Weapons deal magic damage']
  },

  // Knight Promotions
  {
    fromArchetype: Archetype.KNIGHT,
    toArchetype: AdvancedArchetype.CHAMPION,
    name: 'Champion',
    description: 'Elite warrior representing the pinnacle of knightly virtue',
    requirements: {
      level: 18,
      resources: {
        [ResourceType.STEEL]: 200,
        [ResourceType.GOLD]: 800,
        [ResourceType.HORSES]: 10
      },
      achievements: ['Weapon Master', 'Inspiring Leader'],
      battles: 40,
      specialConditions: ['Must have won 30+ battles']
    },
    statBonuses: {
      hp: 20,
      str: 12,
      skl: 10,
      arm: 8,
      ldr: 20
    },
    newAbilities: ['Heroic Strike', 'Inspire Troops', 'Challenge'],
    levelCapIncrease: 25,
    specialEffects: ['Nearby allies gain +10% damage', 'Cannot be critically hit']
  },

  // Archer Promotions
  {
    fromArchetype: Archetype.ARCHER,
    toArchetype: AdvancedArchetype.SNIPER,
    name: 'Sniper',
    description: 'Master marksman with unparalleled accuracy',
    requirements: {
      level: 16,
      resources: {
        [ResourceType.WOOD]: 100,
        [ResourceType.STEEL]: 50,
        [ResourceType.GOLD]: 400
      },
      achievements: ['Perfectionist'],
      battles: 30,
      specialConditions: ['Must have 95%+ accuracy over 100 attacks']
    },
    statBonuses: {
      hp: 10,
      str: 5,
      skl: 20,
      ldr: 5
    },
    newAbilities: ['Headshot', 'Piercing Shot', 'Eagle Eye'],
    levelCapIncrease: 20,
    specialEffects: ['Critical hits ignore armor', 'Can attack from extreme range']
  },

  // Cleric Promotions
  {
    fromArchetype: Archetype.CLERIC,
    toArchetype: AdvancedArchetype.HIGH_PRIEST,
    name: 'High Priest',
    description: 'Divine servant with powerful healing and blessing abilities',
    requirements: {
      level: 17,
      resources: {
        [ResourceType.MANA_CRYSTALS]: 150,
        [ResourceType.GOLD]: 600,
        [ResourceType.WOOD]: 75
      },
      achievements: ['Field Medic', 'Mentor'],
      skills: ['Heal', 'Bless', 'Turn Undead'],
      battles: 25
    },
    statBonuses: {
      hp: 15,
      mag: 20,
      skl: 8,
      ldr: 12
    },
    newAbilities: ['Mass Heal', 'Divine Intervention', 'Sanctuary'],
    levelCapIncrease: 25,
    specialEffects: ['Healing spells affect all nearby allies', 'Immune to status effects']
  },

  // Rogue Promotions
  {
    fromArchetype: Archetype.ROGUE,
    toArchetype: AdvancedArchetype.ASSASSIN,
    name: 'Assassin',
    description: 'Master of stealth and precision strikes',
    requirements: {
      level: 14,
      resources: {
        [ResourceType.STEEL]: 60,
        [ResourceType.GOLD]: 500
      },
      achievements: ['Executioner'],
      battles: 20,
      specialConditions: ['Must have 50+ backstab kills']
    },
    statBonuses: {
      hp: 10,
      str: 12,
      skl: 15,
      arm: 3
    },
    newAbilities: ['Death Strike', 'Vanish', 'Poison Blade'],
    levelCapIncrease: 18,
    specialEffects: ['First attack each battle is always critical', 'Can become invisible']
  },

  // Beast Tamer Promotions
  {
    fromArchetype: Archetype.BEAST_TAMER,
    toArchetype: AdvancedArchetype.BEAST_MASTER,
    name: 'Beast Master',
    description: 'Supreme commander of all creatures great and small',
    requirements: {
      level: 16,
      resources: {
        [ResourceType.FOOD]: 200,
        [ResourceType.GOLD]: 400,
        [ResourceType.WOOD]: 100
      },
      achievements: ['Beast Whisperer'],
      battles: 30,
      specialConditions: ['Must have fought with 10+ different beast types']
    },
    statBonuses: {
      hp: 15,
      str: 8,
      skl: 10,
      ldr: 18
    },
    newAbilities: ['Call of the Wild', 'Beast Bond', 'Pack Tactics'],
    levelCapIncrease: 22,
    specialEffects: ['Can command 2 additional beast units', 'Beasts gain +50% stats']
  },

  // Dwarven Engineer Promotions
  {
    fromArchetype: Archetype.DWARVEN_ENGINEER,
    toArchetype: AdvancedArchetype.MASTER_ENGINEER,
    name: 'Master Engineer',
    description: 'Legendary craftsman and siege warfare expert',
    requirements: {
      level: 15,
      resources: {
        [ResourceType.STEEL]: 150,
        [ResourceType.STONE]: 100,
        [ResourceType.GOLD]: 700
      },
      equipment: ['Master Tools'],
      battles: 20,
      specialConditions: ['Must have built 10+ siege weapons']
    },
    statBonuses: {
      hp: 12,
      str: 10,
      skl: 15,
      arm: 8,
      ldr: 10
    },
    newAbilities: ['Siege Mastery', 'Fortify', 'Explosive Shot'],
    levelCapIncrease: 20,
    specialEffects: ['Siege weapons deal double damage', 'Can repair equipment in battle']
  }
]

/**
 * Get available promotions for a unit
 */
export function getAvailablePromotions(unit: Unit): PromotionPath[] {
  return PROMOTION_PATHS.filter(path => 
    path.fromArchetype === unit.archetype && 
    canPromoteUnit(unit, path)
  )
}

/**
 * Check if a unit meets promotion requirements
 */
export function canPromoteUnit(unit: Unit, promotionPath: PromotionPath): boolean {
  const req = promotionPath.requirements

  // Check level requirement
  if (unit.experience.currentLevel < req.level) {
    return false
  }

  // Check battle requirement
  if (req.battles && unit.experience.totalBattles < req.battles) {
    return false
  }

  // Check achievement requirements
  if (req.achievements) {
    const unlockedAchievements = unit.achievementManager.getUnlockedAchievements()
    const achievementIds = unlockedAchievements.map(a => a.id)
    
    for (const requiredAchievement of req.achievements) {
      if (!achievementIds.includes(requiredAchievement.toLowerCase().replace(' ', '_'))) {
        return false
      }
    }
  }

  // Check skill requirements
  if (req.skills) {
    const learnedSkills = unit.skillManager.getAllLearnedSkills()
    const skillIds = learnedSkills.map(s => s.skillId)
    
    for (const requiredSkill of req.skills) {
      if (!skillIds.includes(requiredSkill.toLowerCase().replace(' ', '_'))) {
        return false
      }
    }
  }

  // Resource and equipment checks would need to be done at promotion time
  // since we don't have access to player resources here
  
  return true
}

/**
 * Get promotion requirements summary for UI
 */
export function getPromotionRequirementsSummary(promotionPath: PromotionPath): {
  met: string[]
  unmet: string[]
  resources: Array<{ type: ResourceType; amount: number }>
} {
  const req = promotionPath.requirements
  const met: string[] = []
  const unmet: string[] = []
  const resources: Array<{ type: ResourceType; amount: number }> = []

  // Add resource requirements
  if (req.resources) {
    Object.entries(req.resources).forEach(([resource, amount]) => {
      resources.push({
        type: resource as ResourceType,
        amount: amount as number
      })
    })
  }

  // Add other requirements to unmet for now (would be checked against actual unit)
  unmet.push(`Level ${req.level}`)
  
  if (req.battles) {
    unmet.push(`${req.battles} battles fought`)
  }
  
  if (req.achievements) {
    req.achievements.forEach(achievement => {
      unmet.push(`Achievement: ${achievement}`)
    })
  }
  
  if (req.skills) {
    req.skills.forEach(skill => {
      unmet.push(`Skill: ${skill}`)
    })
  }

  if (req.equipment) {
    req.equipment.forEach(equipment => {
      unmet.push(`Equipment: ${equipment}`)
    })
  }

  if (req.specialConditions) {
    req.specialConditions.forEach(condition => {
      unmet.push(condition)
    })
  }

  return { met, unmet, resources }
}

/**
 * Apply promotion to a unit
 */
export function promoteUnit(unit: Unit, promotionPath: PromotionPath): boolean {
  try {
    // Apply stat bonuses
    if (promotionPath.statBonuses) {
      const currentStats = unit.getCurrentStats()
      Object.entries(promotionPath.statBonuses).forEach(([stat, bonus]) => {
        if (bonus && currentStats[stat as keyof typeof currentStats] !== undefined) {
          // This would need to be implemented in the Unit class
          // For now, we'll track it in a promotion bonuses system
        }
      })
    }

    // Increase level cap
    unit.experience.maxLevel += promotionPath.levelCapIncrease

    // Add new abilities (would be integrated with skill system)
    promotionPath.newAbilities.forEach(ability => {
      // This would add the ability to the unit's skill list
    })

    // Update unit's archetype to the promoted version
    // This would require modifying the Unit class to support archetype changes
    
    return true
  } catch (error) {
    console.error('Failed to promote unit:', error)
    return false
  }
}

/**
 * Get promotion path by advanced archetype
 */
export function getPromotionPath(advancedArchetype: AdvancedArchetype): PromotionPath | null {
  return PROMOTION_PATHS.find(path => path.toArchetype === advancedArchetype) || null
}