// RecruitmentManager.ts
import {
  RecruitmentState,
  RecruitableUnit,
  TrainingSession,
  TrainingOpponent,
  RecruitmentRecord,
  TrainingRecord
} from './types';
import {
  BASIC_RECRUITABLE_UNITS,
  TRAINING_OPPONENTS,
  TRAINING_FACILITIES
} from './RecruitmentData';
import { Unit } from '../units/Unit';
import { Race, Archetype } from '../units/types';

export class RecruitmentManager {
  private state: RecruitmentState;
  private listeners: Array<(state: RecruitmentState) => void> = [];
  private timerInterval?: NodeJS.Timeout; // NodeJS.Timeout in Node, number in browser

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

  /* ------------------------------------------------------------------ */
  /*  INITIALISATION                                                     */
  /* ------------------------------------------------------------------ */
  private initializeSystem(): void {
    this.checkDailyRefresh();
    this.updateUnitRequirements();
    this.updateTrainingAvailability();
  }

  /* ------------------------------------------------------------------ */
  /*  LISTENER HELPERS                                                   */
  /* ------------------------------------------------------------------ */
  public subscribe(listener: (state: RecruitmentState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn(this.state));
  }

  public getState(): RecruitmentState {
    return { ...this.state };
  }

  /* ------------------------------------------------------------------ */
  /*  RECRUITMENT                                                        */
  /* ------------------------------------------------------------------ */
  public getAvailableUnits(): RecruitableUnit[] {
    return this.state.pool.availableUnits.filter(
      u => this.state.pool.unlockedUnits.includes(u.id) && this.checkUnitRequirements(u)
    );
  }

  public canRecruitUnit(unitId: string): { canRecruit: boolean; reason?: string } {
    const unit = this.state.pool.availableUnits.find(u => u.id === unitId);
    if (!unit) return { canRecruit: false, reason: 'Unit not found' };

    if (!this.state.pool.unlockedUnits.includes(unitId))
      return { canRecruit: false, reason: 'Unit not unlocked' };

    if (!this.checkUnitRequirements(unit)) {
      const unmet = unit.requirements.find(r => !r.isMet);
      return { canRecruit: false, reason: unmet?.description || 'Requirements not met' };
    }

    if (unit.maxRecruits && (unit.currentRecruits || 0) >= unit.maxRecruits)
      return { canRecruit: false, reason: 'Maximum recruits reached' };

    if (!this.hasEnoughResources(unit.cost))
      return { canRecruit: false, reason: 'Insufficient resources' };

    return { canRecruit: true };
  }

  public recruitUnit(unitId: string): Unit | null {
    const check = this.canRecruitUnit(unitId);
    if (!check.canRecruit) return null;

    const recruitable = this.state.pool.availableUnits.find(u => u.id === unitId)!;
    this.deductResources(recruitable.cost);

    const unit = this.createUnitFromRecruitableUnit(recruitable);

    if (recruitable.maxRecruits)
      recruitable.currentRecruits = (recruitable.currentRecruits || 0) + 1;

    this.state.pool.recruitmentHistory.push({
      unitId: recruitable.id,
      unitName: recruitable.name,
      recruitedAt: new Date(),
      cost: recruitable.cost,
      source: 'Standard'
    });

    this.notifyListeners();
    return unit;
  }

