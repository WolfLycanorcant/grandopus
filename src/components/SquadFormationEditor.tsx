import React, { useState, useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Squad } from '../core/squads'
import { Unit, FormationPosition } from '../core/units'
import { UnitCard } from './UnitCard'
import { ClickableUnitCard } from './ClickableUnitCard'
import { FormationSlot } from './FormationSlot'
import { RotateCcw, Info, Users, ArrowRight, Plus } from 'lucide-react'
import clsx from 'clsx'

interface SquadFormationEditorProps {
  squad: Squad
}

export function SquadFormationEditor({ squad }: SquadFormationEditorProps) {
  const { units, addUnitToSquad, removeUnitFromSquad, error } = useGameStore()
  const [draggedUnit, setDraggedUnit] = useState<Unit | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<FormationPosition | null>(null)
  
  // Available units (not in any squad)
  const availableUnits = units.filter(unit => 
    !squad.getUnits().some(squadUnit => squadUnit.id === unit.id)
  )
  
  const formationPositions: { position: FormationPosition; label: string; row: 'front' | 'back' }[] = [
    { position: FormationPosition.FRONT_LEFT, label: 'Front Left', row: 'front' },
    { position: FormationPosition.FRONT_CENTER, label: 'Front Center', row: 'front' },
    { position: FormationPosition.FRONT_RIGHT, label: 'Front Right', row: 'front' },
    { position: FormationPosition.BACK_LEFT, label: 'Back Left', row: 'back' },
    { position: FormationPosition.BACK_CENTER, label: 'Back Center', row: 'back' },
    { position: FormationPosition.BACK_RIGHT, label: 'Back Right', row: 'back' },
  ]
  
  const handleDragStart = useCallback((unit: Unit) => {
    setDraggedUnit(unit)
  }, [])
  
  const handleDragEnd = useCallback(() => {
    setDraggedUnit(null)
    setDragOverPosition(null)
  }, [])
  
  const handleDragOver = useCallback((e: React.DragEvent, position: FormationPosition) => {
    e.preventDefault()
    setDragOverPosition(position)
  }, [])
  
  const handleDragLeave = useCallback(() => {
    setDragOverPosition(null)
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent, position: FormationPosition) => {
    e.preventDefault()
    setDragOverPosition(null)
    
    if (!draggedUnit) return
    
    try {
      // If unit is from available units, add to squad
      if (availableUnits.some(u => u.id === draggedUnit.id)) {
        addUnitToSquad(squad.id, draggedUnit)
        // Set position after adding
        setTimeout(() => {
          try {
            squad.setUnitPosition(draggedUnit.id, position)
          } catch (error) {
            console.error('Failed to set unit position:', error)
          }
        }, 0)
      } else {
        // Unit is already in squad, just move position
        squad.setUnitPosition(draggedUnit.id, position)
      }
    } catch (error) {
      console.error('Failed to handle drop:', error)
    }
    
    setDraggedUnit(null)
  }, [draggedUnit, availableUnits, addUnitToSquad, squad])
  
  const handleRemoveUnit = useCallback((unitId: string) => {
    removeUnitFromSquad(squad.id, unitId)
  }, [removeUnitFromSquad, squad.id])
  
  const handleAutoArrange = useCallback(() => {
    // Remove all units and re-add them to trigger auto-positioning
    const squadUnits = [...squad.getUnits()]
    squadUnits.forEach(unit => {
      removeUnitFromSquad(squad.id, unit.id)
    })
    
    // Re-add units to trigger auto-positioning
    squadUnits.forEach(unit => {
      setTimeout(() => {
        addUnitToSquad(squad.id, unit)
      }, 100)
    })
  }, [squad, removeUnitFromSquad, addUnitToSquad])
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Formation Editor - {squad.name}
            </h2>
            <button
              onClick={handleAutoArrange}
              className="btn-outline flex items-center text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Auto Arrange
            </button>
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formation Grid */}
        <div className="xl:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Battle Formation
              </h3>
            </div>
            <div className="card-body">
              {/* Formation Bonuses Info */}
              <div className="bg-slate-700 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <Info className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-white">Formation Bonuses</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500/30 border border-red-500 rounded mr-2"></div>
                    <span className="text-red-300">Front Row:</span>
                    <span className="text-slate-300 ml-2">+10% armor, +5% physical damage</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500/30 border border-blue-500 rounded mr-2"></div>
                    <span className="text-blue-300">Back Row:</span>
                    <span className="text-slate-300 ml-2">+15% ranged damage, -10% physical taken</span>
                  </div>
                </div>
              </div>
              
              {/* Formation Grid */}
              <div className="space-y-4">
                {/* Front Row */}
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-4 h-4 bg-red-500/30 border border-red-500 rounded mr-2"></div>
                    <h4 className="text-sm font-medium text-red-300">Front Row (Melee)</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {formationPositions.slice(0, 3).map(({ position, label, row }) => {
                      const unit = squad.getUnitAtPosition(position)
                      const isDragOver = dragOverPosition === position
                      
                      return (
                        <FormationSlot
                          key={position}
                          position={position}
                          label={label}
                          unit={unit}
                          isDragOver={isDragOver}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onRemoveUnit={handleRemoveUnit}
                          rowType={row}
                        />
                      )
                    })}
                  </div>
                </div>
                
                {/* Back Row */}
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-4 h-4 bg-blue-500/30 border border-blue-500 rounded mr-2"></div>
                    <h4 className="text-sm font-medium text-blue-300">Back Row (Ranged/Support)</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {formationPositions.slice(3, 6).map(({ position, label, row }) => {
                      const unit = squad.getUnitAtPosition(position)
                      const isDragOver = dragOverPosition === position
                      
                      return (
                        <FormationSlot
                          key={position}
                          position={position}
                          label={label}
                          unit={unit}
                          isDragOver={isDragOver}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onRemoveUnit={handleRemoveUnit}
                          rowType={row}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Squad Summary */}
              <div className="mt-6 bg-slate-700 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{squad.getUnits().length}</div>
                    <div className="text-xs text-slate-400">Total Units</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-300">{squad.getFrontRowUnits().length}</div>
                    <div className="text-xs text-slate-400">Front Row</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-300">{squad.getBackRowUnits().length}</div>
                    <div className="text-xs text-slate-400">Back Row</div>
                  </div>
                  <div className="text-center">
                    <div className={clsx(
                      'text-lg font-bold',
                      squad.isValidForCombat() ? 'text-green-400' : 'text-red-400'
                    )}>
                      {squad.isValidForCombat() ? 'Ready' : 'Not Ready'}
                    </div>
                    <div className="text-xs text-slate-400">Combat Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Available Units */}
        <div className="xl:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <ArrowRight className="h-5 w-5 mr-2" />
                Available Units ({availableUnits.length})
              </h3>
            </div>
            <div className="card-body">
              {availableUnits.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-slate-300 mb-2">No Available Units</h4>
                  <p className="text-slate-400 text-sm">
                    All your units are assigned to squads or you need to create more units.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableUnits.map((unit) => (
                    <ClickableUnitCard
                      key={unit.id}
                      unit={unit}
                      size="small"
                      showActions={false}
                      draggable={true}
                      onDragStart={() => handleDragStart(unit)}
                      onDragEnd={handleDragEnd}
                      className="cursor-move"
                    />
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-xs text-slate-400">
                <p>💡 <strong>Tip:</strong> Drag units from here to formation slots above.</p>
                <p className="mt-1">• Tanks work best in front row</p>
                <p>• Archers and mages in back row</p>
                <p>• Large creatures (beasts, dragons) take 2 slots</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}