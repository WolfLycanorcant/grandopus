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

    // Create base hex tile
    const tileEntity = new pc.Entity(`Tile_${key}`)
    tileEntity.addComponent('model', { type: 'cylinder' })
    tileEntity.setPosition(position)
    tileEntity.setLocalScale(1.8, 0.1, 1.8)

    // Set terrain color and material
    const terrainMaterial = new pc.StandardMaterial()
    terrainMaterial.diffuse = getTerrainColor(tile.terrain)
    if (tileEntity.model?.meshInstances?.[0]) {
      tileEntity.model.meshInstances[0].material = terrainMaterial
    }

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

    const buildingEntity = new pc.Entity(`Building_${building.type}`)

    // Different shapes for different building types
    const modelType = getBuildingModelType(building.type)
    buildingEntity.addComponent('model', { type: modelType })

    const height = 0.5 + (building.level * 0.3)
    buildingEntity.setPosition(position.x, position.y + height / 2, position.z)
    buildingEntity.setLocalScale(0.8, height, 0.8)

    // Building color based on type and faction
    const buildingMaterial = new pc.StandardMaterial()
    buildingMaterial.diffuse = getBuildingColor(building.type, building.faction)
    if (buildingEntity.model?.meshInstances?.[0]) {
      buildingEntity.model.meshInstances[0].material = buildingMaterial
    }

    // Construction progress indicator
    if (building.constructionProgress !== undefined) {
      const progress = building.constructionProgress / 100
      buildingMaterial.opacity = 0.3 + (progress * 0.7)
      buildingMaterial.blendType = pc.BLEND_NORMAL
      buildingMaterial.update()
    }

    return buildingEntity
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

  const getTerrainColor = (terrain: TerrainType): pc.Color => {
    switch (terrain) {
      case TerrainType.GRASSLAND: return new pc.Color(0.3, 0.6, 0.2)
      case TerrainType.FOREST: return new pc.Color(0.1, 0.4, 0.1)
      case TerrainType.MOUNTAIN: return new pc.Color(0.5, 0.5, 0.5)
      case TerrainType.WATER: return new pc.Color(0.2, 0.4, 0.8)
      case TerrainType.DESERT: return new pc.Color(0.8, 0.7, 0.3)
      case TerrainType.SWAMP: return new pc.Color(0.3, 0.3, 0.1)
      default: return new pc.Color(0.4, 0.4, 0.4)
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

    // Create lighting
    const sun = new pc.Entity('Sun')
    sun.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(1, 0.9, 0.7),
      intensity: 1
    })
    sun.setEulerAngles(45, 30, 0)
    app.root.addChild(sun)

    // Ambient light
    const ambient = new pc.Entity('Ambient')
    ambient.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(0.4, 0.5, 0.6),
      intensity: 0.4
    })
    ambient.setEulerAngles(-45, -30, 0)
    app.root.addChild(ambient)

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