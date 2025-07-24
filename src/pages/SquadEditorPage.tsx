import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { SquadCard } from '../components/SquadCard'
import { CreateSquadModal } from '../components/CreateSquadModal'
import { SquadFormationEditor } from '../components/SquadFormationEditor'
import { Plus, Users, Sword, Crown } from 'lucide-react'
import { Squad } from '../core/squads'

export function SquadEditorPage() {
  const { 
    squads, 
    selectedSquad, 
    selectSquad, 
    deleteSquad, 
    error 
  } = useGameStore()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const handleSquadSelect = (squad: Squad) => {
    selectSquad(squad)
  }
  
  const handleDeleteSquad = (squadId: string) => {
    if (confirm('Are you sure you want to delete this squad? All units will be returned to your available units.')) {
      deleteSquad(squadId)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-game">Squad Editor</h1>
          <p className="text-slate-400 mt-1">
            Manage formations and customize your {squads.length} squads
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Squad
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squad List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Your Squads
              </h2>
            </div>
            <div className="card-body">
              {squads.length === 0 ? (
                <div className="text-center py-8">
                  <Sword className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No squads created</h3>
                  <p className="text-slate-400 mb-4">Create your first squad to start organizing your units</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                  >
                    Create First Squad
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {squads.map((squad) => (
                    <SquadCard
                      key={squad.id}
                      squad={squad}
                      isSelected={selectedSquad?.id === squad.id}
                      onClick={() => handleSquadSelect(squad)}
                      onDelete={() => handleDeleteSquad(squad.id)}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Squad Stats Summary */}
          {selectedSquad && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Squad Stats
                </h3>
              </div>
              <div className="card-body">
                <SquadStatsDisplay squad={selectedSquad} />
              </div>
            </div>
          )}
        </div>
        
        {/* Formation Editor */}
        <div className="lg:col-span-2">
          {selectedSquad ? (
            <SquadFormationEditor squad={selectedSquad} />
          ) : (
            <div className="card h-full">
              <div className="card-body flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-300 mb-2">
                    Select a Squad to Edit
                  </h3>
                  <p className="text-slate-400">
                    Choose a squad from the list to manage its formation and units
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Squad Modal */}
      {showCreateModal && (
        <CreateSquadModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}

// Squad Stats Display Component
function SquadStatsDisplay({ squad }: { squad: Squad }) {
  const stats = squad.getStats()
  const capacity = squad.getCapacity()
  const leader = squad.getLeader()
  
  return (
    <div className="space-y-4">
      {/* Capacity */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Capacity</span>
          <span className="text-slate-300">
            {capacity.currentUsedSlots}/{capacity.availableSlots + capacity.currentUsedSlots}
          </span>
        </div>
        <div className="stat-bar">
          <div 
            className="stat-bar-fill bg-gradient-to-r from-blue-600 to-blue-400"
            style={{ 
              width: `${(capacity.currentUsedSlots / (capacity.availableSlots + capacity.currentUsedSlots)) * 100}%` 
            }}
          />
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Base: {capacity.baseCapacity} + Leadership: {capacity.leadershipBonus}
        </div>
      </div>
      
      {/* Leader */}
      {leader && (
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-sm text-slate-400 mb-1">Squad Leader</div>
          <div className="text-white font-medium">{leader.name}</div>
          <div className="text-xs text-slate-400">
            Lv.{leader.experience.currentLevel} • LDR: {leader.getCurrentStats().ldr}
          </div>
        </div>
      )}
      
      {/* Combat Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.totalHp}</div>
          <div className="text-xs text-slate-400">Total HP</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.averageLevel}</div>
          <div className="text-xs text-slate-400">Avg Level</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.combatPower}</div>
          <div className="text-xs text-slate-400">Combat Power</div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">
            {stats.frontRowCount}/{stats.backRowCount}
          </div>
          <div className="text-xs text-slate-400">Front/Back</div>
        </div>
      </div>
      
      {/* Formation Bonuses */}
      <div className="bg-slate-700 rounded-lg p-3">
        <div className="text-sm font-medium text-white mb-2">Formation Bonuses</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-red-300">Front Row:</span>
            <span className="text-slate-300">+10% armor, +5% physical dmg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-300">Back Row:</span>
            <span className="text-slate-300">+15% ranged dmg, -10% physical taken</span>
          </div>
        </div>
      </div>
      
      {/* Battle Experience */}
      <div className="bg-slate-700 rounded-lg p-3">
        <div className="text-sm font-medium text-white mb-2">Battle Record</div>
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <div className="text-green-400 font-medium">{squad.experience.battlesWon}</div>
            <div className="text-slate-400">Won</div>
          </div>
          <div>
            <div className="text-red-400 font-medium">{squad.experience.battlesLost}</div>
            <div className="text-slate-400">Lost</div>
          </div>
          <div>
            <div className="text-slate-300 font-medium">{squad.experience.totalBattles}</div>
            <div className="text-slate-400">Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}