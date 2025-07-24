import { WeaponType, ProficiencyTier, SpecialEffect } from './types'

/**
 * Weapon proficiency tiers and bonuses
 */
export const PROFICIENCY_TIERS: Record<number, ProficiencyTier> = {
  1: {
    tier: 1,
    requiredLevel: 0,
    damageBonus: 0,
    hitBonus: 0
  },
  2: {
    tier: 2,
    requiredLevel: 20,
    damageBonus: 5,
    hitBonus: 5,
    specialAbility: {
      name: 'Weapon Familiarity',
      description: '+5% damage and hit chance with this weapon type',
      effect: {
        id: 'weapon_familiarity',
        name: 'Weapon Familiarity',
        description: '+5% damage and hit chance',
        trigger: 'passive',
        effect: {
          type: 'buff',
          value: 5,
          target: 'self'
        }
      }
    }
  },
  3: {
    tier: 3,
    requiredLevel: 50,
    damageBonus: 10,
    hitBonus: 10,
    specialAbility: {
      name: 'Weapon Expertise',
      description: '+10% damage and hit chance, +5% crit chance',
      effect: {
        id: 'weapon_expertise',
        name: 'Weapon Expertise',
        description: '+10% damage and hit chance, +5% crit chance',
        trigger: 'passive',
        effect: {
          type: 'buff',
          value: 10,
          target: 'self'
        }
      }
    }
  },
  4: {
    tier: 4,
    requiredLevel: 75,
    damageBonus: 15,
    hitBonus: 15,
    specialAbility: {
      name: 'Weapon Mastery',
      description: '+15% damage and hit chance, +10% crit chance, special attacks',
      effect: {
        id: 'weapon_mastery',
        name: 'Weapon Mastery',
        description: '+15% damage and hit chance, +10% crit chance',
        trigger: 'passive',
        effect: {
          type: 'buff',
          value: 15,
          target: 'self'
        }
      }
    }
  },
  5: {
    tier: 5,
    requiredLevel: 100,
    damageBonus: 25,
    hitBonus: 20,
    specialAbility: {
      name: 'Weapon Grandmastery',
      description: '+25% damage, +20% hit chance, +15% crit chance, devastating special attacks',
      effect: {
        id: 'weapon_grandmastery',
        name: 'Weapon Grandmastery',
        description: 'Master of this weapon type with devastating special attacks',
        trigger: 'passive',
        effect: {
          type: 'buff',
          value: 25,
          target: 'self'
        }
      }
    }
  }
}

/**
 * Weapon-specific special abilities unlocked at higher tiers
 */
