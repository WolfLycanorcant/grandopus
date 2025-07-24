import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { Race, Archetype, UnitFactory } from '../core/units'
import { X, Shuffle, User } from 'lucide-react'

interface CreateUnitModalProps {
  onClose: () => void
}

export function CreateUnitModal({ onClose }: CreateUnitModalProps) {
  const { createUnit, createRandomUnit } = useGameStore()
  
  const [formData, setFormData] = useState({
    name: '',
    race: Race.HUMAN,
    archetype: Archetype.LIGHT_INFANTRY,
    level: 1
  })
  
  const [isCreating, setIsCreating] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a unit name')
      return
    }
    
    setIsCreating(true)
    
    try {
      createUnit(formData)
      onClose()
    } catch (error) {
      console.error('Failed to create unit:', error)
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to create unit'
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsCreating(false)
    }
  }
  
  const handleRandomUnit = () => {
    setIsCreating(true)
    try {
      createRandomUnit(formData.level)
      onClose()
    } catch (error) {
      console.error('Failed to create random unit:', error)
    } finally {
      setIsCreating(false)
    }
  }
  
  const generateRandomName = () => {
    const names = {
      [Race.HUMAN]: ['Marcus', 'Elena', 'Thomas', 'Sarah', 'David', 'Maria', 'Alexander', 'Isabella'],
      [Race.ELF]: ['Aelindra', 'Thalorin', 'Silviana', 'Erevan', 'Lyralei', 'Varian', 'Elaria', 'Fenris'],
      [Race.DWARF]: ['Thorin', 'Daina', 'Balin', 'Nori', 'Gimli', 'Dwalin', 'Ori', 'Gloin'],
      [Race.ORC]: ['Grok', 'Ursa', 'Thok', 'Grenda', 'Morg', 'Ulga', 'Krusk', 'Vash'],
      [Race.GOBLIN]: ['Snik', 'Grix', 'Zap', 'Nix', 'Pip', 'Krik', 'Fizz', 'Gob'],
      [Race.ANGEL]: ['Seraphiel', 'Auriel', 'Gabriel', 'Raphael', 'Uriel', 'Michael', 'Azrael', 'Camael'],
      [Race.DEMON]: ['Bael', 'Lilith', 'Malphas', 'Vex', 'Zagan', 'Paimon', 'Beleth', 'Asmodeus'],
      [Race.BEAST]: ['Fang', 'Claw', 'Storm', 'Shadow', 'Thunder', 'Blaze', 'Frost', 'Ember'],
      [Race.DRAGON]: ['Pyraxis', 'Frostmaw', 'Stormwing', 'Shadowflame', 'Goldscale', 'Ironhide', 'Voidclaw', 'Sunfire'],
      [Race.GRIFFON]: ['Skytalon', 'Windcrest', 'Stormfeather', 'Goldbeak', 'Swiftclaw', 'Cloudwing', 'Starsoar', 'Thunderstrike']
    }
    
    const raceNames = names[formData.race] || names[Race.HUMAN]
    const randomName = raceNames[Math.floor(Math.random() * raceNames.length)]
    
    setFormData(prev => ({ ...prev, name: randomName }))
  }
  
  const getRecommendedArchetypes = (race: Race): Archetype[] => {
    return UnitFactory.getRecommendedArchetypes(race)
  }
  
  const recommendedArchetypes = getRecommendedArchetypes(formData.race)
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Create New Unit</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="card-body space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleRandomUnit}
              disabled={isCreating}
              className="btn-secondary flex items-center flex-1"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Generate Random Unit
            </button>
          </div>
          
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Custom Unit</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Unit Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter unit name..."
                    className="input flex-1"
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={generateRandomName}
                    className="btn-outline px-3"
                    title="Generate random name"
                  >
                    <User className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Race */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Race
                </label>
                <select
                  value={formData.race}
                  onChange={(e) => {
                    const newRace = e.target.value as Race
                    const recommendedArchetypes = getRecommendedArchetypes(newRace)
                    
                    // Check if current archetype is valid for new race
                    const isCurrentArchetypeValid = (() => {
                      const currentArchetype = formData.archetype
                      // Only dwarves can be Dwarven Engineers
                      if (currentArchetype === Archetype.DWARVEN_ENGINEER && newRace !== Race.DWARF) {
                        return false
                      }
                      // Beasts can't be spellcasters
                      if (newRace === Race.BEAST && [Archetype.MAGE, Archetype.CLERIC].includes(currentArchetype)) {
                        return false
                      }
                      // Dragons can't be rogues (too large)
                      if (newRace === Race.DRAGON && currentArchetype === Archetype.ROGUE) {
                        return false
                      }
                      // Griffons can't be heavy infantry (flying creatures)
                      if (newRace === Race.GRIFFON && currentArchetype === Archetype.HEAVY_INFANTRY) {
                        return false
                      }
                      return true
                    })()
                    
                    setFormData(prev => ({ 
                      ...prev, 
                      race: newRace,
                      // Auto-select valid archetype if current becomes invalid
                      archetype: isCurrentArchetypeValid 
                        ? prev.archetype 
                        : recommendedArchetypes[0] || Archetype.LIGHT_INFANTRY
                    }))
                  }}
                  className="select"
                >
                  {Object.values(Race).map(race => (
                    <option key={race} value={race}>
                      {race.charAt(0).toUpperCase() + race.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Archetype */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Class/Archetype
                </label>
                <select
                  value={formData.archetype}
                  onChange={(e) => setFormData(prev => ({ ...prev, archetype: e.target.value as Archetype }))}
                  className="select"
                >
                  {Object.values(Archetype).map(archetype => {
                    const isRecommended = recommendedArchetypes.includes(archetype)
                    const displayName = archetype.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                    
                    // Check for special restrictions
                    const isValidForRace = (() => {
                      // Only dwarves can be Dwarven Engineers
                      if (archetype === Archetype.DWARVEN_ENGINEER && formData.race !== Race.DWARF) {
                        return false
                      }
                      // Beasts can't be spellcasters
                      if (formData.race === Race.BEAST && [Archetype.MAGE, Archetype.CLERIC].includes(archetype)) {
                        return false
                      }
                      // Dragons can't be rogues (too large)
                      if (formData.race === Race.DRAGON && archetype === Archetype.ROGUE) {
                        return false
                      }
                      // Griffons can't be heavy infantry (flying creatures)
                      if (formData.race === Race.GRIFFON && archetype === Archetype.HEAVY_INFANTRY) {
                        return false
                      }
                      return true
                    })()
                    
                    if (!isValidForRace) {
                      return null
                    }
                    
                    return (
                      <option key={archetype} value={archetype}>
                        {displayName} {isRecommended ? '⭐' : ''}
                      </option>
                    )
                  })}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  ⭐ = Recommended for {formData.race}
                </p>
              </div>
              
              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Starting Level
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-8 text-center">
                    {formData.level}
                  </span>
                </div>
              </div>
              
              {/* Preview Stats */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Preview Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Race Traits:</span>
                    <div className="text-slate-300 mt-1">
                      {/* This would show race bonuses */}
                      <span className="text-xs">
                        {formData.race === Race.HUMAN && 'Balanced, no penalties'}
                        {formData.race === Race.ELF && '+15% magic damage, +10% evasion'}
                        {formData.race === Race.DWARF && '+20% armor'}
                        {formData.race === Race.ORC && '+10% physical damage, -10% armor'}
                        {formData.race === Race.BEAST && 'High HP/STR, takes 2 slots'}
                        {formData.race === Race.DRAGON && 'Massive stats, takes 2 slots'}
                        {/* Add other races as needed */}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Slot Cost:</span>
                    <div className="text-slate-300 mt-1">
                      {[Race.BEAST, Race.DRAGON, Race.GRIFFON].includes(formData.race) ? '2 slots' : '1 slot'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-4 pt-4">
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
                  {isCreating ? 'Creating...' : 'Create Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}