import { useEffect } from 'react'
import { useGameStore } from '../stores/gameStore'

export const useKeyboardShortcuts = () => {
  const { saveGame, loadGame, autoSave, getSaveSlots } = useGameStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if not typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Ctrl/Cmd + S: Quick Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        const success = autoSave()
        if (success) {
          console.log('Quick save completed')
          // You could show a toast notification here
        }
        return
      }

      // F5: Quick Save (alternative)
      if (event.key === 'F5') {
        event.preventDefault()
        const success = autoSave()
        if (success) {
          console.log('Quick save completed (F5)')
        }
        return
      }

      // F9: Quick Load (load most recent save)
      if (event.key === 'F9') {
        event.preventDefault()
        const slots = getSaveSlots()
        const mostRecentSlot = slots
          .filter(slot => !slot.isEmpty && !slot.isCorrupted)
          .sort((a, b) => b.timestamp - a.timestamp)[0]
        
        if (mostRecentSlot) {
          const success = loadGame(mostRecentSlot.slotId)
          if (success) {
            console.log(`Quick load completed from slot ${mostRecentSlot.slotId}`)
          }
        } else {
          console.warn('No save files available for quick load')
        }
        return
      }

      // Ctrl/Cmd + Shift + S: Save to specific slot (slot 1)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault()
        const success = saveGame('0') // Save to slot 1 (index 0)
        if (success) {
          console.log('Manual save to slot 1 completed')
        }
        return
      }

      // Number keys 1-9: Quick save to specific slots (when Ctrl/Cmd is held)
      if ((event.ctrlKey || event.metaKey) && /^[1-9]$/.test(event.key)) {
        event.preventDefault()
        const slotIndex = (parseInt(event.key) - 1).toString()
        const success = saveGame(slotIndex)
        if (success) {
          console.log(`Quick save to slot ${parseInt(event.key)} completed`)
        }
        return
      }

      // Alt + Number keys 1-9: Quick load from specific slots
      if (event.altKey && /^[1-9]$/.test(event.key)) {
        event.preventDefault()
        const slotIndex = (parseInt(event.key) - 1).toString()
        const success = loadGame(slotIndex)
        if (success) {
          console.log(`Quick load from slot ${parseInt(event.key)} completed`)
        } else {
          console.warn(`No save data in slot ${parseInt(event.key)}`)
        }
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [saveGame, loadGame, autoSave, getSaveSlots])
}

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = {
  quickSave: ['Ctrl+S', 'F5'],
  quickLoad: ['F9'],
  manualSave: ['Ctrl+Shift+S'],
  saveToSlot: ['Ctrl+1-9'],
  loadFromSlot: ['Alt+1-9']
} as const