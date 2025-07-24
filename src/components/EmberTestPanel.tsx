import React from 'react'
import { Unit, UnitFactory } from '../core/units'
import { EquipmentSlot } from '../core/equipment'

/**
 * Test component to verify ember system functionality
 * This can be removed once testing is complete
 */
export function EmberTestPanel() {
  const testEmberSystem = () => {
    try {
      // Create a test unit
      const unit = UnitFactory.createUnit({
        name: 'Test Warrior',
        race: 'human' as any,
        archetype: 'knight' as any,
        level: 10
      })

      console.log('=== EMBER SYSTEM TEST ===')
      
      // Equip a weapon
      unit.equipItem('steel_sword', EquipmentSlot.WEAPON)
      console.log('✓ Equipped steel sword')
      
      // Check weapon stats before embers
      const baseDamage = unit.equipmentManager.getWeaponDamageBonus()
      console.log(`Base weapon damage: ${baseDamage}`)
      
      // Embed a fire ember
      unit.emberManager.embedEmber(EquipmentSlot.WEAPON, 'fire_ember')
      console.log('✓ Embedded fire ember')
      
      // Embed a strength ember
      unit.emberManager.embedEmber(EquipmentSlot.WEAPON, 'strength_ember')
      console.log('✓ Embedded strength ember')
      
      // Check weapon stats after embers
      const enhancedDamage = unit.equipmentManager.getWeaponDamageBonus()
      console.log(`Enhanced weapon damage: ${enhancedDamage}`)
      
      // Check ember bonuses
      const emberBonuses = unit.emberManager.calculateEmberBonuses(EquipmentSlot.WEAPON)
      console.log('Ember bonuses:', emberBonuses)
      
      // Check total equipment stats (should include ember bonuses)
      const equipmentStats = unit.equipmentManager.calculateEquipmentStats()
      console.log('Total equipment stats:', equipmentStats)
      
      // Check unit's current stats (should include ember bonuses)
      const currentStats = unit.getCurrentStats()
      console.log('Unit current stats:', currentStats)
      
      console.log('=== EMBER SYSTEM TEST COMPLETE ===')
      alert('Ember system test completed! Check console for details.')
      
    } catch (error) {
      console.error('Ember system test failed:', error)
      alert(`Ember system test failed: ${error}`)
    }
  }

  return (
    <div className="bg-slate-700 rounded-lg p-4">
      <h3 className="text-white font-medium mb-4">Ember System Test</h3>
      <button
        onClick={testEmberSystem}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
      >
        Run Ember System Test
      </button>
      <p className="text-sm text-slate-400 mt-2">
        This will create a test unit, equip a weapon, embed embers, and verify the system works.
        Check the browser console for detailed output.
      </p>
    </div>
  )
}