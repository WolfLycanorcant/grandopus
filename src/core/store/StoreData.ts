import { StoreItem, StoreCategory } from './types';

export const STORE_WEAPONS: StoreItem[] = [
  // Basic Weapons
  {
    id: 'iron-sword',
    name: 'Iron Sword',
    description: 'A reliable iron blade suitable for most warriors.',
    category: StoreCategory.WEAPONS,
    subcategory: 'Swords',
    price: { gold: 150 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Stat', target: 'attack', value: 12, description: '+12 Attack Power' }
    ],
    tags: ['melee', 'slashing', 'one-handed'],
    icon: '⚔️'
  },
  {
    id: 'steel-bow',
    name: 'Steel Bow',
    description: 'A well-crafted bow with excellent range and accuracy.',
    category: StoreCategory.WEAPONS,
    subcategory: 'Bows',
    price: { gold: 200 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Stat', target: 'attack', value: 10, description: '+10 Attack Power' },
      { type: 'Stat', target: 'accuracy', value: 15, description: '+15% Accuracy' }
    ],
    tags: ['ranged', 'piercing', 'two-handed'],
    icon: '🏹'
  },
  {
    id: 'mage-staff',
    name: 'Apprentice Staff',
    description: 'A basic staff that channels magical energy effectively.',
    category: StoreCategory.WEAPONS,
    subcategory: 'Staves',
    price: { gold: 180 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Stat', target: 'magic', value: 15, description: '+15 Magic Power' },
      { type: 'Stat', target: 'mana', value: 20, description: '+20 Mana' }
    ],
    tags: ['magic', 'two-handed', 'staff'],
    icon: '🔮'
  },

  // Advanced Weapons
  {
    id: 'dragonfire-blade',
    name: 'Dragonfire Blade',
    description: 'A legendary sword forged with dragon fire, dealing additional fire damage.',
    category: StoreCategory.WEAPONS,
    subcategory: 'Swords',
    price: { gold: 2500, reputation: 100 },
    rarity: 'Legendary',
    level: 15,
    stock: 1,
    maxStock: 1,
    restockTime: 168, // 1 week
    requirements: [
      { type: 'Achievement', value: 'dragon-slayer', description: 'Defeat a dragon', isMet: false }
    ],
    effects: [
      { type: 'Stat', target: 'attack', value: 35, description: '+35 Attack Power' },
      { type: 'Special', target: 'fire_damage', value: '25%', description: '+25% Fire Damage' },
      { type: 'Special', target: 'dragon_bane', value: 'true', description: 'Extra damage vs Dragons' }
    ],
    tags: ['melee', 'slashing', 'fire', 'legendary', 'dragon'],
    icon: '🔥⚔️'
  }
];

export const STORE_ARMOR: StoreItem[] = [
  // Basic Armor
  {
    id: 'leather-armor',
    name: 'Leather Armor',
    description: 'Light, flexible armor providing basic protection.',
    category: StoreCategory.ARMOR,
    subcategory: 'Light Armor',
    price: { gold: 100 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Stat', target: 'defense', value: 8, description: '+8 Defense' },
      { type: 'Stat', target: 'speed', value: 2, description: '+2 Speed' }
    ],
    tags: ['light', 'leather', 'flexible'],
    icon: '🦺'
  },
  {
    id: 'chainmail',
    name: 'Chainmail Hauberk',
    description: 'Interlocked metal rings providing solid protection.',
    category: StoreCategory.ARMOR,
    subcategory: 'Medium Armor',
    price: { gold: 250 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Stat', target: 'defense', value: 15, description: '+15 Defense' },
      { type: 'Stat', target: 'speed', value: -1, description: '-1 Speed' }
    ],
    tags: ['medium', 'metal', 'chain'],
    icon: '🛡️'
  },
  {
    id: 'plate-armor',
    name: 'Steel Plate Armor',
    description: 'Heavy steel plates offering maximum protection.',
    category: StoreCategory.ARMOR,
    subcategory: 'Heavy Armor',
    price: { gold: 500 },
    rarity: 'Uncommon',
    level: 5,
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Stat', target: 'defense', value: 25, description: '+25 Defense' },
      { type: 'Stat', target: 'speed', value: -3, description: '-3 Speed' },
      { type: 'Special', target: 'physical_resist', value: '10%', description: '+10% Physical Resistance' }
    ],
    tags: ['heavy', 'steel', 'plate'],
    icon: '🛡️⚔️'
  }
];

