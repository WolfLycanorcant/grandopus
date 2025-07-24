import { Campaign, CampaignMission, CampaignProgress, CampaignState, MissionObjective } from './types';
import { ALL_CAMPAIGNS } from './CampaignData';

export class CampaignManager {
  private state: CampaignState;
  private listeners: Array<(state: CampaignState) => void> = [];

  constructor() {
    this.state = {
      availableCampaigns: [...ALL_CAMPAIGNS],
      campaignProgress: {},
      unlockedContent: []
    };
    this.initializeCampaigns();
  }

  private initializeCampaigns(): void {
    // Initialize progress for all campaigns
    this.state.availableCampaigns.forEach(campaign => {
      if (!this.state.campaignProgress[campaign.id]) {
        this.state.campaignProgress[campaign.id] = {
          campaignId: campaign.id,
          completedMissions: [],
          totalScore: 0,
          achievements: [],
          statistics: {
            battlesWon: 0,
            battlesLost: 0,
            unitsLost: 0,
            enemiesDefeated: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            perfectVictories: 0,
            fastestCompletion: 0
          }
        };
      }
    });

    // Unlock tutorial campaign by default
    const tutorialCampaign = this.state.availableCampaigns.find(c => c.id === 'tutorial');
    if (tutorialCampaign) {
      tutorialCampaign.missions[0].isUnlocked = true;
    }
  }

