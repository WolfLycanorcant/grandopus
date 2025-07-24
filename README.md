# 🏰 Grand Opus: Tactical War Game

A **deeply customizable squad-based tactical war game** that blends **XCOM-style combat**, **4X strategic management**, and **RPG progression**. Command squads of diverse fantasy units, customize formations and equipment, and conquer territories in an immersive 3D world.

![Game Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6.svg)
![PlayCanvas](https://img.shields.io/badge/PlayCanvas-2.9.2-orange.svg)

## 🎮 Game Features

### ⚔️ **Squad-Based Combat**
- **12-unit squads** with customizable formations
- **Turn-based tactical battles** with initiative system
- **Formation bonuses**: Front row tanks, back row ranged units
- **Real-time 3D battle visualization** with PlayCanvas engine

### 🌍 **Strategic Overworld**
- **Hex-based world map** with diverse terrains
- **Territory conquest** and resource management
- **Building construction** (settlements, farms, mines, towers)
- **Dynamic weather** and environmental effects

### 🧙‍♂️ **Deep Customization**
- **9 unique races**: Humans, Elves, Dwarves, Orcs, Angels, Demons, Beasts, Dragons, Griffons
- **Multiple archetypes**: Knights, Mages, Archers, Clerics, Rangers, Fighters
- **Equipment system**: Weapons, armor, accessories with set bonuses
- **Skill trees** and unit progression

### 🤖 **AI Opponents**
- **Intelligent AI factions** with different personalities
- **Dynamic threat assessment** and strategic planning
- **Adaptive difficulty** based on player performance
- **Event-driven AI behavior** system

### 🎨 **Enhanced 3D Graphics**
- **Dynamic environments**: Plains, forests, deserts, snow, volcanic
- **Weather effects**: Rain, snow, fog with particle systems
- **Cinematic camera** angles and smooth transitions
- **Immersive battle animations** and visual effects

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- Modern web browser with WebGL support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd grand-opus-tactical-war-game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## 🏗️ Project Structure

```
src/
├── components/           # React UI components
│   ├── BattleCanvas.tsx     # 3D battle visualization
│   ├── SquadFormationEditor.tsx # Squad formation UI
│   ├── OverworldCanvas.tsx      # Strategic map
│   └── ...
├── core/                # Game logic and systems
│   ├── units/              # Unit management
│   ├── squads/             # Squad system
│   ├── overworld/          # Strategic layer
│   ├── ai/                 # AI system
│   ├── equipment/          # Items and gear
│   ├── skills/             # Skill trees
│   ├── relationships/      # Unit relationships
│   └── achievements/       # Achievement system
├── pages/               # Main game screens
├── stores/              # State management (Zustand)
├── exceptions/          # Error handling
└── docs/               # Documentation
```

## 🎯 Core Game Systems

### Unit System
- **Stats**: HP, STR, MAG, SKL, ARM, LDR
- **Racial traits** and archetype bonuses
- **Experience and leveling** system
- **Equipment slots**: Weapon, armor, accessories

### Squad Management
- **Formation positioning** (3x2 grid)
- **Leadership bonuses** increase squad capacity
- **Squad artifacts** provide team-wide benefits
- **Combat formations** with tactical advantages

### Strategic Layer
- **Hex-based overworld** with terrain effects
- **Resource management**: Gold, wood, stone, steel, food
- **Building construction** and territory control
- **Turn-based campaign** progression

### AI System
- **Faction personalities**: Aggressive, Defensive, Economic
- **Dynamic decision making** based on game state
- **Threat assessment** and strategic planning
- **Event-driven behavior** system

## 🎮 How to Play

### 1. **Unit Creation**
- Create units by selecting race and archetype
- Customize stats and equipment
- Assign units to squads

### 2. **Squad Formation**
- Arrange units in 3x2 formation grid
- Place tanks in front row for defense bonuses
- Position ranged units in back row for damage bonuses

### 3. **Strategic Map**
- Move armies across hex-based world map
- Capture territories and build structures
- Manage resources and expand your empire

### 4. **Tactical Combat**
- Engage in turn-based 3D battles
- Use unit abilities and formation tactics
- Adapt to different environments and weather

## 🛠️ Technical Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation

### 3D Engine
- **PlayCanvas** - WebGL 3D engine
- **Custom battle system** with animations
- **Dynamic environments** and weather effects
- **Particle systems** for visual effects

### Development Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Lucide React** - Icon library

## 🎨 Game Mechanics

### Combat System
```typescript
// Damage calculation
damage = weapon.base_damage 
         * (1 + proficiency/100)
         * stat_modifier (STR/MAG)
         * ember/artifact_modifiers
         * weakness_multiplier
```

### Formation Bonuses
- **Front Row**: +10% armor, +5% physical damage
- **Back Row**: +15% ranged/magic damage, -10% physical damage taken

### Unit Capacity
```typescript
Max Squad Size = Base Size + (Leader_LDR ÷ 10)
// Large units (Beasts, Dragons) take 2 slots
```

## 🌟 Key Features

### ✨ **Enhanced Battle Arena**
- **5 unique environments**: Plains, forest, desert, snow, volcanic
- **4 weather conditions**: Clear, rain, snow, fog
- **4 camera angles**: Overview, close, side, cinematic
- **Dynamic lighting** that adapts to environment

### 🧠 **Advanced AI**
- **Personality-driven behavior**: Each AI faction has unique traits
- **Strategic planning**: AI evaluates threats and opportunities
- **Adaptive difficulty**: AI adjusts based on player performance
- **Event system**: AI reacts to player actions dynamically

### 🎯 **Progression Systems**
- **Unit experience** and skill development
- **Squad cohesion** and veteran bonuses
- **Equipment proficiency** system
- **Achievement tracking** and rewards

## 🐛 Troubleshooting

### Common Issues

**WebGL Errors**
- Ensure your browser supports WebGL 2.0
- Update graphics drivers
- Try disabling browser extensions

**Performance Issues**
- Reduce particle effects in settings
- Lower 3D quality settings
- Close other browser tabs

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful component and function names
- Add JSDoc comments for complex functions
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PlayCanvas** for the excellent 3D engine
- **React** team for the amazing framework
- **Tailwind CSS** for beautiful styling utilities
- **Lucide** for the comprehensive icon set

## 📞 Support

For questions, bug reports, or feature requests:
- Create an issue on GitHub
- Check the [documentation](docs/) folder
- Review the [design document](docs/design_doc.md)

---

**Built with ❤️ using React, TypeScript, and PlayCanvas**

*Experience epic tactical battles in a fully customizable fantasy world!*