import { RecruitmentState, RecruitableUnit, TrainingSession, TrainingOpponent, RecruitmentRecord, TrainingRecord } from './types';
import { BASIC_RECRUITABLE_UNITS, TRAINING_OPPONENTS, TRAINING_FACILITIES } from './RecruitmentData';
import { Unit } from '../units/Unit';

export class RecruitmentManager {
  private state: RecruitmentState;
  private listeners: Array<(state: RecruitmentState) => void> = [];

  constructor() {
    this.state = {
      pool: {
        availableUnits: [...BASIC_RECRUITABLE_UNITS],
        unlockedUnits: ['human-militia', 'elf-scout', 'dwarf-defender'],
        recruitmentHistory: [],
        dailyRefresh: new Date(),
        weeklySpecials: []
      },
      trainingGrounds: {
        availableOpponents: [...TRAINING_OPPONENTS],
        activeTraining: [],
        completedSessions: [],
        facilities: [...TRAINING_FACILITIES]
      },
      playerReputation: 0,
      playerInfluence: 0,
      achievements: [],
      unlockedContent: []
    };

    this.initializeSystem();
  }

  private initializeSystem(): void {
    // Check daily refresh
    this.checkDailyRefresh();
    
    // Update unit requirements based on current state
    this.updateUnitRequirements();
    
    // Update training opponent availability
    this.updateTrainingAvailability();
  }

