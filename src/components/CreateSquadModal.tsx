import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SQUAD_PRESETS } from '../core/squads'
import { X, Shuffle, Users, Crown } from 'lucide-react'

interface CreateSquadModalProps {
  onClose: () => void
}

export function CreateSquadModal({ onClose }: CreateSquadModalProps) {
  const { createSquad, createSquadFromPreset, units } = useGameStore()
  
  const [activeTab, setActiveTab] = useState<'custom' | 'preset'>('preset')
  const [formData, setFormData] = useState({
    name: '',
    gameProgressLevel: 1
  })
  
  const [isCreating, setIsCreating] = useState(false)
  
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a squad name')
      return
    }
    
    setIsCreating(true)
    
    try {
      createSquad({
        name: formData.name,
        gameProgressLevel: formData.gameProgressLevel,
        initialUnits: [],
        autoBalance: false
      })
      onClose()
    } catch (error) {
      console.error('Failed to create squad:', error)
    } finally {
      setIsCreating(false)
    }
  }
  
  const handlePresetCreate = async (presetKey: keyof typeof SQUAD_PRESETS, customName?: string) => {
    setIsCreating(true)
    
    try {
      createSquadFromPreset(presetKey, customName)
      onClose()
    } catch (error) {
      console.error('Failed to create squad from preset:', error)
    } finally {
      setIsCreating(false)
    }
  }
  
  const generateRandomName = () => {
    const adjectives = [
      'Iron', 'Golden', 'Shadow', 'Storm', 'Fire', 'Ice', 'Thunder', 'Swift',
      'Brave', 'Noble', 'Wild', 'Ancient', 'Mystic', 'Sacred', 'Dark', 'Bright'
    ]
    
    const nouns = [
      'Hawks', 'Wolves', 'Lions', 'Eagles', 'Dragons', 'Phoenix', 'Griffons',
      'Blades', 'Shields', 'Spears', 'Arrows', 'Hammers', 'Guards', 'Legion',
      'Company', 'Battalion', 'Regiment', 'Order', 'Brotherhood', 'Alliance'
    ]
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    
    setFormData(prev => ({ ...prev, name: `${adjective} ${noun}` }))
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Create New Squad</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-slate-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('preset')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'preset'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              From Preset
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'custom'
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Crown className="h-4 w-4 mr-2 inline" />
              Custom Squad
            </button>
          </nav>
        </div>
        
        <div className="card-body">
          {activeTab === 'preset' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Choose a Preset Squad</h3>
                <p className="text-slate-400 mb-6">
                  Start with a pre-built squad composition. You can modify it after creation.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SQUAD_PRESETS).map(([key, preset]) => (
                  <div key={key} className="card hover:bg-slate-700 transition-colors">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-white">{preset.name}</h4>
                        <span className="bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
                          T{preset.gameProgressLevel}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-400 mb-4">{preset.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-400 mb-2">Units ({preset.unitConfigs.length})</div>
                          <div className="space-y-1">
                            {preset.unitConfigs.map((unitConfig, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-slate-300">{unitConfig.name}</span>
                                <span className="text-slate-400">
                                  Lv.{unitConfig.level} {unitConfig.race} {unitConfig.archetype.replace('_', ' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {preset.recommendedArtifacts && (
                          <div>
                            <div className="text-xs text-slate-400 mb-2">Recommended Artifacts</div>
                            <div className="flex flex-wrap gap-1">
                              {preset.recommendedArtifacts.map((artifact, index) => (
                                <span
                                  key={index}
                                  className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full"
                                >
                                  {artifact}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handlePresetCreate(key as keyof typeof SQUAD_PRESETS)}
                        disabled={isCreating}
                        className="btn-primary w-full mt-4"
                      >
                        {isCreating ? 'Creating...' : 'Create Squad'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Create Custom Squad</h3>
                <p className="text-slate-400 mb-6">
                  Create an empty squad and add units manually. Perfect for custom compositions.
                </p>
              </div>
              
              <form onSubmit={handleCustomSubmit} className="space-y-6">
                {/* Squad Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Squad Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter squad name..."
                      className="input flex-1"
                      maxLength={50}
                    />
                    <button
                      type="button"
                      onClick={generateRandomName}
                      className="btn-outline px-3"
                      title="Generate random name"
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Game Progress Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tier Level (affects base capacity)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.gameProgressLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, gameProgressLevel: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-white font-medium w-8 text-center">
                      T{formData.gameProgressLevel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Base capacity: {Math.min(3 + (formData.gameProgressLevel - 1) * 2, 9)} units
                  </div>
                </div>
                
                {/* Preview */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Squad Preview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Name:</span>
                      <div className="text-slate-300">{formData.name || 'Unnamed Squad'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Tier:</span>
                      <div className="text-slate-300">T{formData.gameProgressLevel}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Base Capacity:</span>
                      <div className="text-slate-300">
                        {Math.min(3 + (formData.gameProgressLevel - 1) * 2, 9)} units
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Available Units:</span>
                      <div className="text-slate-300">{units.length} units</div>
                    </div>
                  </div>
                </div>
                
                {/* Warning if no units */}
                {units.length === 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm">
                      <strong>Note:</strong> You don't have any available units to add to this squad. 
                      Create some units first, or use a preset squad that includes units.
                    </p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-outline flex-1"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={isCreating || !formData.name.trim()}
                  >
                    {isCreating ? 'Creating...' : 'Create Empty Squad'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}