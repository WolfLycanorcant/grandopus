

# **Squad-Based Tactical War Game Design Document**  
**Version 1.0**  
**Date:** July 2025  

---

## **1. Overview**  
A **deeply customizable squad-based tactical war game** blending **XCOM-style combat**, **4X strategic management**, and **RPG progression**. Players command squads of diverse units (humans, elves, dwarves, beasts, etc.), customize gear/formations, and conquer settlements on a dynamic overworld.  

**Key Pillars:**  
- **Squad Customization:** 12-unit squads with formation, equipment, and skill trees.  
- **Strategic Layer:** Terrain, buildings, and resource management.  
- **Combat Depth:** Turn-based battles with unit-specific abilities and weaknesses.  
- **Progression:** Skill trees, promotions, and relationships.  

---

## **2. Core Gameplay**  
### **2.1 Squad System**  
- **Max Squad Size:**  
  - **Base:** 3–9 units (scales with game progress).  
  - **Leadership (LDR) Bonus:** `Max Size = Base + (Leader_LDR // 10)`.  
  - **Size Cap:** 12 units.  
  - **Beast/Dragon Penalty:** Large units take 2 slots.  

- **Formation Rules:**  
  - **Front Row:** +10% armor, +5% physical damage.  
  - **Back Row:** +15% ranged/magic damage, -10% physical damage taken.  

### **2.2 Turn-Based Combat**  
- **Initiative:** Units act in order of **Speed** (SKL + AGI).  
- **Attack Flow:**  
  1. Attacking squad’s units attack (front row first).  
  2. Defending squad counterattacks.  
  3. Repeat until one squad is wiped.  

- **Damage Formula:**  
  ```python  
  damage = weapon.base_damage  
           * (1 + proficiency/100)  
           * stat_modifier (STR/MAG)  
           * ember/artifact_modifiers  
           * weakness_multiplier  
  ```  

---

## **3. Units**  
### **3.1 Stats & Archetypes**  
| **Stat**       | **Effect**                                                                 |  
|----------------|-----------------------------------------------------------------------------|  
| **HP**         | Total health.                                                             |  
| **STR**        | Boosts physical damage and physical resistance.                           |  
| **MAG**        | Enhances magic damage/healing and magic resistance.                       |  
| **SKL**        | Hit chance, dodge, crits.                                                 |  
| **ARM**        | Reduces physical damage.                                                  |  
| **LDR**        | Squad capacity + squad-wide buffs.                                        |  

- **Archetypes** (e.g., Heavy Infantry, Mage):  
  - Determine stat growth (e.g., Mages gain MAG faster).  
  - Unlock class-specific skills (e.g., *Fireball* for Mages).  

### **3.2 Races**  
| **Race**       | **Traits**                                                                 | **Slot Cost** |  
|----------------|----------------------------------------------------------------------------|---------------|  
| **Human**      | No penalties.                                                             | 1 slot        |  
| **Orc/Goblin** | +10% physical damage, -10% armor.                                         | 1 slot        |  
| **Angel**      | +15% magic resist, *Aura of Light* (heal 5% HP/turn).                     | 1 slot        |  
| **Demon**      | Fire immunity, *Infernal Aura* (5% damage/turn to adjacent enemies).       | 1 slot        |  
| **Beast**      | High HP/STR, *Primal Fury* (crit +20% below 50% HP).                      | **2 slots**   |  
| **Dragon**     | Flight, *Dragonfire* (AoE fire damage).                                    | 2 slots       |  
| **Griffon**    | Flight, +30% movement speed.                                               | 2 slots       |  
| **Elf**        | +15% magic damage, +10% evasion, *Forest Stride* (ignores forest terrain).| 1 slot        |  
| **Dwarf**      | +20% armor, *Stonecunning* (ignores building terrain).                     | 1 slot        |  

---

## **3.3 Unit Creation & Cost System**
### **Economic Unit Creation**
- **Custom Unit Creation:** Players can create units for **2x recruitment cost**
- **Cost Calculation:**
  - Base recruitment cost (varies by race/archetype)
  - Level scaling: +20% per level above 1
  - Custom creation multiplier: 2x base cost
- **Confirmation System:** All unit creation requires cost confirmation
- **Resource Management:** Gold becomes strategic resource for army building

### **Creature System**
- **Creature Races:** Beast, Dragon, Griffon don't use traditional archetypes
- **Natural Abilities:** Creatures rely on innate powers rather than trained skills
- **Specialized Costs:** Creatures have higher base costs reflecting their power
- **Automatic Classification:** System automatically assigns "Creature" type to beast races

---

## **3.4 Beast Care & Companion System** 🐉
### **Core Beast Care Mechanics**

