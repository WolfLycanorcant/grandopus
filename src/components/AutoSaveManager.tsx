import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'

interface AutoSaveManagerProps {
  enabled?: boolean
  intervalMinutes?: number
}

export const AutoSaveManager: React.FC<AutoSaveManagerProps> = ({
  enabled = true,
  intervalMinutes = 5
}) => {
  const { autoSave, units, squads, currentTurn } = useGameStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveStateRef = useRef<string>('')

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Create auto-save interval
    intervalRef.current = setInterval(() => {
      // Create a simple state hash to check if game state changed
      const currentStateHash = JSON.stringify({
        unitsCount: units.length,
        squadsCount: squads.length,
        currentTurn,
        unitIds: units.map(u => u.id).sort(),
        squadIds: squads.map(s => s.id).sort()
      })

      // Only auto-save if state has changed
      if (currentStateHash !== lastSaveStateRef.current) {
        const success = autoSave()
        if (success) {
          lastSaveStateRef.current = currentStateHash
          console.log('Auto-save completed')
        } else {
          console.warn('Auto-save failed')
        }
      }
    }, intervalMinutes * 60 * 1000) // Convert minutes to milliseconds

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, intervalMinutes, autoSave, units, squads, currentTurn])

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabled) {
        autoSave()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, autoSave])

  // This component doesn't render anything
  return null
}