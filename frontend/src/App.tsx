import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, UserProfile, RecEngineMode } from './types/ecommerce';
import { AMAZON_PRODUCTS } from './data/amazon2023Data';
import { USER_PROFILES } from './data/userProfiles';
import { apiService, mapBackendProductToFrontend } from './services/apiService';
import { Header } from './components/Header';
import { SubNavbar } from './components/SubNavbar';
import { CategoryCardsGrid } from './components/CategoryCardsGrid';
import { RecommendationRail } from './components/RecommendationRail';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { ArchitectureModal } from './components/ArchitectureModal';
import { DashboardDesignModal } from './components/DashboardDesignModal';
import { Footer } from './components/Footer';
import { Check } from 'lucide-react';

export default function App() {
  const [activeUser, setActiveUser] = useState<UserProfile>(USER_PROFILES[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: AMAZON_PRODUCTS[0], // Sony XM5
      quantity: 1
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Departments');
  const [recEngineMode, setRecEngineMode] = useState<RecEngineMode>('two-tower');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isDashboardDesignOpen, setIsDashboardDesignOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sorting and filtering
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [primeOnly, setPrimeOnly] = useState(false);

  // Dynamic products loaded from backend with fallback
  const [allProducts, setAllProducts] = useState<Product[]>(AMAZON_PRODUCTS);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadBackendData() {
      try {
        const isHealthy = await apiService.checkHealth();
        setIsBackendConnected(isHealthy);
        if (isHealthy) {
          const backendItems = await apiService.getProducts();
          if (backendItems && backendItems.length > 0) {
            const mapped = backendItems.map(mapBackendProductToFrontend);
            setAllProducts((prev) => {
              const titles = new Set(prev.map((p) => p.title.toLowerCase()));
              const newItems = mapped.filter((m) => !titles.has(m.title.toLowerCase()));
              return [...mapped, ...newItems];
            });
            triggerToast('Connected to recommendation backend (:8000)');
          }
        }
      } catch {
        setIsBackendConnected(false);
      }
    }
    loadBackendData();
  }, []);

  // Helper to show toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    triggerToast(`Added "${product.title.slice(0, 32)}..." to your Cart`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Dynamic ranking based on active user and selected recommendation mode
  const rankedProducts = useMemo(() => {
    return [...allProducts].map((product) => {
      let score = product.twoTowerEmbeddingSimilarity || 0.85;

      // Persona affinity bonus
      if (product.category === activeUser.recommendedCategory) {
        score += 0.08;
      } else if (activeUser.recentCategories.includes(product.category)) {
        score += 0.04;
      }

      // Mode adjustments
      if (recEngineMode === 'collaborative-filtering') {
        score = (product.kCoreInteractionCount / 890) * 0.95;
      } else if (recEngineMode === 'popular-baseline') {
        score = (product.reviewCount / 50000) * (product.rating / 5);
      } else if (recEngineMode === 'hybrid-graph') {
        score = 0.6 * score + 0.4 * (product.kCoreInteractionCount / 890);
      }

      return {
        ...product,
        dynamicScore: Math.min(score, 0.99)
      };
    }).sort((a, b) => b.dynamicScore - a.dynamicScore);
  }, [allProducts, activeUser, recEngineMode]);

  // Filtered catalog for main product grid
  const filteredProducts = useMemo(() => {
    let result = rankedProducts;

    if (searchQuery.trim()) {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      result = result.filter((p) => {
        const searchableText = `${p.title} ${p.brand} ${p.category} ${p.asin} ${p.features.join(' ')} ${p.description.join(' ')}`.toLowerCase();
        return terms.every((t) => searchableText.includes(t));
      });

      if (selectedCategory !== 'All Departments') {
        const inCategory = result.filter((p) => p.category === selectedCategory);
        if (inCategory.length > 0) {
          result = inCategory;
        }
      }
    } else if (selectedCategory !== 'All Departments') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (primeOnly) {
      result = result.filter((p) => p.isPrime);
    }

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [rankedProducts, selectedCategory, searchQuery, primeOnly, sortBy]);

  // Specialized recommendation rails
  const personalizedRail = useMemo(() => {
    return rankedProducts.slice(0, 8);
  }, [rankedProducts]);

  const bestSellingRail = useMemo(() => {
    return [...rankedProducts]
      .sort((a, b) => b.kCoreInteractionCount - a.kCoreInteractionCount)
      .slice(0, 8);
  }, [rankedProducts]);

  const isBrowsingAll = selectedCategory === 'All Departments' && !searchQuery.trim();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 selection:bg-[#db4444] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-black text-white px-4 py-3 rounded-md shadow-2xl border border-neutral-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-5 h-5 rounded-full bg-[#db4444] text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span className="text-xs font-medium max-w-xs truncate">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white text-xs ml-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        activeUser={activeUser}
        onSelectUser={setActiveUser}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenDashboardDesign={() => setIsDashboardDesignOpen(true)}
        products={allProducts}
        onSelectProduct={setSelectedProduct}
      />

      {/* Backend API Status Banner */}
      {isBackendConnected !== null && (
        <div className={`px-4 py-1.5 text-xs flex items-center justify-between border-b transition-colors ${
          isBackendConnected
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-semibold">
              {isBackendConnected ? 'FastAPI Recommendation API: Connected (:8000)' : 'Backend API: Offline Fallback Active'}
            </span>
            <span className="text-gray-500 text-[11px] hidden sm:inline">
              ({isBackendConnected ? 'Loaded catalog items from recommendation backend' : 'Using in-browser offline simulation'})
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-600">
            FastAPI Service (:8000)
          </span>
        </div>
      )}

      {/* SubNavbar with Category Pills & Rec Engine Selector */}
      <SubNavbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        recMode={recEngineMode}
        onSelectRecMode={setRecEngineMode}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {isBrowsingAll ? (
          <>
            {/* Category Grid & Flash Products */}
            <CategoryCardsGrid
              products={rankedProducts}
              activeUser={activeUser}
              onSelectProduct={setSelectedProduct}
              onSelectCategory={setSelectedCategory}
              onAddToCart={(p, e) => {
                e.stopPropagation();
                handleAddToCart(p);
              }}
            />

            {/* Best Selling Products & Personalized Rails */}
            <div className="max-w-[1400px] mx-auto px-4 space-y-16 py-8">
              {/* Recommendation Rail 1: Best Selling Products */}
              <RecommendationRail
                title="Best Selling Products"
                subtitle="This Month"
                algorithmBadge="Verified Top Seller"
                products={bestSellingRail}
                onSelectProduct={setSelectedProduct}
                onAddToCart={(p, e) => {
                  e.stopPropagation();
                  handleAddToCart(p);
                }}
              />

              {/* Recommendation Rail 2: Recommended For You */}
              <RecommendationRail
                title={`Recommended For You (${activeUser.name.split(' ')[0]})`}
                subtitle="Our Products"
                algorithmBadge={
                  recEngineMode === 'two-tower'
                    ? 'Personalized Match'
                    : recEngineMode === 'collaborative-filtering'
                    ? 'Community Pick'
                    : recEngineMode === 'hybrid-graph'
                    ? 'Trending Discovery'
                    : 'Top Rated'
                }
                products={personalizedRail}
                onSelectProduct={setSelectedProduct}
                onAddToCart={(p, e) => {
                  e.stopPropagation();
                  handleAddToCart(p);
                }}
              />

              {/* Complete Catalog Section */}
              <section className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-10 bg-[#db4444] rounded-sm inline-block" />
                      <span className="text-sm font-bold text-[#db4444]">Full Catalog</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                      Explore All Products
                    </h3>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                      <input
                        type="checkbox"
                        checked={primeOnly}
                        onChange={(e) => setPrimeOnly(e.target.checked)}
                        className="rounded text-[#db4444]"
                      />
                      <span className="font-semibold text-black">Prime Delivery</span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-medium">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-white cursor-pointer font-medium outline-none focus:border-black"
                      >
                        <option value="featured">Featured / RecSys Rank</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Avg. Customer Review</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectProduct={setSelectedProduct}
                      onAddToCart={(p, e) => {
                        e.stopPropagation();
                        handleAddToCart(p);
                      }}
                    />
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : (
          /* Search or Department Filter View */
          <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-16 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-gray-500 font-medium">Results for:</span>
                {selectedCategory !== 'All Departments' && (
                  <span className="bg-gray-100 text-black font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('All Departments')}
                      className="text-gray-400 hover:text-black ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-red-50 text-[#db4444] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-red-200">
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[#db4444] hover:text-black ml-1"
                    >
                      ×
                    </button>
                  </span>
                )}
                <span className="text-gray-400 font-mono">({filteredProducts.length} items)</span>
              </div>

              {/* Sort & Filters */}
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={primeOnly}
                    onChange={(e) => setPrimeOnly(e.target.checked)}
                    className="rounded text-[#db4444]"
                  />
                  <span>Prime Only</span>
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-white cursor-pointer font-medium outline-none"
                >
                  <option value="featured">Featured / RecSys Rank</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Avg. Customer Review</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-[#f5f5f5] p-16 text-center rounded-md space-y-3">
                <h3 className="text-lg font-bold text-black">No matching products found</h3>
                <p className="text-xs text-gray-500">
                  Try clearing your search query or switching departments.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Departments');
                  }}
                  className="bg-[#db4444] hover:bg-[#c93b3b] text-white text-xs font-bold px-6 py-2.5 rounded-sm cursor-pointer shadow-xs"
                >
                  Reset Catalog Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={setSelectedProduct}
                    onAddToCart={(p, e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onSelectProduct={setSelectedProduct}
      />

      {/* Cart Drawer - Kept for User's Basket & Association Exploration */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onSelectProduct={setSelectedProduct}
        onAddToCart={handleAddToCart}
        onClearCart={() => setCartItems([])}
      />

      {/* Architecture Specs Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        onOpenDashboardDesign={() => {
          setIsArchitectureOpen(false);
          setIsDashboardDesignOpen(true);
        }}
      />

      {/* Dashboard Design Mockup Modal */}
      <DashboardDesignModal
        isOpen={isDashboardDesignOpen}
        onClose={() => setIsDashboardDesignOpen(false)}
        onOpenArchitecture={() => {
          setIsDashboardDesignOpen(false);
          setIsArchitectureOpen(true);
        }}
      />

      {/* Modern Footer */}
      <Footer
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenDashboardDesign={() => setIsDashboardDesignOpen(true)}
      />
    </div>
  );
}