  private createUnitFromRecruitableUnit(src: RecruitableUnit): Unit {
    const race = src.race.toLowerCase() as Race;
    const archetype = src.archetype as Archetype;
    const id = `${src.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return new Unit(id, src.name, race, archetype, 1);
  }

  /* ------------------------------------------------------------------ */
  /*  REQUIREMENTS / RESOURCES                                           */
  /* ------------------------------------------------------------------ */
  private hasEnoughResources(_cost: any): boolean {
    // TODO: integrate with player inventory
    return true;
  }

  private deductResources(_cost: any): void {
    // TODO: integrate with player inventory
  }

  private checkUnitRequirements(unit: RecruitableUnit): boolean {
    return unit.requirements.every(r => r.isMet);
  }

  private updateUnitRequirements(): void {
    this.state.pool.availableUnits.forEach(u =>
      u.requirements.forEach(r => (r.isMet = this.evaluateRequirement(r)))
    );
  }

  private evaluateRequirement(req: any): boolean {
    switch (req.type) {
      case 'Achievement':
        return this.state.achievements.includes(req.value);
      case 'Level':
        return true; // TODO: check player level
      case 'Campaign':
        return true; // TODO: check campaign progress
      case 'Training':
        return this.state.unlockedContent.includes(req.value);
      case 'Reputation':
        return this.state.playerReputation >= req.value;
      case 'Units':
        return true; // TODO: check trained units
      default:
        return false;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  TRAINING                                                           */
  /* ------------------------------------------------------------------ */
  public getAvailableOpponents(): TrainingOpponent[] {
    return this.state.trainingGrounds.availableOpponents.filter(o => o.isUnlocked);
  }

  public canTrainAgainst(
    opponentId: string,
    unitLevel: number
  ): { canTrain: boolean; reason?: string } {
    const opp = this.state.trainingGrounds.availableOpponents.find(o => o.id === opponentId);
    if (!opp) return { canTrain: false, reason: 'Opponent not found' };
    if (!opp.isUnlocked) return { canTrain: false, reason: 'Opponent not unlocked' };

    const lvlReq = opp.unlockRequirements.find(r => r.type === 'Level');
    if (lvlReq) {
      const requiredLevel = typeof lvlReq.value === 'string' ? parseInt(lvlReq.value, 10) : lvlReq.value;
      if (unitLevel < requiredLevel)
        return { canTrain: false, reason: `Unit must be level ${requiredLevel} or higher` };
    }

    return { canTrain: true };
  }

  /* ---------------- TIMER MANAGEMENT --------------------------------- */
  private ensureTimerRunning(): void {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      let changed = false;
      this.state.trainingGrounds.activeTraining.forEach(s => {
        if (typeof s.timer === 'number') {
          s.timer = Math.max(0, s.timer - 1000);
          if (s.timer === 0) changed = true;
        }
      });
      if (changed) this.notifyListeners();
    }, 1000);
  }

  private maybeStopTimer(): void {
    const stillRunning = this.state.trainingGrounds.activeTraining.some(
      s => typeof s.timer === 'number' && s.timer > 0
    );
    if (!stillRunning && this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  /* ---------------- SESSION START / COMPLETE -------------------------- */
  public startTrainingSession(unitId: string, opponentId: string): TrainingSession | null {
    const opponent = this.state.trainingGrounds.availableOpponents.find(o => o.id === opponentId);
    if (!opponent) return null;

    const durationMinutes = this.calculateTrainingDuration(opponent.difficulty);
    const durationMs = durationMinutes * 60 * 1000;

    const session: TrainingSession = {
      id: `training-${Date.now()}`,
      unitId,
      opponentId,
      startTime: new Date(),
      duration: durationMinutes,
      status: 'Active',
      battleGrid: this.generateTrainingGrid(opponent.difficulty),
      timer: durationMs
    };

    this.state.trainingGrounds.activeTraining.push(session);
    this.ensureTimerRunning();
    this.notifyListeners();
    return session;
  }

  private calculateTrainingDuration(difficulty: string): number {
    const base = { Novice: 5, Adept: 10, Expert: 15, Master: 20, Grandmaster: 30 }[difficulty] || 10;
    const speedBonus = this.getTrainingSpeedBonus();
    return Math.max(1, Math.floor(base * (1 - speedBonus)));
  }

  private getTrainingSpeedBonus(): number {
    return this.state.trainingGrounds.facilities
      .filter(f => f.isUnlocked)
      .reduce((acc, f) => acc + (f.bonuses.find(b => b.type === 'TrainingSpeed')?.value || 0), 0);
  }

  public completeTrainingSession(
    sessionId: string,
    result: 'Victory' | 'Defeat' | 'Draw'
  ): TrainingRecord | null {
    const idx = this.state.trainingGrounds.activeTraining.findIndex(s => s.id === sessionId);
    if (idx === -1) return null;

    const [session] = this.state.trainingGrounds.activeTraining.splice(idx, 1);
    this.maybeStopTimer();

    const opponent = this.state.trainingGrounds.availableOpponents.find(o => o.id === session.opponentId);
    if (!opponent) return null;

    session.status = result === 'Victory' ? 'Completed' : 'Failed';

    const experienceGained = this.calculateTrainingExperience(opponent, result);
    const skillsLearned = this.determineSkillsLearned(opponent, result);

    // look up unit name
    const recruitable = this.state.pool.availableUnits.find(u => u.id === session.unitId);
    const unitName = recruitable ? recruitable.name : 'Unknown Unit';

    const record: TrainingRecord = {
      sessionId: session.id,
      unitId: session.unitId,
      unitName,
      opponentId: opponent.id,
      opponentName: opponent.name,
      result,
      duration: session.duration,
      experienceGained,
      skillsLearned,
      completedAt: new Date(),
      battleLog: []
    };

    // update opponent stats
    opponent.battleCount++;
    if (result === 'Victory') {
      opponent.winRate = (opponent.winRate * (opponent.battleCount - 1) + 1) / opponent.battleCount;
    } else {
      opponent.winRate = (opponent.winRate * (opponent.battleCount - 1)) / opponent.battleCount;
    }

    this.state.trainingGrounds.completedSessions.push(record);
    this.checkTrainingUnlocks(record);
    this.notifyListeners();
    return record;
  }

  private calculateTrainingExperience(opponent: TrainingOpponent, result: string): number {
    const base = opponent.rewards.find(r => r.type === 'Experience')?.amount || 0;
    const mult = { Victory: 1, Draw: 0.7, Defeat: 0.3 }[result] || 0.5;
    return Math.floor(base * mult * this.getExperienceMultiplier());
  }

  private getExperienceMultiplier(): number {
    return this.state.trainingGrounds.facilities
      .filter(f => f.isUnlocked)
      .reduce((acc, f) => acc * (f.bonuses.find(b => b.type === 'ExperienceMultiplier')?.value || 1), 1);
  }

  private determineSkillsLearned(opponent: TrainingOpponent, result: string): string[] {
    if (result !== 'Victory') return [];

    const skillRewards = opponent.rewards.filter(r => r.type === 'Skill');
    const learned: string[] = [];
    const chance = Math.min(0.8, 0.3 + this.getSkillLearnChance());

    skillRewards.forEach(r => {
      if (Math.random() < chance && r.skillId) learned.push(r.skillId);
    });

    return learned;
  }

  private getSkillLearnChance(): number {
    return this.state.trainingGrounds.facilities
      .filter(f => f.isUnlocked)
      .reduce((acc, f) => acc + (f.bonuses.find(b => b.type === 'SkillChance')?.value || 0), 0);
  }

  /* ------------------------------------------------------------------ */
  /*  UNLOCKS / ACHIEVEMENTS                                             */
  /* ------------------------------------------------------------------ */
  private checkTrainingUnlocks(record: TrainingRecord): void {
    if (record.result === 'Victory') this.checkAchievementProgress(record);
    this.updateTrainingAvailability();
  }

  private checkAchievementProgress(record: TrainingRecord): void {
    const victories = this.state.trainingGrounds.completedSessions.filter(s => s.result === 'Victory')
      .length;

    if (victories === 1 && !this.state.achievements.includes('first-training-victory'))
      this.state.achievements.push('first-training-victory');

    if (victories >= 10 && !this.state.achievements.includes('training-veteran'))
      this.state.achievements.push('training-veteran');
  }

  private updateTrainingAvailability(): void {
    this.state.trainingGrounds.availableOpponents.forEach(op => {
      if (!op.isUnlocked) op.isUnlocked = op.unlockRequirements.every(r => this.evaluateRequirement(r));
    });
  }

  public unlockAchievement(achievementId: string): void {
    if (this.state.achievements.includes(achievementId)) return;
    this.state.achievements.push(achievementId);
    this.updateUnitRequirements();
    this.checkForNewUnlocks(achievementId);
    this.notifyListeners();
  }

  private checkForNewUnlocks(achievementId: string): void {
    // units
    this.state.pool.availableUnits.forEach(u => {
      if (
        !this.state.pool.unlockedUnits.includes(u.id) &&
        u.requirements.some(r => r.type === 'Achievement' && r.value === achievementId) &&
        this.checkUnitRequirements(u)
      )
        this.state.pool.unlockedUnits.push(u.id);
    });
    // TODO: facilities
  }

  /* ------------------------------------------------------------------ */
  /*  DAILY REFRESH                                                      */
  /* ------------------------------------------------------------------ */
  private checkDailyRefresh(): void {
    const now = new Date();
    const last = this.state.pool.dailyRefresh;
    if (
      now.getDate() !== last.getDate() ||
      now.getMonth() !== last.getMonth() ||
      now.getFullYear() !== last.getFullYear()
    ) {
      this.performDailyRefresh();
      this.state.pool.dailyRefresh = now;
    }
  }

  private performDailyRefresh(): void {
    this.state.pool.availableUnits.forEach(u => {
      if (u.availability === 'Limited') u.currentRecruits = 0;
    });
    this.generateWeeklySpecials();
  }

  private generateWeeklySpecials(): void {
    // stub
  }

  /* ------------------------------------------------------------------ */
  /*  SERIALISATION                                                      */
  /* ------------------------------------------------------------------ */
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

  public loadState(json: string): void {
    try {
      const data = JSON.parse(json);
      this.state = { ...this.state, ...data };
      this.updateUnitRequirements();
      this.updateTrainingAvailability();
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to load recruitment state:', e);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  GRID GENERATION UTILITIES                                          */
  /* ------------------------------------------------------------------ */
  private generateTrainingGrid(difficulty: string): any {
    const sizes: Record<string, { width: number; height: number }> = {
      Novice: { width: 6, height: 6 },
      Adept: { width: 8, height: 8 },
      Expert: { width: 10, height: 8 },
      Master: { width: 10, height: 10 },
      Grandmaster: { width: 12, height: 10 }
    };
    const size = sizes[difficulty] || { width: 8, height: 8 };
    return {
      size,
      playerPosition: { x: 1, y: Math.floor(size.height / 2) },
      opponentPosition: { x: size.width - 2, y: Math.floor(size.height / 2) },
      obstacles: this.generateObstacles(size, difficulty),
      terrain: this.generateTerrain(size, difficulty)
    };
  }

  private generateObstacles(size: any, difficulty: string): any[] {
    const count = { Novice: 2, Adept: 4, Expert: 6, Master: 8, Grandmaster: 10 }[difficulty] || 4;
    return Array.from({ length: count }, () => ({
      position: {
        x: Math.floor(Math.random() * (size.width - 4)) + 2,
        y: Math.floor(Math.random() * (size.height - 2)) + 1
      },
      type: ['Wall', 'Pillar', 'Pit'][Math.floor(Math.random() * 3)],
      blocksMovement: true,
      blocksVision: Math.random() > 0.5
    }));
  }

  private generateTerrain(size: any, difficulty: string): any[] {
    const density = { Novice: 0.1, Adept: 0.15, Expert: 0.2, Master: 0.25, Grandmaster: 0.3 }[
      difficulty
    ] || 0.15;
    const out: any[] = [];
    for (let x = 0; x < size.width; x++)
      for (let y = 0; y < size.height; y++)
        if (Math.random() < density)
          out.push({
            position: { x, y },
            type: ['Difficult', 'Hazardous', 'Beneficial'][Math.floor(Math.random() * 3)],
            movementCost: Math.random() > 0.7 ? 2 : 1,
            effects: []
          });
    return out;
  }
}