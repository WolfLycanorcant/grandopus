import React from 'react'
import { Unit, UnitFactory } from '../core/units'
import { AffinitySource, RelationshipType } from '../core/relationships'

/**
 * Test component to verify relationship system functionality
 */
export function RelationshipTestPanel() {
  const testRelationshipSystem = () => {
    try {
      // Create test units
      const knight = UnitFactory.createUnit({
        name: 'Sir Marcus',
        race: 'human' as any,
        archetype: 'knight' as any,
        level: 5
      })

      const cleric = UnitFactory.createUnit({
        name: 'Sister Elena',
        race: 'human' as any,
        archetype: 'cleric' as any,
        level: 4
      })

      const rogue = UnitFactory.createUnit({
        name: 'Shadowblade',
        race: 'elf' as any,
        archetype: 'rogue' as any,
        level: 6
      })

      console.log('=== RELATIONSHIP SYSTEM TEST ===')
      
      // Test initial state
      console.log('Initial personality traits:')
      console.log('Knight traits:', knight.relationshipManager.getPersonalityTraits().map(t => t.name))
      console.log('Cleric traits:', cleric.relationshipManager.getPersonalityTraits().map(t => t.name))
      console.log('Rogue traits:', rogue.relationshipManager.getPersonalityTraits().map(t => t.name))
      
      // Test battle together interactions
      console.log('\n--- Testing Battle Together ---')
      let notifications = knight.relationshipManager.recordInteraction(
        cleric.id, 
        AffinitySource.BATTLE_TOGETHER, 
        5, 
        'Fought side by side against orcs'
      )
      console.log('Knight-Cleric battle together, notifications:', notifications.length)
      
      // Multiple battles together
      for (let i = 0; i < 4; i++) {
        knight.relationshipManager.recordInteraction(
          cleric.id, 
          AffinitySource.BATTLE_TOGETHER, 
          3, 
          `Battle ${i + 2} together`
        )
      }
      
      // Test healing interaction
      console.log('\n--- Testing Healing Interaction ---')
      notifications = knight.relationshipManager.recordInteraction(
        cleric.id, 
        AffinitySource.HEALING_RECEIVED, 
        8, 
        'Cleric healed knight in battle'
      )
      console.log('Knight received healing from cleric, notifications:', notifications.length)
      
      // Test life saved
      console.log('\n--- Testing Life Saved ---')
      notifications = knight.relationshipManager.recordInteraction(
        cleric.id, 
        AffinitySource.LIFE_SAVED, 
        15, 
        'Cleric saved knight from death'
      )
      console.log('Knight\'s life saved by cleric, notifications:', notifications.length)
      if (notifications.length > 0) {
        console.log('🤝 Relationship formed:', notifications[0].newRelationship)
      }
      
      // Test rivalry formation
      console.log('\n--- Testing Rivalry Formation ---')
      for (let i = 0; i < 3; i++) {
        notifications = knight.relationshipManager.recordInteraction(
          rogue.id, 
          AffinitySource.COMPETITION, 
          -8, 
          'Competed for leadership'
        )
      }
      
      notifications = knight.relationshipManager.recordInteraction(
        rogue.id, 
        AffinitySource.PERSONALITY_CLASH, 
        -12, 
        'Disagreed on tactics'
      )
      console.log('Knight-Rogue rivalry, notifications:', notifications.length)
      if (notifications.length > 0) {
        console.log('⚔️ Rivalry formed:', notifications[0].newRelationship)
      }
      
      // Test relationship stats
      console.log('\n--- Relationship Statistics ---')
      const knightStats = knight.relationshipManager.getRelationshipStatistics()
      console.log('Knight relationship stats:', knightStats)
      
      // Test specific relationships
      const knightClericRelation = knight.relationshipManager.getRelationship(cleric.id)
      const knightRogueRelation = knight.relationshipManager.getRelationship(rogue.id)
      
      console.log('\nKnight-Cleric relationship:')
      console.log('- Type:', knightClericRelation?.relationshipType)
      console.log('- Affinity:', knightClericRelation?.affinityPoints)
      console.log('- Battles together:', knightClericRelation?.battlesTogther)
      
      console.log('\nKnight-Rogue relationship:')
      console.log('- Type:', knightRogueRelation?.relationshipType)
      console.log('- Affinity:', knightRogueRelation?.affinityPoints)
      
      // Test relationship bonuses (simulating nearby units)
      console.log('\n--- Testing Relationship Bonuses ---')
      const activeBonuses = knight.relationshipManager.getActiveRelationshipBonuses([cleric.id, rogue.id])
      console.log('Active relationship bonuses:', activeBonuses.size)
      
      const relationshipStatBonuses = knight.relationshipManager.getRelationshipStatBonuses()
      console.log('Relationship stat bonuses:', relationshipStatBonuses)
      
      const combatBonuses = knight.relationshipManager.getCombatBonuses()
      console.log('Combat bonuses:', combatBonuses)
      
      // Test unit's current stats (should include relationship bonuses)
      const currentStats = knight.getCurrentStats()
      console.log('Knight current stats (with relationship bonuses):', currentStats)
      
      console.log('=== RELATIONSHIP SYSTEM TEST COMPLETE ===')
      alert('Relationship system test completed! Check console for details.')
      
    } catch (error) {
      console.error('Relationship system test failed:', error)
      alert(`Relationship system test failed: ${error}`)
    }
  }

  const testSpecialRelationships = () => {
    try {
      const hero = UnitFactory.createUnit({
        name: 'Hero',
        race: 'human' as any,
        archetype: 'knight' as any,
        level: 10
      })

      const lover = UnitFactory.createUnit({
        name: 'Beloved',
        race: 'elf' as any,
        archetype: 'mage' as any,
        level: 9
      })

      const sibling = UnitFactory.createUnit({
        name: 'Brother',
        race: 'human' as any,
        archetype: 'archer' as any,
        level: 8
      })

      console.log('=== TESTING SPECIAL RELATIONSHIPS ===')
      
      // Test romantic relationship formation
      console.log('\n--- Testing Romantic Relationship ---')
      
      // Build up to romantic relationship
      const romanticInteractions = [
        { source: AffinitySource.BATTLE_TOGETHER, value: 10, desc: 'Fought together' },
        { source: AffinitySource.LIFE_SAVED, value: 20, desc: 'Saved from death' },
        { source: AffinitySource.HEALING_RECEIVED, value: 15, desc: 'Tender healing' },
        { source: AffinitySource.SHARED_VICTORY, value: 12, desc: 'Celebrated victory together' },
        { source: AffinitySource.SACRIFICE, value: 25, desc: 'Made great sacrifice for love' }
      ]
      
      romanticInteractions.forEach(interaction => {
        const notifications = hero.relationshipManager.recordInteraction(
          lover.id,
          interaction.source,
          interaction.value,
          interaction.desc
        )
        
        if (notifications.length > 0) {
          console.log(`💕 Relationship evolved: ${notifications[0].newRelationship}`)
        }
      })
      
      // Test family relationship (set directly)
      console.log('\n--- Testing Family Relationship ---')
      hero.relationshipManager.setRelationship(sibling.id, RelationshipType.FAMILY, 70, true)
      console.log('👨‍👩‍👧‍👦 Family relationship established')
      
      // Check final relationships
      const heroLoverRelation = hero.relationshipManager.getRelationship(lover.id)
      const heroSiblingRelation = hero.relationshipManager.getRelationship(sibling.id)
      
      console.log('\nFinal relationships:')
      console.log('Hero-Lover:', heroLoverRelation?.relationshipType, 'Affinity:', heroLoverRelation?.affinityPoints)
      console.log('Hero-Sibling:', heroSiblingRelation?.relationshipType, 'Affinity:', heroSiblingRelation?.affinityPoints)
      
      // Test relationship bonuses
      const activeBonuses = hero.relationshipManager.getActiveRelationshipBonuses([lover.id, sibling.id])
      console.log('\nActive bonuses from special relationships:', activeBonuses.size)
      
      const statBonuses = hero.relationshipManager.getRelationshipStatBonuses()
      console.log('Total stat bonuses:', statBonuses)
      
      console.log('=== SPECIAL RELATIONSHIPS TEST COMPLETE ===')
      alert('Special relationships test completed! Check console for details.')
      
    } catch (error) {
      console.error('Special relationships test failed:', error)
      alert(`Special relationships test failed: ${error}`)
    }
  }

  return (
    <div className="bg-slate-700 rounded-lg p-4 space-y-4">
      <h3 className="text-white font-medium mb-4">Relationship System Test</h3>
      
      <div className="space-y-2">
        <button
          onClick={testRelationshipSystem}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Run Relationship System Test
        </button>
        
        <button
          onClick={testSpecialRelationships}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded transition-colors"
        >
          Test Special Relationships (Romance & Family)
        </button>
      </div>
      
      <div className="text-sm text-slate-400 space-y-1">
        <p><strong>Basic Test:</strong> Tests friendship formation through battles, healing, and rivalry through competition.</p>
        <p><strong>Special Test:</strong> Tests romantic relationships and family bonds with their unique bonuses.</p>
        <p>Check the browser console for detailed output and relationship progression.</p>
      </div>
    </div>
  )
}