export const WEAPON_SPECIAL_ABILITIES: Record<WeaponType, Record<number, SpecialEffect>> = {
  [WeaponType.SWORD]: {
    4: {
      id: 'sword_flurry',
      name: 'Sword Flurry',
      description: '10% chance to attack twice in one turn',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 100,
        target: 'enemy'
      }
    },
    5: {
      id: 'perfect_cut',
      name: 'Perfect Cut',
      description: '15% chance to ignore all armor',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 200,
        target: 'enemy'
      }
    }
  },
  
  [WeaponType.BOW]: {
    4: {
      id: 'piercing_shot',
      name: 'Piercing Shot',
      description: '12% chance to hit multiple enemies in a line',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 80,
        target: 'enemy'
      }
    },
    5: {
      id: 'rain_of_arrows',
      name: 'Rain of Arrows',
      description: '8% chance to hit all enemies',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 60,
        target: 'all'
      }
    }
  },
  
  [WeaponType.STAFF]: {
    4: {
      id: 'spell_echo',
      name: 'Spell Echo',
      description: '15% chance to cast the same spell twice',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 100,
        target: 'enemy'
      }
    },
    5: {
      id: 'arcane_mastery',
      name: 'Arcane Mastery',
      description: '20% chance for spells to not consume mana',
      trigger: 'on_hit',
      effect: {
        type: 'buff',
        value: 50,
        target: 'self'
      }
    }
  },
  
  [WeaponType.AXE]: {
    4: {
      id: 'cleave',
      name: 'Cleave',
      description: '20% chance to hit adjacent enemies',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 75,
        target: 'enemy'
      }
    },
    5: {
      id: 'berserker_rage',
      name: 'Berserker Rage',
      description: '10% chance to enter rage: +50% damage for 3 turns',
      trigger: 'on_hit',
      effect: {
        type: 'buff',
        value: 50,
        duration: 3,
        target: 'self'
      }
    }
  },
  
  [WeaponType.SPEAR]: {
    4: {
      id: 'thrust',
      name: 'Piercing Thrust',
      description: '18% chance to ignore armor and deal extra damage',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 150,
        target: 'enemy'
      }
    },
    5: {
      id: 'phalanx_formation',
      name: 'Phalanx Formation',
      description: 'Grants +20% armor to adjacent allies',
      trigger: 'passive',
      effect: {
        type: 'buff',
        value: 20,
        target: 'allies'
      }
    }
  },
  
  [WeaponType.MACE]: {
    4: {
      id: 'armor_crush',
      name: 'Armor Crush',
      description: '25% chance to reduce enemy armor by 50% for 2 turns',
      trigger: 'on_hit',
      effect: {
        type: 'debuff',
        value: 50,
        duration: 2,
        target: 'enemy'
      }
    },
    5: {
      id: 'divine_smite',
      name: 'Divine Smite',
      description: '12% chance to deal holy damage that heals allies',
      trigger: 'on_hit',
      effect: {
        type: 'heal',
        value: 100,
        target: 'allies'
      }
    }
  },
  
  [WeaponType.DAGGER]: {
    4: {
      id: 'backstab',
      name: 'Backstab',
      description: '30% chance to deal critical damage from behind',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 200,
        target: 'enemy'
      }
    },
    5: {
      id: 'shadow_strike',
      name: 'Shadow Strike',
      description: '15% chance to become invisible and guarantee next crit',
      trigger: 'on_hit',
      effect: {
        type: 'buff',
        value: 100,
        duration: 1,
        target: 'self'
      }
    }
  },
  
  [WeaponType.CROSSBOW]: {
    4: {
      id: 'explosive_bolt',
      name: 'Explosive Bolt',
      description: '15% chance to deal area damage',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 120,
        target: 'enemy'
      }
    },
    5: {
      id: 'rapid_reload',
      name: 'Rapid Reload',
      description: '20% chance to attack again immediately',
      trigger: 'on_hit',
      effect: {
        type: 'damage',
        value: 100,
        target: 'enemy'
      }
    }
  },
  
  [WeaponType.WAND]: {
    4: {
      id: 'mana_burn',
      name: 'Mana Burn',
      description: '20% chance to drain enemy mana and boost own magic',
      trigger: 'on_hit',
      effect: {
        type: 'buff',
        value: 25,
        duration: 2,
        target: 'self'
      }
    },
    5: {
      id: 'spell_steal',
      name: 'Spell Steal',
      description: '10% chance to copy enemy abilities',
      trigger: 'on_hit',
      effect: {
        type: 'buff',
        value: 30,
        target: 'self'
      }
    }
  },
  
  [WeaponType.HAMMER]: {
    4: {
      id: 'ground_slam',
      name: 'Ground Slam',
      description: '18% chance to stun all nearby enemies',
      trigger: 'on_hit',
      effect: {
        type: 'debuff',
        value: 100,
        duration: 1,
        target: 'enemy'
      }
    },
    5: {
      id: 'forge_mastery',
      name: 'Forge Mastery',
      description: 'Repairs equipment and boosts team armor',
      trigger: 'passive',
      effect: {
        type: 'buff',
        value: 15,
        target: 'allies'
      }
    }
  }
}

/**
 * Calculate proficiency tier based on level
 */
export function getProficiencyTier(level: number): number {
  if (level >= 100) return 5
  if (level >= 75) return 4
  if (level >= 50) return 3
  if (level >= 20) return 2
  return 1
}

/**
 * Get proficiency bonuses for a weapon type and level
 */
export function getProficiencyBonuses(weaponType: WeaponType, level: number) {
  const tier = getProficiencyTier(level)
  const tierData = PROFICIENCY_TIERS[tier]
  const specialAbilities = WEAPON_SPECIAL_ABILITIES[weaponType]
  
  return {
    tier,
    damageBonus: tierData.damageBonus,
    hitBonus: tierData.hitBonus,
    specialAbility: tierData.specialAbility,
    weaponSpecialAbilities: {
      tier4: specialAbilities[4] || null,
      tier5: specialAbilities[5] || null
    }
  }
}

/**
 * Calculate experience needed for next proficiency level
 */
export function getExpToNextLevel(currentLevel: number): number {
  if (currentLevel >= 100) return 0
  return Math.floor((currentLevel + 1) * 10)
}

/**
 * Add proficiency experience and handle level ups
 */
export function addProficiencyExp(currentLevel: number, currentExp: number, expGain: number) {
  let newLevel = currentLevel
  let newExp = currentExp + expGain
  let leveledUp = false
  
  while (newLevel < 100 && newExp >= getExpToNextLevel(newLevel)) {
    newExp -= getExpToNextLevel(newLevel)
    newLevel++
    leveledUp = true
  }
  
  return {
    level: newLevel,
    experience: newExp,
    leveledUp,
    newTier: leveledUp ? getProficiencyTier(newLevel) : null
  }
}