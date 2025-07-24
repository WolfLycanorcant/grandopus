import React, { useState } from 'react'
import { SaveLoadPanel } from './SaveLoadPanel'
import { useGameStore } from '../stores/gameStore'

export const SaveLoadMenu: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false)
  const { autoSave, loadGame, getSaveSlots } = useGameStore()

  const handleQuickSave = () => {
    autoSave()
  }

  const handleQuickLoad = () => {
    const slots = getSaveSlots()
    const autoSaveSlot = slots.find(slot => slot.isAutoSave && !slot.isEmpty)
    
    if (autoSaveSlot) {
      loadGame('auto')
    } else {
      // If no auto-save, show the panel
      setShowPanel(true)
    }
  }

  return (
    <>
      {/* Menu Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleQuickSave}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
          title="Quick Save (Auto Save)"
        >
          💾 Save
        </button>
        
        <button
          onClick={handleQuickLoad}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
          title="Quick Load (Auto Save)"
        >
          📁 Load
        </button>
        
        <button
          onClick={() => setShowPanel(true)}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
          title="Save & Load Manager"
        >
          ⚙️ Manage
        </button>
      </div>

      {/* Save/Load Panel Modal */}
      {showPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <SaveLoadPanel onClose={() => setShowPanel(false)} />
        </div>
      )}
    </>
  )
}