#### **💖 Bonding / Affection System**
- **Bond Level (0–100):** Represents trust and loyalty
- **Impact:** Affects obedience, combat performance, and special abilities
- **How to Raise Bond:**
  - Petting / grooming sessions
  - Feeding favorite foods
  - Training or play activities
  - Defending the beast or healing it in combat
- **How Bond Falls:**
  - Neglect or poor care
  - Abuse or overworking
  - Sending into unwinnable fights

#### **🍖 Feeding System**
- **Diet Types:** 
  - Carnivore (raw meat, fresh kills)
  - Infernal (sulfur, brimstone, fire essence)
  - Elemental (magical crystals, pure energy)
  - Omnivore (varied diet, fruits and meat)
  - Magical Essence (mana potions, enchanted items)
- **Food Effects:**
  - **Preferred Foods:** Boost bonding and performance
  - **Tolerated Foods:** Normal maintenance effect
  - **Hated/Poisonous:** Causes illness or disobedience
- **Feeding Schedule Impact:**
  - **Starving:** Aggression, sickness, disobedience
  - **Overfeeding:** Laziness, bloating, reduced performance

#### **🛏 Rest & Shelter System**
- **Species-Specific Needs:**
  - **Griffons:** Nesting areas with wind or altitude
  - **Hellhounds:** Warm, dark dens or lava-fueled lairs
  - **Dragons:** Treasure hoards, lava pools, open caverns
  - **Beasts:** Natural environments matching their origin
- **Rest Deprivation Effects:**
  - Slow health regeneration
  - Combat debuffs or mood issues
  - Refusal to fly, fight, or bond

#### **🧼 Hygiene / Maintenance**
- **Grooming Activities:**
  - Brushing fur/feathers
  - Claw sharpening
  - Scale/oil treatments
  - Parasite removal
- **Benefits:** Removes parasites, boosts affection
- **Cultural Aspects:** Some species see grooming as dominance ritual

#### **🧠 Training & Skill Progression**
- **Beast Leveling:** Creatures level alongside players
- **Training Methods:**
  - Combat practice sessions
  - Target training (dummies, obstacle courses)
  - Behavioral correction (stop attacking allies)
- **Skill Trees:**
  - **Combat:** Tackle, Flame Breath, Pounce, Aerial Strike
  - **Utility:** Carry rider, detect enemies, track scent
  - **Loyalty/Support:** Intervene when player hurt, defend other beasts

#### **🧬 Health, Sickness & Injury**
- **Health Conditions:**
  - **Wounds:** Require rest or medicine
  - **Diseases:** Curses, blights, parasites, magical illness
  - **Mental Conditions:** PTSD from battles, trauma responses
- **Treatment Methods:**
  - Herbalism and natural remedies
  - Magical potions and healing spells
  - Professional Beast Healer services
  - Rest and recovery time

#### **🔥 Temperament System**
- **Temperament Profiles:**
  - **Aggressive:** Hard to control but powerful in combat
  - **Loyal:** Follows orders reliably, protects player
  - **Skittish:** Easily frightened but fast and evasive
  - **Proud:** Requires respect, refuses degrading tasks
  - **Curious:** Explores areas, finds hidden items
- **Dynamic Evolution:** Temperament changes based on care and experiences

#### **🧳 Gear & Customization**
- **Beast Equipment:**
  - Saddles for riding
  - Armor for protection
  - Elemental enhancements
  - Aesthetic upgrades (runes, braids, glowing effects)
- **Bonding Requirements:** High bond needed for gear acceptance
- **Player Pride System:** Customization affects player satisfaction

### **🏞 Daily Beast Care Cycle**
- **Morning Routine:**
  - Feed beast appropriate diet
  - Clean den/lair/nest
  - Grooming session
- **Midday Activities:**
  - Training session or combat
  - Apply healing if injured
  - Provide snacks/treats
- **Evening Wind-down:**
  - Bonding activities (petting, playing, flying)
  - Return to appropriate shelter
  - Rest preparation

### **⚔️ Combat Integration**
- **Well-Cared Beast Benefits:**
  - Combat performance buffs
  - Complex command obedience
  - Instinctive player protection
- **Neglected Beast Penalties:**
  - Reduced damage output
  - Disobedience in critical moments
  - May flee from difficult battles

### **🏞 Exploration Integration**
- **Beast Abilities:**
  - Fly across cliffs and obstacles
  - Detect hidden enemies
  - Track scents and trails
  - Access unique areas

### **📖 Story Integration**
- **Narrative Impact:** Beast care affects story outcomes
- **Special Quests:** Beast-specific storylines unlock
- **Multiple Endings:** Different conclusions based on beast relationships

