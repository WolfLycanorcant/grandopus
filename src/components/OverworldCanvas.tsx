import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import * as pc from 'playcanvas'
import { OverworldManager, MapTile, HexCoordinate, BuildingType, TerrainType, Faction } from '../core/overworld'
import { Squad } from '../core/squads'

export interface OverworldCanvasHandle {
  updateMap: (overworldManager: OverworldManager) => void
  highlightTile: (coordinate: HexCoordinate, highlight: boolean) => void
  setCameraPosition: (position: pc.Vec3, target?: pc.Vec3) => void
  animateArmyMovement: (from: HexCoordinate, to: HexCoordinate) => void
  showBuildingConstruction: (coordinate: HexCoordinate, buildingType: BuildingType) => void
  playResourceGeneration: () => void
}

interface TileModel {
  entity: pc.Entity
  tile: MapTile
  isHighlighted: boolean
  buildingEntity?: pc.Entity
  armyEntity?: pc.Entity
}

const OverworldCanvas = forwardRef<OverworldCanvasHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<pc.Application | null>(null)
  const tilesRef = useRef<Map<string, TileModel>>(new Map())
  const cameraRef = useRef<pc.Entity | null>(null)

  useImperativeHandle(ref, () => ({
    updateMap: (overworldManager: OverworldManager) => {
      if (!engineRef.current) return
      updateOverworldMap(overworldManager)
    },

    highlightTile: (coordinate: HexCoordinate, highlight: boolean) => {
      const tileKey = `${coordinate.q},${coordinate.r}`
      const tileModel = tilesRef.current.get(tileKey)
      if (tileModel) {
        highlightTileModel(tileModel, highlight)
      }
    },

    setCameraPosition: (position: pc.Vec3, target?: pc.Vec3) => {
      if (cameraRef.current) {
        cameraRef.current.setPosition(position)
        if (target) {
          cameraRef.current.lookAt(target)
        }
      }
    },

    animateArmyMovement: (from: HexCoordinate, to: HexCoordinate) => {
      animateArmy(from, to)
    },

    showBuildingConstruction: (coordinate: HexCoordinate, buildingType: BuildingType) => {
      playConstructionAnimation(coordinate, buildingType)
    },

    playResourceGeneration: () => {
      playResourceGenerationEffect()
    }
  }))

  const updateOverworldMap = (overworldManager: OverworldManager) => {
    if (!engineRef.current) return

    // Clear existing tiles
    tilesRef.current.forEach(tileModel => {
      engineRef.current!.root.removeChild(tileModel.entity)
    })
    tilesRef.current.clear()

    const state = overworldManager.getState()

    // Create hex tiles
    state.tiles.forEach((tile, key) => {
      createTileModel(tile, key)
    })

    // Set camera to overview position
    if (cameraRef.current) {
      cameraRef.current.setPosition(0, 20, 15)
      cameraRef.current.lookAt(0, 0, 0)
    }
  }

  const createTileModel = (tile: MapTile, key: string) => {
    if (!engineRef.current) return

    const position = hexToWorldPosition(tile.coordinate)

    // Create base hex tile with better geometry
    const tileEntity = new pc.Entity(`Tile_${key}`)
    tileEntity.addComponent('model', { type: 'cylinder' })
    tileEntity.setPosition(position)

    // Vary height based on terrain
    const terrainHeight = getTerrainHeight(tile.terrain)
    tileEntity.setLocalScale(1.8, terrainHeight, 1.8)
    tileEntity.setPosition(position.x, terrainHeight / 2, position.z)

    // Enhanced terrain material with PBR properties
    const terrainMaterial = new pc.StandardMaterial()
    const terrainProps = getEnhancedTerrainProperties(tile.terrain)

    terrainMaterial.diffuse = terrainProps.diffuse
    terrainMaterial.specular = terrainProps.specular
    terrainMaterial.metalness = terrainProps.metalness
    terrainMaterial.gloss = terrainProps.shininess / 100 // Convert shininess to gloss (0-1 range)
    terrainMaterial.emissive = terrainProps.emissive

    // Add normal mapping effect for texture
    if (terrainProps.bumpiness > 0) {
      terrainMaterial.bumpiness = terrainProps.bumpiness
    }

    if (tileEntity.model?.meshInstances?.[0]) {
      tileEntity.model.meshInstances[0].material = terrainMaterial
    }

    // Add terrain-specific decorations
    addTerrainDecorations(tileEntity, tile.terrain, position)

    // Add faction border if controlled
    if (tile.controlledBy !== Faction.NEUTRAL) {
      const borderEntity = new pc.Entity(`Border_${key}`)
      borderEntity.addComponent('model', { type: 'cylinder' })
      borderEntity.setPosition(position.x, position.y + 0.05, position.z)
      borderEntity.setLocalScale(1.9, 0.02, 1.9)

      const borderMaterial = new pc.StandardMaterial()
      borderMaterial.diffuse = getFactionColor(tile.controlledBy)
      if (borderEntity.model?.meshInstances?.[0]) {
        borderEntity.model.meshInstances[0].material = borderMaterial
      }

      engineRef.current.root.addChild(borderEntity)
    }

    // Create building if present
    let buildingEntity: pc.Entity | undefined
    if (tile.building) {
      buildingEntity = createBuildingModel(tile.building, position)
      engineRef.current.root.addChild(buildingEntity)
    }

    // Create army if present
    let armyEntity: pc.Entity | undefined
    if (tile.army) {
      armyEntity = createArmyModel(tile.army.squads, position, tile.army.faction)
      engineRef.current.root.addChild(armyEntity)
    }

    const tileModel: TileModel = {
      entity: tileEntity,
      tile,
      isHighlighted: false,
      buildingEntity,
      armyEntity
    }

    tilesRef.current.set(key, tileModel)
    engineRef.current.root.addChild(tileEntity)
  }

  const createBuildingModel = (building: NonNullable<MapTile['building']>, position: pc.Vec3): pc.Entity => {
    if (!engineRef.current) return new pc.Entity()

    const buildingContainer = new pc.Entity(`Building_${building.type}`)
    const height = 0.5 + (building.level * 0.3)

    // Create main building structure
    const mainBuilding = new pc.Entity('MainStructure')
    const modelType = getBuildingModelType(building.type)
    mainBuilding.addComponent('model', { type: modelType })

    mainBuilding.setPosition(0, height / 2, 0)
    mainBuilding.setLocalScale(0.8, height, 0.8)

    // Enhanced building material with PBR properties
    const buildingMaterial = new pc.StandardMaterial()
    const buildingProps = getEnhancedBuildingProperties(building.type, building.faction)

    buildingMaterial.diffuse = buildingProps.diffuse
    buildingMaterial.specular = buildingProps.specular
    buildingMaterial.metalness = buildingProps.metalness
    buildingMaterial.gloss = buildingProps.shininess / 100 // Convert shininess to gloss (0-1 range)
    buildingMaterial.emissive = buildingProps.emissive

    if (mainBuilding.model?.meshInstances?.[0]) {
      mainBuilding.model.meshInstances[0].material = buildingMaterial
    }

    buildingContainer.addChild(mainBuilding)

    // Add building-specific details
    addBuildingDetails(buildingContainer, building.type, building.level, height)

    // Construction progress indicator
    if (building.constructionProgress !== undefined) {
      const progress = building.constructionProgress / 100
      buildingMaterial.opacity = 0.3 + (progress * 0.7)
      buildingMaterial.blendType = pc.BLEND_NORMAL
      buildingMaterial.update()

      // Add construction scaffolding effect
      addConstructionEffects(buildingContainer, progress, height)
    }

    // Add level indicators
    if (building.level > 1) {
      addLevelIndicators(buildingContainer, building.level, height)
    }

    buildingContainer.setPosition(position.x, position.y, position.z)
    return buildingContainer
  }

  const createArmyModel = (squads: Squad[], position: pc.Vec3, faction: Faction): pc.Entity => {
    if (!engineRef.current) return new pc.Entity()

    const armyContainer = new pc.Entity('Army')
    armyContainer.setPosition(position.x, position.y + 0.3, position.z)

    // Create unit representations
    squads.forEach((squad, squadIndex) => {
      const units = squad.getUnits()
      units.forEach((unit, unitIndex) => {
        const unitEntity = new pc.Entity(`Unit_${unit.id}`)
        unitEntity.addComponent('model', { type: 'capsule' })

        // Position units in a small formation
        const offset = getUnitFormationOffset(squadIndex, unitIndex, units.length)
        unitEntity.setPosition(offset.x, 0, offset.z)
        unitEntity.setLocalScale(0.2, 0.4, 0.2)

        // Unit color based on faction and archetype
        const unitMaterial = new pc.StandardMaterial()
        unitMaterial.diffuse = getUnitColor(unit.archetype, faction)
        if (unitEntity.model?.meshInstances?.[0]) {
          unitEntity.model.meshInstances[0].material = unitMaterial
        }

        armyContainer.addChild(unitEntity)
      })
    })

    // Add faction flag
    const flagEntity = new pc.Entity('Flag')
    flagEntity.addComponent('model', { type: 'cone' })
    flagEntity.setPosition(0, 0.8, 0)
    flagEntity.setLocalScale(0.3, 0.6, 0.3)

    const flagMaterial = new pc.StandardMaterial()
    flagMaterial.diffuse = getFactionColor(faction)
    if (flagEntity.model?.meshInstances?.[0]) {
      flagEntity.model.meshInstances[0].material = flagMaterial
    }

    armyContainer.addChild(flagEntity)

    return armyContainer
  }

  const highlightTileModel = (tileModel: TileModel, highlight: boolean) => {
    if (!tileModel.entity.model?.meshInstances?.[0]) return

    const material = tileModel.entity.model.meshInstances[0].material as pc.StandardMaterial

    if (highlight && !tileModel.isHighlighted) {
      material.emissive = new pc.Color(0.3, 0.3, 0.0)
      tileModel.isHighlighted = true
    } else if (!highlight && tileModel.isHighlighted) {
      material.emissive = new pc.Color(0, 0, 0)
      tileModel.isHighlighted = false
    }

    material.update()
  }

  const animateArmy = (from: HexCoordinate, to: HexCoordinate) => {
    const fromKey = `${from.q},${from.r}`
    const toKey = `${to.q},${to.r}`

    const fromTile = tilesRef.current.get(fromKey)
    const toTile = tilesRef.current.get(toKey)

    if (!fromTile?.armyEntity || !toTile || !engineRef.current) return

    const fromPos = hexToWorldPosition(from)
    const toPos = hexToWorldPosition(to)

    // Animate army movement using simple interpolation
    const startPos = fromTile.armyEntity.getPosition().clone()
    const endPos = new pc.Vec3(toPos.x, toPos.y + 0.3, toPos.z)

    let progress = 0
    const duration = 1000 // 1 second in milliseconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      progress = Math.min(elapsed / duration, 1)

      // Easing function (sine in-out)
      const easedProgress = 0.5 * (1 - Math.cos(progress * Math.PI))

      if (fromTile.armyEntity) {
        const currentPos = new pc.Vec3()
        currentPos.lerp(startPos, endPos, easedProgress)
        fromTile.armyEntity.setPosition(currentPos)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete - update tile models
        if (fromTile.armyEntity && toTile) {
          toTile.armyEntity = fromTile.armyEntity
          fromTile.armyEntity = undefined
        }
      }
    }

    animate()
  }

  const playConstructionAnimation = (coordinate: HexCoordinate, buildingType: BuildingType) => {
    const tileKey = `${coordinate.q},${coordinate.r}`
    const tileModel = tilesRef.current.get(tileKey)

    if (!tileModel || !engineRef.current) return

    // Create construction effect particles (simplified)
    const position = hexToWorldPosition(coordinate)

    for (let i = 0; i < 10; i++) {
      const particle = new pc.Entity(`Particle_${i}`)
      particle.addComponent('model', { type: 'sphere' })
      particle.setPosition(
        position.x + (Math.random() - 0.5) * 2,
        position.y + Math.random() * 2,
        position.z + (Math.random() - 0.5) * 2
      )
      particle.setLocalScale(0.1, 0.1, 0.1)

      const particleMaterial = new pc.StandardMaterial()
      particleMaterial.diffuse = new pc.Color(0.8, 0.6, 0.2)
      if (particle.model?.meshInstances?.[0]) {
        particle.model.meshInstances[0].material = particleMaterial
      }

      engineRef.current.root.addChild(particle)

      // Animate particle using simple interpolation
      const particleStartPos = particle.getPosition().clone()
      const particleEndPos = new pc.Vec3(position.x, position.y + 1, position.z)

      let particleProgress = 0
      const particleDuration = 1000 // 1 second
      const particleStartTime = Date.now()

      const animateParticle = () => {
        const elapsed = Date.now() - particleStartTime
        particleProgress = Math.min(elapsed / particleDuration, 1)

        // Easing function (sine out)
        const easedProgress = Math.sin(particleProgress * Math.PI / 2)

        const currentPos = new pc.Vec3()
        currentPos.lerp(particleStartPos, particleEndPos, easedProgress)
        particle.setPosition(currentPos)

        if (particleProgress < 1) {
          requestAnimationFrame(animateParticle)
        } else {
          engineRef.current!.root.removeChild(particle)
        }
      }

      animateParticle()
    }
  }

  const playResourceGenerationEffect = () => {
    // Create floating resource icons above buildings
    tilesRef.current.forEach(tileModel => {
      if (tileModel.buildingEntity && engineRef.current) {
        const position = tileModel.buildingEntity.getPosition()

        const resourceIcon = new pc.Entity('ResourceIcon')
        resourceIcon.addComponent('model', { type: 'sphere' })
        resourceIcon.setPosition(position.x, position.y + 1, position.z)
        resourceIcon.setLocalScale(0.2, 0.2, 0.2)

        const iconMaterial = new pc.StandardMaterial()
        iconMaterial.diffuse = new pc.Color(1, 0.8, 0.2) // Gold color
        iconMaterial.emissive = new pc.Color(0.2, 0.2, 0.0)
        if (resourceIcon.model?.meshInstances?.[0]) {
          resourceIcon.model.meshInstances[0].material = iconMaterial
        }

        engineRef.current.root.addChild(resourceIcon)

        // Animate resource collection using simple interpolation
        const iconStartPos = resourceIcon.getPosition().clone()
        const iconEndPos = new pc.Vec3(position.x, position.y + 3, position.z)

        let iconProgress = 0
        const iconDuration = 1500 // 1.5 seconds
        const iconStartTime = Date.now()

        const animateIcon = () => {
          const elapsed = Date.now() - iconStartTime
          iconProgress = Math.min(elapsed / iconDuration, 1)

          // Easing function (sine out)
          const easedProgress = Math.sin(iconProgress * Math.PI / 2)

          const currentPos = new pc.Vec3()
          currentPos.lerp(iconStartPos, iconEndPos, easedProgress)
          resourceIcon.setPosition(currentPos)

          if (iconProgress < 1) {
            requestAnimationFrame(animateIcon)
          } else {
            engineRef.current!.root.removeChild(resourceIcon)
          }
        }

        animateIcon()
      }
    })
  }

  const hexToWorldPosition = (coordinate: HexCoordinate): pc.Vec3 => {
    const size = 2
    const x = size * (3 / 2 * coordinate.q)
    const z = size * (Math.sqrt(3) / 2 * coordinate.q + Math.sqrt(3) * coordinate.r)
    return new pc.Vec3(x, 0, z)
  }

  const getTerrainHeight = (terrain: TerrainType): number => {
    switch (terrain) {
      case TerrainType.MOUNTAINS: return 0.8
      case TerrainType.HILLS: return 0.4
      case TerrainType.FOREST: return 0.2
      case TerrainType.PLAINS: return 0.1
      case TerrainType.DESERT: return 0.15
      case TerrainType.SWAMP: return 0.05
      case TerrainType.RIVER: return 0.02
      case TerrainType.SNOW: return 0.3
      default: return 0.1
    }
  }

  const getEnhancedTerrainProperties = (terrain: TerrainType) => {
    switch (terrain) {
      case TerrainType.PLAINS:
        return {
          diffuse: new pc.Color(0.4, 0.7, 0.3),
          specular: new pc.Color(0.1, 0.1, 0.1),
          metalness: 0.0,
          shininess: 20,
          emissive: new pc.Color(0, 0, 0),
          bumpiness: 0.1
        }
      case TerrainType.FOREST:
        return {
          diffuse: new pc.Color(0.2, 0.5, 0.2),
          specular: new pc.Color(0.05, 0.1, 0.05),
          metalness: 0.0,
          shininess: 10,
          emissive: new pc.Color(0, 0, 0),
          bumpiness: 0.3
        }
      case TerrainType.MOUNTAINS:
        return {
          diffuse: new pc.Color(0.6, 0.6, 0.6),
          specular: new pc.Color(0.3, 0.3, 0.3),
          metalness: 0.2,
          shininess: 80,
          emissive: new pc.Color(0, 0, 0),
          bumpiness: 0.5
        }
      case TerrainType.HILLS:
        return {
          diffuse: new pc.Color(0.5, 0.6, 0.4),
          specular: new pc.Color(0.2, 0.2, 0.2),
          metalness: 0.1,
          shininess: 40,
          emissive: new pc.Color(0, 0, 0),
          bumpiness: 0.3
        }
      case TerrainType.RIVER:
        return {
          diffuse: new pc.Color(0.3, 0.5, 0.9),
          specular: new pc.Color(0.8, 0.8, 1.0),
          metalness: 0.0,
          shininess: 100,
          emissive: new pc.Color(0.05, 0.1, 0.2),
          bumpiness: 0.1
        }
      case TerrainType.DESERT:
        return {
          diffuse: new pc.Color(0.9, 0.8, 0.4),
          specular: new pc.Color(0.2, 0.2, 0.1),
          metalness: 0.0,
          shininess: 30,
          emissive: new pc.Color(0.1, 0.05, 0),
          bumpiness: 0.2
        }
      case TerrainType.SWAMP:
        return {
          diffuse: new pc.Color(0.4, 0.4, 0.2),
          specular: new pc.Color(0.1, 0.2, 0.1),
          metalness: 0.0,
          shininess: 15,
          emissive: new pc.Color(0.02, 0.05, 0.02),
          bumpiness: 0.2
        }
      case TerrainType.SNOW:
        return {
          diffuse: new pc.Color(0.95, 0.95, 1.0),
          specular: new pc.Color(0.9, 0.9, 1.0),
          metalness: 0.0,
          shininess: 90,
          emissive: new pc.Color(0.1, 0.1, 0.15),
          bumpiness: 0.1
        }
      default:
        return {
          diffuse: new pc.Color(0.5, 0.5, 0.5),
          specular: new pc.Color(0.2, 0.2, 0.2),
          metalness: 0.0,
          shininess: 30,
          emissive: new pc.Color(0, 0, 0),
          bumpiness: 0.1
        }
    }
  }

  const addTerrainDecorations = (tileEntity: pc.Entity, terrain: TerrainType, position: pc.Vec3) => {
    if (!engineRef.current) return

    const decorationContainer = new pc.Entity('Decorations')
    decorationContainer.setPosition(0, 0, 0)

    switch (terrain) {
      case TerrainType.FOREST:
        // Add small trees
        for (let i = 0; i < 3; i++) {
          const tree = new pc.Entity(`Tree_${i}`)
          tree.addComponent('model', { type: 'cone' })

          const angle = (i / 3) * Math.PI * 2
          const radius = 0.5 + Math.random() * 0.3
          tree.setPosition(
            Math.cos(angle) * radius,
            0.3,
            Math.sin(angle) * radius
          )
          tree.setLocalScale(0.2, 0.6, 0.2)

          const treeMaterial = new pc.StandardMaterial()
          treeMaterial.diffuse = new pc.Color(0.1, 0.3, 0.1)
          if (tree.model?.meshInstances?.[0]) {
            tree.model.meshInstances[0].material = treeMaterial
          }

          decorationContainer.addChild(tree)
        }
        break

      case TerrainType.MOUNTAINS:
        // Add rocky outcrops
        for (let i = 0; i < 2; i++) {
          const rock = new pc.Entity(`Rock_${i}`)
          rock.addComponent('model', { type: 'box' })

          const angle = (i / 2) * Math.PI * 2
          const radius = 0.4 + Math.random() * 0.2
          rock.setPosition(
            Math.cos(angle) * radius,
            0.2,
            Math.sin(angle) * radius
          )
          rock.setLocalScale(0.15, 0.4, 0.15)
          rock.setEulerAngles(
            Math.random() * 30 - 15,
            Math.random() * 360,
            Math.random() * 30 - 15
          )

          const rockMaterial = new pc.StandardMaterial()
          rockMaterial.diffuse = new pc.Color(0.4, 0.4, 0.4)
          rockMaterial.metalness = 0.3
          if (rock.model?.meshInstances?.[0]) {
            rock.model.meshInstances[0].material = rockMaterial
          }

          decorationContainer.addChild(rock)
        }
        break

      case TerrainType.DESERT:
        // Add small dunes/mounds
        for (let i = 0; i < 2; i++) {
          const dune = new pc.Entity(`Dune_${i}`)
          dune.addComponent('model', { type: 'sphere' })

          const angle = (i / 2) * Math.PI * 2
          const radius = 0.3 + Math.random() * 0.2
          dune.setPosition(
            Math.cos(angle) * radius,
            0.05,
            Math.sin(angle) * radius
          )
          dune.setLocalScale(0.3, 0.1, 0.3)

          const duneMaterial = new pc.StandardMaterial()
          duneMaterial.diffuse = new pc.Color(0.8, 0.7, 0.3)
          if (dune.model?.meshInstances?.[0]) {
            dune.model.meshInstances[0].material = duneMaterial
          }

          decorationContainer.addChild(dune)
        }
        break

      case TerrainType.RIVER:
        // Add water ripple effect (simplified)
        const ripple = new pc.Entity('Ripple')
        ripple.addComponent('model', { type: 'cylinder' })
        ripple.setPosition(0, 0.01, 0)
        ripple.setLocalScale(1.5, 0.01, 1.5)

        const rippleMaterial = new pc.StandardMaterial()
        rippleMaterial.diffuse = new pc.Color(0.2, 0.4, 0.8)
        rippleMaterial.opacity = 0.7
        rippleMaterial.blendType = pc.BLEND_NORMAL
        rippleMaterial.emissive = new pc.Color(0.1, 0.2, 0.4)
        if (ripple.model?.meshInstances?.[0]) {
          ripple.model.meshInstances[0].material = rippleMaterial
        }

        decorationContainer.addChild(ripple)
        break
    }

    if (decorationContainer.children.length > 0) {
      tileEntity.addChild(decorationContainer)
    }
  }

  const getTerrainColor = (terrain: TerrainType): pc.Color => {
    switch (terrain) {
      case TerrainType.PLAINS: return new pc.Color(0.4, 0.7, 0.3)
      case TerrainType.FOREST: return new pc.Color(0.2, 0.5, 0.2)
      case TerrainType.MOUNTAINS: return new pc.Color(0.6, 0.6, 0.6)
      case TerrainType.HILLS: return new pc.Color(0.5, 0.6, 0.4)
      case TerrainType.RIVER: return new pc.Color(0.3, 0.5, 0.9)
      case TerrainType.DESERT: return new pc.Color(0.9, 0.8, 0.4)
      case TerrainType.SWAMP: return new pc.Color(0.4, 0.4, 0.2)
      case TerrainType.SNOW: return new pc.Color(0.95, 0.95, 1.0)
      default: return new pc.Color(0.5, 0.5, 0.5)
    }
  }

  const getFactionColor = (faction: Faction): pc.Color => {
    switch (faction) {
      case Faction.PLAYER: return new pc.Color(0.2, 0.4, 0.8)
      case Faction.ENEMY: return new pc.Color(0.8, 0.2, 0.2)
      default: return new pc.Color(0.5, 0.5, 0.5)
    }
  }

  const getBuildingModelType = (buildingType: BuildingType): string => {
    switch (buildingType) {
      case BuildingType.CASTLE: return 'box'
      case BuildingType.CHURCH: return 'cone'
      case BuildingType.FARM: return 'cylinder'
      case BuildingType.BLACKSMITH: return 'box'
      case BuildingType.TOWER: return 'cylinder'
      default: return 'box'
    }
  }

  const getEnhancedBuildingProperties = (buildingType: BuildingType, faction: Faction) => {
    const baseColor = getFactionColor(faction)

    switch (buildingType) {
      case BuildingType.CASTLE:
        return {
          diffuse: new pc.Color(0.6, 0.6, 0.7),
          specular: new pc.Color(0.4, 0.4, 0.5),
          metalness: 0.3,
          shininess: 60,
          emissive: new pc.Color(0.05, 0.05, 0.1)
        }
      case BuildingType.CHURCH:
        return {
          diffuse: new pc.Color(0.9, 0.9, 0.95),
          specular: new pc.Color(0.8, 0.8, 0.9),
          metalness: 0.0,
          shininess: 80,
          emissive: new pc.Color(0.1, 0.1, 0.15)
        }
      case BuildingType.FARM:
        return {
          diffuse: new pc.Color(0.7, 0.5, 0.3),
          specular: new pc.Color(0.2, 0.2, 0.1),
          metalness: 0.0,
          shininess: 20,
          emissive: new pc.Color(0.05, 0.03, 0.01)
        }
      case BuildingType.BLACKSMITH:
        return {
          diffuse: new pc.Color(0.4, 0.4, 0.4),
          specular: new pc.Color(0.6, 0.6, 0.6),
          metalness: 0.7,
          shininess: 90,
          emissive: new pc.Color(0.2, 0.1, 0.05)
        }
      case BuildingType.TOWER:
        return {
          diffuse: new pc.Color(0.5, 0.5, 0.6),
          specular: new pc.Color(0.3, 0.3, 0.4),
          metalness: 0.2,
          shininess: 70,
          emissive: new pc.Color(0.1, 0.05, 0.2)
        }
      case BuildingType.OUTPOST:
        return {
          diffuse: new pc.Color(0.6, 0.5, 0.4),
          specular: new pc.Color(0.3, 0.3, 0.2),
          metalness: 0.1,
          shininess: 40,
          emissive: new pc.Color(0.05, 0.05, 0.02)
        }
      case BuildingType.MINE:
        return {
          diffuse: new pc.Color(0.5, 0.4, 0.3),
          specular: new pc.Color(0.4, 0.4, 0.3),
          metalness: 0.4,
          shininess: 50,
          emissive: new pc.Color(0.1, 0.08, 0.05)
        }
      default:
        return {
          diffuse: baseColor,
          specular: new pc.Color(0.3, 0.3, 0.3),
          metalness: 0.2,
          shininess: 50,
          emissive: new pc.Color(0.05, 0.05, 0.05)
        }
    }
  }

  const addBuildingDetails = (buildingContainer: pc.Entity, buildingType: BuildingType, level: number, height: number) => {
    if (!engineRef.current) return

    switch (buildingType) {
      case BuildingType.CASTLE:
        // Add towers to castle
        for (let i = 0; i < 4; i++) {
          const tower = new pc.Entity(`Tower_${i}`)
          tower.addComponent('model', { type: 'cylinder' })

          const angle = (i / 4) * Math.PI * 2
          const radius = 0.6
          tower.setPosition(
            Math.cos(angle) * radius,
            height * 0.8,
            Math.sin(angle) * radius
          )
          tower.setLocalScale(0.2, height * 0.6, 0.2)

          const towerMaterial = new pc.StandardMaterial()
          towerMaterial.diffuse = new pc.Color(0.5, 0.5, 0.6)
          towerMaterial.metalness = 0.2
          if (tower.model?.meshInstances?.[0]) {
            tower.model.meshInstances[0].material = towerMaterial
          }

          buildingContainer.addChild(tower)
        }
        break

      case BuildingType.CHURCH:
        // Add cross on top
        const cross = new pc.Entity('Cross')
        cross.addComponent('model', { type: 'box' })
        cross.setPosition(0, height + 0.3, 0)
        cross.setLocalScale(0.05, 0.3, 0.05)

        const crossMaterial = new pc.StandardMaterial()
        crossMaterial.diffuse = new pc.Color(0.8, 0.7, 0.3)
        crossMaterial.metalness = 0.8
        crossMaterial.emissive = new pc.Color(0.1, 0.1, 0.05)
        if (cross.model?.meshInstances?.[0]) {
          cross.model.meshInstances[0].material = crossMaterial
        }

        buildingContainer.addChild(cross)
        break

      case BuildingType.BLACKSMITH:
        // Add chimney with smoke effect
        const chimney = new pc.Entity('Chimney')
        chimney.addComponent('model', { type: 'cylinder' })
        chimney.setPosition(0.3, height + 0.2, 0.3)
        chimney.setLocalScale(0.1, 0.4, 0.1)

        const chimneyMaterial = new pc.StandardMaterial()
        chimneyMaterial.diffuse = new pc.Color(0.3, 0.2, 0.2)
        if (chimney.model?.meshInstances?.[0]) {
          chimney.model.meshInstances[0].material = chimneyMaterial
        }

        buildingContainer.addChild(chimney)

        // Add glowing forge effect
        const forge = new pc.Entity('Forge')
        forge.addComponent('model', { type: 'sphere' })
        forge.setPosition(0, height * 0.3, 0)
        forge.setLocalScale(0.3, 0.1, 0.3)

        const forgeMaterial = new pc.StandardMaterial()
        forgeMaterial.diffuse = new pc.Color(1.0, 0.3, 0.1)
        forgeMaterial.emissive = new pc.Color(0.5, 0.2, 0.05)
        forgeMaterial.opacity = 0.8
        forgeMaterial.blendType = pc.BLEND_NORMAL
        if (forge.model?.meshInstances?.[0]) {
          forge.model.meshInstances[0].material = forgeMaterial
        }

        buildingContainer.addChild(forge)
        break

      case BuildingType.FARM:
        // Add windmill blades
        const windmill = new pc.Entity('Windmill')
        windmill.addComponent('model', { type: 'box' })
        windmill.setPosition(0, height + 0.2, 0)
        windmill.setLocalScale(0.8, 0.05, 0.05)

        const windmillMaterial = new pc.StandardMaterial()
        windmillMaterial.diffuse = new pc.Color(0.6, 0.4, 0.2)
        if (windmill.model?.meshInstances?.[0]) {
          windmill.model.meshInstances[0].material = windmillMaterial
        }

        buildingContainer.addChild(windmill)
        break

      case BuildingType.TOWER:
        // Add magical crystal on top
        const crystal = new pc.Entity('Crystal')
        crystal.addComponent('model', { type: 'cone' })
        crystal.setPosition(0, height + 0.3, 0)
        crystal.setLocalScale(0.2, 0.4, 0.2)

        const crystalMaterial = new pc.StandardMaterial()
        crystalMaterial.diffuse = new pc.Color(0.5, 0.3, 0.9)
        crystalMaterial.emissive = new pc.Color(0.3, 0.1, 0.5)
        crystalMaterial.opacity = 0.8
        crystalMaterial.blendType = pc.BLEND_NORMAL
        if (crystal.model?.meshInstances?.[0]) {
          crystal.model.meshInstances[0].material = crystalMaterial
        }

        buildingContainer.addChild(crystal)
        break
    }
  }

  const addConstructionEffects = (buildingContainer: pc.Entity, progress: number, height: number) => {
    if (!engineRef.current) return

    // Add scaffolding
    const scaffolding = new pc.Entity('Scaffolding')

    for (let i = 0; i < 4; i++) {
      const beam = new pc.Entity(`Beam_${i}`)
      beam.addComponent('model', { type: 'box' })

      const angle = (i / 4) * Math.PI * 2
      const radius = 0.9
      beam.setPosition(
        Math.cos(angle) * radius,
        height * progress * 0.5,
        Math.sin(angle) * radius
      )
      beam.setLocalScale(0.05, height * progress, 0.05)

      const beamMaterial = new pc.StandardMaterial()
      beamMaterial.diffuse = new pc.Color(0.6, 0.4, 0.2)
      beamMaterial.opacity = 0.7
      beamMaterial.blendType = pc.BLEND_NORMAL
      if (beam.model?.meshInstances?.[0]) {
        beam.model.meshInstances[0].material = beamMaterial
      }

      scaffolding.addChild(beam)
    }

    buildingContainer.addChild(scaffolding)
  }

  const addLevelIndicators = (buildingContainer: pc.Entity, level: number, height: number) => {
    if (!engineRef.current) return

    // Add level indicator rings
    for (let i = 1; i < level; i++) {
      const ring = new pc.Entity(`LevelRing_${i}`)
      ring.addComponent('model', { type: 'cylinder' })
      ring.setPosition(0, height * (i / level), 0)
      ring.setLocalScale(1.0, 0.02, 1.0)

      const ringMaterial = new pc.StandardMaterial()
      ringMaterial.diffuse = new pc.Color(0.8, 0.6, 0.2)
      ringMaterial.emissive = new pc.Color(0.2, 0.15, 0.05)
      ringMaterial.metalness = 0.8
      if (ring.model?.meshInstances?.[0]) {
        ring.model.meshInstances[0].material = ringMaterial
      }

      buildingContainer.addChild(ring)
    }
  }

  const getBuildingColor = (buildingType: BuildingType, faction: Faction): pc.Color => {
    const baseColor = getFactionColor(faction)

    switch (buildingType) {
      case BuildingType.CASTLE: return new pc.Color(baseColor.r * 0.8, baseColor.g * 0.8, baseColor.b * 0.8)
      case BuildingType.CHURCH: return new pc.Color(0.9, 0.9, 0.9)
      case BuildingType.FARM: return new pc.Color(0.6, 0.4, 0.2)
      case BuildingType.BLACKSMITH: return new pc.Color(0.3, 0.3, 0.3)
      default: return baseColor
    }
  }

  const getUnitColor = (archetype: string, faction: Faction): pc.Color => {
    const baseColor = getFactionColor(faction)

    switch (archetype) {
      case 'knight': return new pc.Color(baseColor.r, baseColor.g, baseColor.b)
      case 'mage': return new pc.Color(baseColor.r * 0.7, baseColor.g * 0.7, baseColor.b + 0.3)
      case 'archer': return new pc.Color(baseColor.r + 0.2, baseColor.g + 0.3, baseColor.b * 0.7)
      default: return baseColor
    }
  }

  const getUnitFormationOffset = (squadIndex: number, unitIndex: number, totalUnits: number): pc.Vec3 => {
    const angle = (unitIndex / totalUnits) * Math.PI * 2
    const radius = 0.3 + (squadIndex * 0.2)

    return new pc.Vec3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    )
  }

  const createSkybox = (app: pc.Application) => {
    // Create a simple gradient skybox using a cubemap
    const device = app.graphicsDevice

    // Create skybox material
    const skyboxMaterial = new pc.StandardMaterial()
    skyboxMaterial.diffuse = new pc.Color(0.5, 0.7, 1.0) // Sky blue
    skyboxMaterial.emissive = new pc.Color(0.1, 0.2, 0.3) // Slight glow
    skyboxMaterial.cull = pc.CULLFACE_FRONT // Render inside faces

    // Create skybox entity
    const skybox = new pc.Entity('Skybox')
    skybox.addComponent('model', { type: 'sphere' })
    skybox.setLocalScale(100, 100, 100) // Large sphere

    if (skybox.model?.meshInstances?.[0]) {
      skybox.model.meshInstances[0].material = skyboxMaterial
    }

    app.root.addChild(skybox)

    // Add some clouds as simple spheres
    for (let i = 0; i < 8; i++) {
      const cloud = new pc.Entity(`Cloud_${i}`)
      cloud.addComponent('model', { type: 'sphere' })

      const angle = (i / 8) * Math.PI * 2
      const radius = 40 + Math.random() * 20
      const height = 15 + Math.random() * 10

      cloud.setPosition(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      )
      cloud.setLocalScale(
        3 + Math.random() * 2,
        1 + Math.random() * 0.5,
        3 + Math.random() * 2
      )

      const cloudMaterial = new pc.StandardMaterial()
      cloudMaterial.diffuse = new pc.Color(0.9, 0.9, 0.95)
      cloudMaterial.opacity = 0.6
      cloudMaterial.blendType = pc.BLEND_NORMAL

      if (cloud.model?.meshInstances?.[0]) {
        cloud.model.meshInstances[0].material = cloudMaterial
      }

      app.root.addChild(cloud)
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const app = new pc.Application(canvasRef.current, {
      graphicsDeviceOptions: { alpha: false },
    })

    app.start()
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW)
    app.setCanvasResolution(pc.RESOLUTION_AUTO)

    const handleResize = () => app.resizeCanvas()
    window.addEventListener('resize', handleResize)

    // Create camera
    const camera = new pc.Entity('Camera')
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.2, 0.3),
      fov: 45
    })
    camera.setPosition(0, 20, 15)
    camera.lookAt(0, 0, 0)
    app.root.addChild(camera)
    cameraRef.current = camera

    // Enhanced lighting system
    const sun = new pc.Entity('Sun')
    sun.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(1.0, 0.95, 0.8),
      intensity: 1.2,
      castShadows: true,
      shadowDistance: 50,
      shadowResolution: 2048,
      shadowBias: 0.05,
      normalOffsetBias: 0.05
    })
    sun.setEulerAngles(45, 30, 0)
    app.root.addChild(sun)

    // Ambient light with better color temperature
    app.scene.ambientLight = new pc.Color(0.3, 0.4, 0.5)

    // Add rim lighting for better depth perception
    const rimLight = new pc.Entity('RimLight')
    rimLight.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(0.6, 0.7, 1.0),
      intensity: 0.3
    })
    rimLight.setEulerAngles(-30, 210, 0)
    app.root.addChild(rimLight)

    // Note: Fog configuration removed due to PlayCanvas API compatibility

    // Enable tone mapping for better color range on camera
    if (camera.camera) {
      camera.camera.toneMapping = pc.TONEMAP_ACES
    }

    // Add skybox for better atmosphere
    createSkybox(app)

    engineRef.current = app

    return () => {
      window.removeEventListener('resize', handleResize)
      app.destroy()
    }
  }, [])

return (
  <canvas
    ref={canvasRef}
    className="absolute inset-0 w-full h-full"
    style={{ touchAction: 'none' }}
  />
)
})

export default OverworldCanvas