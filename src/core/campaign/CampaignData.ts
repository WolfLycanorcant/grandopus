import { Campaign, CampaignMission } from './types';

export const TUTORIAL_CAMPAIGN: Campaign = {
  id: 'tutorial',
  name: 'The First Steps',
  description: 'Learn the basics of tactical warfare in this introductory campaign.',
  lore: 'As a new commander, you must prove your worth through a series of training exercises and small skirmishes.',
  currentMissionIndex: 0,
  isCompleted: false,
  totalScore: 0,
  startDate: new Date(),
  missions: [
    {
      id: 'tutorial-1',
      name: 'Basic Combat',
      description: 'Learn the fundamentals of turn-based combat.',
      briefing: 'Welcome, Commander! Your first task is to defeat a small group of bandits threatening a nearby village. Use this opportunity to learn the basics of positioning, attacking, and unit management.',
      objectives: [
        {
          id: 'defeat-enemies',
          type: 'Defeat',
          description: 'Defeat all enemy units',
          isCompleted: false,
          isOptional: false
        }
      ],
      rewards: [
        { type: 'Gold', amount: 100, description: '100 Gold' },
        { type: 'Experience', amount: 50, description: '50 Experience Points' }
      ],
      requirements: [],
      difficulty: 'Easy',
      estimatedTurns: 5,
      mapSize: 'Small',
      environment: 'Plains',
      weather: 'Clear',
      enemyFactions: ['Bandits'],
      isCompleted: false,
      isUnlocked: true
    },
    {
      id: 'tutorial-2',
      name: 'Formation Tactics',
      description: 'Master squad formations and positioning.',
      briefing: 'Now that you understand basic combat, learn how different formations can give your units tactical advantages. Face a more organized enemy force.',
      objectives: [
        {
          id: 'use-formation',
          type: 'Defeat',
          description: 'Win using at least 2 different formations',
          isCompleted: false,
          isOptional: false
        }
      ],
      rewards: [
        { type: 'Gold', amount: 150, description: '150 Gold' },
        { type: 'Equipment', itemId: 'iron-sword', description: 'Iron Sword' }
      ],
      requirements: [
        { type: 'Mission', value: 'tutorial-1', description: 'Complete Basic Combat' }
      ],
      difficulty: 'Easy',
      estimatedTurns: 8,
      mapSize: 'Medium',
      environment: 'Forest',
      weather: 'Clear',
      enemyFactions: ['Mercenaries'],
      isCompleted: false,
      isUnlocked: false
    }
  ]
};

export const MAIN_CAMPAIGNS: Campaign[] = [
  {
    id: 'rise-of-kingdoms',
    name: 'Rise of Kingdoms',
    description: 'Unite the fractured lands under your banner in this epic campaign.',
    lore: 'The old empire has fallen, leaving the realm divided among warring factions. As a rising commander, you must forge alliances, conquer territories, and ultimately unite the kingdoms under your rule.',
    currentMissionIndex: 0,
    isCompleted: false,
    totalScore: 0,
    startDate: new Date(),
    missions: [
      {
        id: 'rok-1',
        name: 'The Broken Crown',
        description: 'Reclaim the ancient capital from rebel forces.',
        briefing: 'The capital city has fallen to rebel forces. Your first major campaign begins here - retake the seat of power and establish your legitimacy as a ruler.',
        objectives: [
          {
            id: 'capture-capital',
            type: 'Capture',
            description: 'Capture the throne room',
            isCompleted: false,
            isOptional: false
          },
          {
            id: 'save-civilians',
            type: 'Escort',
            description: 'Escort at least 5 civilians to safety',
            quantity: 5,
            isCompleted: false,
            isOptional: true
          }
        ],
        rewards: [
          { type: 'Gold', amount: 500, description: '500 Gold' },
          { type: 'Equipment', itemId: 'royal-banner', description: 'Royal Banner' },
          { type: 'Unlock', description: 'Unlock Noble units' }
        ],
        requirements: [
          { type: 'Level', value: 5, description: 'Commander Level 5' }
        ],
        difficulty: 'Medium',
        estimatedTurns: 15,
        mapSize: 'Large',
        environment: 'Plains',
        weather: 'Clear',
        enemyFactions: ['Rebels', 'Bandits'],
        isCompleted: false,
        isUnlocked: false
      },
      {
        id: 'rok-2',
        name: 'The Northern Alliance',
        description: 'Forge an alliance with the mountain clans.',
        briefing: 'The northern mountain clans hold strategic passes that could secure your borders. Prove your worth to their chieftains through combat and diplomacy.',
        objectives: [
          {
            id: 'defeat-champion',
            type: 'Defeat',
            description: 'Defeat the clan champion in single combat',
            isCompleted: false,
            isOptional: false
          },
          {
            id: 'defend-village',
            type: 'Defend',
            description: 'Defend the clan village from raiders',
            timeLimit: 10,
            isCompleted: false,
            isOptional: false
          }
        ],
        rewards: [
          { type: 'Gold', amount: 300, description: '300 Gold' },
          { type: 'Unit', itemId: 'mountain-warrior', description: 'Mountain Warrior ally' },
          { type: 'Unlock', description: 'Unlock Dwarf units' }
        ],
        requirements: [
          { type: 'Mission', value: 'rok-1', description: 'Complete The Broken Crown' }
        ],
        difficulty: 'Medium',
        estimatedTurns: 12,
        mapSize: 'Medium',
        environment: 'Mountains',
        weather: 'Snow',
        enemyFactions: ['Raiders', 'Clan Warriors'],
        isCompleted: false,
        isUnlocked: false
      }
    ]
  },
  {
    id: 'shadow-war',
    name: 'The Shadow War',
    description: 'Uncover and defeat a hidden conspiracy threatening the realm.',
    lore: 'Dark forces move in the shadows, manipulating events from behind the scenes. As reports of strange occurrences increase, you must investigate and confront this mysterious threat.',
    currentMissionIndex: 0,
    isCompleted: false,
    totalScore: 0,
    startDate: new Date(),
    missions: [
      {
        id: 'sw-1',
        name: 'Whispers in the Dark',
        description: 'Investigate mysterious disappearances in a border town.',
        briefing: 'Citizens have been vanishing from the border town of Millhaven. Local authorities are baffled. Investigate these disappearances and uncover the truth.',
        objectives: [
          {
            id: 'investigate-clues',
            type: 'Collect',
            description: 'Gather 3 pieces of evidence',
            quantity: 3,
            isCompleted: false,
            isOptional: false
          },
          {
            id: 'rescue-survivors',
            type: 'Escort',
            description: 'Rescue and escort survivors to safety',
            isCompleted: false,
            isOptional: true
          }
        ],
        rewards: [
          { type: 'Gold', amount: 400, description: '400 Gold' },
          { type: 'Equipment', itemId: 'shadow-cloak', description: 'Shadow Cloak' }
        ],
        requirements: [
          { type: 'Level', value: 8, description: 'Commander Level 8' }
        ],
        difficulty: 'Hard',
        estimatedTurns: 10,
        mapSize: 'Medium',
        environment: 'Forest',
        weather: 'Fog',
        enemyFactions: ['Cultists', 'Shadow Creatures'],
        isCompleted: false,
        isUnlocked: false
      }
    ]
  }
];

export const ALL_CAMPAIGNS = [TUTORIAL_CAMPAIGN, ...MAIN_CAMPAIGNS];