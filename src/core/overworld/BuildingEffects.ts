import { BuildingType, MapTile, HexCoordinate, Faction } from './types'
import { Squad } from '../squads'
import { Unit } from '../units'
import { getBuildingProperties } from './BuildingData'
import { hexDistance } from './HexUtils'

/**
 * Building effects that benefit squads and units
 */
export interface BuildingEffect {
  type: 'stat_bonus' | 'healing' | 'experience_bonus' | 'resource_bonus' | 'special'
  value: number
  description: string
  range: number // Hex range for effect
  condition?: string
}

/**
 * Squad bonuses from nearby buildings
 */
export interface SquadBuildingBonuses {
  statBonuses: {
    hp?: number
    str?: number
    mag?: number
    skl?: number
    arm?: number
    ldr?: number
  }
  healingPerTurn: number
  experienceBonus: number
  specialEffects: string[]
  activeBuildings: Array<{
    buildingType: BuildingType
    level: number
    distance: number
    effects: BuildingEffect[]
  }>
}

/**
 * Get building effects for a specific building type and level
 */
export function getBuildingEffects(buildingType: BuildingType, level: number = 1): BuildingEffect[] {
  const effects: BuildingEffect[] = []

  switch (buildingType) {
    case BuildingType.SETTLEMENT:
      effects.push({
        type: 'healing',
        value: 5 * level,
        description: `Heals ${5 * level} HP per turn`,
        range: 1
      })
      effects.push({
        type: 'stat_bonus',
        value: level,
        description: `+${level} Leadership to squad leaders`,
        range: 1,
        condition: 'leader_only'
      })
      break

    case BuildingType.CASTLE:
      effects.push({
        type: 'stat_bonus',
        value: 5 * level,
        description: `+${5 * level} Armor to all units`,
        range: 2
      })
      effects.push({
        type: 'healing',
        value: 10 * level,
        description: `Heals ${10 * level} HP per turn`,
        range: 2
      })
      effects.push({
        type: 'special',
        value: 25 * level,
        description: `+${25 * level}% recruitment speed`,
        range: 3,
        condition: 'recruitment_bonus'
      })
      break

    case BuildingType.CHURCH:
      effects.push({
        type: 'healing',
        value: 15 * level,
        description: `Heals ${15 * level} HP per turn`,
        range: 2
      })
      effects.push({
        type: 'stat_bonus',
        value: 2 * level,
        description: `+${2 * level} Magic to spellcasters`,
        range: 2,
        condition: 'spellcaster_only'
      })
      effects.push({
        type: 'special',
        value: 1,
        description: 'Removes negative status effects',
        range: 2,
        condition: 'cleanse'
      })
      break

    case BuildingType.FARM:
      effects.push({
        type: 'healing',
        value: 3 * level,
        description: `Heals ${3 * level} HP per turn`,
        range: 1
      })
      effects.push({
        type: 'special',
        value: level,
        description: `Reduces food consumption by ${level}`,
        range: 2,
        condition: 'food_efficiency'
      })
      break

    case BuildingType.BLACKSMITH:
      effects.push({
        type: 'stat_bonus',
        value: 3 * level,
        description: `+${3 * level} Strength to melee units`,
        range: 1,
        condition: 'melee_only'
      })
      effects.push({
        type: 'special',
        value: 10 * level,
        description: `+${10 * level}% weapon proficiency gain`,
        range: 1,
        condition: 'proficiency_bonus'
      })
      break

    case BuildingType.OUTPOST:
      effects.push({
        type: 'stat_bonus',
        value: 2 * level,
        description: `+${2 * level} Skill to all units`,
        range: 2
      })
      effects.push({
        type: 'special',
        value: level,
        description: `+${level} movement range`,
        range: 2,
        condition: 'movement_bonus'
      })
      break

    case BuildingType.TOWER:
      effects.push({
        type: 'stat_bonus',
        value: 4 * level,
        description: `+${4 * level} Skill to ranged units`,
        range: 3,
        condition: 'ranged_only'
      })
      effects.push({
        type: 'special',
        value: level + 2,
        description: `+${level + 2} vision range`,
        range: 4,
        condition: 'vision_bonus'
      })
      break

    case BuildingType.MINE:
      effects.push({
        type: 'resource_bonus',
        value: 10 * level,
        description: `+${10 * level}% resource generation`,
        range: 1
      })
      break
  }

  return effects
}

/**
 * Calculate building bonuses for a squad at a specific location
 */
