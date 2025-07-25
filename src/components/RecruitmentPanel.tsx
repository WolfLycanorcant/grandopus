import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Star, 
  Crown, 
  Coins, 
  Shield, 
  Sword, 
  Zap, 
  Heart,
  Lock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { RecruitmentManager } from '../core/recruitment/RecruitmentManager';
import { RecruitmentState, RecruitableUnit } from '../core/recruitment/types';

interface RecruitmentPanelProps {
  recruitmentManager: RecruitmentManager;
  onUnitRecruited?: (unit: any) => void;
  playerGold?: number;
}

export const RecruitmentPanel: React.FC<RecruitmentPanelProps> = ({ 
  recruitmentManager, 
  onUnitRecruited,
  playerGold = 0
}) => {
  const [recruitmentState, setRecruitmentState] = useState<RecruitmentState>(recruitmentManager.getState());
  const [selectedUnit, setSelectedUnit] = useState<RecruitableUnit | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'locked'>('available');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'cost'>('rarity');

  useEffect(() => {
    const unsubscribe = recruitmentManager.subscribe(setRecruitmentState);
    return unsubscribe;
  }, [recruitmentManager]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-400';
      case 'Uncommon': return 'text-green-400 border-green-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '●';
      case 'Uncommon': return '◆';
      case 'Rare': return '★';
      case 'Epic': return '♦';
      case 'Legendary': return '👑';
      default: return '●';
    }
  };

  const getFilteredUnits = () => {
    let units = recruitmentState.pool.availableUnits;

    // Apply filter
    switch (filter) {
      case 'available':
        units = units.filter(unit => 
          recruitmentState.pool.unlockedUnits.includes(unit.id) &&
          recruitmentManager.canRecruitUnit(unit.id).canRecruit
        );
        break;
      case 'locked':
        units = units.filter(unit => 
          !recruitmentState.pool.unlockedUnits.includes(unit.id) ||
          !recruitmentManager.canRecruitUnit(unit.id).canRecruit
        );
        break;
    }

    // Apply sorting
    units.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost':
          return a.cost.gold - b.cost.gold;
        case 'rarity':
          const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        default:
          return 0;
      }
    });

    return units;
  };

  const handleRecruitUnit = (unitId: string) => {
    const unit = recruitmentManager.recruitUnit(unitId);
    if (unit) {
      onUnitRecruited?.(unit);
      setSelectedUnit(null);
    }
  };

  const filteredUnits = getFilteredUnits();

  if (selectedUnit) {
    const canRecruit = recruitmentManager.canRecruitUnit(selectedUnit.id);
    
    return (
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedUnit(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Recruitment
          </button>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getRarityColor(selectedUnit.rarity)}`}>
            <span>{getRarityIcon(selectedUnit.rarity)}</span>
            <span className="text-sm font-medium">{selectedUnit.rarity}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unit Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedUnit.name}</h2>
              <p className="text-slate-300 mb-1">{selectedUnit.race} {selectedUnit.archetype}</p>
              <p className="text-slate-400 text-sm">{selectedUnit.description}</p>
            </div>

            {/* Base Stats */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Base Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-slate-300 text-sm">HP:</span>
                  <span className="text-white font-medium">{selectedUnit.baseStats.hp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sword className="h-4 w-4 text-orange-400" />
                  <span className="text-slate-300 text-sm">Attack:</span>
                  <span className="text-white font-medium">{selectedUnit.baseStats.attack}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300 text-sm">Defense:</span>
                  <span className="text-white font-medium">{selectedUnit.baseStats.defense}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-slate-300 text-sm">Speed:</span>
                  <span className="text-white font-medium">{selectedUnit.baseStats.speed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  <span className="text-slate-300 text-sm">Magic:</span>
                  <span className="text-white font-medium">{selectedUnit.baseStats.magic}</span>
                </div>
              </div>
            </div>

            {/* Growth Rates */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Rates
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedUnit.growthRates).map(([stat, rate]) => (
                  <div key={stat} className="flex justify-between">
                    <span className="text-slate-300 text-sm capitalize">{stat}:</span>
                    <span className="text-green-400 font-medium">+{rate}/level</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Abilities */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Special Abilities</h3>
              <div className="space-y-2">
                {selectedUnit.specialAbilities.map((ability, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-slate-300 text-sm">{ability}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recruitment Info */}
          <div className="space-y-4">
            {/* Cost */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Recruitment Cost</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span className="text-slate-300">Gold:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${playerGold >= selectedUnit.cost.gold ? 'text-white' : 'text-red-400'}`}>
                      {selectedUnit.cost.gold.toLocaleString()}
                    </span>
                    {playerGold < selectedUnit.cost.gold && (
                      <span className="text-red-400 text-sm">
                        (Need {(selectedUnit.cost.gold - playerGold).toLocaleString()} more)
                      </span>
                    )}
                  </div>
                </div>
                {selectedUnit.cost.reputation && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-400" />
                      <span className="text-slate-300">Reputation:</span>
                    </div>
                    <span className="text-white font-medium">{selectedUnit.cost.reputation}</span>
                  </div>
                )}
                {selectedUnit.cost.influence && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-300">Influence:</span>
                    <span className="text-white font-medium">{selectedUnit.cost.influence}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            {selectedUnit.requirements.length > 0 && (
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                <div className="space-y-2">
                  {selectedUnit.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        {req.isMet ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <span className={`text-sm ${req.isMet ? 'text-slate-300' : 'text-red-300'}`}>
                        {req.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Availability</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Type:</span>
                  <span className="text-white">{selectedUnit.availability}</span>
                </div>
                {selectedUnit.maxRecruits && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">Limit:</span>
                    <span className="text-white">
                      {selectedUnit.currentRecruits || 0}/{selectedUnit.maxRecruits}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recruit Button */}
            <div className="pt-4">
              {canRecruit.canRecruit ? (
                playerGold >= selectedUnit.cost.gold ? (
                  <button
                    onClick={() => handleRecruitUnit(selectedUnit.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="h-5 w-5" />
                    Recruit Unit ({selectedUnit.cost.gold.toLocaleString()} Gold)
                  </button>
                ) : (
                  <div className="w-full bg-red-600/20 border border-red-500 text-red-400 font-medium py-3 px-4 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Coins className="h-4 w-4" />
                      Insufficient Gold
                    </div>
                    <div className="text-xs">
                      Need {(selectedUnit.cost.gold - playerGold).toLocaleString()} more gold
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full bg-slate-600 text-slate-400 font-medium py-3 px-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Lock className="h-4 w-4" />
                    Cannot Recruit
                  </div>
                  <div className="text-xs">{canRecruit.reason}</div>
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
          <Users className="h-6 w-6 text-blue-400" />
          Unit Recruitment
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-slate-300">Gold: </span>
            <span className="text-yellow-400 font-medium">{playerGold.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Crown className="h-4 w-4 text-purple-400" />
            <span className="text-slate-300">Reputation: {recruitmentState.playerReputation}</span>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-700 rounded-lg p-1">
            {(['all', 'available', 'locked'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-700 text-white rounded px-3 py-1 text-sm"
          >
            <option value="rarity">Sort by Rarity</option>
            <option value="name">Sort by Name</option>
            <option value="cost">Sort by Cost</option>
          </select>
        </div>

        <div className="text-sm text-slate-400">
          {filteredUnits.length} units available
        </div>
      </div>

      {/* Unit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnits.map((unit) => {
          const canRecruit = recruitmentManager.canRecruitUnit(unit.id);
          const isUnlocked = recruitmentState.pool.unlockedUnits.includes(unit.id);
          
          return (
            <div
              key={unit.id}
              className={`bg-slate-700 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-600 ${
                !isUnlocked ? 'opacity-50' : ''
              }`}
              onClick={() => setSelectedUnit(unit)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{unit.name}</h3>
                  <p className="text-slate-400 text-sm">{unit.race} {unit.archetype}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${getRarityColor(unit.rarity).split(' ')[0]}`}>
                    {getRarityIcon(unit.rarity)}
                  </span>
                  {!isUnlocked && <Lock className="h-4 w-4 text-slate-500" />}
                  {canRecruit.canRecruit && <CheckCircle className="h-4 w-4 text-green-400" />}
                </div>
              </div>

              <p className="text-slate-300 text-xs mb-3 line-clamp-2">{unit.description}</p>

              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="text-center">
                  <div className="text-slate-400">HP</div>
                  <div className="text-white font-medium">{unit.baseStats.hp}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">ATK</div>
                  <div className="text-white font-medium">{unit.baseStats.attack}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">DEF</div>
                  <div className="text-white font-medium">{unit.baseStats.defense}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className={`flex items-center gap-1 ${playerGold >= unit.cost.gold ? 'text-yellow-400' : 'text-red-400'}`}>
                  <Coins className="h-3 w-3" />
                  <span>{unit.cost.gold.toLocaleString()}</span>
                </div>
                {unit.maxRecruits && (
                  <span className="text-slate-400">
                    {unit.currentRecruits || 0}/{unit.maxRecruits}
                  </span>
                )}
              </div>

              {!canRecruit.canRecruit && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <div className="text-xs text-red-400">{canRecruit.reason}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No Units Available</h3>
          <p className="text-slate-500">
            {filter === 'available' 
              ? 'Complete achievements and progress through campaigns to unlock more units.'
              : 'Try changing your filter to see more units.'
            }
          </p>
        </div>
      )}
    </div>
  );
};