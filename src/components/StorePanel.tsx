import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Coins,
  Star,
  Crown,
  Users,
  Package,
  Filter,
  Search,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  History,
  Percent
} from 'lucide-react';
import { StoreManager } from '../core/store/StoreManager';
import { StoreState, StoreCategory, StoreItem, CartItem } from '../core/store/types';

interface StorePanelProps {
  storeManager: StoreManager;
}

export const StorePanel: React.FC<StorePanelProps> = ({ storeManager }) => {
  const [storeState, setStoreState] = useState<StoreState>(storeManager.getState());
  const [activeCategory, setActiveCategory] = useState<StoreCategory>(StoreCategory.WEAPONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsubscribe = storeManager.subscribe(setStoreState);
    return unsubscribe;
  }, [storeManager]);

  const getCategoryIcon = (category: StoreCategory) => {
    switch (category) {
      case StoreCategory.WEAPONS: return '⚔️';
      case StoreCategory.ARMOR: return '🛡️';
      case StoreCategory.FOOD: return '🍖';
      case StoreCategory.POTIONS: return '🧪';
      case StoreCategory.MAGICAL_ITEMS: return '✨';
      case StoreCategory.ARTIFACTS: return '🏺';
      case StoreCategory.BEAST_SUPPLIES: return '🐺';
      default: return '📦';
    }
  };

  const getCategoryName = (category: StoreCategory) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-400';
      case 'Uncommon': return 'text-green-400 border-green-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getFilteredItems = () => {
    let items = storeManager.getAvailableItems(activeCategory);

    // Apply search filter
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      items = items.filter(item => item.rarity === rarityFilter);
    }

    return items;
  };

  const addToCart = (item: StoreItem, quantity: number = 1) => {
    const existingCartItem = cart.find(cartItem => cartItem.item.id === item.id);
    
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      const affordabilityCheck = storeManager.canAffordItem(item, newQuantity);
      
      if (!affordabilityCheck.canAfford) {
        alert(affordabilityCheck.reason);
        return;
      }

      setCart(cart.map(cartItem =>
        cartItem.item.id === item.id
          ? { ...cartItem, quantity: newQuantity, totalPrice: item.price.gold * newQuantity }
          : cartItem
      ));
    } else {
      const affordabilityCheck = storeManager.canAffordItem(item, quantity);
      
      if (!affordabilityCheck.canAfford) {
        alert(affordabilityCheck.reason);
        return;
      }

      setCart([...cart, {
        item,
        quantity,
        totalPrice: item.price.gold * quantity
      }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(cartItem => cartItem.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cart.find(cartItem => cartItem.item.id === itemId)?.item;
    if (!item) return;

    const affordabilityCheck = storeManager.canAffordItem(item, newQuantity);
    if (!affordabilityCheck.canAfford) {
      alert(affordabilityCheck.reason);
      return;
    }

    setCart(cart.map(cartItem =>
      cartItem.item.id === itemId
        ? { ...cartItem, quantity: newQuantity, totalPrice: item.price.gold * newQuantity }
        : cartItem
    ));
  };

  const handlePurchase = () => {
    if (cart.length === 0) return;

    const transaction = storeManager.purchaseItems(cart);
    
    if (transaction.success) {
      alert(`Purchase successful! Spent ${transaction.totalCost.gold} gold.`);
      setCart([]);
      setShowCart(false);
    } else {
      alert(`Purchase failed: ${transaction.error}`);
    }
  };

  const cartTotal = storeManager.calculateCartTotal(cart);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = getFilteredItems();

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Grand Opus Store</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Player Resources */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-white font-medium">{storeState.playerGold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="h-4 w-4 text-purple-400" />
              <span className="text-white font-medium">{storeState.playerReputation}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-white font-medium">{storeState.playerInfluence}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History
            </button>
            <button
              onClick={() => setShowCart(!showCart)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 relative"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Categories</h3>
            <nav className="space-y-2">
              {storeState.categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="text-sm">{getCategoryName(category)}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg placeholder-slate-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="bg-slate-600 text-white rounded-lg px-3 py-2"
                >
                  <option value="all">All Rarities</option>
                  <option value="Common">Common</option>
                  <option value="Uncommon">Uncommon</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const affordabilityCheck = storeManager.canAffordItem(item);
              const inInventory = storeState.playerInventory[item.id] || 0;
              
              return (
                <div key={item.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                        <div className={`text-xs px-2 py-1 rounded border ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </div>
                      </div>
                    </div>
                    {item.level && (
                      <div className="text-xs text-slate-400">Lv.{item.level}+</div>
                    )}
                  </div>

                  <p className="text-slate-300 text-xs mb-3 line-clamp-2">{item.description}</p>

                  {/* Effects */}
                  {item.effects && item.effects.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-slate-400 mb-1">Effects:</div>
                      <div className="space-y-1">
                        {item.effects.slice(0, 2).map((effect, index) => (
                          <div key={index} className="text-xs text-green-400">
                            • {effect.description}
                          </div>
                        ))}
                        {item.effects.length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{item.effects.length - 2} more effects
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="h-3 w-3 text-yellow-400" />
                      <span className="text-white font-medium">{item.price.gold}</span>
                      {item.price.reputation && (
                        <>
                          <Crown className="h-3 w-3 text-purple-400 ml-2" />
                          <span className="text-white">{item.price.reputation}</span>
                        </>
                      )}
                      {item.price.influence && (
                        <>
                          <Users className="h-3 w-3 text-blue-400 ml-2" />
                          <span className="text-white">{item.price.influence}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stock & Inventory */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <div>
                      {item.stock === -1 ? 'Unlimited' : `Stock: ${item.stock}`}
                    </div>
                    {inInventory > 0 && (
                      <div>Owned: {inInventory}</div>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!affordabilityCheck.canAfford}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      affordabilityCheck.canAfford
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="h-3 w-3" />
                    Add to Cart
                  </button>

                  {!affordabilityCheck.canAfford && (
                    <div className="mt-2 text-xs text-red-400">
                      {affordabilityCheck.reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 mb-2">No Items Found</h3>
              <p className="text-slate-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Shopping Cart</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(cartItem => (
                    <div key={cartItem.item.id} className="flex items-center gap-4 bg-slate-700 rounded-lg p-4">
                      <span className="text-2xl">{cartItem.item.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{cartItem.item.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Coins className="h-3 w-3 text-yellow-400" />
                          <span>{cartItem.item.price.gold} each</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                          className="p-1 bg-slate-600 hover:bg-slate-500 text-white rounded"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-white font-medium w-8 text-center">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity + 1)}
                          className="p-1 bg-slate-600 hover:bg-slate-500 text-white rounded"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-white font-medium min-w-16 text-right">
                        {cartItem.totalPrice}
                      </div>
                      <button
                        onClick={() => removeFromCart(cartItem.item.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-700 p-6">
                {/* Discounts */}
                {cartTotal.discountsApplied.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <Percent className="h-4 w-4" />
                      <span className="text-sm font-medium">Discounts Applied:</span>
                    </div>
                    {cartTotal.discountsApplied.map(discount => (
                      <div key={discount.id} className="text-sm text-green-400 ml-6">
                        • {discount.name} (-{discount.discountPercent}%)
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span className="text-lg font-bold text-white">
                      {cartTotal.finalCost.gold.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  Complete Purchase
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchase History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Purchase History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {storeState.purchaseHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No purchase history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storeState.purchaseHistory.slice().reverse().map((record, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getCategoryIcon(record.category)}</span>
                        <div>
                          <h4 className="text-white font-medium">{record.itemName}</h4>
                          <div className="text-sm text-slate-400">
                            {record.purchaseDate.toLocaleDateString()} • Qty: {record.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Coins className="h-4 w-4" />
                        <span className="font-medium">{record.totalCost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};