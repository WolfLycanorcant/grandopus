import React, { useState } from 'react'
import { Unit, FormationPosition } from '../core/units'
import { UnitDetailsModal } from './UnitDetailsModal'
import { Plus, Eye } from 'lucide-react'
import clsx from 'clsx'

interface FormationSlotProps {
  position: FormationPosition
  label: string
  unit: Unit | undefined
  isDragOver: boolean
  onDragOver: (e: React.DragEvent, position: FormationPosition) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, position: FormationPosition) => void
  onRemoveUnit: (unitId: string) => void
  rowType: 'front' | 'back'
}

export function FormationSlot({
  position,
  label,
  unit,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveUnit,
  rowType
}: FormationSlotProps) {
  const [showUnitDetails, setShowUnitDetails] = useState(false)
  
  return (
    <>
      <div
        className={clsx(
          'formation-slot h-32 flex-col relative',
          rowType === 'front' ? 'front-row' : 'back-row',
          unit && 'occupied',
          isDragOver && 'animate-formation-glow'
        )}
        onDragOver={(e) => onDragOver(e, position)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, position)}
      >
        {unit ? (
          <div className="w-full h-full relative group">
            {/* Unit Avatar */}
            <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg border border-slate-500 flex flex-col items-center justify-center p-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">
                  {unit.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-center">
                <div className="text-white text-xs font-medium truncate w-full">
                  {unit.name}
                </div>
                <div className="text-slate-400 text-xs">
                  Lv.{unit.experience.currentLevel}
                </div>
                <div className="text-slate-500 text-xs">
                  {unit.race.charAt(0).toUpperCase() + unit.race.slice(1)}
                </div>
              </div>
              
              {/* Health Bar */}
              <div className="w-full mt-1">
                <div className="w-full bg-slate-600 rounded-full h-1">
                  <div 
                    className={clsx(
                      'h-1 rounded-full transition-all',
                      unit.currentHp === unit.getCurrentStats().hp ? 'bg-green-500' :
                      unit.currentHp > unit.getCurrentStats().hp * 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${(unit.currentHp / unit.getCurrentStats().hp) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setShowUnitDetails(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="View Details"
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onRemoveUnit(unit.id)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="Remove Unit"
                >
                  ×
                </button>
              </div>
              
              {/* Slot Cost Indicator */}
              {unit.getSlotCost() > 1 && (
                <div className="absolute bottom-1 left-1 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {unit.getSlotCost()}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Plus className="h-6 w-6 text-slate-500 mx-auto mb-1" />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        )}
      </div>
      
      {/* Unit Details Modal */}
      {showUnitDetails && unit && (
        <UnitDetailsModal
          unit={unit}
          onClose={() => setShowUnitDetails(false)}
        />
      )}
    </>
  )
}