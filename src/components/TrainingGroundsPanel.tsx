import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sword, 
  Shield, 
  Clock, 
  Trophy, 
  Star,
  Play,
  CheckCircle,
  AlertCircle,
  Zap,
  Crown,
  Lock,
  TrendingUp,
  Grid3X3
} from 'lucide-react';
import { RecruitmentManager } from '../core/recruitment/RecruitmentManager';
import { RecruitmentState, TrainingOpponent, TrainingSession } from '../core/recruitment/types';

interface TrainingGroundsPanelProps {
  recruitmentManager: RecruitmentManager;
  availableUnits: any[]; // This would be your actual Unit type
  onTrainingComplete?: (unitId: string, result: any) => void;
}

export const TrainingGroundsPanel: React.FC<TrainingGroundsPanelProps> = ({ 
  recruitmentManager, 
  availableUnits,
  onTrainingComplete 
}) => {
  const [recruitmentState, setRecruitmentState] = useState<RecruitmentState>(recruitmentManager.getState());
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<TrainingOpponent | null>(null);
  const [activeTab, setActiveTab] = useState<'opponents' | 'active' | 'history' | 'facilities'>('opponents');
  const [showBattleGrid, setShowBattleGrid] = useState(false);

  useEffect(() => {
    const unsubscribe = recruitmentManager.subscribe(setRecruitmentState);
    return unsubscribe;
  }, [recruitmentManager]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Novice': return 'text-green-400 bg-green-400/20';
      case 'Adept': return 'text-blue-400 bg-blue-400/20';
      case 'Expert': return 'text-yellow-400 bg-yellow-400/20';
      case 'Master': return 'text-orange-400 bg-orange-400/20';
      case 'Grandmaster': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Novice': return '●';
      case 'Adept': return '◆';
      case 'Expert': return '★';
      case 'Master': return '♦';
      case 'Grandmaster': return '👑';
      default: return '●';
    }
  };

  const handleStartTraining = (unitId: string, opponentId: string) => {
    const session = recruitmentManager.startTrainingSession(unitId, opponentId);
    if (session) {
      setSelectedOpponent(null);
      setSelectedUnit(null);
    }
  };

  const handleCompleteTraining = (sessionId: string, result: 'Victory' | 'Defeat' | 'Draw') => {
    const record = recruitmentManager.completeTrainingSession(sessionId, result);
    if (record) {
      onTrainingComplete?.(record.unitId, record);
    }
  };

  const availableOpponents = recruitmentManager.getAvailableOpponents();
  const activeTraining = recruitmentState.trainingGrounds.activeTraining;
  const completedSessions = recruitmentState.trainingGrounds.completedSessions;
  const facilities = recruitmentState.trainingGrounds.facilities;

  if (selectedOpponent && selectedUnit) {
    const canTrain = recruitmentManager.canTrainAgainst(selectedOpponent.id, selectedUnit.level || 1);
    
    return (
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { setSelectedOpponent(null); setSelectedUnit(null); }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Training Grounds
          </button>
          <button
            onClick={() => setShowBattleGrid(!showBattleGrid)}
            className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            <Grid3X3 className="h-4 w-4" />
            {showBattleGrid ? 'Hide' : 'Show'} Battle Grid
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Training Setup */}
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Your Unit</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Sword className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{selectedUnit.name}</h4>
                  <p className="text-slate-400 text-sm">Level {selectedUnit.level || 1} • {selectedUnit.race} {selectedUnit.archetype}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Training Opponent</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{selectedOpponent.name}</h4>
                    <p className="text-slate-400 text-sm">{selectedOpponent.title}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getDifficultyColor(selectedOpponent.difficulty)}`}>
                      <span>{getDifficultyIcon(selectedOpponent.difficulty)}</span>
                      <span>{selectedOpponent.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm">{selectedOpponent.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Level:</span>
                    <span className="text-white">{selectedOpponent.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Battles:</span>
                    <span className="text-white">{selectedOpponent.battleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="text-white">{(selectedOpponent.winRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Opponent Stats */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Opponent Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-slate-300 text-sm">HP:</span>
                  <span className="text-white font-medium">{selectedOpponent.stats.hp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-slate-300 text-sm">Attack:</span>
                  <span className="text-white font-medium">{selectedOpponent.stats.attack}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-slate-300 text-sm">Defense:</span>
                  <span className="text-white font-medium">{selectedOpponent.stats.defense}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-slate-300 text-sm">Speed:</span>
                  <span className="text-white font-medium">{selectedOpponent.stats.speed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="text-slate-300 text-sm">Magic:</span>
                  <span className="text-white font-medium">{selectedOpponent.stats.magic}</span>
                </div>
              </div>
            </div>

            {/* Abilities */}
            {selectedOpponent.abilities.length > 0 && (
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Special Abilities</h3>
                <div className="space-y-2">
                  {selectedOpponent.abilities.map((ability, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-yellow-400" />
                      <span className="text-slate-300 text-sm">{ability}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rewards and Training */}
          <div className="space-y-4">
            {/* Training Rewards */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Training Rewards
              </h3>
              <div className="space-y-2">
                {selectedOpponent.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-yellow-400">
                      {reward.type === 'Experience' && '⭐'}
                      {reward.type === 'Gold' && '💰'}
                      {reward.type === 'Skill' && '📚'}
                      {reward.type === 'Achievement' && '🏆'}
                      {reward.type === 'Unlock' && '🔓'}
                    </div>
                    <span className="text-white text-sm">{reward.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Battle Grid Preview */}
            {showBattleGrid && (
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Battle Grid Preview</h3>
                <div className="bg-slate-800 rounded p-3">
                  <div className="grid grid-cols-8 gap-1 max-w-64 mx-auto">
                    {Array.from({ length: 64 }, (_, i) => {
                      const x = i % 8;
                      const y = Math.floor(i / 8);
                      const isPlayer = x === 1 && y === 4;
                      const isOpponent = x === 6 && y === 4;
                      const isObstacle = Math.random() > 0.85;
                      
                      return (
                        <div
                          key={i}
                          className={`w-6 h-6 border border-slate-600 flex items-center justify-center text-xs ${
                            isPlayer ? 'bg-blue-500' : 
                            isOpponent ? 'bg-red-500' :
                            isObstacle ? 'bg-slate-600' : 'bg-slate-700'
                          }`}
                        >
                          {isPlayer && '👤'}
                          {isOpponent && '🎯'}
                          {isObstacle && '■'}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center gap-4 mt-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      <span>Your Unit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded" />
                      <span>Opponent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-slate-600 rounded" />
                      <span>Obstacle</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Start Training */}
            <div className="pt-4">
              {canTrain.canTrain ? (
                <button
                  onClick={() => handleStartTraining(selectedUnit.id, selectedOpponent.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  Start Training Session
                </button>
              ) : (
                <div className="w-full bg-slate-600 text-slate-400 font-medium py-3 px-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Lock className="h-4 w-4" />
                    Cannot Train
                  </div>
                  <div className="text-xs">{canTrain.reason}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="h-6 w-6 text-green-400" />
          Training Grounds
        </h2>
        
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <TrendingUp className="h-4 w-4" />
          <span>Active Sessions: {activeTraining.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-700 rounded-lg p-1 mb-6">
        {(['opponents', 'active', 'history', 'facilities'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded text-sm transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'opponents' && (
        <div>
          {/* Unit Selection */}
          {!selectedUnit && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Select Unit to Train</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
                    onClick={() => setSelectedUnit(unit)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Sword className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{unit.name}</h4>
                        <p className="text-slate-400 text-sm">Level {unit.level || 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opponent Selection */}
          {selectedUnit && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Training Opponents for {selectedUnit.name}
                </h3>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Change Unit
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOpponents.map((opponent) => {
                  const canTrain = recruitmentManager.canTrainAgainst(opponent.id, selectedUnit.level || 1);
                  
                  return (
                    <div
                      key={opponent.id}
                      className={`bg-slate-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-600 ${
                        !canTrain.canTrain ? 'opacity-50' : ''
                      }`}
                      onClick={() => canTrain.canTrain && setSelectedOpponent(opponent)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold">{opponent.name}</h4>
                          <p className="text-slate-400 text-sm">{opponent.title}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${getDifficultyColor(opponent.difficulty)}`}>
                          {opponent.difficulty}
                        </div>
                      </div>

                      <p className="text-slate-300 text-xs mb-3 line-clamp-2">{opponent.description}</p>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>Level {opponent.level}</span>
                          <span>•</span>
                          <span>{opponent.battleCount} battles</span>
                        </div>
                        <div className="text-yellow-400">
                          {opponent.rewards.length} rewards
                        </div>
                      </div>

                      {!canTrain.canTrain && (
                        <div className="mt-2 pt-2 border-t border-slate-600">
                          <div className="text-xs text-red-400">{canTrain.reason}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Active Training Sessions</h3>
          {activeTraining.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-400 mb-2">No Active Training</h4>
              <p className="text-slate-500">Start a training session to see it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTraining.map((session) => {
                const opponent = availableOpponents.find(o => o.id === session.opponentId);
                const unit = availableUnits.find(u => u.id === session.unitId);
                
                return (
                  <div key={session.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Sword className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{unit?.name} vs {opponent?.name}</h4>
                          <p className="text-slate-400 text-sm">Started {session.startTime.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCompleteTraining(session.id, 'Victory')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          Victory
                        </button>
                        <button
                          onClick={() => handleCompleteTraining(session.id, 'Defeat')}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
                          Defeat
                        </button>
                        <button
                          onClick={() => handleCompleteTraining(session.id, 'Draw')}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                        >
                          Draw
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Duration: {session.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>Status: {session.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Training History</h3>
          {completedSessions.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-400 mb-2">No Training History</h4>
              <p className="text-slate-500">Complete training sessions to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedSessions.slice(-10).reverse().map((record) => (
                <div key={record.sessionId} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        record.result === 'Victory' ? 'bg-green-400' :
                        record.result === 'Defeat' ? 'bg-red-400' : 'bg-yellow-400'
                      }`} />
                      <div>
                        <h4 className="text-white font-medium">
                          {record.unitName} vs {record.opponentName}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {record.completedAt.toLocaleDateString()} • {record.result}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">+{record.experienceGained} XP</div>
                      {record.skillsLearned.length > 0 && (
                        <div className="text-blue-400 text-sm">{record.skillsLearned.length} skills learned</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'facilities' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Training Facilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((facility) => (
              <div key={facility.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{facility.name}</h4>
                    <p className="text-slate-400 text-sm">{facility.type} Facility</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {facility.isUnlocked ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </div>

                <p className="text-slate-300 text-sm mb-3">{facility.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Level:</span>
                    <span className="text-white">{facility.level}/{facility.maxLevel}</span>
                  </div>
                  {!facility.isUnlocked && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Cost:</span>
                      <span className="text-yellow-400">{facility.cost} Gold</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-600">
                  <h5 className="text-white text-sm font-medium mb-2">Bonuses:</h5>
                  <div className="space-y-1">
                    {facility.bonuses.map((bonus, index) => (
                      <div key={index} className="text-xs text-slate-300">
                        • {bonus.description}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};