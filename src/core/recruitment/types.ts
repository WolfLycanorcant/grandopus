export interface RecruitableUnit {
  id: string;
  name: string;
  race: string;
  archetype: string;
  description: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    magic: number;
  };
  cost: {
    gold: number;
    influence?: number;
    reputation?: number;
  };
  requirements: RecruitmentRequirement[];
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  availability: 'Always' | 'Limited' | 'Seasonal' | 'Achievement';
  maxRecruits?: number; // For limited units
  currentRecruits?: number;
  unlockConditions?: string[];
  specialAbilities: string[];
  growthRates: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    magic: number;
  };
}

export interface RecruitmentRequirement {
  type: 'Achievement' | 'Level' | 'Campaign' | 'Training' | 'Reputation' | 'Units';
  value: string | number;
  description: string;
  isMet: boolean;
}

export interface RecruitmentPool {
  availableUnits: RecruitableUnit[];
  unlockedUnits: string[];
  recruitmentHistory: RecruitmentRecord[];
  dailyRefresh: Date;
  weeklySpecials: RecruitableUnit[];
}

export interface RecruitmentRecord {
  unitId: string;
  unitName: string;
  recruitedAt: Date;
  cost: any;
  source: 'Standard' | 'Achievement' | 'Special' | 'Training';
}

export interface TrainingGrounds {
  availableOpponents: TrainingOpponent[];
  activeTraining: TrainingSession[];
  completedSessions: TrainingRecord[];
  facilities: TrainingFacility[];
}

export interface TrainingOpponent {
  id: string;
  name: string;
  title: string;
  description: string;
  difficulty: 'Novice' | 'Adept' | 'Expert' | 'Master' | 'Grandmaster';
  level: number;
  cost: {
    gold: number;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    magic: number;
  };
  abilities: string[];
  rewards: TrainingReward[];
  unlockRequirements: RecruitmentRequirement[];
  isUnlocked: boolean;
  battleCount: number;
  winRate: number;
}

export interface TrainingSession {
  id: string;
  unitId: string;
  opponentId: string;
  startTime: Date;
  duration: number; // in minutes
  status: 'Active' | 'Completed' | 'Failed' | 'Cancelled';
  battleGrid: TrainingBattleGrid;
  endTime: Date; // When the training will complete
  timer?: number; // Remaining time in milliseconds
}

export interface TrainingBattleGrid {
  size: { width: number; height: number };
  playerPosition: { x: number; y: number };
  opponentPosition: { x: number; y: number };
  obstacles: GridObstacle[];
  terrain: GridTerrain[];
}

export interface GridObstacle {
  position: { x: number; y: number };
  type: 'Wall' | 'Pillar' | 'Pit' | 'Water' | 'Fire';
  blocksMovement: boolean;
  blocksVision: boolean;
  effect?: string;
}

export interface GridTerrain {
  position: { x: number; y: number };
  type: 'Normal' | 'Difficult' | 'Hazardous' | 'Beneficial';
  movementCost: number;
  effects: string[];
}

export interface TrainingReward {
  type: 'Experience' | 'Gold' | 'Skill' | 'Achievement' | 'Unlock';
  amount?: number;
  skillId?: string;
  achievementId?: string;
  unlockId?: string;
  description: string;
}

export interface TrainingRecord {
  sessionId: string;
  unitId: string;
  unitName: string;
  opponentId: string;
  opponentName: string;
  result: 'Victory' | 'Defeat' | 'Draw';
  duration: number;
  experienceGained: number;
  skillsLearned: string[];
  completedAt: Date;
  battleLog: string[];
}

export interface TrainingFacility {
  id: string;
  name: string;
  description: string;
  type: 'Basic' | 'Advanced' | 'Specialized' | 'Elite';
  bonuses: FacilityBonus[];
  cost: number;
  isUnlocked: boolean;
  level: number;
  maxLevel: number;
}

export interface FacilityBonus {
  type: 'ExperienceMultiplier' | 'SkillChance' | 'TrainingSpeed' | 'SpecialUnlock';
  value: number;
  description: string;
}

export interface RecruitmentState {
  pool: RecruitmentPool;
  trainingGrounds: TrainingGrounds;
  playerReputation: number;
  playerInfluence: number;
  achievements: string[];
  unlockedContent: string[];
}