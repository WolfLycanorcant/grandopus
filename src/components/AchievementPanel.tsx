import React, { useState } from 'react'
import { Unit } from '../core/units'
import { 
  Achievement, 
  AchievementCategory, 
  AchievementFilter,
  StatisticType
} from '../core/achievements'
import { 
  getAchievement, 
  getAchievementsByCategory, 
  getVisibleAchievements 
} from '../core/achievements/AchievementData'
import { 
  Trophy, 
  Sword, 
  Heart, 
  Star, 
  Crown, 
  Zap, 
  Filter,
  Search,
  Award,
  Target,
  Shield,
  Users,
  Book,
  Flame
} from 'lucide-react'
import clsx from 'clsx'

interface AchievementPanelProps {
  unit: Unit
}

export function AchievementPanel({ unit }: AchievementPanelProps) {
  const [filter, setFilter] = useState<AchievementFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)

  const achievementSummary = unit.achievementManager.getAchievementSummary()
  const unlockedAchievements = unit.achievementManager.getUnlockedAchievements()
  const activeTitle = unit.achievementManager.getActiveTitle()
  const unlockedTitles = unit.achievementManager.getUnlockedTitles()
  const statistics = unit.achievementManager.getStatistics()
  const achievementBonuses = unit.achievementManager.getAchievementStatBonuses()
  const specialAbilities = unit.achievementManager.getSpecialAbilities()

  const getCategoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case AchievementCategory.COMBAT: return <Sword className="h-4 w-4" />
      case AchievementCategory.SUPPORT: return <Heart className="h-4 w-4" />
      case AchievementCategory.MASTERY: return <Star className="h-4 w-4" />
      case AchievementCategory.LEGENDARY: return <Crown className="h-4 w-4" />
      case AchievementCategory.SPECIALIZED: return <Zap className="h-4 w-4" />
      default: return <Trophy className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: AchievementCategory) => {
    switch (category) {
      case AchievementCategory.COMBAT: return 'text-red-400 bg-red-900/30'
      case AchievementCategory.SUPPORT: return 'text-green-400 bg-green-900/30'
      case AchievementCategory.MASTERY: return 'text-blue-400 bg-blue-900/30'
      case AchievementCategory.LEGENDARY: return 'text-yellow-400 bg-yellow-900/30'
      case AchievementCategory.SPECIALIZED: return 'text-purple-400 bg-purple-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500'
      case 'uncommon': return 'text-green-400 border-green-500'
      case 'rare': return 'text-blue-400 border-blue-500'
      case 'epic': return 'text-purple-400 border-purple-500'
      case 'legendary': return 'text-yellow-400 border-yellow-500'
      default: return 'text-gray-400 border-gray-500'
    }
  }

  const getFilteredAchievements = () => {
    let achievements = getVisibleAchievements()

    // Filter by category
    if (selectedCategory !== 'all') {
      achievements = achievements.filter(achievement => achievement.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      achievements = achievements.filter(achievement =>
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by unlocked status
    if (showUnlockedOnly) {
      achievements = achievements.filter(achievement => {
        const progress = unit.achievementManager.getAchievementProgress(achievement.id)
        return progress?.isUnlocked || false
      })
    }

    return achievements
  }

  const getProgressPercentage = (achievement: Achievement) => {
    const progress = unit.achievementManager.getAchievementProgress(achievement.id)
    if (!progress) return 0
    return Math.min((progress.progress / achievement.requirement.target) * 100, 100)
  }

  const isAchievementUnlocked = (achievement: Achievement) => {
    const progress = unit.achievementManager.getAchievementProgress(achievement.id)
    return progress?.isUnlocked || false
  }

  const getStatisticDisplayValue = (type: StatisticType) => {
    switch (type) {
      case StatisticType.DAMAGE_TAKEN: return statistics.totalDamageTaken
      case StatisticType.HEALING_DONE: return statistics.totalHealingDone
      case StatisticType.KILLS: return statistics.totalKills
      case StatisticType.CRITICAL_HITS: return statistics.criticalHits
      case StatisticType.BATTLES_WON: return statistics.battlesWon
      case StatisticType.BATTLES_SURVIVED: return statistics.battlesSurvived
      case StatisticType.UNITS_HEALED: return statistics.unitsHealed.size
      case StatisticType.WEAPONS_MASTERED: return statistics.weaponsMastered.size
      case StatisticType.DRAGONS_KILLED: return statistics.dragonsKilled
      case StatisticType.EMBERS_EMBEDDED: return statistics.embersEmbedded
      default: return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
            Achievement Progress
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {achievementSummary.unlockedAchievements}/{achievementSummary.totalAchievements}
            </div>
            <div className="text-sm text-slate-400">
              {achievementSummary.completionPercentage}% Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-600 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${achievementSummary.completionPercentage}%` }}
          />
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(achievementSummary.byCategory).map(([category, data]) => (
            <div key={category} className="text-center">
              <div className={clsx(
                'p-2 rounded-lg mb-2',
                getCategoryColor(category as AchievementCategory)
              )}>
                {getCategoryIcon(category as AchievementCategory)}
              </div>
              <div className="text-sm text-white font-medium">
                {data.unlocked}/{data.total}
              </div>
              <div className="text-xs text-slate-400 capitalize">
                {category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Title & Bonuses */}
      {(activeTitle || Object.keys(achievementBonuses).length > 0 || specialAbilities.size > 0) && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Achievement Bonuses
          </h4>

          <div className="space-y-3">
            {/* Active Title */}
            {activeTitle && (
              <div>
                <span className="text-xs text-slate-400">Active Title:</span>
                <div className="text-yellow-400 font-medium">{activeTitle}</div>
              </div>
            )}

            {/* Stat Bonuses */}
            {Object.keys(achievementBonuses).length > 0 && (
              <div>
                <span className="text-xs text-slate-400">Stat Bonuses:</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.entries(achievementBonuses).map(([stat, bonus]) => (
                    bonus > 0 && (
                      <div key={stat} className="flex justify-between text-sm">
                        <span className="text-slate-300 uppercase">{stat}:</span>
                        <span className="text-green-400">+{bonus}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Special Abilities */}
            {specialAbilities.size > 0 && (
              <div>
                <span className="text-xs text-slate-400">Special Abilities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.from(specialAbilities).map((ability) => (
                    <span 
                      key={ability}
                      className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs"
                    >
                      {ability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-slate-400 hover:text-slate-300'
              )}
            >
              All
            </button>
            {Object.values(AchievementCategory).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1',
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-600 text-slate-400 hover:text-slate-300'
                )}
              >
                {getCategoryIcon(category)}
                <span className="capitalize">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Show Unlocked Only Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showUnlockedOnly"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            className="rounded border-slate-500 bg-slate-600 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="showUnlockedOnly" className="text-sm text-slate-300">
            Show unlocked only
          </label>
        </div>
      </div>

      {/* Achievement List */}
      <div className="space-y-3">
        {getFilteredAchievements().map((achievement) => {
          const progress = unit.achievementManager.getAchievementProgress(achievement.id)
          const isUnlocked = isAchievementUnlocked(achievement)
          const progressPercentage = getProgressPercentage(achievement)
          const currentValue = getStatisticDisplayValue(achievement.requirement.type)

          return (
            <div
              key={achievement.id}
              className={clsx(
                'border rounded-lg p-4 transition-all',
                getRarityColor(achievement.rarity).split(' ')[1],
                isUnlocked ? 'bg-slate-600/50' : 'bg-slate-700'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Achievement Icon */}
                  <div className={clsx(
                    'p-2 rounded-lg',
                    getCategoryColor(achievement.category),
                    isUnlocked && 'ring-2 ring-yellow-400'
                  )}>
                    {isUnlocked ? (
                      <Trophy className="h-5 w-5 text-yellow-400" />
                    ) : (
                      getCategoryIcon(achievement.category)
                    )}
                  </div>

                  {/* Achievement Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={clsx(
                        'font-medium',
                        getRarityColor(achievement.rarity).split(' ')[0],
                        isUnlocked && 'text-yellow-400'
                      )}>
                        {achievement.name}
                      </h4>
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium',
                        getCategoryColor(achievement.category)
                      )}>
                        {achievement.category}
                      </span>
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium border',
                        getRarityColor(achievement.rarity)
                      )}>
                        {achievement.rarity}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mb-2">
                      {achievement.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          Progress: {currentValue} / {achievement.requirement.target}
                        </span>
                        <span className={clsx(
                          'font-medium',
                          isUnlocked ? 'text-yellow-400' : 'text-slate-300'
                        )}>
                          {isUnlocked ? 'UNLOCKED' : `${Math.floor(progressPercentage)}%`}
                        </span>
                      </div>

                      {!isUnlocked && (
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Reward */}
                    <div className="mt-3 p-2 bg-slate-800 rounded text-sm">
                      <span className="text-slate-400">Reward: </span>
                      <span className="text-green-400">{achievement.reward.description}</span>
                      {achievement.reward.title && (
                        <span className="text-yellow-400 ml-2">
                          + Title: "{achievement.reward.title}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {getFilteredAchievements().length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No achievements found</p>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  )
}