  public subscribe(listener: (state: RecruitmentState) => void): () => void {
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

  public getState(): RecruitmentState {
    return { ...this.state };
  }

  public getAvailableUnits(): RecruitableUnit[] {
    return this.state.pool.availableUnits.filter(unit => 
      this.state.pool.unlockedUnits.includes(unit.id) &&
      this.checkUnitRequirements(unit)
    );
  }

  public canRecruitUnit(unitId: string): { canRecruit: boolean; reason?: string } {
    const unit = this.state.pool.availableUnits.find(u => u.id === unitId);
    if (!unit) {
      return { canRecruit: false, reason: 'Unit not found' };
    }

    if (!this.state.pool.unlockedUnits.includes(unitId)) {
      return { canRecruit: false, reason: 'Unit not unlocked' };
    }

    if (!this.checkUnitRequirements(unit)) {
      const unmetReq = unit.requirements.find(req => !req.isMet);
      return { canRecruit: false, reason: unmetReq?.description || 'Requirements not met' };
    }

    if (unit.maxRecruits && unit.currentRecruits && unit.currentRecruits >= unit.maxRecruits) {
      return { canRecruit: false, reason: 'Maximum recruits reached' };
    }

    // Check if player has enough resources
    if (!this.hasEnoughResources(unit.cost)) {
      return { canRecruit: false, reason: 'Insufficient resources' };
    }

    return { canRecruit: true };
  }

  public recruitUnit(unitId: string): Unit | null {
    const recruitCheck = this.canRecruitUnit(unitId);
    if (!recruitCheck.canRecruit) {
      return null;
    }

    const recruitableUnit = this.state.pool.availableUnits.find(u => u.id === unitId);
    if (!recruitableUnit) return null;

    // Deduct resources
    this.deductResources(recruitableUnit.cost);

    // Create the actual unit
    const unit = this.createUnitFromRecruitableUnit(recruitableUnit);

    // Update recruitment tracking
    if (recruitableUnit.maxRecruits) {
      recruitableUnit.currentRecruits = (recruitableUnit.currentRecruits || 0) + 1;
    }

    // Add to recruitment history
    const record: RecruitmentRecord = {
      unitId: recruitableUnit.id,
      unitName: recruitableUnit.name,
      recruitedAt: new Date(),
      cost: recruitableUnit.cost,
      source: 'Standard'
    };
    this.state.pool.recruitmentHistory.push(record);

    this.notifyListeners();
    return unit;
  }

  private createUnitFromRecruitableUnit(recruitableUnit: RecruitableUnit): Unit {
    // This would integrate with your existing Unit creation system
    // For now, creating a basic unit structure
    const unit = new Unit(
      recruitableUnit.name,
      recruitableUnit.race as any,
      recruitableUnit.archetype as any
    );

    // Set base stats
    unit.baseStats = { ...recruitableUnit.baseStats };
    unit.currentHp = recruitableUnit.baseStats.hp;

    // Add special abilities
    // This would integrate with your ability system

    return unit;
  }

  private hasEnoughResources(cost: any): boolean {
    // This would check against actual player resources
    // For now, assuming player has enough gold
    return true;
  }

  private deductResources(cost: any): void {
    // This would deduct from actual player resources
    // Implementation depends on your resource system
  }

  private checkUnitRequirements(unit: RecruitableUnit): boolean {
    return unit.requirements.every(req => req.isMet);
  }

  private updateUnitRequirements(): void {
    this.state.pool.availableUnits.forEach(unit => {
      unit.requirements.forEach(req => {
        req.isMet = this.evaluateRequirement(req);
      });
    });
  }

  private evaluateRequirement(req: any): boolean {
    switch (req.type) {
      case 'Achievement':
        return this.state.achievements.includes(req.value);
      case 'Level':
        // This would check player level
        return true; // Placeholder
      case 'Campaign':
        // This would check campaign completion
        return true; // Placeholder
      case 'Training':
        return this.state.unlockedContent.includes(req.value);
      case 'Reputation':
        return this.state.playerReputation >= req.value;
      case 'Units':
        // This would check trained units
        return true; // Placeholder
      default:
        return false;
    }
  }

  // Training System Methods
  public getAvailableOpponents(): TrainingOpponent[] {
    return this.state.trainingGrounds.availableOpponents.filter(opponent => 
      opponent.isUnlocked
    );
  }

  public canTrainAgainst(opponentId: string, unitLevel: number): { canTrain: boolean; reason?: string } {
    const opponent = this.state.trainingGrounds.availableOpponents.find(o => o.id === opponentId);
    if (!opponent) {
      return { canTrain: false, reason: 'Opponent not found' };
    }

    if (!opponent.isUnlocked) {
      return { canTrain: false, reason: 'Opponent not unlocked' };
    }

    // Check level requirements
    const levelReq = opponent.unlockRequirements.find(req => req.type === 'Level');
    if (levelReq && unitLevel < (levelReq.value as number)) {
      return { canTrain: false, reason: `Unit must be level ${levelReq.value} or higher` };
    }

    return { canTrain: true };
  }

  public startTrainingSession(unitId: string, opponentId: string): TrainingSession | null {
    const opponent = this.state.trainingGrounds.availableOpponents.find(o => o.id === opponentId);
    if (!opponent) return null;

    const session: TrainingSession = {
      id: `training-${Date.now()}`,
      unitId,
      opponentId,
      startTime: new Date(),
      duration: this.calculateTrainingDuration(opponent.difficulty),
      status: 'Active',
      battleGrid: this.generateTrainingGrid(opponent.difficulty)
    };

    this.state.trainingGrounds.activeTraining.push(session);
    this.notifyListeners();
    return session;
  }

  private calculateTrainingDuration(difficulty: string): number {
    const baseDuration = {
      'Novice': 5,
      'Adept': 10,
      'Expert': 15,
      'Master': 20,
      'Grandmaster': 30
    }[difficulty] || 10;

    // Apply facility bonuses
    const speedBonus = this.getTrainingSpeedBonus();
    return Math.max(1, Math.floor(baseDuration * (1 - speedBonus)));
  }

  private getTrainingSpeedBonus(): number {
    return this.state.trainingGrounds.facilities
      .filter(f => f.isUnlocked)
      .reduce((bonus, facility) => {
        const speedBonus = facility.bonuses.find(b => b.type === 'TrainingSpeed');
        return bonus + (speedBonus?.value || 0);
      }, 0);
  }

  private generateTrainingGrid(difficulty: string): any {
    const gridSizes = {
      'Novice': { width: 6, height: 6 },
      'Adept': { width: 8, height: 8 },
      'Expert': { width: 10, height: 8 },
      'Master': { width: 10, height: 10 },
      'Grandmaster': { width: 12, height: 10 }
    };

    const size = gridSizes[difficulty] || { width: 8, height: 8 };

    return {
      size,
      playerPosition: { x: 1, y: Math.floor(size.height / 2) },
      opponentPosition: { x: size.width - 2, y: Math.floor(size.height / 2) },
      obstacles: this.generateObstacles(size, difficulty),
      terrain: this.generateTerrain(size, difficulty)
    };
  }

  private generateObstacles(size: any, difficulty: string): any[] {
    const obstacleCount = {
      'Novice': 2,
      'Adept': 4,
      'Expert': 6,
      'Master': 8,
      'Grandmaster': 10
    }[difficulty] || 4;

    const obstacles = [];
    for (let i = 0; i < obstacleCount; i++) {
      obstacles.push({
        position: {
          x: Math.floor(Math.random() * (size.width - 4)) + 2,
          y: Math.floor(Math.random() * (size.height - 2)) + 1
        },
        type: ['Wall', 'Pillar', 'Pit'][Math.floor(Math.random() * 3)],
        blocksMovement: true,
        blocksVision: Math.random() > 0.5
      });
    }
    return obstacles;
  }

  private generateTerrain(size: any, difficulty: string): any[] {
    const terrain = [];
    const terrainDensity = {
      'Novice': 0.1,
      'Adept': 0.15,
      'Expert': 0.2,
      'Master': 0.25,
      'Grandmaster': 0.3
    }[difficulty] || 0.15;

    for (let x = 0; x < size.width; x++) {
      for (let y = 0; y < size.height; y++) {
        if (Math.random() < terrainDensity) {
          terrain.push({
            position: { x, y },
            type: ['Difficult', 'Hazardous', 'Beneficial'][Math.floor(Math.random() * 3)],
            movementCost: Math.random() > 0.7 ? 2 : 1,
            effects: []
          });
        }
      }
    }
    return terrain;
  }

  public completeTrainingSession(sessionId: string, result: 'Victory' | 'Defeat' | 'Draw'): TrainingRecord | null {
    const sessionIndex = this.state.trainingGrounds.activeTraining.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return null;

    const session = this.state.trainingGrounds.activeTraining[sessionIndex];
    const opponent = this.state.trainingGrounds.availableOpponents.find(o => o.id === session.opponentId);
    if (!opponent) return null;

    // Calculate rewards
    const experienceGained = this.calculateTrainingExperience(opponent, result);
    const skillsLearned = this.determineSkillsLearned(opponent, result);

    // Create training record
    const record: TrainingRecord = {
      sessionId: session.id,
      unitId: session.unitId,
      unitName: 'Unit Name', // This would come from actual unit
      opponentId: opponent.id,
      opponentName: opponent.name,
      result,
      duration: session.duration,
      experienceGained,
      skillsLearned,
      completedAt: new Date(),
      battleLog: []
    };

    // Update opponent stats
    opponent.battleCount++;
    if (result === 'Defeat') {
      opponent.winRate = (opponent.winRate * (opponent.battleCount - 1) + 1) / opponent.battleCount;
    } else {
      opponent.winRate = (opponent.winRate * (opponent.battleCount - 1)) / opponent.battleCount;
    }

    // Remove from active training and add to completed
    this.state.trainingGrounds.activeTraining.splice(sessionIndex, 1);
    this.state.trainingGrounds.completedSessions.push(record);

    // Check for unlocks
    this.checkTrainingUnlocks(record);

    this.notifyListeners();
    return record;
  }

  private calculateTrainingExperience(opponent: TrainingOpponent, result: string): number {
    const baseExp = opponent.rewards.find(r => r.type === 'Experience')?.amount || 0;
    const resultMultiplier = {
      'Victory': 1.0,
      'Draw': 0.7,
      'Defeat': 0.3
    }[result] || 0.5;

    const facilityBonus = this.getExperienceMultiplier();
    return Math.floor(baseExp * resultMultiplier * facilityBonus);
  }

  private getExperienceMultiplier(): number {
    return this.state.trainingGrounds.facilities
      .filter(f => f.isUnlocked)
      .reduce((multiplier, facility) => {
        const expBonus = facility.bonuses.find(b => b.type === 'ExperienceMultiplier');
        return multiplier * (expBonus?.value || 1);
      }, 1);
  }

  private determineSkillsLearned(opponent: TrainingOpponent, result: string): string[] {
    if (result !== 'Victory') return [];

    const skillRewards = opponent.rewards.filter(r => r.type === 'Skill');
    const learnedSkills: string[] = [];

    skillRewards.forEach(reward => {
      const baseChance = 0.3; // 30% base chance
      const facilityBonus = this.getSkillLearnChance();
      const totalChance = Math.min(0.8, baseChance + facilityBonus);

      if (Math.random() < totalChance && reward.skillId) {
        learnedSkills.push(reward.skillId);
      }
    });

    return learnedSkills;
  }

  private getSkillLearnChance(): number {
    return this.state.trainingGrounds.facilities
      .filter(f => f.isUnlocked)
      .reduce((chance, facility) => {
        const skillBonus = facility.bonuses.find(b => b.type === 'SkillChance');
        return chance + (skillBonus?.value || 0);
      }, 0);
  }

  private checkTrainingUnlocks(record: TrainingRecord): void {
    // Check for achievement unlocks
    if (record.result === 'Victory') {
      // Check for specific achievements based on opponent
      this.checkAchievementProgress(record);
    }

    // Check for new opponent unlocks
    this.updateTrainingAvailability();
  }

  private checkAchievementProgress(record: TrainingRecord): void {
    // This would integrate with your achievement system
    // For now, just adding some basic achievement logic
    
    const victoriesCount = this.state.trainingGrounds.completedSessions
      .filter(s => s.result === 'Victory').length;

    if (victoriesCount === 1 && !this.state.achievements.includes('first-training-victory')) {
      this.state.achievements.push('first-training-victory');
    }

    if (victoriesCount >= 10 && !this.state.achievements.includes('training-veteran')) {
      this.state.achievements.push('training-veteran');
    }
  }

  private updateTrainingAvailability(): void {
    this.state.trainingGrounds.availableOpponents.forEach(opponent => {
      if (!opponent.isUnlocked) {
        opponent.isUnlocked = opponent.unlockRequirements.every(req => 
          this.evaluateRequirement(req)
        );
      }
    });
  }

  public unlockAchievement(achievementId: string): void {
    if (!this.state.achievements.includes(achievementId)) {
      this.state.achievements.push(achievementId);
      this.updateUnitRequirements();
      this.checkForNewUnlocks(achievementId);
      this.notifyListeners();
    }
  }

  private checkForNewUnlocks(achievementId: string): void {
    // Check for unit unlocks
    this.state.pool.availableUnits.forEach(unit => {
      if (!this.state.pool.unlockedUnits.includes(unit.id)) {
        const hasAchievementReq = unit.requirements.some(req => 
          req.type === 'Achievement' && req.value === achievementId
        );
        
        if (hasAchievementReq && this.checkUnitRequirements(unit)) {
          this.state.pool.unlockedUnits.push(unit.id);
        }
      }
    });

    // Check for facility unlocks
    this.state.trainingGrounds.facilities.forEach(facility => {
      // Add facility unlock logic based on achievements
    });
  }

  private checkDailyRefresh(): void {
    const now = new Date();
    const lastRefresh = this.state.pool.dailyRefresh;
    
    if (now.getDate() !== lastRefresh.getDate() || 
        now.getMonth() !== lastRefresh.getMonth() || 
        now.getFullYear() !== lastRefresh.getFullYear()) {
      
      this.performDailyRefresh();
      this.state.pool.dailyRefresh = now;
    }
  }

  private performDailyRefresh(): void {
    // Reset daily recruitment limits
    this.state.pool.availableUnits.forEach(unit => {
      if (unit.availability === 'Limited') {
        unit.currentRecruits = 0;
      }
    });

    // Generate weekly specials
    this.generateWeeklySpecials();
  }

  private generateWeeklySpecials(): void {
    // This would generate special recruitment offers
    // Implementation depends on your game design
  }

  public saveState(): string {
    return JSON.stringify({
      pool: this.state.pool,
      trainingGrounds: this.state.trainingGrounds,
      playerReputation: this.state.playerReputation,
      playerInfluence: this.state.playerInfluence,
      achievements: this.state.achievements,
      unlockedContent: this.state.unlockedContent
    });
  }

  public loadState(savedState: string): void {
    try {
      const data = JSON.parse(savedState);
      this.state = { ...this.state, ...data };
      this.updateUnitRequirements();
      this.updateTrainingAvailability();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load recruitment state:', error);
    }
  }
}