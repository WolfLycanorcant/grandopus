import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import { BattleTestPanel } from '../components/BattleTestPanel'
import { 
  Users, 
  Sword, 
  Map, 
  Trophy, 
  Settings, 
  Play,
  Plus,
  BarChart3,
  Target,
  Zap,
  Shield,
  Heart,
  TrendingUp
} from 'lucide-react'
import {
  ResponsiveGrid,
  ResponsiveCard,
  QuickInfo,
  StatDisplay,
  ProgressBar,
  ToastManager,
  TutorialSystem,
  TUTORIAL_SEQUENCES,
  Tooltip
} from '../components/ui'
import { PromotionTestPanel } from '../components/PromotionTestPanel'

export function HomePage() {
  const { 
    units, 
    squads, 
    currentBattle, 
    battleResult,
    playerResources,
    currentTurn,
    initializeGame,
    createRandomUnit,
    createSquadFromPreset,
    autoSave,
    isLoading,
    error
  } = useGameStore()

  const [toasts, setToasts] = useState<any[]>([])
  const [showWelcome, setShowWelcome] = useState(false)

  // Initialize game on first load
  useEffect(() => {
    if (units.length === 0 && squads.length === 0) {
      initializeGame()
      setShowWelcome(true)
    }
  }, [units.length, squads.length, initializeGame])

  // Auto-save periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (units.length > 0 || squads.length > 0) {
        autoSave()
        addToast({
          type: 'info',
          title: 'Game Auto-Saved',
          message: 'Your progress has been automatically saved',
          duration: 2000
        })
      }
    }, 60000) // Auto-save every minute

    return () => clearInterval(interval)
  }, [units.length, squads.length, autoSave])

  const addToast = (toast: any) => {
    const newToast = {
      ...toast,
      id: Date.now().toString()
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleQuickStart = () => {
    // Create some units and squads for quick start
    for (let i = 0; i < 3; i++) {
      createRandomUnit(Math.floor(Math.random() * 3) + 1)
    }
    createSquadFromPreset('BALANCED_STARTER', 'Quick Start Squad')
    
    addToast({
      type: 'success',
      title: 'Quick Start Complete!',
      message: 'Created 3 units and 1 squad to get you started',
      duration: 4000
    })
  }

  const handleCreateUnit = () => {
    createRandomUnit(1)
    addToast({
      type: 'success',
      title: 'Unit Created!',
      message: 'A new random unit has been added to your army'
    })
  }

  const handleCreateSquad = () => {
    createSquadFromPreset('BALANCED_STARTER', 'New Squad')
    addToast({
      type: 'success',
      title: 'Squad Created!',
      message: 'A new balanced squad is ready for battle'
    })
  }

  // Calculate some stats for display
  const totalUnitLevels = units.reduce((sum, unit) => sum + unit.experience.currentLevel, 0)
  const averageUnitLevel = units.length > 0 ? Math.round(totalUnitLevels / units.length) : 0
  const readySquads = squads.filter(squad => squad.isValidForCombat()).length

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
      {/* Tutorial System */}
      <TutorialSystem
        sequences={TUTORIAL_SEQUENCES}
        onComplete={(sequenceId) => {
          addToast({
            type: 'success',
            title: 'Tutorial Complete!',
            message: 'You\'ve mastered the basics of Grand Opus'
          })
        }}
        onSkip={(sequenceId) => {
          addToast({
            type: 'info',
            title: 'Tutorial Skipped',
            message: 'You can restart tutorials anytime from the help menu'
          })
        }}
      />

      {/* Toast Manager */}
      <ToastManager toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to Grand Opus
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Command squads of diverse units in tactical battles. 
          Build your army, master formations, and conquer the realm in this 
          deep strategic war game.
        </p>
      </div>

      {/* Quick Stats Dashboard */}
      <ResponsiveGrid cols={{ sm: 2, md: 4, lg: 6 }}>
        <QuickInfo
          title="Units"
          value={units.length}
          subtitle={`Avg Level: ${averageUnitLevel}`}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          trend={units.length > 0 ? 'up' : 'neutral'}
          onClick={() => window.location.href = '/units'}
        />
        
        <QuickInfo
          title="Squads"
          value={squads.length}
          subtitle={`${readySquads} ready for battle`}
          icon={<Target className="h-5 w-5" />}
          color="green"
          trend={squads.length > 0 ? 'up' : 'neutral'}
          onClick={() => window.location.href = '/squads'}
        />
        
        <QuickInfo
          title="Turn"
          value={currentTurn}
          subtitle="Current campaign turn"
          icon={<Trophy className="h-5 w-5" />}
          color="yellow"
          trend="up"
        />
        
        <QuickInfo
          title="Gold"
          value={playerResources.GOLD?.toLocaleString() || '0'}
          subtitle="Available resources"
          icon={<BarChart3 className="h-5 w-5" />}
          color="purple"
          trend={playerResources.GOLD > 500 ? 'up' : 'down'}
        />

        <QuickInfo
          title="Army Strength"
          value={totalUnitLevels}
          subtitle="Combined unit levels"
          icon={<Sword className="h-5 w-5" />}
          color="red"
          trend={totalUnitLevels > 10 ? 'up' : 'neutral'}
        />

        <QuickInfo
          title="Battle Ready"
          value={`${readySquads}/${squads.length}`}
          subtitle="Squads ready to fight"
          icon={<Shield className="h-5 w-5" />}
          color="green"
          trend={readySquads > 0 ? 'up' : 'neutral'}
        />
      </ResponsiveGrid>

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

      {/* Battle Test Panel */}
      <BattleTestPanel />

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