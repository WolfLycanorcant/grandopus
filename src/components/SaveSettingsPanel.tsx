import React, { useState, useEffect } from 'react'
import { SaveManager } from '../core/save/SaveManager'

interface SaveSettings {
  autoSaveEnabled: boolean
  autoSaveInterval: number // in minutes
  maxSaveSlots: number
  showSaveNotifications: boolean
  compressedSaves: boolean
}

interface SaveSettingsPanelProps {
  onClose?: () => void
}

export const SaveSettingsPanel: React.FC<SaveSettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<SaveSettings>({
    autoSaveEnabled: true,
    autoSaveInterval: 5,
    maxSaveSlots: 10,
    showSaveNotifications: true,
    compressedSaves: false
  })

  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    percentage: 0
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('grand_opus_save_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...settings, ...parsed })
      } catch (error) {
        console.warn('Failed to load save settings:', error)
      }
    }

    // Get storage info
    const storage = SaveManager.getStorageUsage()
    setStorageInfo(storage)
  }, [])

  const saveSettings = (newSettings: SaveSettings) => {
    setSettings(newSettings)
    localStorage.setItem('grand_opus_save_settings', JSON.stringify(newSettings))
  }

  const handleClearAllSaves = () => {
    if (window.confirm('Are you sure you want to delete ALL save files? This cannot be undone!')) {
      const success = SaveManager.clearAllSaves()
      if (success) {
        setStorageInfo({ used: 0, total: storageInfo.total, percentage: 0 })
      }
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Save Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Auto-Save Settings */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-lg font-semibold text-white mb-4">Auto-Save</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Enable Auto-Save</label>
              <input
                type="checkbox"
                checked={settings.autoSaveEnabled}
                onChange={(e) => saveSettings({ ...settings, autoSaveEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-300">Auto-Save Interval</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={settings.autoSaveInterval}
                  onChange={(e) => saveSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) })}
                  disabled={!settings.autoSaveEnabled}
                  className="w-24"
                />
                <span className="text-gray-300 w-16">{settings.autoSaveInterval} min</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-300">Show Save Notifications</label>
              <input
                type="checkbox"
                checked={settings.showSaveNotifications}
                onChange={(e) => saveSettings({ ...settings, showSaveNotifications: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Storage Management */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-lg font-semibold text-white mb-4">Storage Management</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Storage Usage</span>
                <span>{formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    storageInfo.percentage > 80 ? 'bg-red-600' :
                    storageInfo.percentage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {storageInfo.percentage.toFixed(1)}% used
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-300">Compressed Saves (Experimental)</label>
              <input
                type="checkbox"
                checked={settings.compressedSaves}
                onChange={(e) => saveSettings({ ...settings, compressedSaves: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleClearAllSaves}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
            >
              Clear All Save Data
            </button>
          </div>
        </div>

        {/* Save Slot Management */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Save Slots</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Maximum Save Slots</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={settings.maxSaveSlots}
                  onChange={(e) => saveSettings({ ...settings, maxSaveSlots: parseInt(e.target.value) })}
                  className="w-24"
                />
                <span className="text-gray-300 w-8">{settings.maxSaveSlots}</span>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p>• Auto-save doesn't count towards the slot limit</p>
              <p>• Higher slot counts use more storage space</p>
              <p>• Recommended: 10-15 slots for most players</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">💡 Save Tips</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Use Quick Save (F5) before important battles</li>
            <li>• Export important saves as backup files</li>
            <li>• Auto-save triggers on game state changes</li>
            <li>• Clear old saves regularly to free up space</li>
            <li>• Manual saves are more reliable than auto-saves</li>
          </ul>
        </div>
      </div>
    </div>
  )
}