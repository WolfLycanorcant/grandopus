import { CampaignManager } from './CampaignManager';
import { CampaignMission, MissionObjective } from './types';
import { BattleResult } from '../battle/types';
import { Squad } from '../units/Squad';

export class CampaignIntegration {
  private campaignManager: CampaignManager;

  constructor(campaignManager: CampaignManager) {
    this.campaignManager = campaignManager;
  }

  public setupMissionBattle(campaignId: string, missionId: string): {
    mission: CampaignMission | null;
    enemySquads: Squad[];
    battleConditions: BattleConditions;
  } {
    const mission = this.campaignManager.getMission(campaignId, missionId);
    if (!mission) {
      return { mission: null, enemySquads: [], battleConditions: {} };
    }

    // Generate enemy squads based on mission
    const enemySquads = this.generateEnemySquads(mission);
    
    // Set up battle conditions
    const battleConditions = this.createBattleConditions(mission);

    return { mission, enemySquads, battleConditions };
  }

  private generateEnemySquads(mission: CampaignMission): Squad[] {
    const squads: Squad[] = [];
    
    // Generate squads based on difficulty and enemy factions
    const squadCount = this.getSquadCountForDifficulty(mission.difficulty);
    
    for (let i = 0; i < squadCount; i++) {
      const faction = mission.enemyFactions[i % mission.enemyFactions.length];
      const squad = this.createEnemySquad(faction, mission.difficulty, i);
      squads.push(squad);
    }

    return squads;
  }

  private getSquadCountForDifficulty(difficulty: string): number {
    switch (difficulty) {
      case 'Easy': return 1;
      case 'Medium': return 2;
      case 'Hard': return 3;
      case 'Legendary': return 4;
      default: return 1;
    }
  }

  private createEnemySquad(faction: string, difficulty: string, index: number): Squad {
    // This would integrate with your existing Squad and Unit creation system
    // For now, returning a placeholder - you'd implement this based on your existing systems
    const squad = new Squad(`${faction} Squad ${index + 1}`);
    
    // Add units based on faction and difficulty
    // This would use your existing UnitFactory and unit creation logic
    
    return squad;
  }

  private createBattleConditions(mission: CampaignMission): BattleConditions {
    return {
      environment: mission.environment,
      weather: mission.weather,
      mapSize: mission.mapSize,
      turnLimit: mission.objectives.find(obj => obj.timeLimit)?.timeLimit,
      specialRules: this.getSpecialRulesForMission(mission),
      victoryConditions: this.createVictoryConditions(mission.objectives)
    };
  }

  private getSpecialRulesForMission(mission: CampaignMission): string[] {
    const rules: string[] = [];
    
    // Add weather effects
    switch (mission.weather) {
      case 'Rain':
        rules.push('Reduced visibility: -10% accuracy for ranged attacks');
        break;
      case 'Snow':
        rules.push('Difficult terrain: -1 movement for all units');
        break;
      case 'Fog':
        rules.push('Limited sight: Cannot target units beyond 2 tiles');
        break;
      case 'Storm':
        rules.push('Chaotic conditions: Random unit each turn loses 1 action');
        break;
    }

    // Add environment effects
    switch (mission.environment) {
      case 'Forest':
        rules.push('Dense cover: +15% dodge chance for all units');
        break;
      case 'Mountains':
        rules.push('High ground advantage: +10% damage from elevated positions');
        break;
      case 'Desert':
        rules.push('Harsh conditions: -5 HP per turn for non-desert units');
        break;
      case 'Swamp':
        rules.push('Difficult movement: Movement costs +1 AP');
        break;
    }

    return rules;
  }

  private createVictoryConditions(objectives: MissionObjective[]): VictoryCondition[] {
    return objectives.map(obj => ({
      id: obj.id,
      type: obj.type,
      description: obj.description,
      target: obj.target,
      quantity: obj.quantity,
      timeLimit: obj.timeLimit,
      isOptional: obj.isOptional,
      isCompleted: false
    }));
  }

  public processBattleResult(
    campaignId: string,
    missionId: string,
    battleResult: BattleResult,
    completedObjectives: string[]
  ): MissionResult {
    const mission = this.campaignManager.getMission(campaignId, missionId);
    if (!mission) {
      return { success: false, score: 0, rewards: [] };
    }

    // Calculate mission score
    const score = this.calculateMissionScore(mission, battleResult, completedObjectives);
    
    // Determine if mission was successful
    const requiredObjectives = mission.objectives.filter(obj => !obj.isOptional);
    const completedRequired = requiredObjectives.filter(obj => 
      completedObjectives.includes(obj.id)
    ).length;
    
    const success = completedRequired === requiredObjectives.length;

    if (success) {
      // Complete the mission
      this.campaignManager.completeMission(
        campaignId,
        missionId,
        score,
        battleResult.duration || 0,
        completedObjectives
      );

      return {
        success: true,
        score,
        rewards: mission.rewards,
        unlockedContent: this.getUnlockedContent(mission),
        nextMission: this.getNextMission(campaignId, missionId)
      };
    } else {
      // Mission failed
      this.campaignManager.failMission(campaignId, missionId);
      
      return {
        success: false,
        score: Math.floor(score * 0.3), // Partial score for failed mission
        rewards: []
      };
    }
  }

