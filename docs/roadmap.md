

# **Squad-Based Tactical War Game: Technical Roadmap**  
**Version 1.0**  
**Date:** July 2025  

---

## **1. Project Overview**  
A **web-first squad-based tactical war game** with deep customization, strategic overworld management, and GPU-accelerated graphics.  
**Tech Stack:**  
- **Frontend:** React.js + TypeScript, Three.js/PixiJS (WebGL), CSS Grid.  
- **Backend (Optional):** Python (Flask), Firebase.  
- **Graphics:** WebGL 2.0, NVIDIA DLSS/Canvas.  
- **Database:** SQLite/PostgreSQL.  

---

## **2. Phases & Milestones**  
### **Phase 1: Core Foundation (COMPLETED)**  
**Objective:** Build the minimal viable product (MVP) for squad customization and basic combat.  

#### **Key Features:**  
1. **✅ Exception System & Error Handling (COMPLETED)**  
   - Comprehensive exception hierarchy for all game systems
   - Centralized error handler with severity levels and strategies
   - Validation utilities and type-safe error handling
   - Automatic fallback mechanisms and user notifications

2. **✅ Unit Data Structure & Stats (COMPLETED)**  
   - Complete `Unit` class with all stats (HP, STR, MAG, SKL, ARM, LDR)
   - 10 races with unique traits and abilities (Human, Elf, Dwarf, Beast, Dragon, etc.)
   - 9 archetypes with balanced stat growth and weapon proficiencies
   - Level-based progression with experience and job points
   - Weapon proficiency system and status effects
   - `UnitFactory` with validation and preset creation

3. **✅ Squad System (COMPLETED)**  
   - Leadership-based squad capacity: `Base + (Leader_LDR // 10)`, capped at 12 units
   - 3x2 formation grid with front/back row positioning and bonuses
   - Large creature support (Beasts/Dragons take 2 slots)
   - Auto-positioning based on unit roles and manual formation control
   - Squad artifacts (max 3) and drill system for bonuses
   - Squad progression with battle experience and cohesion
   - `SquadFactory` with preset squads and validation

4. **✅ Basic Battle System (COMPLETED)**  
   - Ogre Battle-style combat with formation-based attack phases
   - Complete damage formula: `weapon * (1 + proficiency/100) * stat_modifier * bonuses * resistances`
   - Formation bonuses: Front row (+10% armor, +5% physical), Back row (+15% ranged, -10% physical taken)
   - Initiative system, counter-attacks, and smart target selection
   - Experience rewards, weapon proficiency gains, and detailed battle logging
   - `BattleEngine` with comprehensive combat mechanics and statistics

5. **✅ UI/UX Complete Implementation (COMPLETED)**  
   - Complete React + TypeScript frontend with modern styling
   - Home page with dashboard, quick actions, and game statistics
   - Units page with creation, management, filtering, and detailed unit views
   - Squad Editor with drag-and-drop formation management and visual positioning
   - Battle page with 3-phase combat: setup, execution, and comprehensive results
   - **Overworld page with strategic map, building construction, and army deployment**
   - Zustand state management with full game integration
   - Responsive design with game-themed styling and animations

#### **BONUS FEATURES ALREADY IMPLEMENTED:**
6. **✅ Equipment System Foundation (COMPLETED)**  
   - Complete weapon and armor type definitions
   - Equipment slots (weapon, off-hand, head, body, hands, feet, accessories)
   - Ember system with 0-3 slots per weapon
   - Equipment rarity system (common to legendary)
   - Stat bonuses and special effects
   - Equipment sets with set bonuses
   - Paper doll equipment UI components

7. **✅ Skill System Foundation (COMPLETED)**  
   - Complete skill tree architecture (General, Combat, Magic, Tactics, Survival, Weapon Mastery)
   - Job Points (JP) system for skill unlocking
   - Skill node types (stat boosts, passives, actives, weapon skills, formations)
   - Skill activation triggers and effects
   - Skill tree UI components

