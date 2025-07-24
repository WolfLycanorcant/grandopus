import React, { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { UnitCard } from '../components/UnitCard'
import { CreateUnitModal } from '../components/CreateUnitModal'
import { UnitDetailsModal } from '../components/UnitDetailsModal'
import { Plus, Filter, Search } from 'lucide-react'
import { Unit, Race, Archetype } from '../core/units'

export function UnitsPage() {
  const { 
    units, 
    selectedUnit, 
    selectUnit, 
    deleteUnit, 
    error 
  } = useGameStore()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRace, setFilterRace] = useState<Race | 'all'>('all')
  const [filterArchetype, setFilterArchetype] = useState<Archetype | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'race' | 'archetype'>('name')
  
  // Filter and sort units
  const filteredUnits = units
    .filter(unit => {
      const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unit.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unit.archetype.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRace = filterRace === 'all' || unit.race === filterRace
      const matchesArchetype = filterArchetype === 'all' || unit.archetype === filterArchetype
      
      return matchesSearch && matchesRace && matchesArchetype
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'level':
          return b.experience.currentLevel - a.experience.currentLevel
        case 'race':
          return a.race.localeCompare(b.race)
        case 'archetype':
          return a.archetype.localeCompare(b.archetype)
        default:
          return 0
      }
    })
  
  const handleUnitClick = (unit: Unit) => {
    selectUnit(unit)
    setShowDetailsModal(true)
  }
  
  const handleDeleteUnit = (unitId: string) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      deleteUnit(unitId)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-game">Units</h1>
          <p className="text-slate-400 mt-1">
            Manage your army of {units.length} units
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Unit
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            {/* Race Filter */}
            <select
              value={filterRace}
              onChange={(e) => setFilterRace(e.target.value as Race | 'all')}
              className="select"
            >
              <option value="all">All Races</option>
              {Object.values(Race).map(race => (
                <option key={race} value={race}>
                  {race.charAt(0).toUpperCase() + race.slice(1)}
                </option>
              ))}
            </select>
            
            {/* Archetype Filter */}
            <select
              value={filterArchetype}
              onChange={(e) => setFilterArchetype(e.target.value as Archetype | 'all')}
              className="select"
            >
              <option value="all">All Classes</option>
              {Object.values(Archetype).map(archetype => (
                <option key={archetype} value={archetype}>
                  {archetype.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            
            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="select"
            >
              <option value="name">Sort by Name</option>
              <option value="level">Sort by Level</option>
              <option value="race">Sort by Race</option>
              <option value="archetype">Sort by Class</option>
            </select>
            
            {/* Filter Icon */}
            <div className="flex items-center justify-center">
              <Filter className="h-5 w-5 text-slate-400" />
              <span className="ml-2 text-sm text-slate-400">
                {filteredUnits.length} of {units.length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400">
            {units.length === 0 ? (
              <>
                <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No units created yet</h3>
                <p className="mb-4">Create your first unit to start building your army</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Unit
                </button>
              </>
            ) : (
              <>
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No units match your filters</h3>
                <p>Try adjusting your search or filter criteria</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onClick={() => handleUnitClick(unit)}
              onDelete={() => handleDeleteUnit(unit.id)}
              showActions={true}
            />
          ))}
        </div>
      )}
      
      {/* Modals */}
      {showCreateModal && (
        <CreateUnitModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
      
      {showDetailsModal && selectedUnit && (
        <UnitDetailsModal
          unit={selectedUnit}
          onClose={() => {
            setShowDetailsModal(false)
            selectUnit(null)
          }}
        />
      )}
    </div>
  )
}