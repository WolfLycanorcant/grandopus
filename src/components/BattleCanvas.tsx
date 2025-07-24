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
  setCameraAngle: (angle: 'overview' | 'close' | 'side' | 'cinematic') => void
  playVictoryAnimation: (winningSquad: Squad) => void
  setBattleEnvironment: (environment: 'plains' | 'forest' | 'desert' | 'snow' | 'volcanic') => void
  addWeatherEffect: (weather: 'rain' | 'snow' | 'fog' | 'clear') => void
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
  const environmentRef = useRef<pc.Entity[]>([])
  const particleSystemsRef = useRef<pc.Entity[]>([])
  const currentEnvironment = useRef<string>('plains')
  const weatherSystem = useRef<pc.Entity | null>(null)

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

    setCameraAngle: (angle: 'overview' | 'close' | 'side' | 'cinematic') => {
      if (cameraRef.current) {
        setCameraPosition(angle)
      }
    },

    playVictoryAnimation: (winningSquad: Squad) => {
      playVictorySequence(winningSquad)
    },

    setBattleEnvironment: (environment: 'plains' | 'forest' | 'desert' | 'snow' | 'volcanic') => {
      createBattleEnvironment(environment)
    },

    addWeatherEffect: (weather: 'rain' | 'snow' | 'fog' | 'clear') => {
      createWeatherEffect(weather)
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

    // Animate attacker moving forward using setTimeout
    const animationDuration = 300 // 0.3 seconds
    const startTime = Date.now()
    
    const animateToTarget = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      
      // Smooth easing function (similar to SineOut)
      const easedProgress = Math.sin(progress * Math.PI / 2)
      
      const currentPos = new pc.Vec3().lerp(originalPos, attackPos, easedProgress)
      attacker.entity.setPosition(currentPos)
      
      if (progress < 1) {
        requestAnimationFrame(animateToTarget)
      } else {
        // Attack reached target - show damage effect
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

        // Move attacker back to original position
        const returnStartTime = Date.now()
        const animateBack = () => {
          const elapsed = Date.now() - returnStartTime
          const progress = Math.min(elapsed / animationDuration, 1)
          const easedProgress = Math.sin(progress * Math.PI / 2)
          
          const currentPos = new pc.Vec3().lerp(attackPos, originalPos, easedProgress)
          attacker.entity.setPosition(currentPos)
          
          if (progress < 1) {
            requestAnimationFrame(animateBack)
          }
        }
        
        // Start return animation after a brief pause
        setTimeout(animateBack, 100)
      }
    }
    
    animateToTarget()
  }

  const setCameraPosition = (angle: 'overview' | 'close' | 'side' | 'cinematic') => {
    if (!cameraRef.current) return

    const animationDuration = 1000
    const startTime = Date.now()
    const startPos = cameraRef.current.getPosition().clone()
    const startLookAt = new pc.Vec3(0, 0, 0)

    let targetPos: pc.Vec3
    let targetLookAt = new pc.Vec3(0, 0, 0)

    switch (angle) {
      case 'overview':
        targetPos = new pc.Vec3(0, 12, 10)
        break
      case 'close':
        targetPos = new pc.Vec3(0, 4, 6)
        break
      case 'side':
        targetPos = new pc.Vec3(12, 6, 0)
        break
      case 'cinematic':
        targetPos = new pc.Vec3(-8, 5, 8)
        targetLookAt = new pc.Vec3(2, 1, -2)
        break
      default:
        targetPos = new pc.Vec3(0, 8, 8)
    }

    // Smooth camera transition
    const animateCamera = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic

      const currentPos = new pc.Vec3().lerp(startPos, targetPos, easedProgress)
      const currentLookAt = new pc.Vec3().lerp(startLookAt, targetLookAt, easedProgress)

      cameraRef.current!.setPosition(currentPos)
      cameraRef.current!.lookAt(currentLookAt)

      if (progress < 1) {
        requestAnimationFrame(animateCamera)
      }
    }

    animateCamera()
  }

  const createBattleEnvironment = (environment: 'plains' | 'forest' | 'desert' | 'snow' | 'volcanic') => {
    if (!engineRef.current) return

    // Clear existing environment
    environmentRef.current.forEach(entity => {
      engineRef.current!.root.removeChild(entity)
    })
    environmentRef.current = []

    currentEnvironment.current = environment

    // Update ground material based on environment
    const ground = engineRef.current.root.findByName('Ground')
    if (ground && ground.model) {
      const groundMaterial = ground.model.meshInstances[0].material as pc.StandardMaterial
      
      switch (environment) {
        case 'plains':
          groundMaterial.diffuse = new pc.Color(0.3, 0.6, 0.2)
          groundMaterial.specular = new pc.Color(0.1, 0.1, 0.1)
          break
        case 'forest':
          groundMaterial.diffuse = new pc.Color(0.2, 0.4, 0.1)
          groundMaterial.specular = new pc.Color(0.05, 0.05, 0.05)
          createForestEnvironment()
          break
        case 'desert':
          groundMaterial.diffuse = new pc.Color(0.8, 0.7, 0.4)
          groundMaterial.specular = new pc.Color(0.2, 0.2, 0.1)
          createDesertEnvironment()
          break
        case 'snow':
          groundMaterial.diffuse = new pc.Color(0.9, 0.9, 1.0)
          groundMaterial.specular = new pc.Color(0.3, 0.3, 0.4)
          createSnowEnvironment()
          break
        case 'volcanic':
          groundMaterial.diffuse = new pc.Color(0.4, 0.2, 0.1)
          groundMaterial.emissive = new pc.Color(0.2, 0.1, 0.0)
          groundMaterial.specular = new pc.Color(0.1, 0.05, 0.0)
          createVolcanicEnvironment()
          break
      }
      groundMaterial.update()
    }

    // Update lighting based on environment
    updateEnvironmentLighting(environment)
  }

  const createForestEnvironment = () => {
    if (!engineRef.current) return

    // Create trees around the battlefield
    for (let i = 0; i < 12; i++) {
      const tree = new pc.Entity(`Tree_${i}`)
      tree.addComponent('model', { type: 'cylinder' })
      
      const treeMaterial = new pc.StandardMaterial()
      treeMaterial.diffuse = new pc.Color(0.3, 0.2, 0.1) // Brown trunk
      tree.model!.meshInstances[0].material = treeMaterial
      
      // Position trees around the perimeter
      const angle = (i / 12) * Math.PI * 2
      const radius = 15 + Math.random() * 5
      tree.setPosition(Math.cos(angle) * radius, 1, Math.sin(angle) * radius)
      tree.setLocalScale(0.5, 2, 0.5)
      
      // Add tree crown
      const crown = new pc.Entity(`Crown_${i}`)
      crown.addComponent('model', { type: 'sphere' })
      const crownMaterial = new pc.StandardMaterial()
      crownMaterial.diffuse = new pc.Color(0.1, 0.4, 0.1)
      crown.model!.meshInstances[0].material = crownMaterial
      crown.setPosition(0, 1.5, 0)
      crown.setLocalScale(1.5, 1.5, 1.5)
      tree.addChild(crown)
      
      engineRef.current.root.addChild(tree)
      environmentRef.current.push(tree)
    }
  }

  const createDesertEnvironment = () => {
    if (!engineRef.current) return

    // Create sand dunes and rocks
    for (let i = 0; i < 8; i++) {
      const dune = new pc.Entity(`Dune_${i}`)
      dune.addComponent('model', { type: 'sphere' })
      
      const duneMaterial = new pc.StandardMaterial()
      duneMaterial.diffuse = new pc.Color(0.9, 0.8, 0.6)
      dune.model!.meshInstances[0].material = duneMaterial
      
      const angle = (i / 8) * Math.PI * 2
      const radius = 12 + Math.random() * 8
      dune.setPosition(Math.cos(angle) * radius, -0.3, Math.sin(angle) * radius)
      dune.setLocalScale(3 + Math.random() * 2, 0.5, 2 + Math.random() * 1.5)
      
      engineRef.current.root.addChild(dune)
      environmentRef.current.push(dune)
    }

    // Add some rocks
    for (let i = 0; i < 6; i++) {
      const rock = new pc.Entity(`Rock_${i}`)
      rock.addComponent('model', { type: 'box' })
      
      const rockMaterial = new pc.StandardMaterial()
      rockMaterial.diffuse = new pc.Color(0.4, 0.3, 0.2)
      rock.model!.meshInstances[0].material = rockMaterial
      
      const angle = Math.random() * Math.PI * 2
      const radius = 8 + Math.random() * 6
      rock.setPosition(Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius)
      rock.setLocalScale(0.8 + Math.random() * 0.4, 0.6 + Math.random() * 0.8, 0.8 + Math.random() * 0.4)
      rock.setEulerAngles(Math.random() * 30, Math.random() * 360, Math.random() * 20)
      
      engineRef.current.root.addChild(rock)
      environmentRef.current.push(rock)
    }
  }

  const createSnowEnvironment = () => {
    if (!engineRef.current) return

    // Create snow-covered rocks and ice formations
    for (let i = 0; i < 10; i++) {
      const snowPile = new pc.Entity(`SnowPile_${i}`)
      snowPile.addComponent('model', { type: 'sphere' })
      
      const snowMaterial = new pc.StandardMaterial()
      snowMaterial.diffuse = new pc.Color(0.95, 0.95, 1.0)
      snowMaterial.specular = new pc.Color(0.4, 0.4, 0.5)
      snowPile.model!.meshInstances[0].material = snowMaterial
      
      const angle = (i / 10) * Math.PI * 2
      const radius = 10 + Math.random() * 8
      snowPile.setPosition(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      snowPile.setLocalScale(1 + Math.random(), 0.3 + Math.random() * 0.4, 1 + Math.random())
      
      engineRef.current.root.addChild(snowPile)
      environmentRef.current.push(snowPile)
    }
  }

  const createVolcanicEnvironment = () => {
    if (!engineRef.current) return

    // Create lava pools and volcanic rocks
    for (let i = 0; i < 6; i++) {
      const lavaPool = new pc.Entity(`LavaPool_${i}`)
      lavaPool.addComponent('model', { type: 'cylinder' })
      
      const lavaMaterial = new pc.StandardMaterial()
      lavaMaterial.diffuse = new pc.Color(0.8, 0.3, 0.1)
      lavaMaterial.emissive = new pc.Color(0.6, 0.2, 0.0)
      lavaPool.model!.meshInstances[0].material = lavaMaterial
      
      const angle = (i / 6) * Math.PI * 2
      const radius = 12 + Math.random() * 6
      lavaPool.setPosition(Math.cos(angle) * radius, -0.4, Math.sin(angle) * radius)
      lavaPool.setLocalScale(2 + Math.random(), 0.1, 2 + Math.random())
      
      engineRef.current.root.addChild(lavaPool)
      environmentRef.current.push(lavaPool)
    }

    // Add volcanic rocks
    for (let i = 0; i < 8; i++) {
      const volcanicRock = new pc.Entity(`VolcanicRock_${i}`)
      volcanicRock.addComponent('model', { type: 'box' })
      
      const rockMaterial = new pc.StandardMaterial()
      rockMaterial.diffuse = new pc.Color(0.2, 0.1, 0.1)
      rockMaterial.emissive = new pc.Color(0.1, 0.05, 0.0)
      volcanicRock.model!.meshInstances[0].material = rockMaterial
      
      const angle = Math.random() * Math.PI * 2
      const radius = 8 + Math.random() * 8
      volcanicRock.setPosition(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius)
      volcanicRock.setLocalScale(0.6 + Math.random() * 0.8, 0.8 + Math.random(), 0.6 + Math.random() * 0.8)
      volcanicRock.setEulerAngles(Math.random() * 45, Math.random() * 360, Math.random() * 30)
      
      engineRef.current.root.addChild(volcanicRock)
      environmentRef.current.push(volcanicRock)
    }
  }

  const updateEnvironmentLighting = (environment: string) => {
    if (!engineRef.current) return

    const mainLight = engineRef.current.root.findByName('DirectionalLight')
    const ambientLight = engineRef.current.root.findByName('AmbientLight')
    
    if (mainLight && mainLight.light && ambientLight && ambientLight.light) {
      switch (environment) {
        case 'plains':
          mainLight.light.color = new pc.Color(1, 1, 0.9)
          mainLight.light.intensity = 1.2
          ambientLight.light.color = new pc.Color(0.4, 0.4, 0.6)
          ambientLight.light.intensity = 0.4
          break
        case 'forest':
          mainLight.light.color = new pc.Color(0.8, 1, 0.7)
          mainLight.light.intensity = 0.8
          ambientLight.light.color = new pc.Color(0.2, 0.4, 0.2)
          ambientLight.light.intensity = 0.6
          break
        case 'desert':
          mainLight.light.color = new pc.Color(1, 0.9, 0.7)
          mainLight.light.intensity = 1.5
          ambientLight.light.color = new pc.Color(0.6, 0.5, 0.3)
          ambientLight.light.intensity = 0.3
          break
        case 'snow':
          mainLight.light.color = new pc.Color(0.9, 0.9, 1)
          mainLight.light.intensity = 1.3
          ambientLight.light.color = new pc.Color(0.6, 0.6, 0.8)
          ambientLight.light.intensity = 0.5
          break
        case 'volcanic':
          mainLight.light.color = new pc.Color(1, 0.6, 0.4)
          mainLight.light.intensity = 0.9
          ambientLight.light.color = new pc.Color(0.4, 0.2, 0.1)
          ambientLight.light.intensity = 0.7
          break
      }
    }
  }

  const createWeatherEffect = (weather: 'rain' | 'snow' | 'fog' | 'clear') => {
    if (!engineRef.current) return

    // Clear existing weather effects
    if (weatherSystem.current) {
      engineRef.current.root.removeChild(weatherSystem.current)
      weatherSystem.current = null
    }

    particleSystemsRef.current.forEach(particle => {
      engineRef.current!.root.removeChild(particle)
    })
    particleSystemsRef.current = []

    switch (weather) {
      case 'rain':
        createRainEffect()
        break
      case 'snow':
        createSnowEffect()
        break
      case 'fog':
        createFogEffect()
        break
      case 'clear':
        // Clear weather - no additional effects needed
        break
    }
  }

  const createRainEffect = () => {
    if (!engineRef.current) return

    // Create simple rain particles using multiple entities
    for (let i = 0; i < 50; i++) {
      const rainDrop = new pc.Entity(`RainDrop_${i}`)
      rainDrop.addComponent('model', { type: 'cylinder' })
      
      const rainMaterial = new pc.StandardMaterial()
      rainMaterial.diffuse = new pc.Color(0.7, 0.8, 1, 0.6)
      rainMaterial.blendType = pc.BLEND_NORMAL
      rainDrop.model!.meshInstances[0].material = rainMaterial
      
      rainDrop.setLocalScale(0.02, 0.3, 0.02)
      
      // Animate rain drops falling
      const animateRain = () => {
        const x = (Math.random() - 0.5) * 30
        const z = (Math.random() - 0.5) * 25
        rainDrop.setPosition(x, 15, z)
        
        const fallAnimation = () => {
          const currentY = rainDrop.getPosition().y
          if (currentY > -2) {
            rainDrop.setPosition(x, currentY - 0.3, z)
            requestAnimationFrame(fallAnimation)
          } else {
            setTimeout(animateRain, Math.random() * 1000)
          }
        }
        fallAnimation()
      }
      
      setTimeout(animateRain, Math.random() * 2000)
      
      engineRef.current.root.addChild(rainDrop)
      particleSystemsRef.current.push(rainDrop)
    }
  }

  const createSnowEffect = () => {
    if (!engineRef.current) return

    // Create snowflakes
    for (let i = 0; i < 30; i++) {
      const snowflake = new pc.Entity(`Snowflake_${i}`)
      snowflake.addComponent('model', { type: 'sphere' })
      
      const snowMaterial = new pc.StandardMaterial()
      snowMaterial.diffuse = new pc.Color(1, 1, 1, 0.8)
      snowMaterial.blendType = pc.BLEND_NORMAL
      snowflake.model!.meshInstances[0].material = snowMaterial
      
      snowflake.setLocalScale(0.05, 0.05, 0.05)
      
      // Animate snowflakes falling with drift
      const animateSnow = () => {
        const x = (Math.random() - 0.5) * 30
        const z = (Math.random() - 0.5) * 25
        snowflake.setPosition(x, 12, z)
        
        let driftX = x
        const fallAnimation = () => {
          const currentY = snowflake.getPosition().y
          if (currentY > -1) {
            driftX += (Math.random() - 0.5) * 0.1 // Drift effect
            snowflake.setPosition(driftX, currentY - 0.1, z)
            requestAnimationFrame(fallAnimation)
          } else {
            setTimeout(animateSnow, Math.random() * 3000)
          }
        }
        fallAnimation()
      }
      
      setTimeout(animateSnow, Math.random() * 3000)
      
      engineRef.current.root.addChild(snowflake)
      particleSystemsRef.current.push(snowflake)
    }
  }

  const createFogEffect = () => {
    if (!engineRef.current) return

    // Create fog by adjusting camera clear color and adding fog planes
    const camera = cameraRef.current
    if (camera && camera.camera) {
      camera.camera.clearColor = new pc.Color(0.7, 0.7, 0.8, 1)
    }

    // Add fog planes for depth effect
    for (let i = 0; i < 5; i++) {
      const fogPlane = new pc.Entity(`FogPlane_${i}`)
      fogPlane.addComponent('model', { type: 'plane' })
      
      const fogMaterial = new pc.StandardMaterial()
      fogMaterial.diffuse = new pc.Color(0.8, 0.8, 0.9, 0.3)
      fogMaterial.blendType = pc.BLEND_NORMAL
      fogPlane.model!.meshInstances[0].material = fogMaterial
      
      fogPlane.setPosition(0, 2 + i * 0.5, -5 - i * 2)
      fogPlane.setLocalScale(25, 1, 15)
      fogPlane.setEulerAngles(90, 0, 0)
      
      engineRef.current.root.addChild(fogPlane)
      particleSystemsRef.current.push(fogPlane)
    }
  }

  const playVictorySequence = (winningSquad: Squad) => {
    const winningUnits = winningSquad.getUnits()
    
    winningUnits.forEach((unit, index) => {
      const unitModel = unitsRef.current.get(unit.id)
      if (unitModel && engineRef.current) {
        // Victory animation - units jump up and down with staggered timing
        const originalY = unitModel.entity.getPosition().y
        const jumpHeight = 1.5
        const animationDuration = 0.8
        
        // Create a simple bounce animation using setTimeout
        const animateJump = (jumpCount: number) => {
          if (jumpCount <= 0) return
          
          // Jump up
          setTimeout(() => {
            if (unitModel.entity) {
              unitModel.entity.setPosition(
                unitModel.entity.getPosition().x,
                originalY + jumpHeight,
                unitModel.entity.getPosition().z
              )
            }
          }, index * 100) // Stagger the animations
          
          // Jump down
          setTimeout(() => {
            if (unitModel.entity) {
              unitModel.entity.setPosition(
                unitModel.entity.getPosition().x,
                originalY,
                unitModel.entity.getPosition().z
              )
            }
            // Repeat the jump
            setTimeout(() => animateJump(jumpCount - 1), 200)
          }, (index * 100) + (animationDuration * 500))
        }
        
        // Start the victory animation with 3 jumps
        animateJump(3)
        
        // Add a victory particle effect (simple color flash)
        const originalMaterial = unitModel.entity.model?.meshInstances[0]?.material
        if (originalMaterial) {
          const flashMaterial = originalMaterial.clone()
          flashMaterial.emissive = new pc.Color(1, 1, 0) // Yellow glow
          
          // Flash effect
          setTimeout(() => {
            if (unitModel.entity.model?.meshInstances[0]) {
              unitModel.entity.model.meshInstances[0].material = flashMaterial
            }
          }, index * 100)
          
          setTimeout(() => {
            if (unitModel.entity.model?.meshInstances[0]) {
              unitModel.entity.model.meshInstances[0].material = originalMaterial
            }
          }, (index * 100) + 300)
        }
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
      graphicsDeviceOptions: { 
        alpha: false,
        antialias: false, // Disable MSAA to prevent framebuffer issues
        preserveDrawingBuffer: false,
        powerPreference: 'default'
      },
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