8. **✅ Strategic Overworld System (COMPLETED)**  
   - Hex-based strategic map with terrain types
   - Building system (settlements, castles, farms, blacksmiths, etc.)
   - Resource management (gold, steel, wood, stone, food, mana crystals, horses)
   - Army deployment and movement
   - Faction control and territory management
   - Turn-based strategic gameplay
   - Complete overworld UI with building construction

#### **Dependencies:**  
- None (isolated frontend prototype).  

---

### **Phase 2: System Integration & Polish (COMPLETED)**  
**Objective:** Connect existing systems and implement missing functionality.  

#### **Key Features:**  
1. **✅ Equipment System Integration (COMPLETED)**  
   - ✅ Connect equipment types to unit stats and combat
   - ✅ Implement equipment manager for equipping/unequipping items
   - ✅ Add weapon and armor data with actual items
   - ✅ Integrate ember embedding system with 17 different embers
   - ✅ Complete EmberManager with embedding, removal, and bonus calculations
   - **Status:** Fully functional with UI integration

2. **✅ Unit Achievement System (COMPLETED)**  
   - ✅ Persistent tracking of unit actions across all battles
   - ✅ 20+ achievements across Combat, Support, Mastery, Legendary, and Specialized categories
   - ✅ Permanent stat bonuses and special abilities as rewards
   - ✅ Achievement progress UI with notifications and gallery
   - ✅ Complete AchievementManager with progress tracking and reward application
   - ✅ Integration with combat and progression systems
   - **Status:** Fully implemented with comprehensive UI

3. **✅ Unit Relationships System (COMPLETED)**  
   - ✅ Affinity system tracking interactions between units
   - ✅ Personality traits affecting relationship development
   - ✅ Relationship types from Neutral to Brothers-in-Arms, Rivals, Family, etc.
   - ✅ Combat bonuses and stat effects from relationships
   - ✅ Complete RelationshipManager with interaction recording
   - ✅ Relationship UI with filtering, creation, and progress tracking
   - **Status:** Fully implemented with comprehensive relationship mechanics

4. **✅ Skill System Integration (COMPLETED)**  
   - ✅ Connect skill trees to unit progression
   - ✅ Implement JP earning and spending mechanics (automatic on level up + battle rewards)
   - ✅ Add skill activation during combat (passive bonuses integrated into damage calculation)
   - ✅ Create functional skill tree UI (SkillTreePanel in unit details)
   - ✅ Skill stat bonuses integrated into getCurrentStats()
   - ✅ Combat bonuses (damage, critical hit) integrated into battle system
   - ✅ Complete SkillManager with learning, activation, and progression
   - **Status:** Fully implemented and integrated

5. **✅ Strategic Overworld Integration (COMPLETED)**  
   - ✅ Connect overworld to squad deployment (deploy/recall squads from game store)
   - ✅ Implement resource generation and consumption (buildings generate resources per turn)
   - ✅ Add building effects and bonuses (healing, stat bonuses, special effects for nearby squads)
   - ✅ Create army movement and pathfinding (hex-based movement with terrain costs)
   - ✅ Complete game store integration with overworld state management
   - ✅ Building effects system with 8 building types providing unique bonuses
   - ✅ Turn-based resource generation, construction, and squad healing
   - ✅ Strategic events and notifications system
   - **Status:** Fully integrated with comprehensive building effects and squad bonuses

6. **✅ PlayCanvas 3D Engine Integration (COMPLETED)**  
   - ✅ 3D Battle Arena with real-time combat visualization
   - ✅ 3D Strategic Overworld with hex-based terrain and buildings
   - ✅ Unit models differentiated by archetype and faction
   - ✅ Animated combat sequences with damage effects and health bars
   - ✅ Building construction and resource generation animations
   - ✅ Army movement and deployment visualizations
   - ✅ Multiple camera angles and interactive controls
   - ✅ React UI overlays with full feature parity to 2D versions
   - ✅ Seamless integration with existing game systems
   - **Status:** Fully implemented with immersive 3D gameplay

