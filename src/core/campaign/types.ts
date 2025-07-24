export interface CampaignMission {
  id: string;
  name: string;
  description: string;
  briefing: string;
  objectives: MissionObjective[];
  rewards: MissionReward[];
  requirements: MissionRequirement[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  estimatedTurns: number;
  mapSize: 'Small' | 'Medium' | 'Large';
  environment: 'Plains' | 'Forest' | 'Mountains' | 'Desert' | 'Swamp' | 'Tundra';
  weather: 'Clear' | 'Rain' | 'Snow' | 'Fog' | 'Storm';
  enemyFactions: string[];
  isCompleted: boolean;
  isUnlocked: boolean;
  bestScore?: number;
  completionTime?: number;
}

export interface MissionObjective {
  id: string;
  type: 'Defeat' | 'Survive' | 'Capture' | 'Escort' | 'Defend' | 'Collect';
  description: string;
  target?: string;
  quantity?: number;
  timeLimit?: number;
  isCompleted: boolean;
  isOptional: boolean;
}

export interface MissionReward {
  type: 'Gold' | 'Experience' | 'Equipment' | 'Unit' | 'Unlock';
  amount?: number;
  itemId?: string;
  description: string;
}

export interface MissionRequirement {
  type: 'Level' | 'Mission' | 'Units' | 'Resources';
  value: number | string;
  description: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  lore: string;
  missions: CampaignMission[];
  currentMissionIndex: number;
  isCompleted: boolean;
  totalScore: number;
  startDate: Date;
  completionDate?: Date;
}

export interface CampaignProgress {
  campaignId: string;
  completedMissions: string[];
  currentMission?: string;
  totalScore: number;
  achievements: string[];
  statistics: CampaignStatistics;
}

export interface CampaignStatistics {
  battlesWon: number;
  battlesLost: number;
  unitsLost: number;
  enemiesDefeated: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  perfectVictories: number;
  fastestCompletion: number;
}

export interface CampaignState {
  availableCampaigns: Campaign[];
  activeCampaign?: Campaign;
  campaignProgress: Record<string, CampaignProgress>;
  unlockedContent: string[];
}