  public subscribe(listener: (state: CampaignState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  public getState(): CampaignState {
    return { ...this.state };
  }

  public getCampaign(campaignId: string): Campaign | undefined {
    return this.state.availableCampaigns.find(c => c.id === campaignId);
  }

  public getMission(campaignId: string, missionId: string): CampaignMission | undefined {
    const campaign = this.getCampaign(campaignId);
    return campaign?.missions.find(m => m.id === missionId);
  }

  public startCampaign(campaignId: string): boolean {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return false;

    this.state.activeCampaign = campaign;
    this.notifyListeners();
    return true;
  }

  public startMission(campaignId: string, missionId: string): CampaignMission | null {
    const mission = this.getMission(campaignId, missionId);
    if (!mission || !mission.isUnlocked) return null;

    const progress = this.state.campaignProgress[campaignId];
    if (progress) {
      progress.currentMission = missionId;
    }

    this.notifyListeners();
    return mission;
  }

  public completeMission(
    campaignId: string, 
    missionId: string, 
    score: number, 
    completionTime: number,
    objectivesCompleted: string[]
  ): void {
    const campaign = this.getCampaign(campaignId);
    const mission = this.getMission(campaignId, missionId);
    
    if (!campaign || !mission) return;

    // Mark mission as completed
    mission.isCompleted = true;
    mission.bestScore = Math.max(mission.bestScore || 0, score);
    mission.completionTime = Math.min(mission.completionTime || Infinity, completionTime);

    // Update objectives
    mission.objectives.forEach(objective => {
      if (objectivesCompleted.includes(objective.id)) {
        objective.isCompleted = true;
      }
    });

    // Update campaign progress
    const progress = this.state.campaignProgress[campaignId];
    if (progress) {
      if (!progress.completedMissions.includes(missionId)) {
        progress.completedMissions.push(missionId);
      }
      progress.totalScore += score;
      progress.currentMission = undefined;

      // Update statistics
      progress.statistics.battlesWon++;
      if (this.isPerfectVictory(mission)) {
        progress.statistics.perfectVictories++;
      }
    }

    // Unlock next mission
    this.unlockNextMission(campaign, missionId);

    // Check for campaign completion
    this.checkCampaignCompletion(campaign);

    this.notifyListeners();
  }

  public failMission(campaignId: string, missionId: string): void {
    const progress = this.state.campaignProgress[campaignId];
    if (progress) {
      progress.statistics.battlesLost++;
      progress.currentMission = undefined;
    }
    this.notifyListeners();
  }

  private unlockNextMission(campaign: Campaign, completedMissionId: string): void {
    const completedIndex = campaign.missions.findIndex(m => m.id === completedMissionId);
    if (completedIndex >= 0 && completedIndex < campaign.missions.length - 1) {
      const nextMission = campaign.missions[completedIndex + 1];
      if (this.checkMissionRequirements(nextMission)) {
        nextMission.isUnlocked = true;
      }
    }

    // Check if this completion unlocks missions in other campaigns
    this.checkCrossCampaignUnlocks(completedMissionId);
  }

  private checkMissionRequirements(mission: CampaignMission): boolean {
    return mission.requirements.every(req => {
      switch (req.type) {
        case 'Mission':
          return this.isMissionCompleted(req.value as string);
        case 'Level':
          // TODO: Integrate with player level system
          return true;
        case 'Units':
          // TODO: Check unit requirements
          return true;
        case 'Resources':
          // TODO: Check resource requirements
          return true;
        default:
          return true;
      }
    });
  }

  private isMissionCompleted(missionId: string): boolean {
    for (const progress of Object.values(this.state.campaignProgress)) {
      if (progress.completedMissions.includes(missionId)) {
        return true;
      }
    }
    return false;
  }

  private checkCrossCampaignUnlocks(completedMissionId: string): void {
    // Unlock main campaigns after tutorial
    if (completedMissionId === 'tutorial-2') {
      this.state.availableCampaigns.forEach(campaign => {
        if (campaign.id !== 'tutorial' && campaign.missions.length > 0) {
          campaign.missions[0].isUnlocked = true;
        }
      });
    }
  }

  private isPerfectVictory(mission: CampaignMission): boolean {
    return mission.objectives.every(obj => obj.isCompleted);
  }

  private checkCampaignCompletion(campaign: Campaign): void {
    const allMissionsCompleted = campaign.missions.every(m => m.isCompleted);
    if (allMissionsCompleted && !campaign.isCompleted) {
      campaign.isCompleted = true;
      campaign.completionDate = new Date();
      
      // Unlock rewards or new content
      this.unlockCampaignRewards(campaign.id);
    }
  }

  private unlockCampaignRewards(campaignId: string): void {
    switch (campaignId) {
      case 'tutorial':
        this.state.unlockedContent.push('advanced-formations');
        break;
      case 'rise-of-kingdoms':
        this.state.unlockedContent.push('legendary-units');
        break;
      case 'shadow-war':
        this.state.unlockedContent.push('shadow-magic');
        break;
    }
  }

  public getCampaignProgress(campaignId: string): CampaignProgress | undefined {
    return this.state.campaignProgress[campaignId];
  }

  public getAvailableMissions(campaignId: string): CampaignMission[] {
    const campaign = this.getCampaign(campaignId);
    return campaign?.missions.filter(m => m.isUnlocked) || [];
  }

  public getCompletedMissions(campaignId: string): CampaignMission[] {
    const campaign = this.getCampaign(campaignId);
    return campaign?.missions.filter(m => m.isCompleted) || [];
  }

  public getCurrentMission(): CampaignMission | null {
    if (!this.state.activeCampaign) return null;
    
    for (const progress of Object.values(this.state.campaignProgress)) {
      if (progress.currentMission) {
        return this.getMission(progress.campaignId, progress.currentMission) || null;
      }
    }
    return null;
  }

  public updateMissionObjective(
    campaignId: string, 
    missionId: string, 
    objectiveId: string, 
    completed: boolean
  ): void {
    const mission = this.getMission(campaignId, missionId);
    if (mission) {
      const objective = mission.objectives.find(obj => obj.id === objectiveId);
      if (objective) {
        objective.isCompleted = completed;
        this.notifyListeners();
      }
    }
  }

  public saveState(): string {
    return JSON.stringify({
      campaignProgress: this.state.campaignProgress,
      unlockedContent: this.state.unlockedContent,
      activeCampaignId: this.state.activeCampaign?.id
    });
  }

  public loadState(savedState: string): void {
    try {
      const data = JSON.parse(savedState);
      
      if (data.campaignProgress) {
        this.state.campaignProgress = data.campaignProgress;
      }
      
      if (data.unlockedContent) {
        this.state.unlockedContent = data.unlockedContent;
      }
      
      if (data.activeCampaignId) {
        this.state.activeCampaign = this.getCampaign(data.activeCampaignId);
      }

      // Restore mission unlock states based on progress
      this.restoreMissionStates();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load campaign state:', error);
    }
  }

  private restoreMissionStates(): void {
    this.state.availableCampaigns.forEach(campaign => {
      const progress = this.state.campaignProgress[campaign.id];
      if (progress) {
        campaign.missions.forEach(mission => {
          mission.isCompleted = progress.completedMissions.includes(mission.id);
          if (mission.isCompleted || this.checkMissionRequirements(mission)) {
            mission.isUnlocked = true;
          }
        });
      }
    });
  }
}