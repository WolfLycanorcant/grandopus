import React from 'react'
import { Unit, UnitFactory } from '../core/units'
import { StatisticType } from '../core/achievements'

/**
 * Test component to verify achievement system functionality
 * This can be removed once testing is complete
 */
export function AchievementTestPanel() {
  const testAchievementSystem = () => {
    try {
      // Create a test unit
      const unit = UnitFactory.createUnit({
        name: 'Test Hero',
        race: 'human' as any,
        archetype: 'knight' as any,
        level: 5
      })

      console.log('=== ACHIEVEMENT SYSTEM TEST ===')
      
      // Test initial state
      const initialSummary = unit.achievementManager.getAchievementSummary()
      console.log('Initial achievements unlocked:', initialSummary.unlockedAchievements)
      console.log('Initial completion:', initialSummary.completionPercentage + '%')
      
      // Test damage taken tracking
      console.log('\n--- Testing Damage Taken ---')
      let notifications = unit.achievementManager.recordStatistic(StatisticType.DAMAGE_TAKEN, 500)
      console.log('Recorded 500 damage taken, notifications:', notifications.length)
      
      notifications = unit.achievementManager.recordStatistic(StatisticType.DAMAGE_TAKEN, 600)
      console.log('Recorded 600 more damage (1100 total), notifications:', notifications.length)
      if (notifications.length > 0) {
        console.log('🏆 Achievement unlocked:', notifications[0].achievement.name)
      }
      
      // Test critical hits
      console.log('\n--- Testing Critical Hits ---')
      for (let i = 0; i < 105; i++) {
        notifications = unit.achievementManager.recordStatistic(StatisticType.CRITICAL_HITS, 1)
      }
      console.log('Recorded 105 critical hits, notifications:', notifications.length)
      if (notifications.length > 0) {
        console.log('🏆 Achievement unlocked:', notifications[0].achievement.name)
      }
      
      // Test healing
      console.log('\n--- Testing Healing ---')
      for (let i = 0; i < 35; i++) {
        notifications = unit.achievementManager.recordStatistic(StatisticType.UNITS_HEALED, `unit_${i}`)
      }
      console.log('Healed 35 different units, notifications:', notifications.length)
      if (notifications.length > 0) {
        console.log('🏆 Achievement unlocked:', notifications[0].achievement.name)
      }
      
      // Test ember embedding
      console.log('\n--- Testing Ember Embedding ---')
      for (let i = 0; i < 105; i++) {
        notifications = unit.achievementManager.recordStatistic(StatisticType.EMBERS_EMBEDDED, 1)
      }
      console.log('Embedded 105 embers, notifications:', notifications.length)
      if (notifications.length > 0) {
        console.log('🏆 Achievement unlocked:', notifications[0].achievement.name)
      }
      
      // Check final state
      const finalSummary = unit.achievementManager.getAchievementSummary()
      console.log('\n--- Final Results ---')
      console.log('Final achievements unlocked:', finalSummary.unlockedAchievements)
      console.log('Final completion:', finalSummary.completionPercentage + '%')
      
      // Check stat bonuses
      const achievementBonuses = unit.achievementManager.getAchievementStatBonuses()
      console.log('Achievement stat bonuses:', achievementBonuses)
      
      // Check special abilities
      const specialAbilities = unit.achievementManager.getSpecialAbilities()
      console.log('Special abilities:', Array.from(specialAbilities))
      
      // Check titles
      const unlockedTitles = unit.achievementManager.getUnlockedTitles()
      console.log('Unlocked titles:', Array.from(unlockedTitles))
      
      // Check unit's current stats (should include achievement bonuses)
      const currentStats = unit.getCurrentStats()
      console.log('Unit current stats (with achievement bonuses):', currentStats)
      
      console.log('=== ACHIEVEMENT SYSTEM TEST COMPLETE ===')
      alert('Achievement system test completed! Check console for details.')
      
    } catch (error) {
      console.error('Achievement system test failed:', error)
      alert(`Achievement system test failed: ${error}`)
    }
  }

  const testSpecificAchievement = () => {
    try {
      const unit = UnitFactory.createUnit({
        name: 'Dragon Slayer',
        race: 'human' as any,
        archetype: 'knight' as any,
        level: 20
      })

      console.log('=== TESTING DRAGON SLAYER ACHIEVEMENT ===')
      
      // Kill 5 dragons
      for (let i = 0; i < 5; i++) {
        const notifications = unit.achievementManager.recordStatistic(StatisticType.DRAGONS_KILLED, 1)
        console.log(`Dragon ${i + 1} killed, notifications:`, notifications.length)
        if (notifications.length > 0) {
          console.log('🏆 Achievement unlocked:', notifications[0].achievement.name)
          console.log('Reward:', notifications[0].achievement.reward.description)
          if (notifications[0].achievement.reward.title) {
            console.log('Title earned:', notifications[0].achievement.reward.title)
          }
        }
      }
      
      // Check final bonuses
      const bonuses = unit.achievementManager.getAchievementStatBonuses()
      const abilities = unit.achievementManager.getSpecialAbilities()
      const titles = unit.achievementManager.getUnlockedTitles()
      
      console.log('Final stat bonuses:', bonuses)
      console.log('Special abilities:', Array.from(abilities))
      console.log('Titles:', Array.from(titles))
      
      console.log('=== DRAGON SLAYER TEST COMPLETE ===')
      alert('Dragon Slayer test completed! Check console for details.')
      
    } catch (error) {
      console.error('Dragon Slayer test failed:', error)
      alert(`Dragon Slayer test failed: ${error}`)
    }
  }

  return (
    <div className="bg-slate-700 rounded-lg p-4 space-y-4">
      <h3 className="text-white font-medium mb-4">Achievement System Test</h3>
      
      <div className="space-y-2">
        <button
          onClick={testAchievementSystem}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Run Full Achievement System Test
        </button>
        
        <button
          onClick={testSpecificAchievement}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
        >
          Test Dragon Slayer Achievement
        </button>
      </div>
      
      <div className="text-sm text-slate-400 space-y-1">
        <p><strong>Full Test:</strong> Tests damage tracking, critical hits, healing, and ember embedding achievements.</p>
        <p><strong>Dragon Slayer Test:</strong> Tests the legendary Dragon Slayer achievement with fire immunity reward.</p>
        <p>Check the browser console for detailed output and results.</p>
      </div>
    </div>
  )
}