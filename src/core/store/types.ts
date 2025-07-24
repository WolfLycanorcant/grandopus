export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: StoreCategory;
  subcategory?: string;
  price: {
    gold: number;
    reputation?: number;
    influence?: number;
  };
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  level?: number; // Minimum level requirement
  stock: number; // -1 for unlimited
  maxStock: number; // Maximum stock that can be held
  restockTime?: number; // Hours until restock
  requirements?: StoreRequirement[];
  effects?: ItemEffect[];
  tags?: string[];
  icon?: string;
}

export interface StoreRequirement {
  type: 'Level' | 'Achievement' | 'Campaign' | 'Reputation' | 'Beast';
  value: string | number;
  description: string;
  isMet: boolean;
}

export interface ItemEffect {
  type: 'Stat' | 'Healing' | 'Buff' | 'Special';
  target: string; // stat name, effect name, etc.
  value: number | string;
  duration?: number; // for temporary effects
  description: string;
}

export enum StoreCategory {
  WEAPONS = 'weapons',
  ARMOR = 'armor',
  FOOD = 'food',
  POTIONS = 'potions',
  MAGICAL_ITEMS = 'magical_items',
  ARTIFACTS = 'artifacts',
  BEAST_SUPPLIES = 'beast_supplies'
}

export interface StoreState {
  categories: StoreCategory[];
  items: Record<StoreCategory, StoreItem[]>;
  playerInventory: Record<string, number>;
  playerGold: number;
  playerReputation: number;
  playerInfluence: number;
  lastRestockTime: Date;
  purchaseHistory: PurchaseRecord[];
  discounts: StoreDiscount[];
}

export interface PurchaseRecord {
  itemId: string;
  itemName: string;
  quantity: number;
  totalCost: number;
  purchaseDate: Date;
  category: StoreCategory;
}

export interface StoreDiscount {
  id: string;
  name: string;
  description: string;
  category?: StoreCategory;
  itemIds?: string[];
  discountPercent: number;
  requirements?: StoreRequirement[];
  expiryDate?: Date;
  isActive: boolean;
}

export interface CartItem {
  item: StoreItem;
  quantity: number;
  totalPrice: number;
}

export interface StoreTransaction {
  items: CartItem[];
  totalCost: {
    gold: number;
    reputation?: number;
    influence?: number;
  };
  discountsApplied: StoreDiscount[];
  success: boolean;
  error?: string;
}