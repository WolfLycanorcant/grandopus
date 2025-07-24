import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen, Trophy, Target } from 'lucide-react';
import { CampaignPanel } from '../components/CampaignPanel';
import { CampaignManager } from '../core/campaign/CampaignManager';
import { useGameStore } from '../stores/gameStore';

const campaignManager = new CampaignManager();

export const CampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveGame } = useGameStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Load campaign progress from save data
    const savedData = localStorage.getItem('campaign-progress');
    if (savedData) {
      campaignManager.loadState(savedData);
    }
  }, []);

  const handleStartMission = (campaignId: string, missionId: string) => {
    // Save campaign progress
    const campaignState = campaignManager.saveState();
    localStorage.setItem('campaign-progress', campaignState);
    
    // Save current game state
    saveGame('auto-campaign');
    
    // Navigate to battle with campaign context
    navigate('/battle', { 
      state: { 
        campaignMode: true, 
        campaignId, 
        missionId 
      } 
    });
  };

  const handleBackToHome = () => {
    // Save progress before leaving
    const campaignState = campaignManager.saveState();
    localStorage.setItem('campaign-progress', campaignState);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
              <div className="h-6 w-px bg-slate-600" />
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-400" />
                Campaign Mode
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Target className="h-4 w-4" />
                Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Campaign Tutorial</h2>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-white font-semibold mb-2">🎯 How Campaigns Work</h3>
                <p className="text-sm">
                  Campaigns are story-driven sequences of missions that unlock progressively. 
                  Complete objectives to earn rewards and unlock new content.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">🏆 Mission Types</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• <strong>Defeat:</strong> Eliminate all enemy units</li>
                  <li>• <strong>Capture:</strong> Secure specific locations</li>
                  <li>• <strong>Escort:</strong> Protect units to safety</li>
                  <li>• <strong>Defend:</strong> Hold positions against waves</li>
                  <li>• <strong>Survive:</strong> Last for a set number of turns</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">⭐ Scoring & Rewards</h3>
                <p className="text-sm">
                  Earn higher scores by completing optional objectives, minimizing losses, 
                  and finishing quickly. Better scores unlock bonus rewards!
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">🔓 Progression</h3>
                <p className="text-sm">
                  Start with the tutorial campaign to learn the basics. Completing campaigns 
                  unlocks new units, equipment, and advanced gameplay features.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CampaignPanel 
          campaignManager={campaignManager}
          onStartMission={handleStartMission}
        />
      </div>

      {/* Quick Stats Footer */}
      <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>Total Score: {
              Object.values(campaignManager.getState().campaignProgress)
                .reduce((sum, progress) => sum + progress.totalScore, 0)
            }</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Target className="h-4 w-4 text-green-400" />
            <span>Completed: {
              Object.values(campaignManager.getState().campaignProgress)
                .reduce((sum, progress) => sum + progress.completedMissions.length, 0)
            }</span>
          </div>
        </div>
      </div>
    </div>
  );
};