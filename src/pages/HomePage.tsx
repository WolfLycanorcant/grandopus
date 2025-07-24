import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import { EmberTestPanel } from '../components/EmberTestPanel'
import { AchievementTestPanel } from '../components/AchievementTestPanel'
import { RelationshipTestPanel } from '../components/RelationshipTestPanel'
import { SkillTestPanel } from '../components/SkillTestPanel'
import { PromotionTestPanel } from '../components/PromotionTestPanel'
import { OverworldTestPanel } from '../components/OverworldTestPanel'
import { Sword, Users, Zap, Plus, Play, Map } from 'lucide-react'

export function HomePage() {
  const {
    units,
    squads,
    initializeGame,
    isLoading,
    error,
    createRandomUnit,
    createSquadFromPreset
  } = useGameStore()

  useEffect(() => {
    if (units.length === 0 && squads.length === 0) {
      initializeGame()
    }
  }, [units.length, squads.length, initializeGame])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Initializing game...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={initializeGame}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-white mb-4 font-game">
          Welcome to Grand Opus
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          A squad-based tactical war game featuring deep customization,
          formation-based combat, and strategic progression.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <Users className="h-12 w-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">{units.length}</h3>
            <p className="text-slate-400">Available Units</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <Sword className="h-12 w-12 text-secondary-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">{squads.length}</h3>
            <p className="text-slate-400">Active Squads</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white">0</h3>
            <p className="text-slate-400">Battles Won</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => createRandomUnit(1)}
          className="card hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <div className="card-body text-center">
            <Plus className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Create Unit</h3>
            <p className="text-sm text-slate-400">Generate random unit</p>
          </div>
        </button>

        <button
          onClick={() => createSquadFromPreset('BALANCED_STARTER')}
          className="card hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <div className="card-body text-center">
            <Sword className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Create Squad</h3>
            <p className="text-sm text-slate-400">From preset template</p>
          </div>
        </button>

        <Link to="/squads" className="card hover:bg-slate-700 transition-colors">
          <div className="card-body text-center">
            <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Squad Editor</h3>
            <p className="text-sm text-slate-400">Manage formations</p>
          </div>
        </Link>

        <Link to="/battle" className="card hover:bg-slate-700 transition-colors">
          <div className="card-body text-center">
            <Play className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Start Battle</h3>
            <p className="text-sm text-slate-400">Squad vs squad combat</p>
          </div>
        </Link>
      </div>

      {/* 3D Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/battle3d" className="card hover:bg-slate-700 transition-colors border-2 border-emerald-500/30">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Play className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center">
                  3D Battle Arena
                  <span className="ml-2 px-2 py-1 bg-emerald-500 text-emerald-900 text-xs font-bold rounded">NEW</span>
                </h3>
                <p className="text-sm text-slate-400">
                  Experience tactical combat in immersive 3D with PlayCanvas rendering
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/overworld3d" className="card hover:bg-slate-700 transition-colors border-2 border-blue-500/30">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Map className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center">
                  3D Strategic Map
                  <span className="ml-2 px-2 py-1 bg-blue-500 text-blue-900 text-xs font-bold rounded">NEW</span>
                </h3>
                <p className="text-sm text-slate-400">
                  Command your empire from a stunning 3D perspective with real-time effects
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Strategic Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/overworld" className="card hover:bg-slate-700 transition-colors">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <Map className="h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Strategic Overworld</h3>
                <p className="text-sm text-slate-400">
                  Manage your empire, build settlements, control territory, and wage strategic campaigns
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="card bg-slate-700/50">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-slate-400 text-xs">Soon</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-300">Campaign Mode</h3>
                <p className="text-sm text-slate-500">
                  Story-driven campaigns with unique challenges and rewards (Coming Soon)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Units */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Recent Units</h2>
          </div>
          <div className="card-body">
            {units.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No units created yet</p>
            ) : (
              <div className="space-y-3">
                {units.slice(-5).map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">{unit.name}</h3>
                      <p className="text-sm text-slate-400">
                        Lv.{unit.experience.currentLevel} {unit.race} {unit.archetype}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-300">{unit.currentHp}/{unit.getMaxStats().hp} HP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Squads */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-white">Active Squads</h2>
          </div>
          <div className="card-body">
            {squads.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No squads created yet</p>
            ) : (
              <div className="space-y-3">
                {squads.map((squad) => {
                  const stats = squad.getStats()
                  return (
                    <div key={squad.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-white">{squad.name}</h3>
                        <p className="text-sm text-slate-400">
                          {squad.getUnits().length} units, Avg Lv.{stats.averageLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-300">{stats.totalHp} Total HP</p>
                        <p className="text-xs text-slate-400">Power: {stats.combatPower}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Tests (Temporary) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverworldTestPanel />
        <EmberTestPanel />
        <AchievementTestPanel />
        <RelationshipTestPanel />
        <SkillTestPanel />
        <PromotionTestPanel />
      </div>

      {/* Getting Started */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-white">Getting Started</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-400 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Create Units</h3>
              <p className="text-sm text-slate-400">
                Build your army with diverse races and archetypes. Each unit has unique abilities and stat growth.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-secondary-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Form Squads</h3>
              <p className="text-sm text-slate-400">
                Organize units into squads with strategic formations. Front row tanks, back row support.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Battle!</h3>
              <p className="text-sm text-slate-400">
                Engage in tactical combat with formation bonuses, weapon proficiencies, and strategic depth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}