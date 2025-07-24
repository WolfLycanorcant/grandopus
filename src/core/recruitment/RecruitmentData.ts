import { RecruitableUnit, TrainingOpponent, TrainingFacility } from './types';

export const BASIC_RECRUITABLE_UNITS: RecruitableUnit[] = [
  // Common Units - Always Available
  {
    id: 'human-militia',
    name: 'Human Militia',
    race: 'Human',
    archetype: 'Warrior',
    description: 'Basic human soldiers with standard training and equipment.',
    baseStats: { hp: 45, attack: 12, defense: 10, speed: 8, magic: 2 },
    cost: { gold: 50 },
    requirements: [],
    rarity: 'Common',
    availability: 'Always',
    unlockConditions: [],
    specialAbilities: ['Shield Bash'],
    growthRates: { hp: 3, attack: 2, defense: 2, speed: 1, magic: 0.5 }
  },
  {
    id: 'elf-scout',
    name: 'Elf Scout',
    race: 'Elf',
    archetype: 'Archer',
    description: 'Swift elven scouts with keen eyesight and bow skills.',
    baseStats: { hp: 35, attack: 14, defense: 8, speed: 12, magic: 4 },
    cost: { gold: 75 },
    requirements: [],
    rarity: 'Common',
    availability: 'Always',
    unlockConditions: [],
    specialAbilities: ['Precise Shot'],
    growthRates: { hp: 2, attack: 2.5, defense: 1, speed: 2, magic: 1 }
  },
  {
    id: 'dwarf-defender',
    name: 'Dwarf Defender',
    race: 'Dwarf',
    archetype: 'Guardian',
    description: 'Sturdy dwarven warriors specialized in defensive combat.',
    baseStats: { hp: 55, attack: 10, defense: 15, speed: 6, magic: 1 },
    cost: { gold: 80 },
    requirements: [],
    rarity: 'Common',
    availability: 'Always',
    unlockConditions: [],
    specialAbilities: ['Defensive Stance'],
    growthRates: { hp: 4, attack: 1.5, defense: 3, speed: 0.5, magic: 0.2 }
  },

  // Uncommon Units - Require Basic Achievements
  {
    id: 'human-knight',
    name: 'Human Knight',
    race: 'Human',
    archetype: 'Paladin',
    description: 'Noble knights with advanced combat training and holy magic.',
    baseStats: { hp: 60, attack: 16, defense: 14, speed: 9, magic: 6 },
    cost: { gold: 150, reputation: 10 },
    requirements: [
      { type: 'Achievement', value: 'first-victory', description: 'Win your first battle', isMet: false },
      { type: 'Level', value: 5, description: 'Reach Commander Level 5', isMet: false }
    ],
    rarity: 'Uncommon',
    availability: 'Achievement',
    unlockConditions: ['Complete tutorial campaign'],
    specialAbilities: ['Holy Strike', 'Healing Light'],
    growthRates: { hp: 3.5, attack: 2.5, defense: 2.5, speed: 1.5, magic: 1.5 }
  },
  {
    id: 'elf-ranger',
    name: 'Elf Ranger',
    race: 'Elf',
    archetype: 'Ranger',
    description: 'Elite elven rangers with mastery over nature magic and archery.',
    baseStats: { hp: 45, attack: 18, defense: 10, speed: 15, magic: 8 },
    cost: { gold: 200, influence: 5 },
    requirements: [
      { type: 'Achievement', value: 'marksman', description: 'Score 10 critical hits with archers', isMet: false },
      { type: 'Units', value: 3, description: 'Train 3 archer units to level 10', isMet: false }
    ],
    rarity: 'Uncommon',
    availability: 'Achievement',
    unlockConditions: ['Master archery training'],
    specialAbilities: ['Multi-Shot', 'Nature\'s Blessing'],
    growthRates: { hp: 2.5, attack: 3, defense: 1.5, speed: 2.5, magic: 2 }
  },

  // Rare Units - Require Significant Progress
  {
    id: 'dragon-knight',
    name: 'Dragon Knight',
    race: 'Human',
    archetype: 'Dragon Rider',
    description: 'Elite warriors bonded with young dragons, masters of aerial combat.',
    baseStats: { hp: 80, attack: 22, defense: 18, speed: 12, magic: 10 },
    cost: { gold: 500, reputation: 50, influence: 20 },
    requirements: [
      { type: 'Achievement', value: 'dragon-slayer', description: 'Defeat a dragon in campaign', isMet: false },
      { type: 'Campaign', value: 'rise-of-kingdoms', description: 'Complete Rise of Kingdoms campaign', isMet: false },
      { type: 'Level', value: 15, description: 'Reach Commander Level 15', isMet: false }
    ],
    rarity: 'Rare',
    availability: 'Achievement',
    maxRecruits: 3,
    currentRecruits: 0,
    unlockConditions: ['Forge alliance with Dragon Clan'],
    specialAbilities: ['Dragon Breath', 'Aerial Strike', 'Dragon Bond'],
    growthRates: { hp: 4, attack: 3.5, defense: 3, speed: 2, magic: 2.5 }
  },

  // Epic Units - Endgame Content
  {
    id: 'archmage',
    name: 'Archmage',
    race: 'Elf',
    archetype: 'Arcane Master',
    description: 'Masters of the arcane arts with devastating magical abilities.',
    baseStats: { hp: 50, attack: 8, defense: 12, speed: 10, magic: 25 },
    cost: { gold: 1000, influence: 100 },
    requirements: [
      { type: 'Achievement', value: 'spell-master', description: 'Cast 100 spells in combat', isMet: false },
      { type: 'Training', value: 'arcane-mastery', description: 'Complete Arcane Mastery training', isMet: false },
      { type: 'Level', value: 20, description: 'Reach Commander Level 20', isMet: false }
    ],
    rarity: 'Epic',
    availability: 'Achievement',
    maxRecruits: 2,
    currentRecruits: 0,
    unlockConditions: ['Master all schools of magic'],
    specialAbilities: ['Meteor', 'Time Stop', 'Arcane Mastery', 'Spell Weaving'],
    growthRates: { hp: 2, attack: 1, defense: 1.5, speed: 1.5, magic: 4 }
  },

  // Legendary Units - Ultimate Rewards
  {
    id: 'ancient-guardian',
    name: 'Ancient Guardian',
    race: 'Construct',
    archetype: 'Legendary Guardian',
    description: 'Ancient magical constructs awakened to serve worthy commanders.',
    baseStats: { hp: 120, attack: 25, defense: 30, speed: 8, magic: 15 },
    cost: { gold: 2000, reputation: 200, influence: 200 },
    requirements: [
      { type: 'Achievement', value: 'legend-forged', description: 'Complete all campaigns with perfect scores', isMet: false },
      { type: 'Achievement', value: 'master-trainer', description: 'Train 50 units to maximum level', isMet: false },
      { type: 'Level', value: 30, description: 'Reach Commander Level 30', isMet: false }
    ],
    rarity: 'Legendary',
    availability: 'Achievement',
    maxRecruits: 1,
    currentRecruits: 0,
    unlockConditions: ['Prove yourself as a legendary commander'],
    specialAbilities: ['Ancient Power', 'Regeneration', 'Immunity', 'Guardian\'s Wrath'],
    growthRates: { hp: 5, attack: 4, defense: 4, speed: 1, magic: 3 }
  }
];

