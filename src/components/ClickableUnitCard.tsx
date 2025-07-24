import React, { useState } from 'react'
import { Unit } from '../core/units'
import { UnitCard } from './UnitCard'
import { UnitDetailsModal } from './UnitDetailsModal'

interface ClickableUnitCardProps {
  unit: Unit
  size?: 'small' | 'medium' | 'large'
  showActions?: boolean
  draggable?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  className?: string
}

export function ClickableUnitCard({
  unit,
  size = 'medium',
  showActions = true,
  draggable = false,
  onDragStart,
  onDragEnd,
  className
}: ClickableUnitCardProps) {
  const [showUnitDetails, setShowUnitDetails] = useState(false)
  
  return (
    <>
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={() => setShowUnitDetails(true)}
        className={`cursor-pointer hover:scale-105 transition-transform ${className || ''}`}
        title="Click to view details"
      >
        <UnitCard
          unit={unit}
          size={size}
          showActions={showActions}
        />
      </div>
      
      {/* Unit Details Modal */}
      {showUnitDetails && (
        <UnitDetailsModal
          unit={unit}
          onClose={() => setShowUnitDetails(false)}
        />
      )}
    </>
  )
}