  private calculateMissionScore(
    mission: CampaignMission,
    battleResult: BattleResult,
    completedObjectives: string[]
  ): number {
    let score = 0;

    // Base score for completion
    score += 100;

    // Bonus for optional objectives
    const optionalCompleted = mission.objectives.filter(obj => 
      obj.isOptional && completedObjectives.includes(obj.id)
    ).length;
    score += optionalCompleted * 50;

    // Speed bonus
    if (battleResult.duration && battleResult.duration <= mission.estimatedTurns) {
      const speedBonus = Math.max(0, mission.estimatedTurns - battleResult.duration) * 10;
      score += speedBonus;
    }

    // Survival bonus (fewer units lost)
    if (battleResult.playerLosses !== undefined) {
      const survivalBonus = Math.max(0, 6 - battleResult.playerLosses) * 20;
      score += survivalBonus;
    }

    // Difficulty multiplier
    const difficultyMultiplier = {
      'Easy': 1.0,
      'Medium': 1.5,
      'Hard': 2.0,
      'Legendary': 3.0
    }[mission.difficulty] || 1.0;

    return Math.floor(score * difficultyMultiplier);
  }

  private getUnlockedContent(mission: CampaignMission): string[] {
    const unlocked: string[] = [];
    
    // Check for content unlocks based on mission rewards
    mission.rewards.forEach(reward => {
      if (reward.type === 'Unlock') {
        unlocked.push(reward.description);
      }
    });

    return unlocked;
  }

  private getNextMission(campaignId: string, completedMissionId: string): CampaignMission | null {
    const campaign = this.campaignManager.getCampaign(campaignId);
    if (!campaign) return null;

    const currentIndex = campaign.missions.findIndex(m => m.id === completedMissionId);
    if (currentIndex >= 0 && currentIndex < campaign.missions.length - 1) {
      const nextMission = campaign.missions[currentIndex + 1];
      return nextMission.isUnlocked ? nextMission : null;
    }

    return null;
  }

  public checkObjectiveProgress(
    campaignId: string,
    missionId: string,
    gameState: any
  ): ObjectiveProgress[] {
    const mission = this.campaignManager.getMission(campaignId, missionId);
    if (!mission) return [];

    return mission.objectives.map(objective => {
      const progress = this.evaluateObjective(objective, gameState);
      
      // Update objective completion status
      if (progress.completed && !objective.isCompleted) {
        this.campaignManager.updateMissionObjective(
          campaignId,
          missionId,
          objective.id,
          true
        );
      }

      return progress;
    });
  }

  private evaluateObjective(objective: MissionObjective, gameState: any): ObjectiveProgress {
    switch (objective.type) {
      case 'Defeat':
        return {
          id: objective.id,
          description: objective.description,
          progress: gameState.enemiesDefeated || 0,
          target: gameState.totalEnemies || 1,
          completed: (gameState.enemiesDefeated || 0) >= (gameState.totalEnemies || 1)
        };
        
      case 'Survive':
        return {
          id: objective.id,
          description: objective.description,
          progress: gameState.currentTurn || 0,
          target: objective.timeLimit || 10,
          completed: (gameState.currentTurn || 0) >= (objective.timeLimit || 10)
        };
        
      case 'Capture':
        return {
          id: objective.id,
          description: objective.description,
          progress: gameState.capturedPoints || 0,
          target: objective.quantity || 1,
          completed: (gameState.capturedPoints || 0) >= (objective.quantity || 1)
        };
        
      case 'Escort':
        return {
          id: objective.id,
          description: objective.description,
          progress: gameState.escortedUnits || 0,
          target: objective.quantity || 1,
          completed: (gameState.escortedUnits || 0) >= (objective.quantity || 1)
        };
        
      default:
        return {
          id: objective.id,
          description: objective.description,
          progress: 0,
          target: 1,
          completed: false
        };
    }
  }
}

// Type definitions for campaign integration
export interface BattleConditions {
  environment?: string;
  weather?: string;
  mapSize?: string;
  turnLimit?: number;
  specialRules?: string[];
  victoryConditions?: VictoryCondition[];
}

export interface VictoryCondition {
  id: string;
  type: string;
  description: string;
  target?: string;
  quantity?: number;
  timeLimit?: number;
  isOptional: boolean;
  isCompleted: boolean;
}

export interface MissionResult {
  success: boolean;
  score: number;
  rewards: any[];
  unlockedContent?: string[];
  nextMission?: CampaignMission | null;
}

export interface ObjectiveProgress {
  id: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}