export const TRAINING_OPPONENTS: TrainingOpponent[] = [
  // Novice Opponents
  {
    id: 'training-dummy',
    name: 'Training Dummy',
    title: 'Practice Target',
    description: 'A basic training dummy for learning combat fundamentals.',
    difficulty: 'Novice',
    level: 1,
    stats: { hp: 30, attack: 5, defense: 5, speed: 3, magic: 0 },
    abilities: [],
    rewards: [
      { type: 'Experience', amount: 10, description: '10 Experience Points' }
    ],
    unlockRequirements: [],
    isUnlocked: true,
    battleCount: 0,
    winRate: 0
  },
  {
    id: 'recruit-trainer',
    name: 'Sergeant Marcus',
    title: 'Drill Instructor',
    description: 'A veteran sergeant who trains new recruits in basic combat.',
    difficulty: 'Novice',
    level: 3,
    stats: { hp: 40, attack: 8, defense: 7, speed: 6, magic: 1 },
    abilities: ['Basic Strike', 'Encourage'],
    rewards: [
      { type: 'Experience', amount: 25, description: '25 Experience Points' },
      { type: 'Skill', skillId: 'combat-basics', description: 'Learn Combat Basics' }
    ],
    unlockRequirements: [],
    isUnlocked: true,
    battleCount: 0,
    winRate: 0
  },

  // Adept Opponents
  {
    id: 'knight-captain',
    name: 'Captain Elena',
    title: 'Knight Captain',
    description: 'An experienced knight captain who teaches advanced swordplay.',
    difficulty: 'Adept',
    level: 8,
    stats: { hp: 65, attack: 15, defense: 12, speed: 9, magic: 3 },
    abilities: ['Power Strike', 'Defensive Stance', 'Rally'],
    rewards: [
      { type: 'Experience', amount: 50, description: '50 Experience Points' },
      { type: 'Skill', skillId: 'advanced-swordplay', description: 'Learn Advanced Swordplay' },
      { type: 'Gold', amount: 25, description: '25 Gold' }
    ],
    unlockRequirements: [
      { type: 'Level', value: 5, description: 'Unit must be level 5 or higher', isMet: false }
    ],
    isUnlocked: false,
    battleCount: 0,
    winRate: 0
  },
  {
    id: 'arcane-scholar',
    name: 'Master Aldric',
    title: 'Arcane Scholar',
    description: 'A learned mage who teaches the fundamentals of magic.',
    difficulty: 'Adept',
    level: 10,
    stats: { hp: 45, attack: 6, defense: 8, speed: 7, magic: 18 },
    abilities: ['Fireball', 'Magic Shield', 'Mana Burn'],
    rewards: [
      { type: 'Experience', amount: 60, description: '60 Experience Points' },
      { type: 'Skill', skillId: 'basic-magic', description: 'Learn Basic Magic' },
      { type: 'Unlock', unlockId: 'magic-training', description: 'Unlock Magic Training Facility' }
    ],
    unlockRequirements: [
      { type: 'Achievement', value: 'first-spell', description: 'Cast your first spell', isMet: false }
    ],
    isUnlocked: false,
    battleCount: 0,
    winRate: 0
  },

  // Expert Opponents
  {
    id: 'weapon-master',
    name: 'Grandmaster Thane',
    title: 'Weapon Master',
    description: 'A legendary weapon master who has perfected all forms of combat.',
    difficulty: 'Expert',
    level: 15,
    stats: { hp: 85, attack: 22, defense: 16, speed: 14, magic: 5 },
    abilities: ['Weapon Mastery', 'Counter Attack', 'Flurry', 'Perfect Strike'],
    rewards: [
      { type: 'Experience', amount: 100, description: '100 Experience Points' },
      { type: 'Skill', skillId: 'weapon-mastery', description: 'Learn Weapon Mastery' },
      { type: 'Achievement', achievementId: 'weapon-expert', description: 'Weapon Expert Achievement' }
    ],
    unlockRequirements: [
      { type: 'Level', value: 12, description: 'Unit must be level 12 or higher', isMet: false },
      { type: 'Training', value: 'advanced-combat', description: 'Complete Advanced Combat Training', isMet: false }
    ],
    isUnlocked: false,
    battleCount: 0,
    winRate: 0
  },

  // Master Opponents
  {
    id: 'shadow-assassin',
    name: 'Shadowblade Kira',
    title: 'Master Assassin',
    description: 'A deadly assassin who teaches the arts of stealth and precision.',
    difficulty: 'Master',
    level: 20,
    stats: { hp: 70, attack: 28, defense: 12, speed: 20, magic: 8 },
    abilities: ['Stealth Strike', 'Shadow Step', 'Poison Blade', 'Assassination'],
    rewards: [
      { type: 'Experience', amount: 150, description: '150 Experience Points' },
      { type: 'Skill', skillId: 'shadow-arts', description: 'Learn Shadow Arts' },
      { type: 'Unlock', unlockId: 'assassin-recruitment', description: 'Unlock Assassin Recruitment' }
    ],
    unlockRequirements: [
      { type: 'Level', value: 18, description: 'Unit must be level 18 or higher', isMet: false },
      { type: 'Achievement', value: 'stealth-master', description: 'Master stealth techniques', isMet: false }
    ],
    isUnlocked: false,
    battleCount: 0,
    winRate: 0
  },

  // Grandmaster Opponents
  {
    id: 'ancient-dragon',
    name: 'Pyraxis the Ancient',
    title: 'Ancient Dragon',
    description: 'An ancient dragon who tests only the most worthy warriors.',
    difficulty: 'Grandmaster',
    level: 30,
    stats: { hp: 200, attack: 35, defense: 25, speed: 15, magic: 30 },
    abilities: ['Dragon Breath', 'Ancient Magic', 'Tail Sweep', 'Intimidating Roar', 'Legendary Resistance'],
    rewards: [
      { type: 'Experience', amount: 300, description: '300 Experience Points' },
      { type: 'Achievement', achievementId: 'dragon-slayer', description: 'Dragon Slayer Achievement' },
      { type: 'Unlock', unlockId: 'dragon-knight-recruitment', description: 'Unlock Dragon Knight Recruitment' },
      { type: 'Gold', amount: 500, description: '500 Gold' }
    ],
    unlockRequirements: [
      { type: 'Level', value: 25, description: 'Unit must be level 25 or higher', isMet: false },
      { type: 'Achievement', value: 'master-warrior', description: 'Achieve Master Warrior status', isMet: false }
    ],
    isUnlocked: false,
    battleCount: 0,
    winRate: 0
  }
];