export const STORE_FOOD: StoreItem[] = [
  // Basic Food
  {
    id: 'bread-loaf',
    name: 'Fresh Bread',
    description: 'Hearty bread that restores health and morale.',
    category: StoreCategory.FOOD,
    subcategory: 'Basic Food',
    price: { gold: 5 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Healing', target: 'hp', value: 25, description: 'Restores 25 HP' },
      { type: 'Buff', target: 'morale', value: 5, duration: 3, description: '+5 Morale for 3 turns' }
    ],
    tags: ['food', 'healing', 'morale'],
    icon: '🍞'
  },
  {
    id: 'dried-meat',
    name: 'Dried Meat',
    description: 'Preserved meat that provides sustained energy.',
    category: StoreCategory.FOOD,
    subcategory: 'Preserved Food',
    price: { gold: 15 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Healing', target: 'hp', value: 40, description: 'Restores 40 HP' },
      { type: 'Buff', target: 'stamina', value: 10, duration: 5, description: '+10 Stamina for 5 turns' }
    ],
    tags: ['food', 'healing', 'stamina', 'carnivore'],
    icon: '🥩'
  },

  // Beast Food
  {
    id: 'raw-steak',
    name: 'Fresh Raw Steak',
    description: 'High-quality raw meat preferred by carnivorous beasts.',
    category: StoreCategory.FOOD,
    subcategory: 'Beast Food',
    price: { gold: 25 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Special', target: 'beast_bond', value: 10, description: '+10 Beast Bonding (Carnivores)' },
      { type: 'Healing', target: 'beast_hp', value: 50, description: 'Restores 50 Beast HP' }
    ],
    tags: ['beast-food', 'carnivore', 'bonding', 'preferred'],
    icon: '🥩🐺'
  },
  {
    id: 'mana-crystals',
    name: 'Mana Crystal Shards',
    description: 'Crystallized magical energy that magical beasts crave.',
    category: StoreCategory.FOOD,
    subcategory: 'Beast Food',
    price: { gold: 75 },
    rarity: 'Uncommon',
    stock: 20,
    maxStock: 20,
    restockTime: 24,
    effects: [
      { type: 'Special', target: 'beast_bond', value: 15, description: '+15 Beast Bonding (Magical Essence)' },
      { type: 'Buff', target: 'beast_magic', value: 20, duration: 10, description: '+20 Beast Magic for 10 turns' }
    ],
    tags: ['beast-food', 'magical-essence', 'bonding', 'preferred'],
    icon: '💎🐉'
  }
];

export const STORE_POTIONS: StoreItem[] = [
  // Healing Potions
  {
    id: 'health-potion',
    name: 'Health Potion',
    description: 'A red potion that instantly restores health.',
    category: StoreCategory.POTIONS,
    subcategory: 'Healing',
    price: { gold: 50 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Healing', target: 'hp', value: 100, description: 'Instantly restores 100 HP' }
    ],
    tags: ['potion', 'healing', 'instant'],
    icon: '🧪❤️'
  },
  {
    id: 'mana-potion',
    name: 'Mana Potion',
    description: 'A blue potion that restores magical energy.',
    category: StoreCategory.POTIONS,
    subcategory: 'Mana',
    price: { gold: 60 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Healing', target: 'mana', value: 80, description: 'Instantly restores 80 Mana' }
    ],
    tags: ['potion', 'mana', 'instant'],
    icon: '🧪💙'
  },

  // Buff Potions
  {
    id: 'strength-elixir',
    name: 'Elixir of Strength',
    description: 'Temporarily increases physical power.',
    category: StoreCategory.POTIONS,
    subcategory: 'Enhancement',
    price: { gold: 120 },
    rarity: 'Uncommon',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Buff', target: 'strength', value: 15, duration: 10, description: '+15 Strength for 10 turns' }
    ],
    tags: ['potion', 'buff', 'strength', 'temporary'],
    icon: '🧪💪'
  }
];