### **💡 Advanced Beast Mechanics**
- **Breeding System:** Raise eggs/cubs from well-cared beasts
- **Emotional Feedback:** Animations and sounds indicate mood
- **Beast Relationships:** Creatures form bonds with each other
- **Legacy System:** Offspring inherit traits from parents

---

## **4. Customization**  
### **4.1 Equipment (Paper Doll)**  
- **Slots:**  
  - Weapon, Off-Hand, Head, Body, Hands, Feet, Accessories (2).  
- **Effects:**  
  - **Stat Boosts** (e.g., *Dragonfire Belt*: +10% fire damage).  
  - **Set Bonuses** (e.g., 3 *Dragonflight* items: +20% fire resistance).  

### **4.2 Artifacts**  
- **Max 3 per squad** (scales with LDR/game progress).  
- **Examples:**  
  - *Banner of Unity*: +10% squad damage.  
  - *Dragon’s Scale*: 25% fire damage reduction.  

### **4.3 Weapons**  
- **Proficiency System:**  
  - Units gain skill with any weapon type (e.g., *sword: 50/100*).  
  - Tiered bonuses (e.g., Tier 4: +15% damage + special ability).  
- **Damage Types:**  
  - **Physical:** Bludgeoning, Piercing, Slashing.  
  - **Magic:** Fire, Ice, Lightning (magic-user only).  
- **Ember Slots:**  
  - Weapons have 0–3 slots for embers (e.g., *Fire Ember* adds fire damage).  

---

## **5. Progression Systems**  
### **5.1 Skill Trees**  
- **General Tree (All Units):**  
  - Stat boosts (e.g., +10% HP), shared passives (e.g., *Pathfinder*).  
- **Class-Specific Tree:**  
  - Class-defining abilities (e.g., *Shield Bash* for Knights).  
- **Advanced Themed Trees (Promoted Classes):**  
  - **Tactics Tree** (leaders): *Phalanx Formation* (+15% front-row armor).  
  - **Magic Tree** (casters): *Chain Lightning* (hits 2 adjacent enemies).  

### **5.2 Job Points (JP) & Experience**  
- **Job Points (JP):**  
  - Unlock skill nodes or boost stats.  
  - Save JP for future investments.  
- **Experience (EXP):**  
  - Levels up units, unlocking stat growth.  
  - **Optional Override:** Use JP to buy stat increases instead of EXP.  

### **5.3 Promotions**  
- **Requirements:**  
  - Max level + resources (e.g., 50 steel + *Lance* for *Fighter → Knight*).  
  - Old equipment stored in army inventory.

### **5.4 Unit Achievement System**  
**Persistent progression that tracks unit actions across all battles and rewards mastery.**

#### **Combat Achievements**  
| **Achievement**        | **Requirement**                    | **Reward**                                    |  
|------------------------|-----------------------------------|-----------------------------------------------|  
| *Battle-Scarred*       | Take 1000 total damage            | +5% damage resistance                         |  
| *Berserker*            | Land 100 critical hits            | +10% critical hit chance                      |  
| *Executioner*          | Deal 50 killing blows             | +15% damage to enemies below 25% HP          |  
| *Guardian*             | Block/absorb 500 damage           | +10% armor effectiveness                      |  
| *Untouchable*          | Dodge 200 attacks                 | +15% evasion chance                           |  
| *Relentless*           | Attack 500 times                  | +5% attack speed                              |  

#### **Support Achievements**  
| **Achievement**        | **Requirement**                    | **Reward**                                    |  
|------------------------|-----------------------------------|-----------------------------------------------|  
| *Field Medic*          | Heal 30 different units           | Healing abilities restore +25% more HP       |  
| *Inspiring Leader*     | Lead squad in 100 battles         | +2 LDR permanently                            |  
| *Mentor*               | Train 10 units to max level       | +50% experience gain for nearby allies       |  
| *Protector*            | Save 25 allies from death         | Can revive fallen ally once per battle       |  
| *Tactician*            | Win 50 battles without casualties | Squad formations grant +10% bonus effects    |  

#### **Mastery Achievements**  
| **Achievement**        | **Requirement**                    | **Reward**                                    |  
|------------------------|-----------------------------------|-----------------------------------------------|  
| *Weapon Master*        | Max proficiency in 5 weapons      | +20% weapon damage with all weapons          |  
| *Arcane Scholar*       | Learn 25 different spells         | -20% magic costs, +10% magic damage          |  
| *Survivor*             | Survive 50 battles at <10% HP     | +1 to all stats permanently                  |  
| *Veteran*              | Participate in 200 battles        | +25% experience gain                          |  
| *Perfectionist*        | Achieve 95% hit rate over 100 attacks | +20% accuracy with all attacks           |  

