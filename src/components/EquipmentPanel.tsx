import React, { useState } from 'react'
import { Unit } from '../core/units'
import { EquipmentSlot, EquipmentRarity, WeaponProperties, ArmorProperties, AccessoryProperties } from '../core/equipment'
import { getWeapon, getStarterWeapons } from '../core/equipment/WeaponData'
import { getArmor, getAccessory, getStarterEquipment } from '../core/equipment/ArmorData'
import { Sword, Shield, Crown, Shirt, Hand, Footprints, Gem, Package, Plus, X } from 'lucide-react'
import clsx from 'clsx'

interface EquipmentPanelProps {
  unit: Unit
  onEquipmentChange?: () => void
}

export function EquipmentPanel({ unit, onEquipmentChange }: EquipmentPanelProps) {
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null)
  const [showItemBrowser, setShowItemBrowser] = useState(false)
  
  const getSlotIcon = (slot: EquipmentSlot) => {
    switch (slot) {
      case EquipmentSlot.WEAPON: return <Sword className="h-4 w-4" />
      case EquipmentSlot.OFF_HAND: return <Shield className="h-4 w-4" />
      case EquipmentSlot.HEAD: return <Crown className="h-4 w-4" />
      case EquipmentSlot.BODY: return <Shirt className="h-4 w-4" />
      case EquipmentSlot.HANDS: return <Hand className="h-4 w-4" />
      case EquipmentSlot.FEET: return <Footprints className="h-4 w-4" />
      case EquipmentSlot.ACCESSORY_1:
      case EquipmentSlot.ACCESSORY_2: return <Gem className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }
  
  const getSlotName = (slot: EquipmentSlot) => {
    switch (slot) {
      case EquipmentSlot.WEAPON: return 'Weapon'
      case EquipmentSlot.OFF_HAND: return 'Off-Hand'
      case EquipmentSlot.HEAD: return 'Head'
      case EquipmentSlot.BODY: return 'Body'
      case EquipmentSlot.HANDS: return 'Hands'
      case EquipmentSlot.FEET: return 'Feet'
      case EquipmentSlot.ACCESSORY_1: return 'Accessory 1'
      case EquipmentSlot.ACCESSORY_2: return 'Accessory 2'
      default: return 'Unknown'
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
  
  const handleEquipItem = (itemId: string, slot: EquipmentSlot) => {
    try {
      unit.equipItem(itemId, slot)
      onEquipmentChange?.()
      setShowItemBrowser(false)
      setSelectedSlot(null)
    } catch (error) {
      console.error('Failed to equip item:', error)
      alert(`Failed to equip item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  const handleUnequipItem = (slot: EquipmentSlot) => {
    try {
      unit.unequipItem(slot)
      onEquipmentChange?.()
    } catch (error) {
      console.error('Failed to unequip item:', error)
    }
  }
  
  const getAvailableItems = (slot: EquipmentSlot) => {
    if (slot === EquipmentSlot.WEAPON || slot === EquipmentSlot.OFF_HAND) {
      return getStarterWeapons().filter(weapon => 
        unit.equipmentManager.canEquipItem(weapon, slot)
      )
    } else if (slot === EquipmentSlot.ACCESSORY_1 || slot === EquipmentSlot.ACCESSORY_2) {
      const { accessories } = getStarterEquipment()
      return accessories.filter(accessory => 
        unit.equipmentManager.canEquipItem(accessory, slot)
      )
    } else {
      const { armor } = getStarterEquipment()
      return armor.filter(armorPiece => 
        armorPiece.slot === slot && unit.equipmentManager.canEquipItem(armorPiece, slot)
      )
    }
  }
  
  const equipmentSlots = Object.values(EquipmentSlot)
  const equipmentStats = unit.equipmentManager.calculateEquipmentStats()
  
  return (
    <div className="space-y-4">
      {/* Equipment Stats Summary */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Equipment Bonuses</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(equipmentStats.totalStatBonuses).map(([stat, bonus]) => (
            bonus > 0 && (
              <div key={stat} className="flex justify-between">
                <span className="text-slate-400 uppercase">{stat}:</span>
                <span className="text-green-400">+{bonus}</span>
              </div>
            )
          ))}
          {equipmentStats.totalArmorValue > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Armor:</span>
              <span className="text-blue-400">+{equipmentStats.totalArmorValue}</span>
            </div>
          )}
          {equipmentStats.totalMagicResistance > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Magic Resist:</span>
              <span className="text-purple-400">+{equipmentStats.totalMagicResistance}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Equipment Slots */}
      <div className="bg-slate-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Equipment Slots</h4>
        <div className="grid grid-cols-2 gap-3">
          {equipmentSlots.map((slot) => {
            const equippedItem = unit.getEquippedItem(slot)
            
            return (
              <div
                key={slot}
                className={clsx(
                  'border-2 border-dashed border-slate-600 rounded-lg p-3 min-h-[80px] flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 transition-colors',
                  equippedItem && 'border-solid bg-slate-600'
                )}
                onClick={() => {
                  if (equippedItem) {
                    // Show equipped item details or unequip
                    if (confirm(`Unequip ${equippedItem.name}?`)) {
                      handleUnequipItem(slot)
                    }
                  } else {
                    // Show item browser
                    setSelectedSlot(slot)
                    setShowItemBrowser(true)
                  }
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {getSlotIcon(slot)}
                  <span className="text-xs text-slate-400">{getSlotName(slot)}</span>
                </div>
                
                {equippedItem ? (
                  <div className="text-center">
                    <div className={clsx(
                      'text-xs font-medium',
                      getRarityColor(equippedItem.rarity).split(' ')[0]
                    )}>
                      {equippedItem.name}
                    </div>
                    {('baseDamage' in equippedItem) && (
                      <div className="text-xs text-slate-400">
                        {equippedItem.baseDamage} dmg
                      </div>
                    )}
                    {('armorValue' in equippedItem) && (
                      <div className="text-xs text-slate-400">
                        {equippedItem.armorValue} armor
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <Plus className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                    <span className="text-xs text-slate-500">Empty</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Item Browser Modal */}
      {showItemBrowser && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Select {getSlotName(selectedSlot)}
              </h3>
              <button
                onClick={() => {
                  setShowItemBrowser(false)
                  setSelectedSlot(null)
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="card-body">
              <div className="space-y-3">
                {getAvailableItems(selectedSlot).map((item) => (
                  <div
                    key={item.id}
                    className={clsx(
                      'border rounded-lg p-3 cursor-pointer hover:bg-slate-600 transition-colors',
                      getRarityColor(item.rarity).split(' ')[1]
                    )}
                    onClick={() => handleEquipItem(item.id, selectedSlot)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={clsx(
                          'font-medium',
                          getRarityColor(item.rarity).split(' ')[0]
                        )}>
                          {item.name}
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          {item.description}
                        </p>
                        
                        {/* Item Stats */}
                        <div className="mt-2 space-y-1">
                          {('baseDamage' in item) && (
                            <div className="text-sm text-orange-400">
                              Damage: {item.baseDamage} ({item.damageType})
                            </div>
                          )}
                          {('armorValue' in item) && (
                            <div className="text-sm text-blue-400">
                              Armor: {item.armorValue}
                            </div>
                          )}
                          {item.statBonuses && Object.entries(item.statBonuses).map(([stat, bonus]) => (
                            <div key={stat} className="text-sm text-green-400">
                              {stat.toUpperCase()}: +{bonus}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-slate-400">
                          Lv.{item.levelRequirement}
                        </div>
                        {('emberSlots' in item) && item.emberSlots > 0 && (
                          <div className="text-xs text-purple-400">
                            {item.emberSlots} ember slots
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getAvailableItems(selectedSlot).length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No items available for this slot</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Items may require higher level or specific stats
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