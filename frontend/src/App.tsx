import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem } from './types/ecommerce';
import { apiService, mapFastApiProductToFrontend } from './services/apiService';
import { AuthUser, UserProductList, OrderSummary } from './types/api';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { SubNavbar } from './components/SubNavbar';
import { CategoryCardsGrid } from './components/CategoryCardsGrid';
import { RecommendationRail } from './components/RecommendationRail';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { OrderHistoryDrawer } from './components/OrderHistoryDrawer';
import { Check } from 'lucide-react';

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('recommendation_auth_token'));
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistAsins, setWishlistAsins] = useState<Set<string>>(new Set());
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Departments');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sorting and filtering
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'popularity'>('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [globalRecommendations, setGlobalRecommendations] = useState<Product[]>([]);
  const [categoryRecommendations, setCategoryRecommendations] = useState<Product[]>([]);
  const [similarRecommendations, setSimilarRecommendations] = useState<Product[]>([]);
  const [cartRecommendations, setCartRecommendations] = useState<Product[]>([]);
  const [wishlistRecommendations, setWishlistRecommendations] = useState<Product[]>([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [hasPersonalizationHistory, setHasPersonalizationHistory] = useState(false);
  const [personalizationVersion, setPersonalizationVersion] = useState(0);
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

  const applyCartResponse = (response: UserProductList) => {
    setCartItems(response.items
      .filter((item) => item.quantity !== undefined)
      .map((item) => ({
        product: mapFastApiProductToFrontend(item.product),
        quantity: item.quantity as number
      })));
  };

  useEffect(() => {
    if (!authToken || !authUser) {
      setCartItems([]);
      setWishlistAsins(new Set());
      setRecentlyViewedProducts([]);
      return;
    }
    Promise.all([
      apiService.getCart(authToken),
      apiService.getWishlist(authToken),
      apiService.getOrders(authToken)
    ])
      .then(([cart, wishlist, orderHistory]) => {
        applyCartResponse(cart);
        setWishlistAsins(new Set(wishlist.items.map((item: UserProductList['items'][number]) => item.parent_asin)));
        setWishlistProducts(wishlist.items.map((item) => mapFastApiProductToFrontend(item.product)));
        setOrders(orderHistory);
      })
      .catch((error) => {
        setDataError(error instanceof Error ? error.message : 'Unable to load your saved items');
      });
    apiService.getRecentlyViewed(authToken)
      .then((items) => setRecentlyViewedProducts(items.map(mapFastApiProductToFrontend)))
      .catch(() => setRecentlyViewedProducts([]));
  }, [authToken, authUser, historyVersion]);

  useEffect(() => {
    if (!authUser) return;
    async function loadCatalogue() {
      const catalog = await apiService.getProducts({
        page,
        pageSize: 48,
        search: searchQuery || undefined,
        category: selectedCategory,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        store: storeFilter || undefined,
        sort: sortBy
      });
      setAllProducts(catalog.items.map(mapFastApiProductToFrontend));
      setTotalProducts(catalog.total);
    }
    loadCatalogue().catch((error) => {
      setAllProducts([]);
      setDataError(error instanceof Error ? error.message : 'Unable to load products');
    });
    if (selectedCategory !== 'All Departments' && !searchQuery.trim()) {
      void apiService.recordEvent(
        { event_type: 'category_view', category: selectedCategory },
        authToken as string
      ).catch((error) => setDataError(error instanceof Error ? error.message : 'Unable to record category activity'));
    }
  }, [authUser, searchQuery, selectedCategory, page, minPrice, maxPrice, minRating, storeFilter, sortBy]);

  const handleSearchSubmit = (query: string) => {
    const normalized = query.trim();
    if (!normalized || !authToken) return;
    void apiService.recordEvent(
      { event_type: 'search', search_query: normalized },
      authToken
    ).then(() => setPersonalizationVersion((version) => version + 1))
      .catch((error) => setDataError(error instanceof Error ? error.message : 'Unable to record search activity'));
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, minRating, storeFilter, sortBy]);

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

  useEffect(() => {
    if (!authUser || !authToken) {
      setPersonalizedRecommendations([]);
      setHasPersonalizationHistory(false);
      return;
    }
    apiService.getPersonalizedRecommendations(authToken, 8)
      .then((response) => {
        setPersonalizedRecommendations(response.items.map(mapFastApiProductToFrontend));
        setHasPersonalizationHistory(response.has_history);
      })
      .catch(() => {
        setPersonalizedRecommendations([]);
        setHasPersonalizationHistory(false);
      });
  }, [authUser, authToken, orders, personalizationVersion]);

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
    void apiService.recordEvent(
      { event_type: 'product_view', parent_asin: selectedAsin },
      authToken as string
    ).then(() => setHistoryVersion((version) => version + 1))
      .catch((error) => setDataError(error instanceof Error ? error.message : 'Unable to record product activity'));
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

  useEffect(() => {
    if (!authUser) {
      setWishlistRecommendations([]);
      return;
    }
    const wishlistSeeds = Array.from(wishlistAsins);
    if (!wishlistSeeds.length) {
      setWishlistRecommendations([]);
      return;
    }
    apiService.getSimilarRecommendations(wishlistSeeds, 8)
      .then((items) => setWishlistRecommendations(items.map(mapFastApiProductToFrontend)))
      .catch(() => setWishlistRecommendations([]));
  }, [authUser, wishlistAsins]);

  // Helper to show toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Cart operations
  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!authToken || !product.inStock || product.price <= 0) {
      if (product.price <= 0) {
        setDataError('This product is out of stock and can only be added to your wishlist');
      }
      return;
    }
    try {
      applyCartResponse(await apiService.addCart(product.asin, quantity, authToken));
      await apiService.recordEvent(
        { event_type: 'cart_add', parent_asin: product.asin, metadata: { quantity } },
        authToken
      );
      triggerToast(`Added "${product.title.slice(0, 32)}..." to your Cart`);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to update your cart');
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!authToken) return;
    try {
      applyCartResponse(await apiService.updateCart(productId, quantity, authToken));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to update your cart');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    if (!authToken) return;
    try {
      applyCartResponse(await apiService.removeCart(productId, authToken));
      await apiService.recordEvent(
        { event_type: 'cart_remove', parent_asin: productId },
        authToken
      );
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to remove the cart item');
    }
  };

  const handleToggleWishlist = async (product: Product) => {
    if (!authToken) return;
    try {
      const response = wishlistAsins.has(product.asin)
        ? await apiService.removeWishlist(product.asin, authToken)
        : await apiService.addWishlist(product.asin, authToken);
      setWishlistAsins(new Set(response.items.map((item: UserProductList['items'][number]) => item.parent_asin)));
      setWishlistProducts(response.items.map((item) => mapFastApiProductToFrontend(item.product)));
      await apiService.recordEvent(
        {
          event_type: wishlistAsins.has(product.asin) ? 'wishlist_remove' : 'wishlist_add',
          parent_asin: product.asin
        },
        authToken
      );
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to update your wishlist');
    }
  };

  // Dynamic ranking based on active user and selected recommendation mode
  const rankedProducts = allProducts;

  // Filtered catalog for main product grid
  const filteredProducts = useMemo(() => {
    return rankedProducts;
  }, [rankedProducts]);

  // Specialized recommendation rails
  const personalizedRail = useMemo(() => {
    return personalizedRecommendations;
  }, [personalizedRecommendations]);

  const bestSellingRail = useMemo(() => {
    return globalRecommendations;
  }, [globalRecommendations]);

  const isBrowsingAll = selectedCategory === 'All Departments' && !searchQuery.trim();

  const handleCheckout = async () => {
    if (!authToken) return;
    try {
      await apiService.checkout(authToken);
      setCartItems([]);
      setOrders(await apiService.getOrders(authToken));
      triggerToast('Simulated order completed successfully');
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to complete checkout');
      throw error;
    }
  };

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
      {dataError && (
        <div className="fixed top-24 left-4 z-50 max-w-sm rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 shadow-lg">
          {dataError}
          <button
            className="ml-3 font-bold"
            onClick={() => setDataError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        user={authUser}
        onLogout={() => {
          void apiService.logout(authToken).catch(() => undefined);
          localStorage.removeItem('recommendation_auth_token');
          setAuthToken(null);
          setAuthUser(null);
          setCartItems([]);
          setWishlistAsins(new Set());
          setWishlistProducts([]);
          setOrders([]);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
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
            {/* Category Grid */}
            <CategoryCardsGrid
              onSelectCategory={setSelectedCategory}
              categories={categories}
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

              {recentlyViewedProducts.length > 0 && (
                <RecommendationRail
                  title="Recently Viewed"
                  subtitle="Your history"
                  products={recentlyViewedProducts}
                  onSelectProduct={setSelectedProduct}
                  onAddToCart={(p, e) => {
                    e.stopPropagation();
                    handleAddToCart(p);
                  }}
                />
              )}

              {/* Recommendation Rail 2: Recommended For You */}
              {personalizedRail.length > 0 ? (
                <RecommendationRail
                  title="Recommended For You"
                  subtitle="Based on your activity"
                  algorithmBadge="Personalized"
                  products={personalizedRail}
                  onSelectProduct={setSelectedProduct}
                  onAddToCart={(p, e) => {
                    e.stopPropagation();
                    handleAddToCart(p);
                  }}
                />
              ) : (
                <section className="rounded-md border border-gray-200 bg-white p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-900">Recommended For You</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {hasPersonalizationHistory
                      ? 'We are still building recommendations from your activity.'
                      : 'Search, view products, or complete a purchase to get personalized recommendations.'}
                  </p>
                </section>
              )}

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
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-medium">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-white cursor-pointer font-medium outline-none focus:border-black"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating_desc">Average Rating</option>
                        <option value="popularity">Rating Count</option>
                      </select>
                    </div>
                    <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" min="0" placeholder="Min $" className="w-20 border border-gray-200 rounded-md px-2 py-1.5" />
                    <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" min="0" placeholder="Max $" className="w-20 border border-gray-200 rounded-md px-2 py-1.5" />
                    <input value={minRating} onChange={(e) => setMinRating(e.target.value)} type="number" min="0" max="5" step="0.1" placeholder="Min ★" className="w-20 border border-gray-200 rounded-md px-2 py-1.5" />
                    <input value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} type="text" placeholder="Brand/store" className="w-24 border border-gray-200 rounded-md px-2 py-1.5" />
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
                      isWishlisted={wishlistAsins.has(product.asin)}
                      onToggleWishlist={handleToggleWishlist}
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
                <span className="text-gray-400 font-mono">({totalProducts.toLocaleString()} items)</span>
              </div>

              {/* Sort & Filters */}
              <div className="flex items-center gap-3 text-xs">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-white cursor-pointer font-medium outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Average Rating</option>
                  <option value="popularity">Rating Count</option>
                </select>
                <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" min="0" placeholder="Min $" className="w-20 border border-gray-200 rounded-md px-2 py-1.5" />
                <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" min="0" placeholder="Max $" className="w-20 border border-gray-200 rounded-md px-2 py-1.5" />
                <input value={minRating} onChange={(e) => setMinRating(e.target.value)} type="number" min="0" max="5" step="0.1" placeholder="Min ★" className="w-20 border border-gray-200 rounded-md px-2 py-1.5" />
                <input value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} type="text" placeholder="Brand/store" className="w-24 border border-gray-200 rounded-md px-2 py-1.5" />
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
                    isWishlisted={wishlistAsins.has(product.asin)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {totalProducts > 48 && (
          <div className="max-w-[1400px] mx-auto px-4 pb-10 flex items-center justify-center gap-4 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded border border-gray-200 px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <span>Page {page} of {Math.ceil(totalProducts / 48)}</span>
            <button
              disabled={page >= Math.ceil(totalProducts / 48)}
              onClick={() => setPage((current) => current + 1)}
              className="rounded border border-gray-200 px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
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
        onClearCart={() => {
          if (authToken) {
            void Promise.all(cartItems.map((item) => apiService.removeCart(item.product.asin, authToken)))
              .then(() => setCartItems([]))
              .catch((error) => setDataError(error instanceof Error ? error.message : 'Unable to clear your cart'));
          }
        }}
        onCheckout={handleCheckout}
        recommendationProducts={cartRecommendations}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        products={wishlistProducts}
        recommendationProducts={wishlistRecommendations}
        onClose={() => setIsWishlistOpen(false)}
        onSelect={(product) => {
          setSelectedProduct(product);
          setIsWishlistOpen(false);
        }}
        onRemove={(product) => void handleToggleWishlist(product)}
        onSelectProduct={setSelectedProduct}
        onAddToCart={handleAddToCart}
      />

      <OrderHistoryDrawer
        isOpen={isOrdersOpen}
        orders={orders}
        onClose={() => setIsOrdersOpen(false)}
      />

      <Footer />
    </div>
  );
}
