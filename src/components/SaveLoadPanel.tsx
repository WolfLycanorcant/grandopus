import React, { useState, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SaveSlotInfo } from '../core/save/SaveManager'

interface SaveLoadPanelProps {
  onClose?: () => void
}

export const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    saveGame,
    loadGame,
    getSaveSlots,
    deleteSave,
    exportSave,
    importSave,
    autoSave,
    setError,
    isLoading
  } = useGameStore()

  const saveSlots = getSaveSlots()

  const handleSave = (slotId: string) => {
    const success = saveGame(slotId)
    if (success) {
      setSelectedSlot(null)
      setError(null)
    }
  }

  const handleLoad = (slotId: string) => {
    const success = loadGame(slotId)
    if (success && onClose) {
      onClose()
    }
  }

  const handleDelete = (slotId: string) => {
    const success = deleteSave(slotId)
    if (success) {
      setShowConfirmDelete(null)
      setSelectedSlot(null)
    }
  }

  const handleExport = (slotId: string) => {
    exportSave(slotId)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!selectedSlot) {
      setError('Please select a slot to import to')
      return
    }

    setIsImporting(true)
    const success = await importSave(file, selectedSlot)
    setIsImporting(false)

    if (success) {
      setSelectedSlot(null)
      setError(null)
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAutoSave = () => {
    const success = autoSave()
    if (success) {
      setError(null)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getSlotDisplayName = (slot: SaveSlotInfo) => {
    if (slot.isAutoSave) return 'Auto Save'
    return `Slot ${parseInt(slot.slotId) + 1}`
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Save & Load Game</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('save')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'save'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Save Game
        </button>
        <button
          onClick={() => setActiveTab('load')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'load'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Load Game
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleAutoSave}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded"
        >
          Quick Save
        </button>
        {activeTab === 'load' && (
          <>
            <button
              onClick={handleImportClick}
              disabled={!selectedSlot || isImporting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded"
            >
              {isImporting ? 'Importing...' : 'Import Save'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Save Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {saveSlots.map((slot) => (
          <div
            key={slot.slotId}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedSlot === slot.slotId
                ? 'border-blue-500 bg-blue-900/20'
                : slot.isEmpty
                ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                : 'border-gray-500 bg-gray-700 hover:bg-gray-600'
            } ${slot.isCorrupted ? 'border-red-500 bg-red-900/20' : ''}`}
            onClick={() => setSelectedSlot(slot.slotId)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white">
                {getSlotDisplayName(slot)}
              </h3>
              {slot.isAutoSave && (
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                  AUTO
                </span>
              )}
              {slot.isCorrupted && (
                <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                  CORRUPTED
                </span>
              )}
            </div>

            {slot.isEmpty ? (
              <p className="text-gray-400 text-sm">Empty Slot</p>
            ) : slot.isCorrupted ? (
              <p className="text-red-400 text-sm">Corrupted save file</p>
            ) : slot.metadata ? (
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">
                  Turn {slot.metadata.currentTurn} • {slot.metadata.unitsCount} units • {slot.metadata.squadsCount} squads
                </p>
                <p className="text-gray-400">
                  {formatTimestamp(slot.timestamp)}
                </p>
                {slot.metadata.totalPlayTime > 0 && (
                  <p className="text-gray-400">
                    Play time: {formatPlayTime(slot.metadata.totalPlayTime)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No metadata available</p>
            )}

            {/* Slot Actions */}
            {selectedSlot === slot.slotId && !slot.isEmpty && !slot.isCorrupted && (
              <div className="flex gap-2 mt-3">
                {activeTab === 'save' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSave(slot.slotId)
                    }}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded"
                  >
                    Overwrite
                  </button>
                )}
                {activeTab === 'load' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLoad(slot.slotId)
                    }}
                    disabled={isLoading}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded"
                  >
                    Load
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExport(slot.slotId)
                  }}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                >
                  Export
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowConfirmDelete(slot.slotId)
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                >
                  Delete
                </button>
              </div>
            )}

            {/* Save to empty slot */}
            {selectedSlot === slot.slotId && slot.isEmpty && activeTab === 'save' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave(slot.slotId)
                }}
                disabled={isLoading}
                className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded"
              >
                Save Here
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this save? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showConfirmDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Usage */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          Storage Usage: {Math.round((saveSlots.length / 10) * 100)}% of available slots
        </div>
      </div>
    </div>
  )
}