7. **✅ Unit Promotion System (COMPLETED)**  
   - ✅ 27 Advanced classes across all base archetypes
   - ✅ Comprehensive promotion requirements (level, resources, achievements, skills)
   - ✅ Stat bonuses and level cap increases for promoted units
   - ✅ New abilities and special effects for advanced classes
   - ✅ Resource-based promotion costs integrated with overworld economy
   - ✅ Complete PromotionManager with validation and progression tracking
   - ✅ Promotion UI panel with detailed requirements and previews
   - ✅ Integration with existing achievement and skill systems
   - **Status:** Fully implemented with comprehensive progression paths

8. **📋 Remaining Advanced Features**  
   - Equipment crafting and enhancement
   - Siege equipment for Dwarven Engineers
   - Dynamic events and random encounters

#### **Tech Tasks:**  
- **Priority 1:** Connect equipment system to units and combat
- **Priority 2:** Implement functional skill trees with JP mechanics  
- **Priority 3:** Add resource management and building effects
- **Priority 4:** Create unit promotion and crafting systems

#### **Dependencies:**  
- Phase 1 completion (✅ DONE).  

---

### **Phase 3: Advanced Features & Polish (CURRENT PHASE)**  
**Objective:** Complete remaining core systems and add advanced features.  

#### **Key Features:**  
1. **🔄 Strategic Overworld Integration (IN PROGRESS)**  
   - Connect overworld buildings to actual resource generation
   - Implement army movement and pathfinding on hex map
   - Add building effects and territory bonuses
   - Create dynamic events and random encounters
   - **Status:** UI complete, needs deeper system integration

3. **📋 Unit Promotion System (PENDING)**  
   - Level cap increases and class changes
   - Resource requirements for promotions (steel, mana crystals, etc.)
   - Advanced class unlocks (Knight → Paladin, Mage → Archmage)
   - Equipment inheritance and storage system

4. **📋 Equipment Crafting & Enhancement (PENDING)**  
   - Blacksmith building functionality
   - Resource-based weapon and armor creation
   - Equipment upgrade system (+1, +2, +3 enhancements)
   - Rare material requirements for legendary items

5. **📋 Siege Equipment (Dwarven Engineers) (PENDING)**  
   - Resource-based crafting system
   - Pre-battle effects (e.g., -30% enemy defense)
   - Siege workshop UI and management
   - Battering rams, trebuchets, and siege towers

6. **📋 NVIDIA GPU Integration (PENDING)**  
   - WebGL optimizations (DLSS, texture compression)
   - CUDA-accelerated calculations (e.g., damage formulas)
   - Performance optimization for large battles

#### **Tech Tasks:**  
- **Priority 1:** Complete skill system integration and UI
- **Priority 2:** Finish overworld system integration
- **Priority 3:** Implement unit promotion system
- **Priority 4:** Add equipment crafting and enhancement
- **Priority 5:** Create siege equipment system
- **Priority 6:** Optimize rendering with WebGL 2.0 and NVIDIA extensions

#### **Dependencies:**  
- Phase 2 completion (✅ DONE)  

---

### **Phase 4: Polish & Launch (Months 10–12)**  
**Objective:** Finalize gameplay, balance, and deploy.  

#### **Key Features:**  
1. **Dynamic Events & Quests**  
   - Random encounters (bandit ambushes).  
   - Settlement capture mechanics.  

2. **Multiplayer Support (Optional)**  
   - Save/load squad configurations via Firebase.  

3. **Performance Optimization**  
   - Load testing for large squads (12 units).  
   - GPU memory management (textures, particles).  