export const STORE_MAGICAL_ITEMS: StoreItem[] = [
  // Enchanted Accessories
  {
    id: 'ring-of-protection',
    name: 'Ring of Protection',
    description: 'A magical ring that provides constant protection.',
    category: StoreCategory.MAGICAL_ITEMS,
    subcategory: 'Rings',
    price: { gold: 300 },
    rarity: 'Uncommon',
    level: 3,
    stock: 5,
    maxStock: 5,
    restockTime: 72,
    effects: [
      { type: 'Stat', target: 'defense', value: 5, description: '+5 Defense' },
      { type: 'Special', target: 'magic_resist', value: '15%', description: '+15% Magic Resistance' }
    ],
    tags: ['ring', 'protection', 'magic-resist', 'accessory'],
    icon: '💍🛡️'
  },
  {
    id: 'amulet-of-wisdom',
    name: 'Amulet of Wisdom',
    description: 'An ancient amulet that enhances magical abilities.',
    category: StoreCategory.MAGICAL_ITEMS,
    subcategory: 'Amulets',
    price: { gold: 450 },
    rarity: 'Rare',
    level: 8,
    stock: 3,
    maxStock: 3,
    restockTime: 120,
    effects: [
      { type: 'Stat', target: 'magic', value: 12, description: '+12 Magic Power' },
      { type: 'Stat', target: 'mana', value: 50, description: '+50 Maximum Mana' },
      { type: 'Special', target: 'spell_crit', value: '10%', description: '+10% Spell Critical Chance' }
    ],
    tags: ['amulet', 'magic', 'mana', 'crit', 'accessory'],
    icon: '📿✨'
  }
];

export const STORE_ARTIFACTS: StoreItem[] = [
  // Legendary Artifacts
  {
    id: 'banner-of-unity',
    name: 'Banner of Unity',
    description: 'A legendary banner that inspires entire squads.',
    category: StoreCategory.ARTIFACTS,
    subcategory: 'Squad Artifacts',
    price: { gold: 1500, reputation: 50 },
    rarity: 'Epic',
    level: 12,
    stock: 1,
    maxStock: 1,
    restockTime: 336, // 2 weeks
    requirements: [
      { type: 'Achievement', value: 'squad-master', description: 'Master squad tactics', isMet: false }
    ],
    effects: [
      { type: 'Special', target: 'squad_damage', value: '15%', description: '+15% Squad Damage' },
      { type: 'Special', target: 'squad_morale', value: '20%', description: '+20% Squad Morale' },
      { type: 'Special', target: 'leadership_bonus', value: '10%', description: '+10% Leadership Effectiveness' }
    ],
    tags: ['artifact', 'squad', 'leadership', 'morale', 'legendary'],
    icon: '🏴‍☠️✨'
  },
  {
    id: 'dragons-heart',
    name: 'Heart of the Ancient Dragon',
    description: 'The crystallized heart of an ancient dragon, pulsing with power.',
    category: StoreCategory.ARTIFACTS,
    subcategory: 'Power Artifacts',
    price: { gold: 5000, reputation: 200, influence: 100 },
    rarity: 'Legendary',
    level: 20,
    stock: 1,
    maxStock: 1,
    requirements: [
      { type: 'Achievement', value: 'dragon-slayer', description: 'Defeat an ancient dragon', isMet: false },
      { type: 'Campaign', value: 'dragon-wars', description: 'Complete Dragon Wars campaign', isMet: false }
    ],
    effects: [
      { type: 'Special', target: 'fire_immunity', value: 'true', description: 'Fire Immunity' },
      { type: 'Stat', target: 'magic', value: 25, description: '+25 Magic Power' },
      { type: 'Special', target: 'dragon_command', value: 'true', description: 'Can command dragons' },
      { type: 'Special', target: 'dragonfire_aura', value: 'true', description: 'Dragonfire Aura (AoE damage)' }
    ],
    tags: ['artifact', 'dragon', 'fire', 'immunity', 'legendary', 'unique'],
    icon: '🐉❤️'
  }
];

