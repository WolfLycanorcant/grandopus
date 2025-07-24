import React, { useState } from 'react'
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts'
import { Keyboard, X } from 'lucide-react'

export const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const shortcutGroups = [
    {
      title: 'Save & Load',
      shortcuts: [
        { keys: ['Ctrl+S', 'F5'], description: 'Quick Save (Auto-save slot)' },
        { keys: ['F9'], description: 'Quick Load (Most recent save)' },
        { keys: ['Ctrl+Shift+S'], description: 'Manual Save to Slot 1' },
        { keys: ['Ctrl+1-9'], description: 'Save to specific slot (1-9)' },
        { keys: ['Alt+1-9'], description: 'Load from specific slot (1-9)' }
      ]
    },
    {
      title: 'General',
      shortcuts: [
        { keys: ['Esc'], description: 'Close current modal/panel' },
        { keys: ['?'], description: 'Show this help panel' },
        { keys: ['Tab'], description: 'Navigate between UI elements' }
      ]
    },
    {
      title: 'Battle',
      shortcuts: [
        { keys: ['Space'], description: 'Pause/Resume battle' },
        { keys: ['Enter'], description: 'Confirm action' },
        { keys: ['1-6'], description: 'Select formation position' }
      ]
    }
  ]

  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <span key={index}>
        <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-gray-300">
          {key}
        </kbd>
        {index < keys.length - 1 && <span className="mx-1 text-gray-500">or</span>}
      </span>
    ))
  }

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        title="Keyboard Shortcuts (Press ? for help)"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Keyboard className="h-6 w-6" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {shortcutGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-3">
                    {group.shortcuts.map((shortcut, shortcutIndex) => (
                      <div key={shortcutIndex} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {formatKeys(shortcut.keys)}
                        </div>
                        <span className="text-gray-300 text-sm flex-1 ml-4">
                          {shortcut.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Tips */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">💡 Tips</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Shortcuts work globally except when typing in input fields</li>
                  <li>• Auto-save happens automatically every 5 minutes and on page close</li>
                  <li>• Use numbered slots (1-9) for important save points</li>
                  <li>• Quick Load (F9) loads the most recent save file</li>
                  <li>• Press Esc to close most dialogs and panels</li>
                </ul>
              </div>

              {/* Platform-specific notes */}
              <div className="text-xs text-gray-400 text-center">
                <p>On Mac, use Cmd instead of Ctrl for most shortcuts</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}