4. **Beta Testing**  
   - Balance combat formulas (damage, hit chance).  
   - Fix UI/UX bugs (e.g., drag-and-drop responsiveness).  

#### **Tech Tasks:**  
- Deploy to Netlify/Vercel for web access.  
- Set up CI/CD pipeline (GitHub Actions).  
- Add analytics (e.g., Google Analytics for player behavior).  

#### **Dependencies:**  
- Phase 3 completion.  

---

## **3. Technical Details**  
### **3.1 Data Structures**  
#### **Unit**  
```typescript
interface Unit {
  id: string;
  name: string;
  race: "human" | "elf" | "dwarf" | "beast" | ...;
  stats: {
    hp: number;
    str: number;
    mag: number;
    skl: number;
    arm: number;
    ldr: number;
  };
  proficiencies: { [weaponType: string]: number };
  equipment: {
    weapon?: Weapon;
    armor?: Armor;
    // ... other slots
  };
  skills: string[]; // Unlocked skill IDs
}
```  

#### **Squad**  
```typescript
interface Squad {
  id: string;
  units: Unit[];
  formation: { [position: string]: string }; // e.g., "row-0-col-0": "unit-1"
  artifacts: Artifact[];
  drills: string[]; // e.g., ["phalanx", "arcane_resonance"]
}
```

#### **Achievement System**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'support' | 'mastery' | 'legendary';
  requirement: {
    type: 'damage_taken' | 'healing_done' | 'kills' | 'battles_won' | ...;
    target: number;
    condition?: string; // e.g., "below_25_percent_hp"
  };
  reward: {
    statBonuses?: { [stat: string]: number };
    specialAbility?: string;
    title?: string;
    description: string;
  };
  isUnlocked: boolean;
  progress: number;
}

interface UnitAchievements {
  unitId: string;
  achievements: Map<string, Achievement>;
  statistics: {
    totalDamageTaken: number;
    totalHealingDone: number;
    totalKills: number;
    battlesWon: number;
    criticalHits: number;
    unitsHealed: Set<string>;
    // ... other tracked stats
  };
}
```  

---

### **3.2 API Endpoints (Backend)**  
| **Endpoint**               | **Method** | **Description**                          |  
|----------------------------|------------|------------------------------------------|  
| `/api/squad/<id>/stats`    | GET        | Returns squad stats (total damage, HP). |  
| `/api/equipment/embed`     | POST       | Embeds an ember into a weapon.          |  
| `/api/battle/simulate`     | POST       | Runs combat simulation between squads.  |  

---

### **3.3 NVIDIA GPU Integration**  
- **WebGL Extensions:**  
  - Use `WEBGL_lose_context` for fallback handling.  
  - `OES_texture_float` for high-precision rendering.  
- **CUDA via WebAssembly:**  
  - Offload damage calculations to GPU using `GPU.js` or `Fugue`.  

---

## **4. QA & Testing**  
### **4.1 Automated Testing**  
- **Unit Tests:**  
  - Combat formula validation (e.g., `calculate_damage` returns expected values).  
  - Squad size calculation edge cases (e.g., 12 units + 2 beasts = 14 slots → capped at 12).  
- **Integration Tests:**  
  - Squad editor UI updates state correctly.  
  - Battle log accurately reflects attack results.  

### **4.2 Performance Testing**  
- **GPU Load:**  
  - Measure FPS with 12 units on screen (target: ≥60 FPS on NVIDIA GTX 1060).  
- **Memory:**  
  - Profile texture/asset usage (keep under 2GB VRAM).  

---

## **5. Post-Launch**  
- **Content Updates:**  
  - New races (e.g., undead), siege equipment, and skill nodes.  
- **Mod Support:**  
  - JSON schema for custom units/weapons.  

--- 

**Final Note:** Prioritize modularity (e.g., decouple battle logic from UI) to simplify scaling. Use `git` branches for parallel development (e.g., `feature/skill-trees`, `bugfix/formation-bugs`).