export const STORE_BEAST_SUPPLIES: StoreItem[] = [
  // Grooming Supplies
  {
    id: 'beast-brush',
    name: 'Beast Grooming Brush',
    description: 'A specialized brush for maintaining beast hygiene.',
    category: StoreCategory.BEAST_SUPPLIES,
    subcategory: 'Grooming',
    price: { gold: 30 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Special', target: 'grooming_efficiency', value: '25%', description: '+25% Grooming Efficiency' },
      { type: 'Special', target: 'bond_gain', value: 2, description: '+2 Bond per grooming session' }
    ],
    tags: ['beast-supplies', 'grooming', 'hygiene', 'bonding'],
    icon: '🪮🐺'
  },
  {
    id: 'claw-sharpener',
    name: 'Claw Sharpening Stone',
    description: 'A special stone for keeping beast claws sharp and healthy.',
    category: StoreCategory.BEAST_SUPPLIES,
    subcategory: 'Grooming',
    price: { gold: 45 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Special', target: 'claw_maintenance', value: 'true', description: 'Maintains claw health' },
      { type: 'Buff', target: 'beast_attack', value: 5, duration: 20, description: '+5 Beast Attack for 20 turns' }
    ],
    tags: ['beast-supplies', 'grooming', 'claws', 'attack'],
    icon: '🪨🐾'
  },

  // Beast Medicine
  {
    id: 'beast-healing-salve',
    name: 'Beast Healing Salve',
    description: 'A medicinal salve that heals beast wounds and ailments.',
    category: StoreCategory.BEAST_SUPPLIES,
    subcategory: 'Medicine',
    price: { gold: 80 },
    rarity: 'Uncommon',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Healing', target: 'beast_hp', value: 150, description: 'Heals 150 Beast HP' },
      { type: 'Special', target: 'cure_wounds', value: 'true', description: 'Cures wounds and infections' }
    ],
    tags: ['beast-supplies', 'medicine', 'healing', 'wounds'],
    icon: '🧴🐺'
  },

  // Beast Gear
  {
    id: 'leather-saddle',
    name: 'Leather Saddle',
    description: 'A comfortable saddle for riding flying or large beasts.',
    category: StoreCategory.BEAST_SUPPLIES,
    subcategory: 'Gear',
    price: { gold: 200 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    requirements: [
      { type: 'Beast', value: 'rideable', description: 'Requires rideable beast', isMet: false }
    ],
    effects: [
      { type: 'Special', target: 'riding_comfort', value: '50%', description: '+50% Riding Comfort' },
      { type: 'Special', target: 'mount_speed', value: '20%', description: '+20% Mount Speed' }
    ],
    tags: ['beast-supplies', 'gear', 'saddle', 'riding'],
    icon: '🪑🐎'
  },
  {
    id: 'beast-armor',
    name: 'Beast Scale Armor',
    description: 'Protective armor designed specifically for large beasts.',
    category: StoreCategory.BEAST_SUPPLIES,
    subcategory: 'Gear',
    price: { gold: 400 },
    rarity: 'Uncommon',
    level: 5,
    stock: 10,
    maxStock: 10,
    restockTime: 48,
    effects: [
      { type: 'Stat', target: 'beast_defense', value: 20, description: '+20 Beast Defense' },
      { type: 'Special', target: 'physical_resist', value: '15%', description: '+15% Physical Resistance' }
    ],
    tags: ['beast-supplies', 'gear', 'armor', 'defense'],
    icon: '🛡️🐉'
  },

  // Shelter Supplies
  {
    id: 'nest-materials',
    name: 'Premium Nesting Materials',
    description: 'High-quality materials for building comfortable beast nests.',
    category: StoreCategory.BEAST_SUPPLIES,
    subcategory: 'Shelter',
    price: { gold: 150 },
    rarity: 'Common',
    stock: -1,
    maxStock: -1,
    effects: [
      { type: 'Special', target: 'nest_quality', value: '40%', description: '+40% Nest Quality' },
      { type: 'Special', target: 'rest_efficiency', value: '25%', description: '+25% Rest Efficiency' }
    ],
    tags: ['beast-supplies', 'shelter', 'nesting', 'rest'],
    icon: '🪺🌿'
  }
];

export const ALL_STORE_ITEMS: Record<StoreCategory, StoreItem[]> = {
  [StoreCategory.WEAPONS]: STORE_WEAPONS,
  [StoreCategory.ARMOR]: STORE_ARMOR,
  [StoreCategory.FOOD]: STORE_FOOD,
  [StoreCategory.POTIONS]: STORE_POTIONS,
  [StoreCategory.MAGICAL_ITEMS]: STORE_MAGICAL_ITEMS,
  [StoreCategory.ARTIFACTS]: STORE_ARTIFACTS,
  [StoreCategory.BEAST_SUPPLIES]: STORE_BEAST_SUPPLIES
};