import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart,
  ClipboardList,
  ArrowRight,
  X,
  TrendingUp
} from 'lucide-react';
import { CartItem, Product } from '../types/ecommerce';
import { AuthUser } from '../types/api';

interface HeaderProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  user: AuthUser;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItems,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  user,
  onLogout,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  products = [],
  onSelectProduct
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const popularSearches = [
    'Sony XM5',
    'AirPods Pro',
    'Mechanical Keyboard',
    'USB-C Cable',
    'Smart LED Bulb',
    'Noise Cancelling'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search suggestions based on multi-term matching
  const matchingSuggestions = React.useMemo(() => {
    if (!searchQuery.trim() || !products.length) return [];
    const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      const text = `${p.title} ${p.brand} ${p.category} ${p.asin} ${p.features.join(' ')}`.toLowerCase();
      return terms.every((t) => text.includes(t));
    }).slice(0, 5);
  }, [searchQuery, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
    // Ensure all departments are searched
    if (selectedCategory !== 'All Departments') {
      onCategoryChange('All Departments');
    }
  };

  const handleSelectSuggestion = (product: Product) => {
    setIsSearchFocused(false);
    onSearchChange(product.title);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handlePickPopular = (term: string) => {
    onSearchChange(term);
    onCategoryChange('All Departments');
    setIsSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 select-none shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => {
            onCategoryChange('All Departments');
            onSearchChange('');
          }}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">
            Exclusive<span className="text-[#db4444]">.</span>
          </span>
          <span className="hidden xl:inline text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-semibold border border-neutral-200">
            Curated Picks
          </span>
        </div>

        {/* Right Section: Interactive Search Bar & Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end max-w-xl">
          {/* Functional Search Bar with Form & Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative w-full max-w-xs sm:max-w-sm">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsSearchFocused(false);
                }}
                placeholder="What are you looking for?"
                className="w-full bg-[#f5f5f5] text-xs text-gray-900 rounded-md pl-4 pr-16 py-2.5 outline-none focus:ring-1 focus:ring-black placeholder:text-gray-500 transition"
              />

              {/* Clear button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                  }}
                  className="absolute right-8 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Clickable Search Submit Button */}
              <button
                type="submit"
                className="absolute right-2 p-1.5 text-gray-700 hover:text-black hover:bg-gray-200/60 rounded-md transition cursor-pointer"
                title="Search"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Autocomplete & Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {searchQuery.trim() ? (
                  <div>
                    {matchingSuggestions.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        <div className="px-3 py-2 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                          <span>Matching Products ({matchingSuggestions.length})</span>
                          <span className="text-[10px] text-gray-400">Press Enter to search</span>
                        </div>
                        {matchingSuggestions.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => handleSelectSuggestion(product)}
                            className="p-2.5 flex items-center gap-3 hover:bg-red-50/50 cursor-pointer transition group"
                          >
                            <div className="w-10 h-10 bg-[#f5f5f5] rounded p-1 flex items-center justify-center shrink-0">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 group-hover:text-[#db4444] truncate">
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="font-bold text-[#db4444]">
                                  {product.inStock ? `$${product.price.toFixed(2)}` : 'Unavailable'}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">{product.brand}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">{product.category}</span>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#db4444] shrink-0" />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="w-full text-center py-2.5 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-[#db4444] transition cursor-pointer"
                        >
                          View all matching results for "{searchQuery}" &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 text-center space-y-1">
                        <p className="text-xs font-semibold text-gray-800">
                          No direct matches for "{searchQuery}"
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Try searching for "Sony", "Keyboard", "Cable", "AirPods", or "Smart"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Popular Search Terms when empty */
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5 text-[#db4444]" />
                      <span>Popular Searches in 20-Core</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => handlePickPopular(term)}
                          className="bg-[#f5f5f5] hover:bg-[#db4444] hover:text-white text-gray-700 text-xs px-2.5 py-1 rounded-full transition cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons Cluster */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-600">
              <span className="max-w-32 truncate">{user.name}</span>
              <button onClick={onLogout} className="font-semibold text-gray-900 hover:text-[#db4444]">
                Sign out
              </button>
            </div>
            {/* Cart Icon */}
            <button onClick={onOpenWishlist} className="p-2 text-gray-800 hover:text-[#db4444]" title="Wishlist" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </button>
            <button onClick={onOpenOrders} className="p-2 text-gray-800 hover:text-[#db4444]" title="Purchase history" aria-label="Purchase history">
              <ClipboardList className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenCart}
              className="relative p-2 text-gray-800 hover:text-black transition cursor-pointer rounded-full hover:bg-gray-100"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-800" />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#db4444] text-white font-bold text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
