import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Trophy, Target, CheckCircle, Clock } from 'lucide-react';
import { CampaignManager } from '../core/campaign/CampaignManager';
import { CampaignState, Campaign, CampaignMission } from '../core/campaign/types';

const campaignManager = new CampaignManager();

export const CampaignTestPanel: React.FC = () => {
  const [campaignState, setCampaignState] = useState<CampaignState>(campaignManager.getState());
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = campaignManager.subscribe(setCampaignState);
    return unsubscribe;
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testStartCampaign = () => {
    if (!selectedCampaign) {
      addTestResult('❌ No campaign selected');
      return;
    }

    const success = campaignManager.startCampaign(selectedCampaign);
    if (success) {
      addTestResult(`✅ Started campaign: ${selectedCampaign}`);
    } else {
      addTestResult(`❌ Failed to start campaign: ${selectedCampaign}`);
    }
  };

  const testStartMission = () => {
    if (!selectedCampaign || !selectedMission) {
      addTestResult('❌ Campaign or mission not selected');
      return;
    }

    const mission = campaignManager.startMission(selectedCampaign, selectedMission);
    if (mission) {
      addTestResult(`✅ Started mission: ${mission.name}`);
    } else {
      addTestResult(`❌ Failed to start mission: ${selectedMission}`);
    }
  };

  const testCompleteMission = () => {
    if (!selectedCampaign || !selectedMission) {
      addTestResult('❌ Campaign or mission not selected');
      return;
    }

    const mission = campaignManager.getMission(selectedCampaign, selectedMission);
    if (!mission) {
      addTestResult('❌ Mission not found');
      return;
    }

    // Simulate completing all required objectives
    const requiredObjectives = mission.objectives
      .filter(obj => !obj.isOptional)
      .map(obj => obj.id);

    const score = Math.floor(Math.random() * 500) + 100;
    const completionTime = Math.floor(Math.random() * 10) + 5;

    campaignManager.completeMission(
      selectedCampaign,
      selectedMission,
      score,
      completionTime,
      requiredObjectives
    );

    addTestResult(`✅ Completed mission with score: ${score}`);
  };

  const testFailMission = () => {
    if (!selectedCampaign || !selectedMission) {
      addTestResult('❌ Campaign or mission not selected');
      return;
    }

    campaignManager.failMission(selectedCampaign, selectedMission);
    addTestResult(`❌ Failed mission: ${selectedMission}`);
  };

  const testSaveLoad = () => {
    // Test save
    const savedState = campaignManager.saveState();
    addTestResult('💾 Campaign state saved');

    // Modify state
    if (selectedCampaign && selectedMission) {
      campaignManager.completeMission(selectedCampaign, selectedMission, 999, 1, []);
      addTestResult('🔄 Modified campaign state');
    }

    // Test load
    campaignManager.loadState(savedState);
    addTestResult('📂 Campaign state loaded');
  };

  const resetCampaigns = () => {
    // Create a new campaign manager to reset state
    const newManager = new CampaignManager();
    const newState = newManager.getState();
    setCampaignState(newState);
    addTestResult('🔄 Campaign state reset');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const selectedCampaignData = campaignState.availableCampaigns.find(c => c.id === selectedCampaign);
  const selectedMissionData = selectedCampaignData?.missions.find(m => m.id === selectedMission);

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Campaign System Test Panel
        </h2>
        <div className="flex gap-2">
          <button
            onClick={clearResults}
            className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors"
          >
            Clear Results
          </button>
          <button
            onClick={resetCampaigns}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Campaign Selection</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Campaign:</label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => {
                    setSelectedCampaign(e.target.value);
                    setSelectedMission('');
                  }}
                  className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Campaign</option>
                  {campaignState.availableCampaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCampaignData && (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Mission:</label>
                  <select
                    value={selectedMission}
                    onChange={(e) => setSelectedMission(e.target.value)}
                    className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm"
                  >
                    <option value="">Select Mission</option>
                    {selectedCampaignData.missions.map(mission => (
                      <option key={mission.id} value={mission.id}>
                        {mission.name} {mission.isCompleted ? '✅' : ''} {!mission.isUnlocked ? '🔒' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Test Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={testStartCampaign}
                disabled={!selectedCampaign}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
              >
                <Play className="h-3 w-3" />
                Start Campaign
              </button>
              
              <button
                onClick={testStartMission}
                disabled={!selectedMission}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
              >
                <Target className="h-3 w-3" />
                Start Mission
              </button>
              
              <button
                onClick={testCompleteMission}
                disabled={!selectedMission}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Complete Mission
              </button>
              
              <button
                onClick={testFailMission}
                disabled={!selectedMission}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
              >
                Fail Mission
              </button>
              
              <button
                onClick={testSaveLoad}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors col-span-2"
              >
                Test Save/Load
              </button>
            </div>
          </div>

          {/* Mission Details */}
          {selectedMissionData && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Mission Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Status:</span>
                  <span className={selectedMissionData.isCompleted ? 'text-green-400' : 
                    selectedMissionData.isUnlocked ? 'text-yellow-400' : 'text-red-400'}>
                    {selectedMissionData.isCompleted ? 'Completed' : 
                     selectedMissionData.isUnlocked ? 'Available' : 'Locked'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Difficulty:</span>
                  <span className="text-white">{selectedMissionData.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Objectives:</span>
                  <span className="text-white">{selectedMissionData.objectives.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Best Score:</span>
                  <span className="text-white">{selectedMissionData.bestScore || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results and State */}
        <div className="space-y-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Campaign State</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Available Campaigns:</span>
                <span className="text-white">{campaignState.availableCampaigns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Active Campaign:</span>
                <span className="text-white">{campaignState.activeCampaign?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Score:</span>
                <span className="text-white">
                  {Object.values(campaignState.campaignProgress)
                    .reduce((sum, progress) => sum + progress.totalScore, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Completed Missions:</span>
                <span className="text-white">
                  {Object.values(campaignState.campaignProgress)
                    .reduce((sum, progress) => sum + progress.completedMissions.length, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Test Results
            </h3>
            <div className="bg-slate-800 rounded p-3 max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-slate-400 text-sm">No test results yet</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-xs font-mono text-slate-300">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Campaign Progress */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Campaign Progress</h3>
            <div className="space-y-3">
              {campaignState.availableCampaigns.map(campaign => {
                const progress = campaignState.campaignProgress[campaign.id];
                const completedCount = campaign.missions.filter(m => m.isCompleted).length;
                const totalCount = campaign.missions.length;
                const percentage = (completedCount / totalCount) * 100;

                return (
                  <div key={campaign.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{campaign.name}</span>
                      <span className="text-white">{completedCount}/{totalCount}</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};