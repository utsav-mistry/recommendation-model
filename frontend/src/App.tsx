import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem } from './types/ecommerce';
import { apiService, mapFastApiProductToFrontend } from './services/apiService';
import { AuthUser } from './types/api';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { SubNavbar } from './components/SubNavbar';
import { CategoryCardsGrid } from './components/CategoryCardsGrid';
import { RecommendationRail } from './components/RecommendationRail';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Check } from 'lucide-react';

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('recommendation_auth_token'));
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Departments');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sorting and filtering
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [primeOnly, setPrimeOnly] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [globalRecommendations, setGlobalRecommendations] = useState<Product[]>([]);
  const [categoryRecommendations, setCategoryRecommendations] = useState<Product[]>([]);
  const [similarRecommendations, setSimilarRecommendations] = useState<Product[]>([]);
  const [cartRecommendations, setCartRecommendations] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; label: string; product_count: number }>>([]);

  useEffect(() => {
    if (!authToken) {
      setAuthUser(null);
      setAuthReady(true);
      return;
    }
    apiService.getCurrentUser(authToken)
      .then(setAuthUser)
      .catch(() => {
        localStorage.removeItem('recommendation_auth_token');
        setAuthToken(null);
        setAuthUser(null);
      })
      .finally(() => setAuthReady(true));
  }, [authToken]);

  useEffect(() => {
    if (!authUser) return;
    async function loadCatalogue() {
      const catalog = await apiService.getProducts({
        page: 1,
        pageSize: 48,
        search: searchQuery || undefined,
        category: selectedCategory
      });
      setAllProducts(catalog.items.map(mapFastApiProductToFrontend));
    }
    loadCatalogue().catch(() => setAllProducts([]));
  }, [authUser, searchQuery, selectedCategory]);

  useEffect(() => {
    if (!authUser) return;
    apiService.getGlobalRecommendations(8)
      .then((items) => setGlobalRecommendations(items.map(mapFastApiProductToFrontend)))
      .catch(() => setGlobalRecommendations([]));
    apiService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    if (selectedCategory === 'All Departments') {
      setCategoryRecommendations(globalRecommendations);
      return;
    }
    apiService.getCategoryRecommendations(selectedCategory, 8)
      .then((items) => setCategoryRecommendations(items.map(mapFastApiProductToFrontend)))
      .catch(() => setCategoryRecommendations([]));
  }, [authUser, selectedCategory, globalRecommendations]);

  const selectedAsin = selectedProduct?.asin;

  useEffect(() => {
    if (!authUser) return;
    if (!selectedAsin) {
      setSimilarRecommendations([]);
      return;
    }
    apiService.getProductById(selectedAsin)
      .then((item) => setSelectedProduct(mapFastApiProductToFrontend(item)))
      .catch(() => undefined);
    apiService.getSimilarRecommendations([selectedAsin], 6)
      .then((items) => setSimilarRecommendations(items.map(mapFastApiProductToFrontend)))
      .catch(() => setSimilarRecommendations([]));
  }, [authUser, selectedAsin]);

  useEffect(() => {
    if (!authUser) return;
    const cartAsins = cartItems.map((item) => item.product.asin);
    if (!cartAsins.length) {
      setCartRecommendations([]);
      return;
    }
    apiService.getSimilarRecommendations(cartAsins, 6)
      .then((items) => setCartRecommendations(items.map(mapFastApiProductToFrontend)))
      .catch(() => setCartRecommendations([]));
  }, [authUser, cartItems]);

  if (!authReady) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!authToken || !authUser) {
    return (
      <AuthPage
        onAuthenticated={(token, user) => {
          localStorage.setItem('recommendation_auth_token', token);
          setAuthToken(token);
          setAuthUser(user);
        }}
      />
    );
  }

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

      return {
        ...product,
        dynamicScore: Math.min(score, 0.99)
      };
    }).sort((a, b) => b.dynamicScore - a.dynamicScore);
  }, [allProducts]);

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
    return categoryRecommendations.length ? categoryRecommendations : globalRecommendations;
  }, [categoryRecommendations, globalRecommendations]);

  const bestSellingRail = useMemo(() => {
    return globalRecommendations;
  }, [globalRecommendations]);

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
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        user={authUser}
        onLogout={() => {
          localStorage.removeItem('recommendation_auth_token');
          setAuthToken(null);
          setAuthUser(null);
          setCartItems([]);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        products={allProducts}
        onSelectProduct={setSelectedProduct}
      />

      {/* SubNavbar with Category Pills & Rec Engine Selector */}
      <SubNavbar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
      />

      {/* Main Body */}
      <main className="flex-1">
        {isBrowsingAll ? (
          <>
            {/* Category Grid & Flash Products */}
            <CategoryCardsGrid
              products={rankedProducts}
              onSelectProduct={setSelectedProduct}
              onSelectCategory={setSelectedCategory}
              categories={categories}
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
                title="Recommended For You"
                subtitle="Our Products"
                algorithmBadge="Trained recommendation model"
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
        similarProducts={similarRecommendations}
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
        recommendationProducts={cartRecommendations}
      />

      <Footer />
    </div>
  );
}