#### **Legendary Achievements**  
| **Achievement**        | **Requirement**                    | **Reward**                                    |  
|------------------------|-----------------------------------|-----------------------------------------------|  
| *Dragon Slayer*        | Defeat 5 dragons                  | Immunity to fire damage                      |  
| *Immortal*             | Survive 1000 battles              | Cannot be reduced below 1 HP once per battle |  
| *Champion*             | Win 500 battles                   | +25% to all stats                             |  
| *Legend*               | Unlock 10 other achievements      | Unique title + aura effect for squad         |  

#### **Specialized Achievements**  
| **Achievement**        | **Requirement**                    | **Reward**                                    |  
|------------------------|-----------------------------------|-----------------------------------------------|  
| *Beast Whisperer*      | Fight alongside 20 different beasts | +2 slots for beast units in squad          |  
| *Ember Forger*         | Embed 100 embers                  | Can embed +1 extra ember in any weapon       |  
| *Formation Expert*     | Use every formation type 50 times | Formations cost -1 LDR to maintain           |  
| *Treasure Hunter*      | Find 50 rare items                | +20% chance to find rare loot after battles |  

---

## **6. Strategic Layer**  
### **6.1 Terrain & Movement**  
| **Terrain**       | **Effect**                                                                 |  
|--------------------|---------------------------------------------------------------------------|  
| **Forest**         | +10% evasion, -20% ranged damage.                                        |  
| **Hill**           | +15% damage to units below, -10% movement cost.                          |  
| **River**          | Cross only with *Boots of Swiftness*.                                    |  
| **Castle**         | Squads heal 10% HP/turn, +20% armor.                                     |  

### **6.2 Buildings & Settlements**  
| **Building**       | **Function**                                                                 |  
|---------------------|-----------------------------------------------------------------------------|  
| **Church**          | +1 LDR/turn, remove debuffs.                                               |  
| **Outpost**         | Generates 10 resources/turn.                                               |  
| **Tower**           | Extends vision range, *Early Warning* (detect ambushes).                   |  
| **Farm**            | Produces food (healing/promotions).                                        |  
| **Blacksmith**      | Craft weapons/armor (e.g., 50 steel → *Steel Sword*).                      |  

### **6.3 Resource System**  
- **Types:** Horses, Steel, Mana Crystals, Food.  
- **Promotions:** Units require resources to upgrade classes.  

### **6.4 Siege Equipment (Dwarven Engineers)**  
- **Prerequisite:** 1 Dwarven Engineer in army.  
- **Equipment Types:**  
  | **Siege Equipment**   | **Resource Cost**          | **Effect**                                                                 |  
  |-------------------------|----------------------------|---------------------------------------------------------------------------|  
  | **Battering Ram**       | 50 steel + 30 wood         | -30% enemy defense.                                                      |  
  | **Trebuchet**           | 80 steel + 20 stone        | Deals 100 damage to settlement HP.                                       |  
  | **Siege Tower**         | 60 steel + 40 wood + 10 mana | Bypass terrain penalties.                                               |  

---

## **7. Technical Implementation**  
### **7.1 Tech Stack**  
- **Frontend:**  
  - **React.js + TypeScript:** Squad editor, paper doll UI.  
  - **Three.js/PixiJS:** GPU-accelerated battle rendering.  
- **Backend (Optional):**  
  - **Python (Flask):** Combat logic, API endpoints.  
  - **Firebase/SQLite:** Save squad configurations.  

### **7.2 Graphics & NVIDIA Integration**  
- **Modern Visuals:**  
  - WebGL/Canvas for 3D/2D rendering.  
  - NVIDIA DLSS for upscaling (4K/8K support).  
- **Performance:**  
  - CUDA cores for physics/AI calculations.  
  - NVIDIA Studio Drivers for optimization.  

---

## **8. Additional Features**  
### **8.1 Relationships & Squad Bonding**  
- **Affinity System:**  
  - Units gain bonuses (e.g., *Brothers-in-Arms*: 10% chance to block lethal damage).  
- **Drilling:**  
  - Squads gain perks (e.g., *Phalanx Formation*: +15% front-row armor).  

### **8.2 Dynamic Events**  
- **Random Encounters:** Bandit ambushes grant resources.  
- **Quests:** Deliver resources to unlock classes/buildings.  

---

## **9. Future Expansions**  
- **Multiplayer:** PvP/PvE skirmishes.  
- **Mod Support:** Steam Workshop integration.  
- **New Races/Classes:** Undead, Elementals, etc.  

--- 

**Final Note:** This document provides a comprehensive framework. Adjust numbers, balance, and UI/UX details during prototyping.