export function calculateSquadBuildingBonuses(
  squadLocation: HexCoordinate,
  tiles: Map<string, MapTile>,
  faction: Faction = Faction.PLAYER
): SquadBuildingBonuses {
  const bonuses: SquadBuildingBonuses = {
    statBonuses: {},
    healingPerTurn: 0,
    experienceBonus: 0,
    specialEffects: [],
    activeBuildings: []
  }

  // Check all tiles for buildings that could affect this squad
  for (const tile of tiles.values()) {
    if (!tile.building || tile.building.faction !== faction) continue
    if (tile.building.constructionProgress !== undefined) continue // Skip buildings under construction

    const distance = hexDistance(squadLocation, tile.coordinate)
    const buildingEffects = getBuildingEffects(tile.building.type, tile.building.level)

    // Check each effect to see if it applies
    for (const effect of buildingEffects) {
      if (distance <= effect.range) {
        bonuses.activeBuildings.push({
          buildingType: tile.building.type,
          level: tile.building.level,
          distance,
          effects: [effect]
        })

        // Apply the effect
        switch (effect.type) {
          case 'stat_bonus':
            if (!effect.condition || effect.condition === 'all') {
              // Apply to all units
              const statKey = getStatKeyFromEffect(effect)
              if (statKey) {
                bonuses.statBonuses[statKey] = (bonuses.statBonuses[statKey] || 0) + effect.value
              }
            }
            // Conditional bonuses will be applied when the squad is processed
            break

          case 'healing':
            bonuses.healingPerTurn += effect.value
            break

          case 'experience_bonus':
            bonuses.experienceBonus += effect.value
            break

          case 'special':
            bonuses.specialEffects.push(effect.condition || effect.description)
            break
        }
      }
    }
  }

  return bonuses
}

/**
 * Apply building bonuses to a squad
 */
export function applyBuildingBonusesToSquad(
  squad: Squad,
  bonuses: SquadBuildingBonuses
): void {
  const units = squad.getUnits()

  // Apply healing
  if (bonuses.healingPerTurn > 0) {
    units.forEach(unit => {
      if (unit.isAlive()) {
        unit.heal(bonuses.healingPerTurn)
      }
    })
  }

  // Apply conditional stat bonuses
  bonuses.activeBuildings.forEach(building => {
    building.effects.forEach(effect => {
      if (effect.type === 'stat_bonus' && effect.condition) {
        units.forEach(unit => {
          if (shouldApplyConditionalBonus(unit, effect.condition!)) {
            // This would need to be implemented as a temporary bonus system
            // For now, we'll track it in the building bonuses
          }
        })
      }
    })
  })

  // Apply special effects
  bonuses.specialEffects.forEach(effect => {
    switch (effect) {
      case 'cleanse':
        units.forEach(unit => {
          // Remove negative status effects
          unit.statusEffects.clear()
        })
        break

      case 'proficiency_bonus':
        // This would be applied during combat or training
        break
    }
  })
}

/**
 * Get stat key from building effect description
 */
function getStatKeyFromEffect(effect: BuildingEffect): keyof SquadBuildingBonuses['statBonuses'] | null {
  const description = effect.description.toLowerCase()
  
  if (description.includes('armor')) return 'arm'
  if (description.includes('strength')) return 'str'
  if (description.includes('magic')) return 'mag'
  if (description.includes('skill')) return 'skl'
  if (description.includes('leadership')) return 'ldr'
  if (description.includes('hp') || description.includes('health')) return 'hp'
  
  return null
}

/**
 * Check if a conditional bonus should apply to a unit
 */
function shouldApplyConditionalBonus(unit: Unit, condition: string): boolean {
  switch (condition) {
    case 'leader_only':
      return unit.getCurrentStats().ldr > 10 // Arbitrary leadership threshold
    
    case 'spellcaster_only':
      return unit.archetype === 'mage' || unit.archetype === 'cleric'
    
    case 'melee_only':
      return unit.archetype === 'knight' || unit.archetype === 'fighter' || unit.archetype === 'barbarian'
    
    case 'ranged_only':
      return unit.archetype === 'archer' || unit.archetype === 'ranger'
    
    default:
      return true
  }
}

/**
 * Get building effect summary for UI display
 */
export function getBuildingEffectSummary(buildingType: BuildingType, level: number = 1): string {
  const effects = getBuildingEffects(buildingType, level)
  return effects.map(effect => effect.description).join(', ')
}