export const TRAINING_FACILITIES: TrainingFacility[] = [
  {
    id: 'basic-barracks',
    name: 'Basic Barracks',
    description: 'Simple training facilities for basic combat instruction.',
    type: 'Basic',
    bonuses: [
      { type: 'ExperienceMultiplier', value: 1.1, description: '+10% Experience from training' }
    ],
    cost: 0,
    isUnlocked: true,
    level: 1,
    maxLevel: 3
  },
  {
    id: 'archery-range',
    name: 'Archery Range',
    description: 'Specialized facility for training ranged combat skills.',
    type: 'Specialized',
    bonuses: [
      { type: 'SkillChance', value: 0.2, description: '+20% chance to learn archery skills' },
      { type: 'ExperienceMultiplier', value: 1.15, description: '+15% Experience for archer training' }
    ],
    cost: 200,
    isUnlocked: false,
    level: 1,
    maxLevel: 5
  },
  {
    id: 'magic-academy',
    name: 'Magic Academy',
    description: 'Advanced facility for magical training and research.',
    type: 'Advanced',
    bonuses: [
      { type: 'SkillChance', value: 0.25, description: '+25% chance to learn magic skills' },
      { type: 'SpecialUnlock', value: 1, description: 'Unlocks advanced magic opponents' }
    ],
    cost: 500,
    isUnlocked: false,
    level: 1,
    maxLevel: 5
  },
  {
    id: 'elite-dojo',
    name: 'Elite Dojo',
    description: 'Ultimate training facility for the most advanced warriors.',
    type: 'Elite',
    bonuses: [
      { type: 'ExperienceMultiplier', value: 1.5, description: '+50% Experience from training' },
      { type: 'TrainingSpeed', value: 0.5, description: '50% faster training sessions' },
      { type: 'SpecialUnlock', value: 1, description: 'Unlocks legendary opponents' }
    ],
    cost: 2000,
    isUnlocked: false,
    level: 1,
    maxLevel: 3
  }
];