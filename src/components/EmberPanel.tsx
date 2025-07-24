import React, { useState } from 'react'
import { Unit } from '../core/units'
import { 
  Ember, 
  EquipmentSlot, 
  EquipmentRarity, 
  WeaponProperties 
} from '../core/equipment'
import { 
  getEmber, 
  getAllEmbers, 
  getEmbersByType, 
  getEmbersForLevel 
} from '../core/equipment/EmberData'
import { 
  Flame, 
  Zap, 
  Star, 
  Plus, 
  X, 
  Trash2, 
  Info,
  Filter,
  Search
} from 'lucide-react'
import clsx from 'clsx'

interface EmberPanelProps {
  unit: Unit
  weaponSlot: EquipmentSlot.WEAPON | EquipmentSlot.OFF_HAND
  onEmberChange?: () => void
}

export function EmberPanel({ unit, weaponSlot, onEmberChange }: EmberPanelProps) {
  const [showEmberBrowser, setShowEmberBrowser] = useState(false)
  const [selectedEmberType, setSelectedEmberType] = useState<'all' | 'damage' | 'stat' | 'special'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const weapon = unit.getEquippedItem(weaponSlot) as WeaponProperties
  
  if (!weapon || !('emberSlots' in weapon)) {
    return (
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="text-center py-8">
          <Flame className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No weapon equipped</p>
          <p className="text-sm text-slate-500 mt-1">
            Equip a weapon to manage embers
          </p>
        </div>
      </div>
    )
  }
  
  const embeddedEmbers = unit.emberManager.getEmbeddedEmbers(weaponSlot)
  const availableSlots = unit.emberManager.getAvailableEmberSlots(weaponSlot)
  const emberBonuses = unit.emberManager.calculateEmberBonuses(weaponSlot)
  
  const getEmberTypeIcon = (type: string) => {
    switch (type) {
      case 'damage': return <Flame className="h-4 w-4" />
      case 'stat': return <Star className="h-4 w-4" />
      case 'special': return <Zap className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }
  
  const getEmberTypeColor = (type: string) => {
    switch (type) {
      case 'damage': return 'text-red-400 bg-red-900/30'
      case 'stat': return 'text-blue-400 bg-blue-900/30'
      case 'special': return 'text-purple-400 bg-purple-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }
  
  const getRarityColor = (rarity: EquipmentRarity) => {
    switch (rarity) {
      case EquipmentRarity.COMMON: return 'text-gray-400 border-gray-500'
      case EquipmentRarity.UNCOMMON: return 'text-green-400 border-green-500'
      case EquipmentRarity.RARE: return 'text-blue-400 border-blue-500'
      case EquipmentRarity.EPIC: return 'text-purple-400 border-purple-500'
      case EquipmentRarity.LEGENDARY: return 'text-yellow-400 border-yellow-500'
      default: return 'text-gray-400 border-gray-500'
    }
  }
  
  const handleEmbedEmber = (emberId: string) => {
    try {
      unit.emberManager.embedEmber(weaponSlot, emberId)
      onEmberChange?.()
      setShowEmberBrowser(false)
    } catch (error) {
      console.error('Failed to embed ember:', error)
      alert(`Failed to embed ember: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  const handleRemoveEmber = (emberId: string) => {
    try {
      unit.emberManager.removeEmber(weaponSlot, emberId)
      onEmberChange?.()
    } catch (error) {
      console.error('Failed to remove ember:', error)
      alert(`Failed to remove ember: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  const getAvailableEmbers = () => {
    let embers = getEmbersForLevel(unit.experience.currentLevel)
    
    // Filter by type
    if (selectedEmberType !== 'all') {
      embers = embers.filter(ember => ember.type === selectedEmberType)
    }
    
    // Filter by search term
    if (searchTerm) {
      embers = embers.filter(ember => 
        ember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ember.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter out already embedded embers
    const embeddedEmberIds = embeddedEmbers.map(e => e.id)
    embers = embers.filter(ember => !embeddedEmberIds.includes(ember.id))
    
    return embers
  }
  
  return (
    <div className="space-y-4">
      {/* Weapon Info */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-300">
            {weapon.name} - Ember Slots
          </h4>
          <span className="text-xs text-slate-400">
            {embeddedEmbers.length}/{weapon.emberSlots} slots used
          </span>
        </div>
        
        {/* Ember Slots Visual */}
        <div className="flex space-x-2 mb-4">
          {Array.from({ length: weapon.emberSlots }, (_, index) => {
            const ember = embeddedEmbers[index]
            return (
              <div
                key={index}
                className={clsx(
                  'w-12 h-12 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors',
                  ember 
                    ? `${getRarityColor(ember.rarity).split(' ')[1]} bg-slate-600` 
                    : 'border-dashed border-slate-600 hover:border-slate-500'
                )}
                onClick={() => {
                  if (ember) {
                    if (confirm(`Remove ${ember.name}?`)) {
                      handleRemoveEmber(ember.id)
                    }
                  } else if (availableSlots > 0) {
                    setShowEmberBrowser(true)
                  }
                }}
              >
                {ember ? (
                  <div className="text-center">
                    <div className={getEmberTypeColor(ember.type).split(' ')[0]}>
                      {getEmberTypeIcon(ember.type)}
                    </div>
                  </div>
                ) : (
                  <Plus className="h-4 w-4 text-slate-500" />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Add Ember Button */}
        {availableSlots > 0 && (
          <button
            onClick={() => setShowEmberBrowser(true)}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Ember</span>
          </button>
        )}
      </div>
      
      {/* Embedded Embers List */}
      {embeddedEmbers.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Embedded Embers</h4>
          <div className="space-y-2">
            {embeddedEmbers.map((ember) => (
              <div
                key={ember.id}
                className={clsx(
                  'border rounded-lg p-3 flex items-center justify-between',
                  getRarityColor(ember.rarity).split(' ')[1]
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={clsx(
                    'p-2 rounded',
                    getEmberTypeColor(ember.type)
                  )}>
                    {getEmberTypeIcon(ember.type)}
                  </div>
                  <div>
                    <h5 className={clsx(
                      'font-medium text-sm',
                      getRarityColor(ember.rarity).split(' ')[0]
                    )}>
                      {ember.name}
                    </h5>
                    <p className="text-xs text-slate-400">{ember.description}</p>
                    
                    {/* Ember Effects */}
                    <div className="mt-1 space-y-1">
                      {ember.damageBonus && (
                        <div className="text-xs text-orange-400">
                          +{ember.damageBonus} {ember.damageType} damage
                        </div>
                      )}
                      {ember.statBonuses && Object.entries(ember.statBonuses).map(([stat, bonus]) => (
                        <div key={stat} className="text-xs text-green-400">
                          {stat.toUpperCase()}: +{bonus}
                        </div>
                      ))}
                      {ember.specialEffect && (
                        <div className="text-xs text-purple-400">
                          {ember.specialEffect.name}: {ember.specialEffect.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm(`Remove ${ember.name}?`)) {
                      handleRemoveEmber(ember.id)
                    }
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Ember Bonuses Summary */}
      {(emberBonuses.damageBonus > 0 || Object.keys(emberBonuses.statBonuses).length > 0 || emberBonuses.specialEffects.length > 0) && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Total Ember Bonuses</h4>
          <div className="space-y-2">
            {emberBonuses.damageBonus > 0 && (
              <div className="text-sm text-orange-400">
                Damage: +{emberBonuses.damageBonus}
              </div>
            )}
            {Object.entries(emberBonuses.statBonuses).map(([stat, bonus]) => (
              <div key={stat} className="text-sm text-green-400">
                {stat.toUpperCase()}: +{bonus}
              </div>
            ))}
            {emberBonuses.specialEffects.map((effect, index) => (
              <div key={index} className="text-sm text-purple-400">
                {effect.name}: {effect.description}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Ember Browser Modal */}
      {showEmberBrowser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Select Ember to Embed
              </h3>
              <button
                onClick={() => {
                  setShowEmberBrowser(false)
                  setSearchTerm('')
                  setSelectedEmberType('all')
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="card-body">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search embers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {(['all', 'damage', 'stat', 'special'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedEmberType(type)}
                      className={clsx(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        selectedEmberType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-slate-300'
                      )}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Available Embers */}
              <div className="space-y-3">
                {getAvailableEmbers().map((ember) => {
                  const compatibility = unit.emberManager.getEmberCompatibility(ember.id)
                  
                  return (
                    <div
                      key={ember.id}
                      className={clsx(
                        'border rounded-lg p-4 transition-colors',
                        getRarityColor(ember.rarity).split(' ')[1],
                        compatibility.canUse 
                          ? 'cursor-pointer hover:bg-slate-600' 
                          : 'opacity-50 cursor-not-allowed'
                      )}
                      onClick={() => {
                        if (compatibility.canUse) {
                          handleEmbedEmber(ember.id)
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className={clsx(
                            'p-2 rounded',
                            getEmberTypeColor(ember.type)
                          )}>
                            {getEmberTypeIcon(ember.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={clsx(
                                'font-medium',
                                getRarityColor(ember.rarity).split(' ')[0]
                              )}>
                                {ember.name}
                              </h4>
                              <span className={clsx(
                                'px-2 py-1 rounded text-xs font-medium',
                                getEmberTypeColor(ember.type)
                              )}>
                                {ember.type}
                              </span>
                            </div>
                            
                            <p className="text-sm text-slate-400 mb-2">
                              {ember.description}
                            </p>
                            
                            {/* Ember Effects */}
                            <div className="space-y-1">
                              {ember.damageBonus && (
                                <div className="text-sm text-orange-400">
                                  +{ember.damageBonus} {ember.damageType} damage
                                </div>
                              )}
                              {ember.statBonuses && Object.entries(ember.statBonuses).map(([stat, bonus]) => (
                                <div key={stat} className="text-sm text-green-400">
                                  {stat.toUpperCase()}: +{bonus}
                                </div>
                              ))}
                              {ember.specialEffect && (
                                <div className="text-sm text-purple-400">
                                  <strong>{ember.specialEffect.name}:</strong> {ember.specialEffect.description}
                                </div>
                              )}
                            </div>
                            
                            {!compatibility.canUse && (
                              <div className="mt-2 text-sm text-red-400">
                                ⚠️ {compatibility.reason}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-slate-400">
                            Lv.{ember.levelRequirement}
                          </div>
                          <div className={clsx(
                            'text-xs font-medium mt-1',
                            getRarityColor(ember.rarity).split(' ')[0]
                          )}>
                            {ember.rarity}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {getAvailableEmbers().length === 0 && (
                  <div className="text-center py-8">
                    <Flame className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No embers available</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Try adjusting your filters or level up to unlock more embers
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}