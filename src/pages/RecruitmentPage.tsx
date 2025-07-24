import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Target, Trophy, Star } from 'lucide-react';
import { RecruitmentPanel } from '../components/RecruitmentPanel';
import { TrainingGroundsPanel } from '../components/TrainingGroundsPanel';
import { RecruitmentManager } from '../core/recruitment/RecruitmentManager';
import { useGameStore } from '../stores/gameStore';

const recruitmentManager = new RecruitmentManager();

export const RecruitmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { units, addUnit, saveGame } = useGameStore();
  const [activeTab, setActiveTab] = useState<'recruitment' | 'training'>('recruitment');
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Load recruitment progress from save data
    const savedData = localStorage.getItem('recruitment-progress');
    if (savedData) {
      recruitmentManager.loadState(savedData);
    }
  }, []);

  const handleUnitRecruited = (unit: any) => {
    addUnit(unit);
    
    // Save recruitment progress
    const recruitmentState = recruitmentManager.saveState();
    localStorage.setItem('recruitment-progress', recruitmentState);
    
    // Save game state
    saveGame('auto-recruitment');
    
    // Show success message or notification
    console.log('Unit recruited:', unit.name);
  };

  const handleTrainingComplete = (unitId: string, result: any) => {
    // Update unit with training results
    const unitIndex = units.findIndex(u => u.id === unitId);
    if (unitIndex >= 0) {
      // Apply experience and skill gains
      // This would integrate with your unit progression system
      console.log('Training completed:', result);
    }
    
    // Save progress
    const recruitmentState = recruitmentManager.saveState();
    localStorage.setItem('recruitment-progress', recruitmentState);
    saveGame('auto-training');
  };

  const handleBackToHome = () => {
    // Save progress before leaving
    const recruitmentState = recruitmentManager.saveState();
    localStorage.setItem('recruitment-progress', recruitmentState);
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
                {activeTab === 'recruitment' ? (
                  <>
                    <Users className="h-6 w-6 text-blue-400" />
                    Unit Recruitment
                  </>
                ) : (
                  <>
                    <Target className="h-6 w-6 text-green-400" />
                    Training Grounds
                  </>
                )}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Star className="h-4 w-4" />
                Help
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
              <h2 className="text-xl font-bold text-white">Recruitment & Training Guide</h2>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-white font-semibold mb-2">🎯 Unit Recruitment</h3>
                <p className="text-sm">
                  Recruit individual units instead of pre-made squads. Each unit has unique stats, 
                  abilities, and growth potential. Higher rarity units require achievements to unlock.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">⚔️ Training Grounds</h3>
                <p className="text-sm">
                  Train your units individually against AI opponents in grid-based combat. 
                  Win training sessions to gain experience, learn new skills, and unlock stronger opponents.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">📈 Progression System</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Complete achievements to unlock rare units</li>
                  <li>• Train units to increase their level and abilities</li>
                  <li>• Build training facilities for better bonuses</li>
                  <li>• Face increasingly difficult opponents</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">🏆 Rarity Tiers</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">●</span>
                    <span>Common - Always available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">◆</span>
                    <span>Uncommon - Basic achievements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">★</span>
                    <span>Rare - Campaign completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">♦</span>
                    <span>Epic - Advanced achievements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">👑</span>
                    <span>Legendary - Master achievements</span>
                  </div>
                </div>
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

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('recruitment')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded transition-colors ${
              activeTab === 'recruitment'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Unit Recruitment</span>
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded transition-colors ${
              activeTab === 'training'
                ? 'bg-green-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Target className="h-5 w-5" />
            <span>Training Grounds</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'recruitment' ? (
          <RecruitmentPanel 
            recruitmentManager={recruitmentManager}
            onUnitRecruited={handleUnitRecruited}
          />
        ) : (
          <TrainingGroundsPanel 
            recruitmentManager={recruitmentManager}
            availableUnits={units}
            onTrainingComplete={handleTrainingComplete}
          />
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="h-4 w-4 text-blue-400" />
            <span>Units: {units.length}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>Achievements: {recruitmentManager.getState().achievements.length}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Target className="h-4 w-4 text-green-400" />
            <span>Training: {recruitmentManager.getState().trainingGrounds.activeTraining.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};