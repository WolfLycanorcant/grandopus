import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  MapPin, 
  Sword, 
  Shield, 
  Crown,
  Lock,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CampaignManager } from '../core/campaign/CampaignManager';
import { Campaign, CampaignMission, CampaignState } from '../core/campaign/types';

interface CampaignPanelProps {
  campaignManager: CampaignManager;
  onStartMission?: (campaignId: string, missionId: string) => void;
}

export const CampaignPanel: React.FC<CampaignPanelProps> = ({ 
  campaignManager, 
  onStartMission 
}) => {
  const [campaignState, setCampaignState] = useState<CampaignState>(campaignManager.getState());
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedMission, setSelectedMission] = useState<CampaignMission | null>(null);

  useEffect(() => {
    const unsubscribe = campaignManager.subscribe(setCampaignState);
    return unsubscribe;
  }, [campaignManager]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-orange-400';
      case 'Legendary': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getEnvironmentIcon = (environment: string) => {
    switch (environment) {
      case 'Plains': return '🌾';
      case 'Forest': return '🌲';
      case 'Mountains': return '⛰️';
      case 'Desert': return '🏜️';
      case 'Swamp': return '🐊';
      case 'Tundra': return '❄️';
      default: return '🗺️';
    }
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Clear': return '☀️';
      case 'Rain': return '🌧️';
      case 'Snow': return '❄️';
      case 'Fog': return '🌫️';
      case 'Storm': return '⛈️';
      default: return '☀️';
    }
  };

  const handleStartMission = (campaignId: string, missionId: string) => {
    campaignManager.startMission(campaignId, missionId);
    onStartMission?.(campaignId, missionId);
  };

  if (selectedMission) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedMission(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Campaign
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getDifficultyColor(selectedMission.difficulty)}`}>
              {selectedMission.difficulty}
            </span>
            {selectedMission.isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-400" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mission Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedMission.name}</h2>
              <p className="text-slate-300">{selectedMission.description}</p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Mission Briefing</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{selectedMission.briefing}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Est. Duration</span>
                </div>
                <span className="text-white font-medium">{selectedMission.estimatedTurns} turns</span>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Map Size</span>
                </div>
                <span className="text-white font-medium">{selectedMission.mapSize}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getEnvironmentIcon(selectedMission.environment)}</span>
                  <span className="text-sm text-slate-400">Environment</span>
                </div>
                <span className="text-white font-medium">{selectedMission.environment}</span>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getWeatherIcon(selectedMission.weather)}</span>
                  <span className="text-sm text-slate-400">Weather</span>
                </div>
                <span className="text-white font-medium">{selectedMission.weather}</span>
              </div>
            </div>
          </div>

          {/* Objectives and Rewards */}
          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectives
              </h3>
              <div className="space-y-2">
                {selectedMission.objectives.map((objective) => (
                  <div key={objective.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {objective.isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : objective.isOptional ? (
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-slate-400 rounded" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm">{objective.description}</p>
                      {objective.isOptional && (
                        <span className="text-xs text-yellow-400">Optional</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Rewards
              </h3>
              <div className="space-y-2">
                {selectedMission.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-yellow-400">
                      {reward.type === 'Gold' && '💰'}
                      {reward.type === 'Experience' && '⭐'}
                      {reward.type === 'Equipment' && '⚔️'}
                      {reward.type === 'Unit' && '👥'}
                      {reward.type === 'Unlock' && '🔓'}
                    </div>
                    <span className="text-white text-sm">{reward.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedMission.enemyFactions.length > 0 && (
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Sword className="h-5 w-5" />
                  Enemy Factions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMission.enemyFactions.map((faction) => (
                    <span key={faction} className="bg-red-900 text-red-200 px-2 py-1 rounded text-sm">
                      {faction}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedMission.isUnlocked && !selectedMission.isCompleted && (
              <button
                onClick={() => handleStartMission(selectedCampaign!.id, selectedMission.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                Start Mission
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedCampaign) {
    const progress = campaignState.campaignProgress[selectedCampaign.id];
    const completedMissions = selectedCampaign.missions.filter(m => m.isCompleted).length;
    const totalMissions = selectedCampaign.missions.length;
    const progressPercentage = (completedMissions / totalMissions) * 100;

    return (
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedCampaign(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Campaigns
          </button>
          <div className="flex items-center gap-2">
            {selectedCampaign.isCompleted && (
              <Crown className="h-6 w-6 text-yellow-400" />
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">{selectedCampaign.name}</h2>
          <p className="text-slate-300 mb-4">{selectedCampaign.description}</p>
          
          <div className="bg-slate-700 rounded-lg p-4 mb-4">
            <p className="text-slate-300 text-sm leading-relaxed">{selectedCampaign.lore}</p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Progress</span>
                <span>{completedMissions}/{totalMissions} missions</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{progress?.totalScore || 0}</div>
              <div className="text-slate-400 text-sm">Total Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCampaign.missions.map((mission) => (
            <div
              key={mission.id}
              className={`bg-slate-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-600 ${
                !mission.isUnlocked ? 'opacity-50' : ''
              }`}
              onClick={() => mission.isUnlocked && setSelectedMission(mission)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">{mission.name}</h3>
                <div className="flex items-center gap-1">
                  {mission.isCompleted && <CheckCircle className="h-4 w-4 text-green-400" />}
                  {!mission.isUnlocked && <Lock className="h-4 w-4 text-slate-500" />}
                </div>
              </div>
              
              <p className="text-slate-300 text-xs mb-3 line-clamp-2">{mission.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${getDifficultyColor(mission.difficulty)}`}>
                  {mission.difficulty}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{mission.estimatedTurns}t</span>
                </div>
              </div>
              
              {mission.bestScore && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Best Score:</span>
                    <span className="text-yellow-400 font-medium">{mission.bestScore}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Campaign Selection</h2>
        <p className="text-slate-300">Choose your path and forge your legend</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaignState.availableCampaigns.map((campaign) => {
          const progress = campaignState.campaignProgress[campaign.id];
          const completedMissions = campaign.missions.filter(m => m.isCompleted).length;
          const totalMissions = campaign.missions.length;
          const progressPercentage = (completedMissions / totalMissions) * 100;
          const hasUnlockedMissions = campaign.missions.some(m => m.isUnlocked);

          return (
            <div
              key={campaign.id}
              className={`bg-slate-700 rounded-lg p-6 cursor-pointer transition-all hover:bg-slate-600 ${
                !hasUnlockedMissions ? 'opacity-50' : ''
              }`}
              onClick={() => hasUnlockedMissions && setSelectedCampaign(campaign)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{campaign.name}</h3>
                  <p className="text-slate-300 text-sm">{campaign.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {campaign.isCompleted && <Crown className="h-6 w-6 text-yellow-400" />}
                  {!hasUnlockedMissions && <Lock className="h-5 w-5 text-slate-500" />}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{completedMissions}/{totalMissions}</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{progress?.totalScore || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{totalMissions} missions</span>
                  </div>
                </div>
                {hasUnlockedMissions && (
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Enter Campaign →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};