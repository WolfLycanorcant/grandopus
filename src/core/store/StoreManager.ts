import { StoreState, StoreItem, StoreCategory, CartItem, StoreTransaction, StoreDiscount, PurchaseRecord } from './types';
import { ALL_STORE_ITEMS } from './StoreData';

export class StoreManager {
  private state: StoreState;
  private listeners: Array<(state: StoreState) => void> = [];

  constructor() {
    this.state = {
      categories: Object.values(StoreCategory),
      items: { ...ALL_STORE_ITEMS },
      playerInventory: {},
      playerGold: 1000, // Starting gold
      playerReputation: 0,
      playerInfluence: 0,
      lastRestockTime: new Date(),
      purchaseHistory: [],
      discounts: []
    };

    this.initializeStore();
  }

  private initializeStore(): void {
    // Check for restocks
    this.checkRestocks();
    
    // Initialize player inventory tracking
    this.initializeInventory();
    
    // Set up initial discounts
    this.initializeDiscounts();
  }

  public subscribe(listener: (state: StoreState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  public getState(): StoreState {
    return { ...this.state };
  }

  public getItemsByCategory(category: StoreCategory): StoreItem[] {
    return this.state.items[category] || [];
  }

  public getItem(itemId: string): StoreItem | null {
    for (const category of Object.values(StoreCategory)) {
      const item = this.state.items[category].find(item => item.id === itemId);
      if (item) return item;
    }
    return null;
  }

  public getAvailableItems(category: StoreCategory): StoreItem[] {
    return this.state.items[category].filter(item => {
      // Check stock availability
      if (item.stock === 0) return false;
      
      // Check requirements
      if (item.requirements) {
        return item.requirements.every(req => this.checkRequirement(req));
      }
      
      return true;
    });
  }

  private checkRequirement(requirement: any): boolean {
    switch (requirement.type) {
      case 'Level':
        // This would check player level - placeholder for now
        return true;
      case 'Achievement':
        // This would check achievements - placeholder for now
        return requirement.isMet;
      case 'Campaign':
        // This would check campaign completion - placeholder for now
        return requirement.isMet;
      case 'Reputation':
        return this.state.playerReputation >= requirement.value;
      case 'Beast':
        // This would check beast ownership - placeholder for now
        return requirement.isMet;
      default:
        return true;
    }
  }

  public canAffordItem(item: StoreItem, quantity: number = 1): { canAfford: boolean; reason?: string } {
    const totalGoldCost = item.price.gold * quantity;
    const totalReputationCost = (item.price.reputation || 0) * quantity;
    const totalInfluenceCost = (item.price.influence || 0) * quantity;

    if (this.state.playerGold < totalGoldCost) {
      return { 
        canAfford: false, 
        reason: `Insufficient gold. Need ${totalGoldCost - this.state.playerGold} more gold.` 
      };
    }

    if (this.state.playerReputation < totalReputationCost) {
      return { 
        canAfford: false, 
        reason: `Insufficient reputation. Need ${totalReputationCost - this.state.playerReputation} more reputation.` 
      };
    }

    if (this.state.playerInfluence < totalInfluenceCost) {
      return { 
        canAfford: false, 
        reason: `Insufficient influence. Need ${totalInfluenceCost - this.state.playerInfluence} more influence.` 
      };
    }

    // Check stock
    if (item.stock !== -1 && item.stock < quantity) {
      return { 
        canAfford: false, 
        reason: `Insufficient stock. Only ${item.stock} available.` 
      };
    }

    return { canAfford: true };
  }

  public calculateCartTotal(cart: CartItem[]): {
    totalCost: { gold: number; reputation: number; influence: number };
    discountsApplied: StoreDiscount[];
    finalCost: { gold: number; reputation: number; influence: number };
  } {
    let totalGold = 0;
    let totalReputation = 0;
    let totalInfluence = 0;

    // Calculate base costs
    cart.forEach(cartItem => {
      totalGold += cartItem.item.price.gold * cartItem.quantity;
      totalReputation += (cartItem.item.price.reputation || 0) * cartItem.quantity;
      totalInfluence += (cartItem.item.price.influence || 0) * cartItem.quantity;
    });

    const baseCost = { gold: totalGold, reputation: totalReputation, influence: totalInfluence };

    // Apply discounts
    const applicableDiscounts = this.getApplicableDiscounts(cart);
    let discountMultiplier = 1.0;

    applicableDiscounts.forEach(discount => {
      discountMultiplier *= (1 - discount.discountPercent / 100);
    });

    const finalCost = {
      gold: Math.floor(totalGold * discountMultiplier),
      reputation: Math.floor(totalReputation * discountMultiplier),
      influence: Math.floor(totalInfluence * discountMultiplier)
    };

    return {
      totalCost: baseCost,
      discountsApplied: applicableDiscounts,
      finalCost
    };
  }

  private getApplicableDiscounts(cart: CartItem[]): StoreDiscount[] {
    return this.state.discounts.filter(discount => {
      if (!discount.isActive) return false;
      
      // Check expiry
      if (discount.expiryDate && discount.expiryDate < new Date()) {
        discount.isActive = false;
        return false;
      }

      // Check requirements
      if (discount.requirements) {
        const meetsRequirements = discount.requirements.every(req => this.checkRequirement(req));
        if (!meetsRequirements) return false;
      }

      // Check if discount applies to items in cart
      if (discount.category) {
        return cart.some(cartItem => cartItem.item.category === discount.category);
      }

      if (discount.itemIds) {
        return cart.some(cartItem => discount.itemIds!.includes(cartItem.item.id));
      }

      return true; // Global discount
    });
  }

  public purchaseItems(cart: CartItem[]): StoreTransaction {
    const costCalculation = this.calculateCartTotal(cart);
    const { finalCost, discountsApplied } = costCalculation;

    // Check if player can afford the final cost
    if (this.state.playerGold < finalCost.gold ||
        this.state.playerReputation < finalCost.reputation ||
        this.state.playerInfluence < finalCost.influence) {
      return {
        items: cart,
        totalCost: finalCost,
        discountsApplied,
        success: false,
        error: 'Insufficient resources for purchase'
      };
    }

    // Check stock for all items
    for (const cartItem of cart) {
      if (cartItem.item.stock !== -1 && cartItem.item.stock < cartItem.quantity) {
        return {
          items: cart,
          totalCost: finalCost,
          discountsApplied,
          success: false,
          error: `Insufficient stock for ${cartItem.item.name}`
        };
      }
    }

    // Process the purchase
    this.state.playerGold -= finalCost.gold;
    this.state.playerReputation -= finalCost.reputation;
    this.state.playerInfluence -= finalCost.influence;

    // Update inventory and stock
    cart.forEach(cartItem => {
      // Add to inventory
      const currentAmount = this.state.playerInventory[cartItem.item.id] || 0;
      this.state.playerInventory[cartItem.item.id] = currentAmount + cartItem.quantity;

      // Reduce stock
      if (cartItem.item.stock !== -1) {
        cartItem.item.stock -= cartItem.quantity;
      }

      // Add to purchase history
      const purchaseRecord: PurchaseRecord = {
        itemId: cartItem.item.id,
        itemName: cartItem.item.name,
        quantity: cartItem.quantity,
        totalCost: cartItem.totalPrice,
        purchaseDate: new Date(),
        category: cartItem.item.category
      };
      this.state.purchaseHistory.push(purchaseRecord);
    });

    this.notifyListeners();

    return {
      items: cart,
      totalCost: finalCost,
      discountsApplied,
      success: true
    };
  }

  public sellItem(itemId: string, quantity: number): { success: boolean; goldEarned?: number; error?: string } {
    const inventoryAmount = this.state.playerInventory[itemId] || 0;
    
    if (inventoryAmount < quantity) {
      return { success: false, error: 'Not enough items in inventory' };
    }

    const item = this.getItem(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Calculate sell price (50% of purchase price)
    const sellPrice = Math.floor(item.price.gold * 0.5);
    const totalEarned = sellPrice * quantity;

    // Update inventory and gold
    this.state.playerInventory[itemId] -= quantity;
    if (this.state.playerInventory[itemId] === 0) {
      delete this.state.playerInventory[itemId];
    }
    
    this.state.playerGold += totalEarned;

    this.notifyListeners();

    return { success: true, goldEarned: totalEarned };
  }

  public getPlayerInventory(): Record<string, number> {
    return { ...this.state.playerInventory };
  }

  public getInventoryValue(): number {
    let totalValue = 0;
    
    Object.entries(this.state.playerInventory).forEach(([itemId, quantity]) => {
      const item = this.getItem(itemId);
      if (item) {
        totalValue += item.price.gold * quantity;
      }
    });

    return totalValue;
  }

  private checkRestocks(): void {
    const now = new Date();
    const hoursSinceLastRestock = (now.getTime() - this.state.lastRestockTime.getTime()) / (1000 * 60 * 60);

    // Check each item for restock
    Object.values(this.state.items).flat().forEach(item => {
      if (item.restockTime && hoursSinceLastRestock >= item.restockTime) {
        if (item.stock < item.maxStock) {
          item.stock = item.maxStock;
        }
      }
    });

    if (hoursSinceLastRestock >= 24) { // Daily restock check
      this.state.lastRestockTime = now;
    }
  }

  private initializeInventory(): void {
    // Players start with some basic items
    this.state.playerInventory = {
      'bread-loaf': 5,
      'health-potion': 3,
      'mana-potion': 2
    };
  }

  private initializeDiscounts(): void {
    // Set up some initial discounts
    this.state.discounts = [
      {
        id: 'new-player-discount',
        name: 'New Player Discount',
        description: '10% off all basic items for new players',
        category: StoreCategory.WEAPONS,
        discountPercent: 10,
        requirements: [],
        isActive: true
      },
      {
        id: 'beast-lover-discount',
        name: 'Beast Lover Discount',
        description: '15% off all beast supplies',
        category: StoreCategory.BEAST_SUPPLIES,
        discountPercent: 15,
        requirements: [
          { type: 'Beast', value: 'owned', description: 'Own at least one beast', isMet: false }
        ],
        isActive: true
      }
    ];
  }

  public updatePlayerResources(gold: number, reputation: number = 0, influence: number = 0): void {
    this.state.playerGold = Math.max(0, gold);
    this.state.playerReputation = Math.max(0, reputation);
    this.state.playerInfluence = Math.max(0, influence);
    this.notifyListeners();
  }

  public addDiscount(discount: StoreDiscount): void {
    this.state.discounts.push(discount);
    this.notifyListeners();
  }

  public removeDiscount(discountId: string): void {
    this.state.discounts = this.state.discounts.filter(d => d.id !== discountId);
    this.notifyListeners();
  }

  public getPurchaseHistory(): PurchaseRecord[] {
    return [...this.state.purchaseHistory];
  }

  public saveState(): string {
    return JSON.stringify({
      playerInventory: this.state.playerInventory,
      playerGold: this.state.playerGold,
      playerReputation: this.state.playerReputation,
      playerInfluence: this.state.playerInfluence,
      purchaseHistory: this.state.purchaseHistory,
      lastRestockTime: this.state.lastRestockTime,
      itemStocks: this.getItemStocks()
    });
  }

  public loadState(savedState: string): void {
    try {
      const data = JSON.parse(savedState);
      
      if (data.playerInventory) {
        this.state.playerInventory = data.playerInventory;
      }
      
      if (data.playerGold !== undefined) {
        this.state.playerGold = data.playerGold;
      }
      
      if (data.playerReputation !== undefined) {
        this.state.playerReputation = data.playerReputation;
      }
      
      if (data.playerInfluence !== undefined) {
        this.state.playerInfluence = data.playerInfluence;
      }
      
      if (data.purchaseHistory) {
        this.state.purchaseHistory = data.purchaseHistory.map((record: any) => ({
          ...record,
          purchaseDate: new Date(record.purchaseDate)
        }));
      }
      
      if (data.lastRestockTime) {
        this.state.lastRestockTime = new Date(data.lastRestockTime);
      }
      
      if (data.itemStocks) {
        this.restoreItemStocks(data.itemStocks);
      }

      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load store state:', error);
    }
  }

  private getItemStocks(): Record<string, number> {
    const stocks: Record<string, number> = {};
    Object.values(this.state.items).flat().forEach(item => {
      if (item.stock !== -1) {
        stocks[item.id] = item.stock;
      }
    });
    return stocks;
  }

  private restoreItemStocks(stocks: Record<string, number>): void {
    Object.values(this.state.items).flat().forEach(item => {
      if (stocks[item.id] !== undefined) {
        item.stock = stocks[item.id];
      }
    });
  }
}