import React from 'react';
import { 
  AlertTriangle, 
  Coins, 
  User, 
  X, 
  Check,
  Info,
  TrendingUp
} from 'lucide-react';
import { UnitCostCalculator } from '../core/units/UnitCostCalculator';

interface UnitCreationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  unitConfig: {
    name: string;
    race: string;
    archetype: string;
    level?: number;
  };
  playerGold: number;
}

export const UnitCreationConfirmModal: React.FC<UnitCreationConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  unitConfig,
  playerGold
}) => {
  if (!isOpen) return null;

  const { name, race, archetype, level = 1 } = unitConfig;
  const affordabilityCheck = UnitCostCalculator.canAffordUnit(playerGold, race, archetype, level);
  const costBreakdown = UnitCostCalculator.getCostBreakdown(race, archetype, level);

  const handleConfirm = () => {
    if (affordabilityCheck.canAfford) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Create Custom Unit</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Unit Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Unit Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="text-white font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Race:</span>
                <span className="text-white">{race}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Archetype:</span>
                <span className="text-white">{archetype}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Level:</span>
                <span className="text-white">{level}</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-400" />
              Cost Breakdown
            </h3>
            <div className="space-y-2">
              {costBreakdown.breakdown.map((line, index) => (
                <div key={index} className="text-sm text-slate-300">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Current Gold */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-white font-medium">Your Gold:</span>
              </div>
              <span className="text-yellow-400 font-bold">{playerGold.toLocaleString()}</span>
            </div>
            
            {!affordabilityCheck.canAfford && (
              <div className="mt-2 pt-2 border-t border-slate-600">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    Insufficient funds! Need {affordabilityCheck.shortfall.toLocaleString()} more gold.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Custom Unit Creation</p>
                <p>
                  Creating custom units costs 2x the normal recruitment price. 
                  This reflects the additional resources needed for specialized training and equipment.
                </p>
                {level > 1 && (
                  <p className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Higher level units cost more due to advanced training requirements.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!affordabilityCheck.canAfford}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              affordabilityCheck.canAfford
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="h-4 w-4" />
            {affordabilityCheck.canAfford 
              ? `Create Unit (${costBreakdown.totalCost.toLocaleString()} Gold)`
              : 'Insufficient Funds'
            }
          </button>
        </div>
      </div>
    </div>
  );
};