import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import * as pc from 'playcanvas'
import { Unit } from '../core/units'
import { Squad } from '../core/squads'

export interface BattleCanvasHandle {
  setupBattle: (attackingSquad: Squad, defendingSquad: Squad) => void
  animateAttack: (attackerId: string, targetId: string, damage: number) => void
  updateUnitHealth: (unitId: string, currentHp: number, maxHp: number) => void
  highlightUnit: (unitId: string, highlight: boolean) => void
  setCameraAngle: (angle: 'overview' | 'close' | 'side') => void
  playVictoryAnimation: (winningSquad: Squad) => void
}

interface UnitModel {
  entity: pc.Entity
  unit: Unit
  healthBar: pc.Entity
  isHighlighted: boolean
}

const BattleCanvas = forwardRef<BattleCanvasHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<pc.Application | null>(null)
  const unitsRef = useRef<Map<string, UnitModel>>(new Map())
  const cameraRef = useRef<pc.Entity | null>(null)

  useImperativeHandle(ref, () => ({
    setupBattle: (attackingSquad: Squad, defendingSquad: Squad) => {
      if (!engineRef.current) return
      setupBattleScene(attackingSquad, defendingSquad)
    },

    animateAttack: (attackerId: string, targetId: string, damage: number) => {
      if (!engineRef.current) return
      playAttackAnimation(attackerId, targetId, damage)
    },

    updateUnitHealth: (unitId: string, currentHp: number, maxHp: number) => {
      const unitModel = unitsRef.current.get(unitId)
      if (unitModel) {
        updateHealthBar(unitModel, currentHp, maxHp)
      }
    },

    highlightUnit: (unitId: string, highlight: boolean) => {
      const unitModel = unitsRef.current.get(unitId)
      if (unitModel) {
        highlightUnitModel(unitModel, highlight)
      }
    },

    setCameraAngle: (angle: 'overview' | 'close' | 'side') => {
      if (cameraRef.current) {
        setCameraPosition(angle)
      }
    },

    playVictoryAnimation: (winningSquad: Squad) => {
      playVictorySequence(winningSquad)
    }
  }))

  const setupBattleScene = (attackingSquad: Squad, defendingSquad: Squad) => {
    if (!engineRef.current) return

    // Clear existing units
    unitsRef.current.forEach(unitModel => {
      engineRef.current!.root.removeChild(unitModel.entity)
    })
    unitsRef.current.clear()

    // Create battlefield ground
    const ground = new pc.Entity('Ground')
    ground.addComponent('model', { type: 'plane' })
    ground.setLocalScale(20, 1, 15)
    ground.setPosition(0, -0.5, 0)
    
    const groundMaterial = new pc.StandardMaterial()
    groundMaterial.diffuse = new pc.Color(0.3, 0.5, 0.2) // Grass green
    ground.model!.meshInstances[0].material = groundMaterial
    
    engineRef.current.root.addChild(ground)

    // Position attacking squad (left side)
    const attackingUnits = attackingSquad.getUnits()
    attackingUnits.forEach((unit, index) => {
      const position = getFormationPosition('attacking', index, attackingUnits.length)
      createUnitModel(unit, position, 'attacking')
    })

    // Position defending squad (right side)
    const defendingUnits = defendingSquad.getUnits()
    defendingUnits.forEach((unit, index) => {
      const position = getFormationPosition('defending', index, defendingUnits.length)
      createUnitModel(unit, position, 'defending')
    })

    // Set camera to overview
    setCameraPosition('overview')
  }

  const createUnitModel = (unit: Unit, position: pc.Vec3, side: 'attacking' | 'defending') => {
    if (!engineRef.current) return

    // Create unit entity
    const unitEntity = new pc.Entity(`Unit_${unit.id}`)
    
    // Create unit model based on archetype
    const modelType = getModelTypeForArchetype(unit.archetype)
    unitEntity.addComponent('model', { type: modelType })
    
    // Set unit color based on side and race
    const material = new pc.StandardMaterial()
    material.diffuse = getUnitColor(unit, side)
    unitEntity.model!.meshInstances[0].material = material
    
    unitEntity.setPosition(position)
    unitEntity.setLocalScale(0.8, 0.8, 0.8)
    
    // Create health bar
    const healthBar = createHealthBar(unit)
    healthBar.setPosition(position.x, position.y + 1.5, position.z)
    
    // Store unit model
    const unitModel: UnitModel = {
      entity: unitEntity,
      unit,
      healthBar,
      isHighlighted: false
    }
    
    unitsRef.current.set(unit.id, unitModel)
    
    engineRef.current.root.addChild(unitEntity)
    engineRef.current.root.addChild(healthBar)
  }

  const createHealthBar = (unit: Unit): pc.Entity => {
    if (!engineRef.current) return new pc.Entity()

    const healthBarContainer = new pc.Entity(`HealthBar_${unit.id}`)
    
    // Background bar (red)
    const bgBar = new pc.Entity('HealthBG')
    bgBar.addComponent('model', { type: 'plane' })
    bgBar.setLocalScale(1, 0.1, 1)
    
    const bgMaterial = new pc.StandardMaterial()
    bgMaterial.diffuse = new pc.Color(0.8, 0.2, 0.2)
    bgBar.model!.meshInstances[0].material = bgMaterial
    
    // Foreground bar (green)
    const fgBar = new pc.Entity('HealthFG')
    fgBar.addComponent('model', { type: 'plane' })
    fgBar.setLocalScale(1, 0.1, 1)
    fgBar.setPosition(0, 0.01, 0)
    
    const fgMaterial = new pc.StandardMaterial()
    fgMaterial.diffuse = new pc.Color(0.2, 0.8, 0.2)
    fgBar.model!.meshInstances[0].material = fgMaterial
    
    healthBarContainer.addChild(bgBar)
    healthBarContainer.addChild(fgBar)
    
    return healthBarContainer
  }

  const updateHealthBar = (unitModel: UnitModel, currentHp: number, maxHp: number) => {
    const healthPercent = Math.max(0, currentHp / maxHp)
    const fgBar = unitModel.healthBar.findByName('HealthFG')
    
    if (fgBar) {
      fgBar.setLocalScale(healthPercent, 0.1, 1)
      fgBar.setPosition((healthPercent - 1) * 0.5, 0.01, 0)
      
      // Change color based on health
      const material = fgBar.model!.meshInstances[0].material as pc.StandardMaterial
      if (healthPercent > 0.6) {
        material.diffuse = new pc.Color(0.2, 0.8, 0.2) // Green
      } else if (healthPercent > 0.3) {
        material.diffuse = new pc.Color(0.8, 0.8, 0.2) // Yellow
      } else {
        material.diffuse = new pc.Color(0.8, 0.2, 0.2) // Red
      }
      material.update()
    }
  }

  const highlightUnitModel = (unitModel: UnitModel, highlight: boolean) => {
    const material = unitModel.entity.model!.meshInstances[0].material as pc.StandardMaterial
    
    if (highlight && !unitModel.isHighlighted) {
      material.emissive = new pc.Color(0.3, 0.3, 0.3)
      unitModel.isHighlighted = true
    } else if (!highlight && unitModel.isHighlighted) {
      material.emissive = new pc.Color(0, 0, 0)
      unitModel.isHighlighted = false
    }
    
    material.update()
  }

  const playAttackAnimation = (attackerId: string, targetId: string, damage: number) => {
    const attacker = unitsRef.current.get(attackerId)
    const target = unitsRef.current.get(targetId)
    
    if (!attacker || !target || !engineRef.current) return

    // Simple attack animation - move attacker toward target and back
    const originalPos = attacker.entity.getPosition().clone()
    const targetPos = target.entity.getPosition()
    const attackPos = new pc.Vec3().lerp(originalPos, targetPos, 0.7)

    // Animate attacker moving forward
    const moveForward = engineRef.current.tween(attacker.entity.getPosition())
      .to(attackPos, 0.3, pc.SineOut)
      .on('complete', () => {
        // Flash target red to show damage
        const targetMaterial = target.entity.model!.meshInstances[0].material as pc.StandardMaterial
        const originalColor = targetMaterial.diffuse.clone()
        
        targetMaterial.diffuse = new pc.Color(1, 0.3, 0.3)
        targetMaterial.update()
        
        setTimeout(() => {
          targetMaterial.diffuse = originalColor
          targetMaterial.update()
        }, 200)

        // Show damage number (simplified)
        console.log(`${attacker.unit.name} deals ${damage} damage to ${target.unit.name}`)

        // Move attacker back
        engineRef.current!.tween(attacker.entity.getPosition())
          .to(originalPos, 0.3, pc.SineOut)
          .start()
      })

    moveForward.start()
  }

  const setCameraPosition = (angle: 'overview' | 'close' | 'side') => {
    if (!cameraRef.current) return

    switch (angle) {
      case 'overview':
        cameraRef.current.setPosition(0, 8, 8)
        cameraRef.current.lookAt(0, 0, 0)
        break
      case 'close':
        cameraRef.current.setPosition(0, 3, 5)
        cameraRef.current.lookAt(0, 0, 0)
        break
      case 'side':
        cameraRef.current.setPosition(10, 4, 0)
        cameraRef.current.lookAt(0, 0, 0)
        break
    }
  }

  const playVictorySequence = (winningSquad: Squad) => {
    const winningUnits = winningSquad.getUnits()
    
    winningUnits.forEach(unit => {
      const unitModel = unitsRef.current.get(unit.id)
      if (unitModel && engineRef.current) {
        // Victory animation - units jump up and down
        const originalY = unitModel.entity.getPosition().y
        
        engineRef.current.tween(unitModel.entity.getPosition())
          .to({ x: unitModel.entity.getPosition().x, y: originalY + 1, z: unitModel.entity.getPosition().z }, 0.5, pc.SineOut)
          .yoyo(true)
          .repeat(3)
          .start()
      }
    })
  }

  const getFormationPosition = (side: 'attacking' | 'defending', index: number, totalUnits: number): pc.Vec3 => {
    const baseX = side === 'attacking' ? -6 : 6
    const spacing = 2
    const rows = Math.ceil(totalUnits / 3)
    const unitsPerRow = Math.ceil(totalUnits / rows)
    
    const row = Math.floor(index / unitsPerRow)
    const col = index % unitsPerRow
    
    const x = baseX + (side === 'attacking' ? row * 1.5 : -row * 1.5)
    const z = (col - (unitsPerRow - 1) / 2) * spacing
    
    return new pc.Vec3(x, 0, z)
  }

  const getModelTypeForArchetype = (archetype: string): string => {
    switch (archetype) {
      case 'knight':
      case 'fighter':
        return 'cylinder' // Represents armored units
      case 'mage':
      case 'cleric':
        return 'sphere' // Represents magical units
      case 'archer':
      case 'ranger':
        return 'cone' // Represents ranged units
      default:
        return 'box' // Default unit shape
    }
  }

  const getUnitColor = (unit: Unit, side: 'attacking' | 'defending'): pc.Color => {
    const baseColor = side === 'attacking' ? new pc.Color(0.3, 0.3, 0.8) : new pc.Color(0.8, 0.3, 0.3)
    
    // Modify color based on race
    switch (unit.race) {
      case 'elf':
        return new pc.Color(baseColor.r, baseColor.g + 0.2, baseColor.b)
      case 'dwarf':
        return new pc.Color(baseColor.r + 0.2, baseColor.g, baseColor.b)
      case 'orc':
        return new pc.Color(baseColor.r, baseColor.g + 0.3, baseColor.b - 0.2)
      default:
        return baseColor
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
      clearColor: new pc.Color(0.1, 0.1, 0.2),
      fov: 60
    })
    camera.setPosition(0, 8, 8)
    camera.lookAt(0, 0, 0)
    app.root.addChild(camera)
    cameraRef.current = camera

    // Create lighting
    const light = new pc.Entity('DirectionalLight')
    light.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(1, 1, 1),
      intensity: 1
    })
    light.setEulerAngles(45, 30, 0)
    app.root.addChild(light)

    // Ambient light
    const ambientLight = new pc.Entity('AmbientLight')
    ambientLight.addComponent('light', {
      type: pc.LIGHTTYPE_DIRECTIONAL,
      color: new pc.Color(0.4, 0.4, 0.6),
      intensity: 0.3
    })
    ambientLight.setEulerAngles(-45, -30, 0)
    app.root.addChild(ambientLight)

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

export default BattleCanvas