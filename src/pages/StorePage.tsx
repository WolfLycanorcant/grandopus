import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Store, Info, HelpCircle } from 'lucide-react';
import { StorePanel } from '../components/StorePanel';
import { StoreManager } from '../core/store/StoreManager';
import { useGameStore } from '../stores/gameStore';

const storeManager = new StoreManager();

export const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const { playerResources, saveGame } = useGameStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Load store progress from save data
    const savedData = localStorage.getItem('store-progress');
    if (savedData) {
      storeManager.loadState(savedData);
    }

    // Sync player resources with store
    storeManager.updatePlayerResources(
      playerResources.gold || 1000,
      0, // reputation - would come from game state
      0  // influence - would come from game state
    );
  }, [playerResources]);

  const handleBackToHome = () => {
    // Save progress before leaving
    const storeState = storeManager.saveState();
    localStorage.setItem('store-progress', storeState);
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
                <Store className="h-6 w-6 text-green-400" />
                Grand Opus Store
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                Store Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-3xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Store Guide</h2>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-white font-semibold mb-2">🛒 Store Categories</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>⚔️ Weapons:</strong> Swords, bows, staves, and legendary arms</div>
                  <div><strong>🛡️ Armor:</strong> Light, medium, and heavy protection</div>
                  <div><strong>🍖 Food:</strong> Healing items and beast nutrition</div>
                  <div><strong>🧪 Potions:</strong> Healing, mana, and enhancement elixirs</div>
                  <div><strong>✨ Magical Items:</strong> Enchanted rings, amulets, and accessories</div>
                  <div><strong>🏺 Artifacts:</strong> Legendary squad-enhancing relics</div>
                  <div><strong>🐺 Beast Supplies:</strong> Grooming, medicine, gear, and shelter items</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">💰 Currency System</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><strong>Gold:</strong> Primary currency for most purchases</li>
                  <li><strong>Reputation:</strong> Earned through achievements, unlocks premium items</li>
                  <li><strong>Influence:</strong> Political currency for rare artifacts and special items</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">🎯 Item Rarity & Requirements</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">●</span> <strong>Common:</strong> Always available</div>
                  <div><span className="text-green-400">◆</span> <strong>Uncommon:</strong> Basic requirements</div>
                  <div><span className="text-blue-400">★</span> <strong>Rare:</strong> Level or achievement locked</div>
                  <div><span className="text-purple-400">♦</span> <strong>Epic:</strong> Advanced achievements</div>
                  <div><span className="text-yellow-400">👑</span> <strong>Legendary:</strong> Ultimate challenges</div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">🐺 Beast Care Essentials</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><strong>Grooming Supplies:</strong> Brushes, claw sharpeners for hygiene and bonding</li>
                  <li><strong>Specialized Food:</strong> Species-specific diets (Carnivore, Magical Essence, etc.)</li>
                  <li><strong>Medicine:</strong> Healing salves and treatments for beast ailments</li>
                  <li><strong>Gear & Shelter:</strong> Saddles, armor, and nesting materials</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">🛍️ Shopping Tips</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Use search and rarity filters to find specific items</li>
                  <li>• Check stock levels - some items have limited availability</li>
                  <li>• Items restock over time based on their rarity</li>
                  <li>• Look for discounts based on your achievements and beast ownership</li>
                  <li>• Sell unwanted items back to the store for 50% of purchase price</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Start Shopping!
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <StorePanel storeManager={storeManager} />
      </div>

      {/* Store Info Footer */}
      <div className="bg-slate-800/30 border-t border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Store Policies
              </h3>
              <ul className="text-slate-400 space-y-1">
                <li>• Items are delivered instantly to your inventory</li>
                <li>• Sell back items for 50% of purchase price</li>
                <li>• Limited stock items restock over time</li>
                <li>• No returns on consumable items after use</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Restocking Schedule</h3>
              <ul className="text-slate-400 space-y-1">
                <li>• Common items: Always in stock</li>
                <li>• Uncommon items: Daily restock</li>
                <li>• Rare items: 3-day restock cycle</li>
                <li>• Epic/Legendary: Weekly restock</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Earning Currency</h3>
              <ul className="text-slate-400 space-y-1">
                <li>• Gold: Battle victories, quest rewards</li>
                <li>• Reputation: Campaign completion, achievements</li>
                <li>• Influence: Political quests, alliances</li>
                <li>• Discounts: Beast ownership, achievements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};